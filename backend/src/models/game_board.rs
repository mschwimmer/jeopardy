// models/game_board.rs

use crate::db::schema::game_boards;
use crate::models::user::User;
use async_graphql::SimpleObject;
use chrono::{DateTime, Utc};
use derive_builder::Builder;
use diesel::prelude::*;
use diesel_async::{AsyncPgConnection, RunQueryDsl};

/// Diesel Game Board model with async-graphql support
#[derive(
    Identifiable, Associations, Queryable, Selectable, Debug, SimpleObject, Builder, Clone,
)]
#[diesel(table_name = game_boards)]
#[diesel(belongs_to(User))]
pub struct GameBoard {
    pub id: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub user_id: i64,
    pub title: String,
    pub categories: Vec<Option<String>>,
}

#[derive(Debug, Insertable, Builder)]
#[diesel(table_name = game_boards)]
pub struct NewGameBoard {
    pub user_id: i64,
    pub title: String,
}

#[derive(Debug, AsChangeset)]
#[diesel(table_name = game_boards)]
pub struct UpdateGameBoard {
    pub title: Option<String>,
    pub categories: Option<Vec<String>>,
}

impl GameBoard {
    /// Fetch gameboard by id
    pub async fn find_by_id(
        conn: &mut AsyncPgConnection,
        game_board_id: i64,
    ) -> Result<Self, diesel::result::Error> {
        game_boards::table.find(game_board_id).first(conn).await
    }

    /// Fetch user's gameboards
    pub async fn find_by_user(
        conn: &mut AsyncPgConnection,
        user_id: i64,
    ) -> Result<Vec<Self>, diesel::result::Error> {
        game_boards::table
            .filter(game_boards::user_id.eq(user_id))
            .load::<Self>(conn)
            .await
    }

    /// Fetch all gameboards
    pub async fn all(conn: &mut AsyncPgConnection) -> Result<Vec<Self>, diesel::result::Error> {
        game_boards::table.load::<Self>(conn).await
    }

    /// Create gameboard
    pub async fn create(
        conn: &mut AsyncPgConnection,
        new_game_board: NewGameBoard,
    ) -> Result<Self, diesel::result::Error> {
        diesel::insert_into(game_boards::table)
            .values(&new_game_board)
            .get_result(conn)
            .await
    }

    /// Update title or categories of gameboard
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

    /// Update individual category of gameboard
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
