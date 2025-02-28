// src/graphql/mutation/game_board_question_mapping.rs

use async_graphql::{Context, InputObject, Object, Result};

use crate::db::pool::DBPool;
use crate::models::{
    game_board::GameBoard, question::Question, GBQMapping, NewGBQMapping, UpdateGBQMapping,
};

#[derive(InputObject)]
pub struct CreateGameBoardMappingInput {
    pub board_id: i64,
    pub question_id: i64,
    pub daily_double: bool,
    pub points: i32,
    pub grid_row: i32,
    pub grid_col: i32,
}

#[derive(InputObject)]
pub struct UpdateGameBoardMappingInput {
    pub board_id: i64,
    pub question_id: i64,
    pub daily_double: Option<bool>,
    pub points: Option<i32>,
    pub grid_row: Option<i32>,
    pub grid_col: Option<i32>,
}

#[derive(Default)]

pub struct GameBoardMappingMutation;

#[Object]
impl GameBoardMappingMutation {
    /// Associate a question with a gameboard
    async fn create_mapping(
        &self,
        ctx: &Context<'_>,
        input: CreateGameBoardMappingInput,
    ) -> Result<GBQMapping> {
        let pool = ctx.data::<DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;

        // Validate GameBoard exists
        let _board = match GameBoard::find_by_id(&mut conn, input.board_id).await {
            Ok(b) => b,
            Err(_) => return Err(async_graphql::Error::new("GameBoard not found")),
        };

        // Validate Question Exists
        let _question = match Question::find_by_id(&mut conn, input.question_id).await {
            Ok(q) => q,
            Err(_) => return Err(async_graphql::Error::new("Question not found")),
        };

        // Check for existing mapping between question and board
        if let Ok(_existing_mapping) = GBQMapping::find_mapping_by_board_and_question(
            &mut conn,
            input.board_id,
            input.question_id,
        )
        .await
        {
            return Ok(_existing_mapping);
        }

        // Check for existing BoardQuestion at [row, col]
        if let Ok(_existing_mapping) = GBQMapping::find_mapping_by_row_and_col(
            &mut conn,
            input.board_id,
            input.grid_row,
            input.grid_col,
        )
        .await
        {
            return Err(async_graphql::Error::new(format!(
                "Mapping already exists for [{},{}]",
                input.grid_row, input.grid_col
            )));
        }

        // Proceed with association
        let new_mapping = NewGBQMapping {
            board_id: input.board_id,
            question_id: input.question_id,
            daily_double: input.daily_double,
            points: input.points,
            grid_row: input.grid_row,
            grid_col: input.grid_col,
        };

        let mapping = GBQMapping::create_mapping(&mut conn, new_mapping).await?;
        Ok(mapping)
    }

    async fn update_mapping(
        &self,
        ctx: &Context<'_>,
        input: UpdateGameBoardMappingInput,
    ) -> Result<GBQMapping> {
        let pool = ctx.data::<DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;

        let existing_mapping_result = GBQMapping::find_mapping_by_board_and_question(
            &mut conn,
            input.board_id,
            input.question_id,
        )
        .await;

        let _existing_mapping = match existing_mapping_result {
            Ok(mapping) => mapping,
            Err(diesel::NotFound) => return Err(async_graphql::Error::new("Mapping not found")),
            Err(e) => {
                return Err(async_graphql::Error::new(format!(
                    "Database error: {:?}",
                    e
                )));
            }
        };

        // Input validation
        if let Some(p) = input.points {
            if p < 0 {
                return Err(async_graphql::Error::new("Points must be positive"));
            }
        }

        let updated_fields: UpdateGBQMapping = UpdateGBQMapping {
            daily_double: input.daily_double,
            points: input.points,
            grid_row: input.grid_row,
            grid_col: input.grid_col,
        };

        let updated: GBQMapping = GBQMapping::update_mapping(
            &mut conn,
            input.board_id,
            input.question_id,
            updated_fields,
        )
        .await?;

        Ok(updated)
    }
}
