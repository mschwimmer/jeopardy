// graphql/mutations/game_board.rs

use crate::db::pool::DBPool;
use crate::models::game_board::{GameBoard, NewGameBoard, UpdateGameBoard};
use crate::models::game_board_question_mapping::{
    GameBoardQuestionMapping, NewGameBoardQuestionMapping,
};
use crate::models::question::{NewQuestion, Question};
use async_graphql::{Context, InputObject, Object, Result};

#[derive(InputObject)]
pub struct CreateGameBoardInput {
    pub user_id: i64,
    pub title: String,
}

#[derive(InputObject)]
pub struct UpdateGameBoardInput {
    pub board_id: i64,
    pub title: Option<String>,
    pub categories: Option<Vec<String>>,
}

#[derive(Default)]
pub struct GameBoardMutation;

#[Object]
impl GameBoardMutation {
    /// Create a new gameboard with example question
    async fn create_game_board(
        &self,
        ctx: &Context<'_>,
        input: CreateGameBoardInput,
    ) -> Result<GameBoard> {
        let pool = ctx.data::<DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;

        let new_game_board: NewGameBoard = NewGameBoard {
            user_id: input.user_id,
            title: input.title,
        };
        let game_board: GameBoard = GameBoard::create(&mut conn, new_game_board).await?;
        // Create example question and associate it with this gameboard
        let example_question: Question = Question::create(
            &mut conn,
            NewQuestion {
                user_id: input.user_id,
                question: "Example Question".to_string(),
                answer: "Example Answer".to_string(),
            },
        )
        .await?;
        // Create an example board game question mapping
        let _example_board_game_question_mapping: GameBoardQuestionMapping =
            GameBoardQuestionMapping::create_mapping(
                &mut conn,
                NewGameBoardQuestionMapping {
                    board_id: game_board.id,
                    question_id: example_question.id,
                    daily_double: false,
                    points: 100,
                    grid_row: 0,
                    grid_col: 0,
                },
            )
            .await?;
        Ok(game_board)
    }

    /// Update gameboard title or categories
    async fn update_game_board(
        &self,
        ctx: &Context<'_>,
        input: UpdateGameBoardInput,
    ) -> Result<GameBoard> {
        let pool = ctx.data::<DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;

        let existing_game_board_result = GameBoard::find_by_id(&mut conn, input.board_id).await;

        let _existing_game_board = match existing_game_board_result {
            Ok(game_board) => game_board,
            Err(diesel::NotFound) => return Err(async_graphql::Error::new("Gameboard not found")),
            Err(e) => {
                return Err(async_graphql::Error::new(format!(
                    "Database error: {:?}",
                    e
                )));
            }
        };

        // Input validation
        if let Some(title) = &input.title {
            if title.is_empty() {
                return Err(async_graphql::Error::new("Title length must be positive"));
            }
        }
        if let Some(categories) = &input.categories {
            if categories.len() != 5 {
                return Err(async_graphql::Error::new("Must have 5 categories"));
            }
        }

        let updated_fields: UpdateGameBoard = UpdateGameBoard {
            title: input.title,
            categories: input.categories,
        };

        let updated: GameBoard =
            GameBoard::update_game_board(&mut conn, input.board_id, updated_fields).await?;

        Ok(updated)
    }

    /// Update gameboard category at specific index
    async fn update_game_board_category(
        &self,
        ctx: &Context<'_>,
        game_board_id: i64,
        index: i32,
        category: String,
    ) -> Result<GameBoard> {
        if !(0..=4).contains(&index) {
            return Err(async_graphql::Error::new("Category index must be 0 - 4"));
        }

        let pool = ctx.data::<DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;

        let updated: GameBoard =
            GameBoard::update_game_board_category(&mut conn, game_board_id, index, category)
                .await?;

        Ok(updated)
    }
}
