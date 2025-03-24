// src/ws/handler.rs
use crate::db::pool::DBPool;
use crate::ws::socket::handle_socket;
use crate::ws::state::GameState;
use crate::ws::Games;
use axum::{
    extract::{
        connect_info::ConnectInfo,
        ws::{WebSocket, WebSocketUpgrade},
        Extension, Query,
    },
    http::StatusCode,
    response::IntoResponse,
};
use axum_extra::TypedHeader;
use std::collections::HashMap;
use std::net::SocketAddr;

/// The handler for the HTTP request (this gets called when the HTTP request lands at the start
/// of websocket negotiation). After this completes, the actual switching from HTTP to
/// websocket protocol will occur.
/// This is the last point where we can extract TCP/IP metadata such as IP address of the client
/// as well as things from HTTP headers such as user-agent of the browser etc.
#[axum::debug_handler]
pub async fn ws_handler(
    ws: WebSocketUpgrade,
    user_agent: Option<TypedHeader<headers::UserAgent>>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Query(params): Query<HashMap<String, String>>,
    Extension(games): Extension<Games>,
    Extension(db_pool): Extension<DBPool>,
) -> impl IntoResponse {
    tracing::info!("WebSocket connection request received");
    tracing::info!("Params: {:?}", params);

    let _user_agent = if let Some(TypedHeader(user_agent)) = user_agent {
        user_agent.to_string()
    } else {
        "Unkown Browser".to_string()
    };

    let room_code: String = params.get("room_code").cloned().unwrap_or_else(|| {
        tracing::warn!("No room code provided, using default");
        "DEFAULT".to_string()
    });

    // Todo, validate room code
    tracing::info!("Client {addr} wants to join game with room code {room_code}");

    // Get a connection from the pool
    let mut conn = match db_pool.get().await {
        Ok(conn) => conn,
        Err(e) => {
            tracing::error!("Failed to get database connection: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Database connection error",
            )
                .into_response();
        }
    };

    // Check and create game state if needed
    {
        let mut should_insert = false;
        {
            let games_lock = match games.lock() {
                Ok(guard) => guard,
                Err(poisoned) => {
                    tracing::warn!("Mutex was poisoned, recovering");
                    poisoned.into_inner()
                }
            };

            should_insert = !games_lock.contains_key(&room_code);
        }

        // Create game state outside of lock if needed
        if should_insert {
            let new_state = match GameState::new(&mut conn, room_code.clone()).await {
                Ok(state) => state,
                Err(e) => {
                    tracing::error!("Failed to create game state: {:?}", e);
                    return (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        "Failed to create game state",
                    )
                        .into_response();
                }
            };

            // Insert the new state
            let mut games_lock = match games.lock() {
                Ok(guard) => guard,
                Err(poisoned) => {
                    tracing::warn!("Mutex was poisoned, recovering");
                    poisoned.into_inner()
                }
            };
            games_lock.insert(room_code.clone(), new_state);
        }

        // Add client to game state
        let mut games_lock = match games.lock() {
            Ok(guard) => guard,
            Err(poisoned) => {
                tracing::warn!("Mutex was poisoned, recovering");
                poisoned.into_inner()
            }
        };
        if let Some(game_state) = games_lock.get_mut(&room_code) {
            game_state.players.push(addr);
        }
    }

    ws.on_upgrade(move |socket: WebSocket| handle_socket(socket, addr, room_code, games))
}
