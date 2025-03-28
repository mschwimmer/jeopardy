// src/ws/handler.rs
use crate::db::pool::DBPool;
use crate::models::player::Player;
use crate::ws::error::ApiError;
use crate::ws::socket::handle_socket;
use crate::ws::state::GameState;
use crate::ws::Games;
use axum::{
    extract::{
        connect_info::ConnectInfo,
        ws::{WebSocket, WebSocketUpgrade},
        Extension, Query,
    },
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
) -> Result<impl IntoResponse, ApiError> {
    tracing::info!("WebSocket connection request received");
    tracing::info!("Params: {:?}", params);

    let _user_agent = if let Some(TypedHeader(user_agent)) = user_agent {
        user_agent.to_string()
    } else {
        "Unkown Browser".to_string()
    };

    let room_code: String = params
        .get("room_code")
        .cloned()
        .ok_or_else(|| ApiError::InvalidRoomCode)?;

    let player_id_str: String = params
        .get("player_id")
        .cloned()
        .ok_or_else(|| ApiError::InvalidPlayerId)?;
    let player_id: i64 = player_id_str.parse::<i64>().unwrap();

    // Todo, validate room code
    tracing::info!("Client {addr} wants to join game with room code {room_code}");

    // Get a connection from the pool
    let mut conn = db_pool
        .get()
        .await
        .map_err(|_| ApiError::DatabaseConnectionError)?;

    // Use connection to retrieve player object
    let player: Player = Player::find_by_id(&mut conn, player_id)
        .await
        .map_err(|_| ApiError::InvalidPlayerId)?;

    // Check and create game state if needed
    {
        let should_insert: bool = {
            let games_lock = match games.lock() {
                Ok(guard) => guard,
                Err(poisoned) => {
                    tracing::warn!("Mutex was poisoned, recovering");
                    poisoned.into_inner()
                }
            };
            !games_lock.contains_key(&room_code)
        };

        // Create game state outside of lock if needed
        if should_insert {
            let new_state = GameState::new(&mut conn, room_code.clone())
                .await
                .map_err(|_| ApiError::GameStateCreationError)?;

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
            // Add the player to the game state
            game_state.players.insert(addr, player);
        }
    }

    Ok(ws.on_upgrade(move |socket: WebSocket| handle_socket(socket, addr, room_code, games)))
}
