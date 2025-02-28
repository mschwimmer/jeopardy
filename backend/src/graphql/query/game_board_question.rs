// src/graphql/query/game_board_question

use crate::db::pool::DBPool;
use crate::models::question::Question;
use crate::models::{GBQMapping, GBQ};
use async_graphql::{Context, Object, Result};

#[derive(Default)]
pub struct GameBoardQuestionQuery;

#[Object]
impl GameBoardQuestionQuery {
    /// Find GameBoardQuestion from game_board_id and question_id
    async fn find_game_board_question(
        &self,
        ctx: &Context<'_>,
        game_board_id: i64,
        question_id: i64,
    ) -> Result<GBQ> {
        let pool = ctx.data::<DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;
        let mapping: GBQMapping =
            GBQMapping::find_mapping_by_board_and_question(&mut conn, game_board_id, question_id)
                .await?;
        let question: Question = Question::find_by_id(&mut conn, question_id).await?;

        let game_board_question: GBQ = GBQ { mapping, question };

        Ok(game_board_question)
    }

    /// Fetch all GameBoardQuestions from board id
    async fn fetch_game_board_questions(
        &self,
        ctx: &Context<'_>,
        game_board_id: i64,
    ) -> Result<Vec<GBQ>> {
        let pool = ctx.data::<DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;

        let questions =
            GBQ::fetch_all_game_board_questions_by_board_id(&mut conn, game_board_id).await?;

        Ok(questions)
    }
}
