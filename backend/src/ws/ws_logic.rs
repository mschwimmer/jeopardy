// src/ws/ws_logics.rs
// Implementing and testing web socket stuff for axum

use crate::db::pool::DBPool;
use crate::models::game::Game; // Import your Game model
use axum::{
    body::Bytes,
    extract::{
        connect_info::ConnectInfo,
        ws::{Message, WebSocket, WebSocketUpgrade},
        Extension, Query,
    },
    http::StatusCode,
    response::IntoResponse,
};
use axum_extra::TypedHeader;
use diesel_async::AsyncPgConnection;
use futures::{sink::SinkExt, stream::StreamExt};
use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::{Arc, Mutex};
use tokio::sync::broadcast;

pub type Games = Arc<Mutex<HashMap<String, GameState>>>;

#[derive(Default)]
pub struct GameState {
    game: Option<Game>,
    room_code: String,
    players: Vec<SocketAddr>,
    first_buzzer: Option<SocketAddr>,
    broadcast_tx: Option<broadcast::Sender<String>>,
}

impl GameState {
    pub async fn new(
        conn: &mut AsyncPgConnection,
        room_code: String,
    ) -> Result<Self, diesel::result::Error> {
        // Fetch the actual game from the database
        let game = Game::find_by_room_code(conn, room_code).await?;

        // Create a broadcast channel with capacity for 100 messages
        let (broadcast_tx, _) = broadcast::channel::<String>(100);

        Ok(Self {
            game: Some(game.clone()),
            room_code: game.room_code.clone(),
            players: Vec::new(),
            first_buzzer: None,
            broadcast_tx: Some(broadcast_tx),
        })
    }

    // Method to send a message to all players
    pub fn broadcast(&self, message: String) {
        if let Some(broadcast_tx) = &self.broadcast_tx {
            // Send returns the number of receivers that got the message
            let recv_count = broadcast_tx.send(message).unwrap_or(0);
            tracing::debug!("Broadcasted message to all players: {}", recv_count);
        }
    }

    // Optional: method to get the associated game
    pub fn get_game(&self) -> Option<&Game> {
        self.game.as_ref()
    }
}

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

    ws.on_upgrade(move |socket| handle_socket(socket, addr, room_code, games))
}

/// Actual websocket statemachine (one will be spawned per connection)
async fn handle_socket(mut socket: WebSocket, who: SocketAddr, room_code: String, games: Games) {
    // send a ping
    if socket
        .send(Message::Ping(Bytes::from_static(&[1, 2, 3])))
        .await
        .is_ok()
    {
        tracing::info!("Pinged {}", who);
    } else {
        tracing::info!("Failed to send ping to {}", who);
        // no Error here since the only thing we can do is to close the connection.
        // If we can not send messages, there is no way to salvage the statemachine anyway.
        return;
    }

    // By splitting socket we can send and receive at the same time.
    let (mut sender, mut receiver) = socket.split();

    // Get a broadcast receiver for this player
    let mut broadcast_rx = {
        let mut games_lock = match games.lock() {
            Ok(guard) => guard,
            Err(poisoned) => {
                tracing::warn!("Mutex was poisoned, recovering");
                poisoned.into_inner()
            }
        };
        if let Some(game_state) = games_lock.get_mut(&room_code) {
            // Get a new receiver from the broadcast channel
            game_state
                .broadcast_tx
                .as_ref()
                .expect("Broadcast channel should be initialized")
                .subscribe()
        } else {
            // Handle the case where the game state is not found
            tracing::error!("No game found for room code: {}", room_code);

            // Option 1: Create a dummy broadcast receiver
            let (_, rx) = broadcast::channel(16);
            rx
        }
    };

    // This task will forward broadcast messages to this client
    let who_clone = who;
    let mut broadcast_task = tokio::spawn(async move {
        while let Ok(msg) = broadcast_rx.recv().await {
            tracing::info!("Forwarding broadcast message to {}", who_clone);
            if sender.send(Message::Text(msg.into())).await.is_err() {
                break;
            }
        }
    });

    // This task will receive messages from client and print them on server console
    let games_clone = games.clone();
    let room_code_clone = room_code.clone();
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            match msg {
                // Handle client sending "buzz"
                Message::Text(t) if t.trim().eq_ignore_ascii_case("buzz") => {
                    // Grab the games_lock
                    let mut games_lock = match games_clone.lock() {
                        Ok(guard) => guard,
                        Err(poisoned) => {
                            tracing::warn!("Mutex was poisoned, recovering");
                            poisoned.into_inner()
                        }
                    };
                    // Get the game state for this game_id
                    if let Some(game_state) = games_lock.get_mut(&room_code_clone) {
                        match game_state.first_buzzer {
                            Some(first_buzzer) => {
                                if first_buzzer == who {
                                    tracing::info!("Player {who} buzzed again");
                                    // Broadcast to all players that {who} buzzed again
                                    game_state.broadcast(format!("Player {} buzzed again!", who));
                                } else {
                                    tracing::info!(
                                        "Player {who} buzzed, but {first_buzzer} already buzzed first"
                                    );
                                    // Broadcast to all players that {who} buzzed, but {first_buzzer} already buzzed first
                                    game_state.broadcast(format!(
                                        "Player {} buzzed, but {} already buzzed first!",
                                        who, first_buzzer
                                    ));
                                }
                            }
                            None => {
                                game_state.first_buzzer = Some(who);
                                tracing::info!("Player {who} buzzed first");
                                // Broadcast to all players that {who} buzzed first
                                game_state.broadcast(format!("Player {} buzzed first!", who));
                            }
                        }
                    }
                }
                Message::Text(t) if t.trim().eq_ignore_ascii_case("reset") => {
                    // Lock game state and reset buzzer
                    let mut games_lock = match games_clone.lock() {
                        Ok(guard) => guard,
                        Err(poisoned) => {
                            tracing::warn!("Mutex was poisoned, recovering");
                            poisoned.into_inner()
                        }
                    };
                    if let Some(game_state) = games_lock.get_mut(&room_code_clone) {
                        game_state.first_buzzer = None;
                        tracing::info!("Buzzer reset by {who}");
                        // Broadcast to all players that {who} reset the buzzer.
                        game_state.broadcast(format!("Buzzer reset by {}", who));
                    }
                }
                _other => {}
            }
        }
    });

    // Wait for either task to finish
    tokio::select! {
        _ = &mut broadcast_task => recv_task.abort(),
        _ = &mut recv_task => broadcast_task.abort(),
    }

    // Clean up when the connection is closed
    {
        let mut games_lock = match games.lock() {
            Ok(guard) => guard,
            Err(poisoned) => {
                tracing::warn!("Mutex was poisoned, recovering");
                poisoned.into_inner()
            }
        };
        if let Some(game_state) = games_lock.get_mut(&room_code) {
            // Remove the player from the game
            game_state.players.retain(|&p| p != who);

            // If this was the first buzzer, reset it
            if game_state.first_buzzer == Some(who) {
                game_state.first_buzzer = None;
                // Optionally broadcast that the buzzer has been reset due to player disconnect
                game_state.broadcast(format!("Buzzer reset because player {} disconnected", who));
            }
        }
    }

    // Returning from the handler closes the websocket connection
    tracing::info!("Websocket context {who} destroyed");
}
