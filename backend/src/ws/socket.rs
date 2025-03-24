// src/ws/socket.rs
use crate::ws::Games;
use axum::{
    body::Bytes,
    extract::ws::{Message, WebSocket},
};
use futures::{SinkExt, StreamExt};
use std::net::SocketAddr;
use tokio::sync::broadcast;

/// Actual websocket statemachine (one will be spawned per connection)
pub async fn handle_socket(
    mut socket: WebSocket,
    who: SocketAddr,
    room_code: String,
    games: Games,
) {
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
