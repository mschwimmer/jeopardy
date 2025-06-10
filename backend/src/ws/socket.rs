// src/ws/socket.rs
use crate::ws::utils::get_games_lock;
use crate::ws::Games;
use axum::{
    body::Bytes,
    extract::ws::{Message, WebSocket},
};
use futures::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use tokio::sync::broadcast;

// Creating a type for websocket server json messages
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub enum ServerMessageType {
    Buzz,
    Reset,
    Status,
}

#[derive(Serialize, Deserialize, Debug, Default)]
#[serde(rename_all = "camelCase")]
pub struct ServerData {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub buzz_time: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<String>,
    // You can add other optional fields as needed
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ServerMessage {
    #[serde(rename = "type")]
    pub message_type: ServerMessageType,
    pub data: ServerData,
    pub timestamp: u64,
}

/// Helper function to run broadcast task
async fn run_broadcast_task(
    mut sender: impl SinkExt<Message> + Unpin,
    mut broadcast_rx: broadcast::Receiver<String>,
    who: SocketAddr,
) {
    while let Ok(msg) = broadcast_rx.recv().await {
        tracing::info!("Forwarding broadcast message to {}", who);
        if sender.send(Message::Text(msg.into())).await.is_err() {
            break;
        }
    }
}

/// Helper function to handle messages from the client (buzz, reset, status)
// TODO: create and send ServerMessage here, then create type in frontend that corresponds and processes.
async fn handle_client_message(
    mut receiver: impl StreamExt<Item = Result<Message, axum::Error>> + Unpin,
    games: Games,
    room_code: String,
    who: SocketAddr,
) {
    while let Some(Ok(msg)) = receiver.next().await {
        match msg {
            Message::Text(text) => {
                match serde_json::from_str::<ServerMessage>(&text) {
                    Ok(server_message) => {
                        match server_message.message_type {
                            ServerMessageType::Buzz => {
                                tracing::info!("Received buzz from {}", who);
                                // Grab the games_lock
                                let mut games_lock = get_games_lock(&games);
                                // Get the game state for this game_id
                                if let Some(game_state) = games_lock.get_mut(&room_code) {
                                    // Get the buzzer's name
                                    // Default to SocketAddr if player's name not found
                                    let buzzer = game_state
                                        .players
                                        .get(&who)
                                        .map(|player| player.player_name.clone())
                                        .unwrap_or_else(|| who.to_string());
                                    // Check if this is the first buzzer
                                    // If the first buzzer is None, set it to the current buzzer
                                    // If the first buzzer is Some, check if it's the same as the current buzzer
                                    // If it's the same, just send a message
                                    match game_state.first_buzzer.clone() {
                                        Some(first_buzzer) => {
                                            if first_buzzer == buzzer {
                                                tracing::info!("{buzzer} buzzed again");
                                                // Broadcast to all players that {who} buzzed again
                                                game_state
                                                    .broadcast(format!("{} buzzed again!", buzzer));
                                            } else {
                                                tracing::info!(
                                    "{who} buzzed, but {first_buzzer} already buzzed first"
                                );
                                                // Broadcast to all players that {who} buzzed, but {first_buzzer} already buzzed first
                                                game_state.broadcast(format!(
                                                    "{} buzzed, but {} already buzzed first!",
                                                    who, first_buzzer
                                                ));
                                            }
                                        }
                                        // No existing first buzzer, buzzer must be first
                                        None => {
                                            game_state.first_buzzer = Some(buzzer.clone());
                                            tracing::info!("{buzzer} buzzed first");
                                            // Broadcast to all players that {who} buzzed first
                                            game_state
                                                .broadcast(format!("{} buzzed first!", buzzer));
                                        }
                                    }
                                }
                            }
                            ServerMessageType::Reset => {
                                tracing::info!("Received reset from {}", who);
                                // Lock game state and reset buzzer
                                let mut games_lock = get_games_lock(&games);
                                if let Some(game_state) = games_lock.get_mut(&room_code) {
                                    game_state.first_buzzer = None;
                                    tracing::info!("Buzzer reset by {who}");
                                    // Broadcast to all players that {who} reset the buzzer.
                                    game_state.broadcast(format!("Buzzer reset by {}", who));
                                }
                            }
                            ServerMessageType::Status => {
                                tracing::info!("Received status from {}", who);
                                // Handle status logic here
                            }
                        }
                    }
                    Err(e) => {
                        tracing::warn!("Failed to deserialize message from {}: {}", who, e);
                        // Handle error (e.g., send an error message back to the client)
                    }
                }
            }
            _other => {}
        }
    }
}

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
    let (mut sender, receiver) = socket.split();

    // Check for the game state first without doing anything async
    let maybe_broadcast_rx = {
        let mut games_lock = get_games_lock(&games);
        games_lock.get_mut(&room_code).map(|game_state| {
            game_state
                .broadcast_tx
                .as_ref()
                .expect("Broadcast channel should be initialized")
                .subscribe()
        })
    };

    let broadcast_rx = match maybe_broadcast_rx {
        Some(rx) => rx,
        None => {
            tracing::error!("No game found for room code: {}", room_code);
            let _ = sender.send(Message::Close(None)).await;
            return;
        }
    };

    // This task will forward broadcast messages to this client
    let who_clone = who;
    let mut broadcast_task = tokio::spawn(run_broadcast_task(sender, broadcast_rx, who_clone));

    // This task will receive messages from client and print them on server console
    let games_clone = games.clone();
    let room_code_clone = room_code.clone();
    let mut recv_task = tokio::spawn(handle_client_message(
        receiver,
        games_clone,
        room_code_clone,
        who,
    ));

    // Wait for either task to finish
    tokio::select! {
        _ = &mut broadcast_task => recv_task.abort(),
        _ = &mut recv_task => broadcast_task.abort(),
    }

    // Clean up when the connection is closed
    {
        let mut games_lock = get_games_lock(&games);
        if let Some(game_state) = games_lock.get_mut(&room_code) {
            // Remove the player from the game
            let removed_player = game_state.players.remove(&who);

            // If this was the first buzzer, reset it
            if let Some(player) = removed_player {
                if game_state.first_buzzer.as_deref() == Some(&player.player_name) {
                    game_state.first_buzzer = None;
                    game_state.broadcast(format!(
                        "Buzzer reset because player {} disconnected",
                        player.player_name
                    ));
                }
            }
        }
    }

    // Returning from the handler closes the websocket connection
    tracing::info!("Websocket context {who} destroyed");
}
