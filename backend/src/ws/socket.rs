// src/ws/socket.rs
/// Main loop and dispatch goes here
/// TODO: factor out message types and builders into messages.rs
use crate::ws::messages::{make_status_message, ServerMessage, ServerMessageType};
use crate::ws::state::{Client, GameState};
use crate::ws::utils::get_games_lock;
use crate::ws::Games;

use axum::{
    body::Bytes,
    extract::ws::{Message, Utf8Bytes, WebSocket},
};
use futures::{SinkExt, StreamExt};
use std::net::SocketAddr;
use tokio::sync::broadcast;

/// Helper function to run broadcast task
async fn run_broadcast_task(
    mut sender: impl SinkExt<Message> + Unpin,
    mut broadcast_rx: broadcast::Receiver<ServerMessage>,
    who: SocketAddr,
) {
    while let Ok(server_message) = broadcast_rx.recv().await {
        tracing::info!("Forwarding broadcast message to {}", who);
        if let Ok(json_string) = serde_json::to_string(&server_message) {
            let json_bytes = Utf8Bytes::from(json_string);
            if sender.send(Message::Text(json_bytes)).await.is_err() {
                break;
            }
        } else {
            tracing::warn!("Failed to serialize ServerMessage for {}", who);
        }
    }
}

/// Helper function to handle buzz from client, possibly worth extracting to a utility module
fn handle_buzz(game_state: &mut GameState, who: SocketAddr) {
    let buzzer = game_state
        .clients
        .get(&who)
        .map(|client| client.display_name.clone())
        .unwrap_or_else(|| who.to_string());

    match game_state.first_buzzer.clone() {
        Some(ref first_buzzer) if *first_buzzer == buzzer => {
            tracing::info!("{buzzer} buzzed again");
            game_state.broadcast(make_status_message(
                &who.to_string(),
                &format!("{buzzer} buzzed again!"),
            ));
        }
        Some(ref first_buzzer) => {
            tracing::info!("{who} buzzed, but {first_buzzer} already buzzed first");
            game_state.broadcast(make_status_message(
                &who.to_string(),
                &format!("{buzzer} buzzed, but {first_buzzer} already buzzed first!"),
            ));
        }
        None => {
            game_state.first_buzzer = Some(buzzer.clone());
            tracing::info!("{buzzer} buzzed first");
            game_state.broadcast(make_status_message(
                &who.to_string(),
                &format!("{buzzer} buzzed first!"),
            ));
        }
    }
}

/// Helper function to handle buzzer resets from host, possibly worth extracting to a utility module
fn handle_reset(game_state: &mut GameState, who: SocketAddr) {
    game_state.first_buzzer = None;

    let display_name = game_state
        .clients
        .get(&who)
        .map(|client| client.display_name.clone())
        .unwrap_or_else(|| who.to_string());

    tracing::info!("Buzzer reset by {}", display_name);

    game_state.broadcast(make_status_message(
        &who.to_string(),
        &format!("Buzzer reset by {}", display_name),
    ));
}

/// Helper function to handle status request from client, possibly worth extracting to a utility module
fn handle_status(_game_state: &mut GameState, who: SocketAddr, message: &ServerMessage) {
    tracing::info!(
        "Received status from {}: {:?}",
        who,
        message.data.status.as_deref().unwrap_or("<no status>")
    );

    // Example: Echo it back to everyone (optional, based on your app logic)
    // You can ignore this or customize it further
}

/// Helper function to handle client disconnection, possibly worth extracting to a utility module
fn handle_disconnect(game_state: &mut GameState, who: SocketAddr, client: &Client) {
    if game_state.first_buzzer.as_deref() == Some(&client.display_name) {
        game_state.first_buzzer = None;
        game_state.broadcast(make_status_message(
            &who.to_string(),
            &format!(
                "Buzzer reset because player {} disconnected",
                client.display_name
            ),
        ));
    }
}

/// Helper function to handle messages from the client (buzz, reset, status)
async fn handle_client_message(
    mut receiver: impl StreamExt<Item = Result<Message, axum::Error>> + Unpin,
    games: Games,
    room_code: String,
    who: SocketAddr,
) {
    while let Some(msg) = receiver.next().await {
        match msg {
            Ok(Message::Text(text)) => {
                tracing::info!(%who, len = text.len(), "Received text");
                match serde_json::from_str::<ServerMessage>(&text) {
                    Ok(server_message) => match server_message.message_type {
                        ServerMessageType::Buzz => {
                            tracing::info!("Received buzz from {}", who);
                            let mut games_lock = get_games_lock(&games);
                            if let Some(game_state) = games_lock.get_mut(&room_code) {
                                handle_buzz(game_state, who);
                            }
                        }
                        ServerMessageType::Reset => {
                            tracing::info!("Received reset from {}", who);
                            let mut games_lock = get_games_lock(&games);
                            if let Some(game_state) = games_lock.get_mut(&room_code) {
                                // TODO implement reset logic
                                handle_reset(game_state, who);
                            }
                        }
                        ServerMessageType::Status => {
                            let mut games_lock = get_games_lock(&games);
                            if let Some(game_state) = games_lock.get_mut(&room_code) {
                                // TODO implement status logic
                                handle_status(game_state, who, &server_message);
                            }
                        }
                    },
                    Err(e) => {
                        tracing::warn!("Failed to deserialize ServerMessage from {}: {}", who, e);
                    }
                }
            }
            Ok(Message::Binary(ref b)) => {
                /* TODO ignore or handle */
                tracing::info!(%who, len = b.len(), "Received binary");
            }
            Ok(Message::Ping(_p)) => {
                /* TODO axum auto-pongs; no-op */
                tracing::trace!(%who, "Received ping");
            }
            Ok(Message::Pong(_p)) => {
                /* TODO keep-alive; no-op */
                tracing::trace!(%who, "Received pong");
            }
            Ok(Message::Close(frame)) => {
                tracing::warn!(%who, ?frame, "Client closed connection");
                break;
            }
            Err(e) => {
                tracing::error!(%who, error = ?e, "WebSocket error");
                break;
            }
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
            let removed_client = game_state.clients.remove(&who);

            if let Some(client) = removed_client {
                handle_disconnect(game_state, who, &client);
            }
        }
    }

    // Returning from the handler closes the websocket connection
    tracing::info!("Websocket context {who} destroyed");
}
