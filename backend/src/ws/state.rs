// src/ws/state.rs

use crate::{
    models::{game::Game, player::Player},
    ws::socket::ServerMessage,
};
use diesel_async::AsyncPgConnection;
use std::{collections::HashMap, net::SocketAddr};
use tokio::sync::broadcast;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Role {
    Host,
    Player,
}

/// Represents an active connection in a game, whether host or player.
///
/// Fields are optional depending on role:
/// - `user_id` is populated for hosts (ties back to persistent users).
/// - `player_id` and `player_info` are populated for players if backed by a `Player` record.
/// - `display_name` is always used for UI/logs regardless.
#[derive(Debug, Clone)]
pub struct Client {
    // Every client has a display_name and role
    pub display_name: String,
    pub role: Role,

    /// Only present for Role::Host
    pub user_id: Option<i64>,

    // Only present for Role::Player
    pub player_id: Option<i64>,
    pub player_info: Option<Player>,
}

#[derive(Default)]
pub struct GameState {
    pub game: Option<Game>,
    pub room_code: String,
    pub clients: HashMap<SocketAddr, Client>,
    pub first_buzzer: Option<String>,
    pub buzzing_open: bool,
    pub broadcast_tx: Option<broadcast::Sender<ServerMessage>>,
}

impl GameState {
    pub async fn new(
        conn: &mut AsyncPgConnection,
        room_code: String,
    ) -> Result<Self, diesel::result::Error> {
        // Fetch the actual game from the database
        let game = Game::find_by_room_code(conn, room_code).await?;

        // Create a broadcast channel with capacity for 100 messages
        let (broadcast_tx, _) = broadcast::channel::<ServerMessage>(100);

        Ok(Self {
            game: Some(game.clone()),
            room_code: game.room_code.clone(),
            clients: HashMap::new(),
            first_buzzer: None,
            buzzing_open: false,
            broadcast_tx: Some(broadcast_tx),
        })
    }

    // Method to send a message to all players
    pub fn broadcast(&self, message: ServerMessage) {
        if let Some(broadcast_tx) = &self.broadcast_tx {
            // Send returns the number of receivers that got the message
            let recv_count = broadcast_tx.send(message.clone()).unwrap_or(0);
            tracing::debug!(
                "Broadcasted message of type {:?} to {} clients",
                message.message_type,
                recv_count
            );
        }
    }

    // Optional: method to get the associated game
    pub fn get_game(&self) -> Option<&Game> {
        self.game.as_ref()
    }
}
