// graphql/query/game_board.rs

use crate::db::pool::DBPool;
use crate::models::game_board::GameBoard;
use async_graphql::{Context, Object, Result};

#[derive(Default)]
pub struct GameBoardQuery;

#[Object]
impl GameBoardQuery {
    /// Find a single gameboard by id
    async fn find_game_board(&self, ctx: &Context<'_>, game_board_id: i64) -> Result<GameBoard> {
        let pool = ctx.data::<DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;
        let game_board: GameBoard = GameBoard::find_by_id(&mut conn, game_board_id)
            .await
            .map_err(|e| {
                async_graphql::Error::new(format!(
                    "Failed to fetch game board with ID {}: {}",
                    game_board_id, e
                ))
            })?;
        Ok(game_board)
    }

    /// Fetch all gameboards associated with a specific user
    async fn fetch_game_boards_from_user(
        &self,
        ctx: &Context<'_>,
        user_id: i64,
    ) -> Result<Vec<GameBoard>> {
        let pool = ctx.data::<DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;
        let game_boards = GameBoard::fetch_by_user(&mut conn, user_id).await?;
        Ok(game_boards)
    }

    /// Fetch all gameboards in the database
    async fn fetch_all_game_boards(&self, ctx: &Context<'_>) -> Result<Vec<GameBoard>> {
        let pool = ctx.data::<DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;
        let game_boards = GameBoard::all(&mut conn).await?;
        Ok(game_boards)
    }
}
