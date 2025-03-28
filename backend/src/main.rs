// src/main.rs

use async_graphql::http::{playground_source, GraphQLPlaygroundConfig};
use async_graphql_axum::{GraphQLRequest, GraphQLResponse};
use axum::response::IntoResponse;
use axum::{
    extract::{Extension, FromRequestParts, State},
    http::{HeaderValue, Method, StatusCode, Uri},
    response::Html,
    routing::get,
    Router,
};
use backend::auth::firebase_auth::AuthenticatedUser;
use backend::db::pool::{create_app_pool, DBPool};
use backend::graphql::schema::{create_schema, AppSchema};
use backend::ws::{ws_handler, Games};
use dotenvy::dotenv;
use http::header::{
    AUTHORIZATION, CONNECTION, CONTENT_TYPE, SEC_WEBSOCKET_KEY, SEC_WEBSOCKET_PROTOCOL,
    SEC_WEBSOCKET_VERSION, UPGRADE,
};
use std::collections::HashMap;
use std::env;
use std::net::SocketAddr;
use std::sync::{Arc, Mutex};
use tower_http::cors::CorsLayer;
use tracing::error;
use tracing_subscriber::EnvFilter;

async fn root_handler() -> impl IntoResponse {
    (
        StatusCode::OK,
        "Service is running. Visit /graphql for the GraphQL Playground.",
    )
}

async fn graphql_playground() -> Html<String> {
    Html(playground_source(GraphQLPlaygroundConfig::new("/graphql")))
}

#[axum::debug_handler]
async fn graphql_handler(
    schema: Extension<AppSchema>,
    auth_user: Extension<Option<AuthenticatedUser>>,
    req: GraphQLRequest,
) -> impl IntoResponse {
    // Build the context with the authenticated user (if available)
    let mut request = req.0;

    if let Some(user) = auth_user.0 {
        tracing::info!("Authenticated request from user: {}", user.sub());
        request = request.data(user);
    } else {
        tracing::info!("Unauthenticated GraphQL request");
    }

    GraphQLResponse::from(schema.execute(request).await)
}

async fn auth_middleware(
    State(firebase_project_id): State<String>,
    request: axum::extract::Request,
    next: axum::middleware::Next,
) -> impl IntoResponse {
    // Split request into parts
    let (mut parts, body) = request.into_parts();

    tracing::info!("Auth middleware");
    // tracing::info!("Firebase project ID: {}", firebase_project_id);

    // Skip authentication if websocket request
    let path = parts.uri.path();
    if path == "/ws" {
        tracing::info!("Skipping auth for /ws");
        parts.extensions.insert(None::<AuthenticatedUser>);
        let request = axum::extract::Request::from_parts(parts, body);
        return next.run(request).await;
    }

    // If successful, add it to extensions
    match AuthenticatedUser::from_request_parts(&mut parts, &firebase_project_id).await {
        Ok(user) => {
            // tracing::info!("Authenticated user: {:?}", user);
            parts.extensions.insert(Some(user)); // Insert Some(user)
        }
        Err(err) => {
            tracing::warn!("Authentication failed: {:?}", err);
            parts.extensions.insert(None::<AuthenticatedUser>); // Insert None explicitly
        }
    }

    // Reassemble the request with the (possibly updated) parts.
    let request = axum::extract::Request::from_parts(parts, body);

    // Continue to the next middleware/handler
    next.run(request).await
}

#[tokio::main]
async fn main() {
    // Wrap the application logic in run() to allow graceful error handling.
    if let Err(err) = run().await {
        error!("Application error: {}", err);
        std::process::exit(1);
    }
}

async fn run() -> Result<(), Box<dyn std::error::Error>> {
    // Load environment variables from .env file
    dotenv().ok();

    // Initialize the tracing subscriber.
    // For production, you might prefer JSON output. Uncomment the `.json()` call below if desired.
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        // .json() // Uncomment for JSON formatted logs
        .init();

    // tracing::info!("--- Environment Variables ---");
    // for (key, value) in env::vars() {
    //     tracing::info!("{} = {}", key, value);
    // }

    // Get Firebase configuration from environment
    let firebase_project_id =
        env::var("FIREBASE_PROJECT_ID").unwrap_or_else(|_| "jeopardy-b4166".to_string());

    tracing::info!("Using Firebase project ID: {}", firebase_project_id);

    // Try to get a connection from our DBPool
    let pool: DBPool = create_app_pool()?;

    // Create graphql schema
    let schema = create_schema(pool.clone());

    let default_origin = "http://localhost:3000".to_string();
    let allowed_origins: Vec<HeaderValue> = match env::var("ALLOWED_ORIGINS") {
        Ok(origins_str) => {
            tracing::info!("Raw ALLOWED_ORIGINS: {}", origins_str);
            // Check if the string looks like a JSON array
            origins_str
                .split(',')
                .map(|s| s.trim_matches(|c| c == '\"' || c == '\'').parse().unwrap())
                .collect()
        }
        Err(_) => vec![default_origin.parse().unwrap()],
    };
    tracing::info!("Parsed Allowed origins: {:?}", allowed_origins);

    // Configure CORS
    let cors = CorsLayer::new()
        .allow_origin(allowed_origins)
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers([
            CONTENT_TYPE,
            AUTHORIZATION,
            CONNECTION,
            UPGRADE,
            SEC_WEBSOCKET_KEY,
            SEC_WEBSOCKET_PROTOCOL,
            SEC_WEBSOCKET_VERSION,
        ])
        .allow_credentials(true);

    // Add Firebase project ID to app state
    let app_state = firebase_project_id;
    // Initialize the shared games state.
    let games: Games = Arc::new(Mutex::new(HashMap::new()));

    let app = Router::new()
        .route("/", get(root_handler))
        .route("/graphql", get(graphql_playground).post(graphql_handler))
        .route("/ws", get(ws_handler))
        .layer(Extension(pool.clone()))
        .layer(Extension(games))
        .layer(Extension(schema))
        .layer(axum::middleware::from_fn_with_state(
            app_state.clone(),
            auth_middleware,
        )) // Overrides with Some(user) if exists
        .layer(Extension(None::<AuthenticatedUser>)) // Default empty user
        .with_state(app_state)
        .layer(cors)
        .fallback(|uri: Uri| async move {
            tracing::warn!("Unmatched route hit: {}", uri);
            (StatusCode::NOT_FOUND, "Route not found")
        });

    let port = env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse::<u16>()
        .unwrap_or_else(|err| {
            tracing::error!("PORT must be a number, but got an error: {}", err);
            std::process::exit(1);
        });
    let addr = SocketAddr::from(([0, 0, 0, 0], port));

    // Instead of println!, log the startup info using tracing.
    tracing::info!("Server running at http://{}", &addr);

    axum_server::bind(addr)
        .serve(app.into_make_service_with_connect_info::<SocketAddr>())
        .await?;

    Ok(())
}
