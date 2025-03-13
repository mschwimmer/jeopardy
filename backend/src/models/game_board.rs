// models/game_board.rs

use crate::db::pool::DBPool;
use crate::db::schema::game_boards;
use crate::models::user::User;
use async_graphql::{ComplexObject, SimpleObject};
use chrono::{DateTime, Utc};
use derive_builder::Builder;
use diesel::prelude::*;
use diesel_async::{AsyncPgConnection, RunQueryDsl};

/// Represents a game board in the application.
///
/// This struct supports Diesel for database interactions
/// and integrates with async-graphql for GraphQL APIs. It is
/// associated with the `User` struct and organizes the structure
/// of a game with its title and categories.
#[derive(
    Identifiable, Associations, Queryable, Selectable, Debug, SimpleObject, Builder, Clone,
)]
#[diesel(table_name = game_boards)]
#[diesel(belongs_to(User))]
#[graphql(complex)]
pub struct GameBoard {
    /// The unique identifier for the game board.
    pub id: i64,
    /// The timestamp when the game board record was created.
    pub created_at: DateTime<Utc>,
    /// The timestamp when the game board record was last updated.
    pub updated_at: DateTime<Utc>,
    /// The unique identifier of the user who created the game board.
    pub user_id: i64,
    /// The title of the game board.
    pub title: String,
    /// A vector of category names for the game board. Each category
    /// is an optional string, allowing for empty or missing categories.
    pub categories: Vec<Option<String>>,
}

/// Represents a new game board to be inserted into the database.
#[derive(Debug, Insertable, Builder)]
#[diesel(table_name = game_boards)]
pub struct NewGameBoard {
    pub user_id: i64,
    pub title: String,
}

/// Represents the fields to update in an existing game board record.
#[derive(Debug, AsChangeset)]
#[diesel(table_name = game_boards)]
pub struct UpdateGameBoard {
    pub title: Option<String>,
    pub categories: Option<Vec<String>>,
}

impl GameBoard {
    /// Find a game board by its unique ID.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    /// * `game_board_id` - The unique identifier of the game board to fetch.
    ///
    /// # Returns
    /// A `Result` containing the game board or a Diesel error.
    pub async fn find_by_id(
        conn: &mut AsyncPgConnection,
        game_board_id: i64,
    ) -> Result<Self, diesel::result::Error> {
        game_boards::table.find(game_board_id).first(conn).await
    }

    /// Fetch all game boards created by a specific user.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    /// * `user_id` - The unique identifier of the user.
    ///
    /// # Returns
    /// A `Result` containing a vector of game boards or a Diesel error.
    pub async fn fetch_by_user(
        conn: &mut AsyncPgConnection,
        user_id: i64,
    ) -> Result<Vec<Self>, diesel::result::Error> {
        game_boards::table
            .filter(game_boards::user_id.eq(user_id))
            .load::<Self>(conn)
            .await
    }

    /// Fetch all game boards from the database.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    ///
    /// # Returns
    /// A `Result` containing a vector of game boards or a Diesel error.
    pub async fn all(conn: &mut AsyncPgConnection) -> Result<Vec<Self>, diesel::result::Error> {
        game_boards::table.load::<Self>(conn).await
    }

    /// Create a new game board in the database.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    /// * `new_game_board` - A `NewGameBoard` instance containing the game board's data.
    ///
    /// # Returns
    /// A `Result` containing the newly created game board or a Diesel error.
    pub async fn create(
        conn: &mut AsyncPgConnection,
        new_game_board: NewGameBoard,
    ) -> Result<Self, diesel::result::Error> {
        diesel::insert_into(game_boards::table)
            .values(&new_game_board)
            .get_result(conn)
            .await
    }

    /// Update the title or categories of a game board.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    /// * `game_board_id` - The unique identifier of the game board to update.
    /// * `updated_fields` - An `UpdateGameBoard` instance containing the updated fields.
    ///
    /// # Returns
    /// A `Result` containing the updated game board or a Diesel error.
    pub async fn update_game_board(
        conn: &mut AsyncPgConnection,
        game_board_id: i64,
        updated_fields: UpdateGameBoard,
    ) -> Result<Self, diesel::result::Error> {
        diesel::update(game_boards::table.find(game_board_id))
            .set(&updated_fields)
            .get_result(conn)
            .await
    }

    /// Update an individual category of a game board.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    /// * `game_board_id` - The unique identifier of the game board to update.
    /// * `index` - The index of the category to update.
    /// * `category` - The new category name to set at the specified index.
    ///
    /// # Returns
    /// A `Result` containing the updated game board or a Diesel error.
    pub async fn update_game_board_category(
        conn: &mut AsyncPgConnection,
        game_board_id: i64,
        index: i32,
        category: String,
    ) -> Result<Self, diesel::result::Error> {
        let mut game_board: GameBoard = game_boards::table
            .find(game_board_id)
            .first::<Self>(conn)
            .await?;

        game_board.categories[index as usize] = Some(category);

        diesel::update(game_boards::table.find(game_board_id))
            .set(game_boards::categories.eq(game_board.categories))
            .get_result::<Self>(conn)
            .await
    }
}

#[ComplexObject]
impl GameBoard {
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

        let user = User::find_by_id(&mut conn, self.user_id).await?;

        user.ok_or_else(|| {
            async_graphql::Error::new("Data integrity error: GameBoard has invalid user_id")
        })
    }
}
