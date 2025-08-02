// src/ws/handler.rs
use crate::db::pool::DBPool;
use crate::models::player::Player;
use crate::ws::error::ApiError;
use crate::ws::socket::handle_socket;
use crate::ws::state::{Client, GameState, Role};
use crate::ws::utils::get_games_lock;
use crate::ws::validators::validate_display_name;
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
/// Expected WebSocket connect URL formats:
/// Host:   ws://…/ws?room_code=ABC123&host_id=42&display_name=Hosty
/// Player: ws://…/ws?room_code=ABC123&player_id=99&display_name=BuzzBoy
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

    // Validate query parameters
    // Todo, validate room code
    let room_code: String = params
        .get("room_code")
        .cloned()
        .ok_or_else(|| ApiError::InvalidRoomCode)?;
    tracing::info!("Client {addr} wants to join game with room code {room_code}");

    let display_name = if let Some(name) = params.get("display_name") {
        validate_display_name(name).map_err(|_| ApiError::InvalidDisplayName)?
    } else {
        return Err(ApiError::InvalidDisplayName);
    };

    // Validate host_id/player_id
    let (is_host, user_id_str) = if let Some(host_id_str) = params.get("host_id") {
        (true, host_id_str.clone())
    } else if let Some(player_id_str) = params.get("player_id") {
        (false, player_id_str.clone())
    } else {
        tracing::error!("No host_id or player_id provided in query parameters");
        return Err(ApiError::InvalidPlayerId);
    };
    let user_id: i64 = user_id_str
        .parse::<i64>()
        .map_err(|_| ApiError::InvalidPlayerId)?;

    // Get a connection from the pool
    let mut conn = db_pool
        .get()
        .await
        .map_err(|_| ApiError::DatabaseConnectionError)?;

    // Only lookup a Player if this is not a host
    let (player_id_opt, player_obj_opt) = if !is_host {
        let player: Player = Player::find_by_id(&mut conn, user_id)
            .await
            .map_err(|_| ApiError::PlayerNotFoundError)?;
        (Some(player.id), Some(player))
    } else {
        (None, None)
    };

    // Check and create game state if needed
    {
        // Check if the game state already exists for this room code
        let should_insert: bool = {
            let games_lock = get_games_lock(&games);
            !games_lock.contains_key(&room_code)
        };

        // Create game state outside of lock if needed
        if should_insert {
            let new_state = GameState::new(&mut conn, room_code.clone())
                .await
                .map_err(|_| ApiError::GameStateCreationError)?;

            // Insert the new state
            let mut games_lock = get_games_lock(&games);
            games_lock.insert(room_code.clone(), new_state);
        }

        // Add client to game state
        let mut games_lock = get_games_lock(&games);
        if let Some(game_state) = games_lock.get_mut(&room_code) {
            let client = Client {
                display_name: display_name.clone(),
                role: if is_host { Role::Host } else { Role::Player },
                user_id: if is_host { Some(user_id) } else { None },
                player_id: player_id_opt,
                player_info: player_obj_opt.clone(),
            };
            game_state.clients.insert(addr, client.clone());
            tracing::info!(
                "Client {} with role {:?} added to game state for room code {}",
                client.display_name,
                client.role,
                room_code
            );
        }
    }

    // TODO figure out why this has an error
    Ok(ws.on_upgrade(move |socket: WebSocket| handle_socket(socket, addr, room_code, games)))
}
