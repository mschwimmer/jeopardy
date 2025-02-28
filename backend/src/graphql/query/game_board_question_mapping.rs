// src/graphql/query/game_board_question_mapping.rs

use crate::db::pool::DBPool;
use crate::models::GBQMapping;
use async_graphql::{Context, Object, Result};

#[derive(Default)]
pub struct GameBoardMappingQuery;

#[Object]
impl GameBoardMappingQuery {
    /// Find a GameBoard-Question mapping by board id and question id
    async fn find_game_board_mapping(
        &self,
        ctx: &Context<'_>,
        game_board_id: i64,
        question_id: i64,
    ) -> Result<GBQMapping> {
        let pool = ctx.data::<DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;

        let mapping =
            GBQMapping::find_mapping_by_board_and_question(&mut conn, game_board_id, question_id)
                .await?;
        Ok(mapping)
    }

    /// Fetch all GameBoard-Question mappings for a specific GameBoard
    async fn fetch_game_board_mappings(
        &self,
        ctx: &Context<'_>,
        game_board_id: i64,
    ) -> Result<Vec<GBQMapping>> {
        let pool = ctx.data::<DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;

        let mappings = GBQMapping::fetch_mappings_by_board_id(&mut conn, game_board_id).await?;

        Ok(mappings)
    }
}
