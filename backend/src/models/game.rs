// models/game.rs

use crate::db::pool::DBPool;
use crate::db::schema::games;
use crate::models::game_board::GameBoard;
use crate::models::user::User;
use async_graphql::{ComplexObject, SimpleObject};
use chrono::{DateTime, Utc};
use derive_builder::Builder;
use diesel::prelude::*;
use diesel_async::{AsyncPgConnection, RunQueryDsl};
use rand::distr::{Alphanumeric, SampleString};

/// Represents a game in the application.
///
/// This struct supports Diesel for database interactions
/// and integrates with async-graphql for GraphQL APIs. It is
/// associated with the `User` struct.
#[derive(
    Identifiable, Associations, Queryable, Selectable, Debug, SimpleObject, Builder, Clone,
)]
#[diesel(table_name = games)]
#[diesel(belongs_to(User))]
#[graphql(complex)]
pub struct Game {
    pub id: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub user_id: i64,
    pub game_board_id: i64,
    pub room_code: String,
}

/// Represents a new game to be inserted into the database.
#[derive(Debug, Insertable, Builder)]
#[diesel(table_name = games)]
pub struct NewGame {
    pub user_id: i64,
    pub game_board_id: i64,
    pub room_code: String,
}

impl Game {
    /// Find a game by its unique ID.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    /// * `game_id` - The unique identifier of the game to fetch.
    ///
    /// # Returns
    /// A `Result` containing the game or a Diesel error.
    pub async fn find_by_id(
        conn: &mut AsyncPgConnection,
        game_id: i64,
    ) -> Result<Self, diesel::result::Error> {
        games::table.find(game_id).first(conn).await
    }

    /// Find a game by its unique room code.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    /// * `room_code` - The unique room code of the game to fetch.
    ///
    /// # Returns
    /// A `Result` containing the game or a Diesel error.
    pub async fn find_by_room_code(
        conn: &mut AsyncPgConnection,
        room_code: String,
    ) -> Result<Self, diesel::result::Error> {
        games::table
            .filter(games::room_code.eq(room_code))
            .first(conn)
            .await
    }

    /// Fetch all games from the database.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    ///
    /// # Returns
    /// A `Result` containing a vector of games or a Diesel error.
    pub async fn all(conn: &mut AsyncPgConnection) -> Result<Vec<Self>, diesel::result::Error> {
        games::table.load::<Self>(conn).await
    }

    /// Fetch all games created by a specific user.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    /// * `user_id` - The unique identifier of the user.
    ///
    /// # Returns
    /// A `Result` containing a vector of games or a Diesel error.
    pub async fn fetch_by_user(
        conn: &mut AsyncPgConnection,
        user_id: i64,
    ) -> Result<Vec<Self>, diesel::result::Error> {
        games::table
            .filter(games::user_id.eq(user_id))
            .load::<Self>(conn)
            .await
    }

    /// Create a new game in the database.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    /// * `new_game` - A `NewGame` instance containing the game's data.
    ///
    /// # Returns
    /// A `Result` containing the newly created game or a Diesel error.
    pub async fn create(
        conn: &mut AsyncPgConnection,
        new_game: NewGame,
    ) -> Result<Self, diesel::result::Error> {
        // Try to generate a unique room code
        let room_code = Self::generate_unique_room_code(conn).await?;

        // Insert the game with the generated room code
        diesel::insert_into(games::table)
            .values(
                &NewGameBuilder::default()
                    .user_id(new_game.user_id)
                    .game_board_id(new_game.game_board_id)
                    .room_code(room_code)
                    .build()
                    .expect("Failed to build NewGame"),
            )
            .get_result(conn)
            .await
    }

    /// Generate a unique room code for a game.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    ///
    /// # Returns
    /// A `Result` containing a unique room code or a Diesel error.
    async fn generate_unique_room_code(
        conn: &mut AsyncPgConnection,
    ) -> Result<String, diesel::result::Error> {
        const MAX_ATTEMPTS: usize = 10;
        const ROOM_CODE_LENGTH: usize = 6;

        for _ in 0..MAX_ATTEMPTS {
            // Generate a random 6-character alphanumeric room code
            let room_code: String = Alphanumeric.sample_string(&mut rand::rng(), ROOM_CODE_LENGTH);

            // Check if the room code already exists
            let existing_count = games::table
                .filter(games::room_code.eq(&room_code))
                .count()
                .get_result::<i64>(conn)
                .await?;

            // If no existing game with this room code, return it
            if existing_count == 0 {
                tracing::debug!("Generated unique room code: {}", room_code);
                return Ok(room_code);
            }
        }

        // If we couldn't generate a unique code after MAX_ATTEMPTS
        Err(diesel::result::Error::RollbackTransaction)
    }
}

#[ComplexObject]
impl Game {
    pub async fn game_board(
        &self,
        ctx: &async_graphql::Context<'_>,
    ) -> Result<GameBoard, async_graphql::Error> {
        let pool = ctx.data::<DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;
        GameBoard::find_by_id(&mut conn, self.game_board_id)
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to load game board: {}", e)))
    }

    pub async fn user(
        &self,
        ctx: &async_graphql::Context<'_>,
    ) -> Result<User, async_graphql::Error> {
        let pool = ctx.data::<DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;
        let user = User::find_by_id(&mut conn, self.user_id)
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to load user: {}", e)))?;

        user.ok_or_else(|| {
            async_graphql::Error::new("Data integrity error: game references non-existent user")
        })
    }
}
