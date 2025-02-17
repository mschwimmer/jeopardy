use async_graphql::http::{playground_source, GraphQLPlaygroundConfig};
use async_graphql_axum::{GraphQLRequest, GraphQLResponse};
use axum::response::IntoResponse;
use axum::{extract::Extension, response::Html, routing::get, Router};
use backend::db::pool::create_app_pool;
use backend::graphql::schema::{create_schema, AppSchema};
use dotenvy::dotenv;
use http::header::{AUTHORIZATION, CONTENT_TYPE};
use http::{HeaderValue, Method, StatusCode};
use std::env;
use std::net::SocketAddr;
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

async fn graphql_handler(schema: Extension<AppSchema>, req: GraphQLRequest) -> impl IntoResponse {
    GraphQLResponse::from(schema.execute(req.0).await)
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

    // Try to get a connection from our DBPool
    let pool = create_app_pool()?;

    // Create graphql schema
    let schema = create_schema(pool);

    let allowed_origin =
        env::var("ALLOWED_ORIGIN").unwrap_or_else(|_| "http://localhost:3000".to_string());

    // Configure CORS
    let cors = CorsLayer::new()
        .allow_origin(allowed_origin.parse::<HeaderValue>()?)
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers([CONTENT_TYPE, AUTHORIZATION])
        .allow_credentials(true); // In case of cookies or other credentials

    let app = Router::new()
        .route("/", get(root_handler))
        .route("/graphql", get(graphql_playground).post(graphql_handler))
        .layer(Extension(schema))
        .layer(cors);

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
        .serve(app.into_make_service())
        .await?;

    Ok(())
}
