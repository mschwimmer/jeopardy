// src/ws/state.rs

use crate::models::{game::Game, player::Player};
use diesel_async::AsyncPgConnection;
use std::{collections::HashMap, net::SocketAddr};
use tokio::sync::broadcast;

#[derive(Default)]
pub struct GameState {
    pub game: Option<Game>,
    pub room_code: String,
    pub players: HashMap<SocketAddr, Player>,
    pub first_buzzer: Option<String>,
    pub broadcast_tx: Option<broadcast::Sender<String>>,
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
            players: HashMap::new(),
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
