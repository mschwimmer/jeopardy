//! src/models/board_question.rs
//! This module contains the `GameBoardQuestionMapping` struct and related logic.
//! The struct is aliased as `GBQMapping` in the `mod.rs` file for shorter references.

use crate::db::schema::game_board_question_mappings;
use crate::models::game_board::GameBoard;
use crate::models::question::Question;
use async_graphql::SimpleObject;
use derive_builder::Builder;
use diesel::prelude::*;
use diesel_async::{AsyncPgConnection, RunQueryDsl};

/// `GBQMapping` is alias for `GameBoardQuestionMapping`.
/// Represents the mapping between a game board and a question.
///
/// This struct defines the association between a game board and a question
/// along with additional metadata such as the position of the question
/// on the grid, points, and whether it's a daily double.
/// # Example
/// ```rust, ignore
/// let mapping = GBQMapping {
///     board_id: 1,
///     question_id: 42,
///     daily_double: false,
///     points: 200,
///     grid_row: 2,
///     grid_col: 3,
/// }
/// ```
#[derive(
    Identifiable, Associations, Queryable, Selectable, Debug, SimpleObject, Builder, Clone,
)]
#[diesel(primary_key(board_id, question_id))]
#[diesel(table_name = game_board_question_mappings)]
#[diesel(belongs_to(GameBoard, foreign_key = board_id))]
#[diesel(belongs_to(Question, foreign_key = question_id))]
pub struct GameBoardQuestionMapping {
    pub board_id: i64,
    pub question_id: i64,
    pub daily_double: bool,
    pub points: i32,
    pub grid_row: i32,
    pub grid_col: i32,
}

/// `NewGBQMapping` is alias for `NewGameBoardQuestionMapping`.
///
/// Represents a new mapping between a game board and a question.
#[derive(Debug, Insertable, Builder)]
#[diesel(table_name = game_board_question_mappings)]
pub struct NewGameBoardQuestionMapping {
    pub board_id: i64,
    pub question_id: i64,
    pub daily_double: bool,
    pub points: i32,
    pub grid_row: i32,
    pub grid_col: i32,
}

/// `UpdateGBQMapping` is alias for `UpdateGameBoardQuestionMapping`.
///
/// Represents the fields to update in an existing game board-question mapping.
#[derive(Debug, AsChangeset)]
#[diesel(table_name = game_board_question_mappings)]
pub struct UpdateGameBoardQuestionMapping {
    pub daily_double: Option<bool>,
    pub points: Option<i32>,
    pub grid_row: Option<i32>,
    pub grid_col: Option<i32>,
}

impl GameBoardQuestionMapping {
    /// Create a new game board-question mapping.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    /// * `new_mapping` - A `NewGameBoardQuestionMapping` instance containing the mapping's data.
    ///
    /// # Returns
    /// A `Result` containing the newly created mapping or a Diesel error.
    pub async fn create_mapping(
        conn: &mut AsyncPgConnection,
        new_mapping: NewGameBoardQuestionMapping,
    ) -> Result<Self, diesel::result::Error> {
        diesel::insert_into(game_board_question_mappings::table)
            .values(&new_mapping)
            .get_result(conn)
            .await
    }

    /// Fetch all mappings for a board
    pub async fn fetch_mappings_by_board_id(
        conn: &mut AsyncPgConnection,
        board_id: i64,
    ) -> Result<Vec<Self>, diesel::result::Error> {
        game_board_question_mappings::table
            .filter(game_board_question_mappings::board_id.eq(board_id))
            .load::<Self>(conn)
            .await
    }

    /// Fetch all mappings for a specific game board.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    /// * `board_id` - The ID of the game board.
    ///
    /// # Returns
    /// A `Result` containing a vector of mappings or a Diesel error.
    pub async fn fetch_mappings_by_question_id(
        conn: &mut AsyncPgConnection,
        question_id: i64,
    ) -> Result<Vec<Self>, diesel::result::Error> {
        game_board_question_mappings::table
            .filter(game_board_question_mappings::question_id.eq(question_id))
            .load::<Self>(conn)
            .await
    }

    /// Find a mapping by game board ID and question ID.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    /// * `board_id` - The ID of the game board.
    /// * `question_id` - The ID of the question.
    ///
    /// # Returns
    /// A `Result` containing the mapping or a Diesel error.
    pub async fn find_mapping_by_board_and_question(
        conn: &mut AsyncPgConnection,
        board_id: i64,
        question_id: i64,
    ) -> Result<Self, diesel::result::Error> {
        game_board_question_mappings::table
            .filter(game_board_question_mappings::board_id.eq(board_id))
            .filter(game_board_question_mappings::question_id.eq(question_id))
            .first(conn)
            .await
    }

    /// Find a mapping by game board ID, row, and column.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    /// * `game_board_id` - The ID of the game board.
    /// * `row` - The row position on the game board grid.
    /// * `col` - The column position on the game board grid.
    ///
    /// # Returns
    /// A `Result` containing the mapping or a Diesel error.
    pub async fn find_mapping_by_row_and_col(
        conn: &mut AsyncPgConnection,
        game_board_id: i64,
        row: i32,
        col: i32,
    ) -> Result<Self, diesel::result::Error> {
        game_board_question_mappings::table
            .filter(game_board_question_mappings::board_id.eq(game_board_id))
            .filter(game_board_question_mappings::grid_row.eq(row))
            .filter(game_board_question_mappings::grid_col.eq(col))
            .first(conn)
            .await
    }

    /// Update fields for a specific game board-question mapping.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    /// * `board_id` - The ID of the game board.
    /// * `question_id` - The ID of the question.
    /// * `updated_fields` - An `UpdateGameBoardQuestionMapping` instance containing the updated fields.
    ///
    /// # Returns
    /// A `Result` containing the updated mapping or a Diesel error.
    pub async fn update_mapping(
        conn: &mut AsyncPgConnection,
        board_id: i64,
        question_id: i64,
        updated_fields: UpdateGameBoardQuestionMapping,
    ) -> Result<Self, diesel::result::Error> {
        diesel::update(game_board_question_mappings::table.find((board_id, question_id)))
            .set(&updated_fields)
            .get_result(conn)
            .await
    }
}
