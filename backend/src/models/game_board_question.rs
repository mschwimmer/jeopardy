// src/models/game_board_question.rs
//! This module contains the `GameBoardQuestion` struct and related logic.
//! The struct is aliased as `GBQ` in the `mod.rs` file for shorter references.

use crate::models::question::Question;
use crate::models::GBQMapping;
use async_graphql::SimpleObject;
use diesel_async::AsyncPgConnection;

///`GBQ` is alias for `GameBoardQuestion`.
///
/// Represents a question and its corresponding gameboard metadata
///
/// GBQ := GBQMapping + Question.
/// # Example
/// ```rust, ignore
/// use crate::models::{GameBoardQuestion, GBQMapping, Question};
/// use chrono::Utc;
///
/// let mapping = GBQMapping {
///     board_id: 1,
///     question_id: 42,
///     daily_double: false,
///     points: 200,
///     grid_row: 2,
///     grid_col: 3,
/// };
///
/// let question = Question {
///     id: 42,
///     created_at: Utc::now(),
///     updated_at: Utc::now(),
///     user_id: 1,
///     question: String::from("What is Rust?"),
///     answer: String::from("A programming language."),
/// };
///
/// let gbq = GameBoardQuestion::new(mapping, question);
/// println!("{:?}", gbq);
/// ```
#[derive(SimpleObject, Debug)]
pub struct GameBoardQuestion {
    pub mapping: GBQMapping,
    pub question: Question,
}

impl GameBoardQuestion {
    pub fn new(mapping: GBQMapping, question: Question) -> Self {
        Self { mapping, question }
    }

    /// Fetch all mappings with questions for a gameboard
    pub async fn fetch_all_game_board_questions_by_board_id(
        conn: &mut AsyncPgConnection,
        game_board_id: i64,
    ) -> Result<Vec<GameBoardQuestion>, diesel::result::Error> {
        // Fetch mappings
        let mappings: Vec<GBQMapping> =
            GBQMapping::fetch_mappings_by_board_id(conn, game_board_id).await?;

        // Fetch questions for each mapping
        let mut game_board_questions = Vec::new();
        for mapping in mappings {
            let question: Question = Question::find_by_id(conn, mapping.question_id).await?;
            game_board_questions.push(GameBoardQuestion { mapping, question });
        }

        Ok(game_board_questions)
    }
}
