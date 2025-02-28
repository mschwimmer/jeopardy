// graphql/query/game.rs

use crate::db::pool::DBPool;
use crate::models::game::Game;
use async_graphql::{Context, Object, Result};

#[derive(Default)]
pub struct GameQuery;

#[Object]
impl GameQuery {
    /// Find a single game by id
    async fn find_game(&self, ctx: &Context<'_>, game_id: i64) -> Result<Game> {
        let pool = ctx.data::<DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;

        let game: Game = Game::find_by_id(&mut conn, game_id).await?;
        Ok(game)
    }

    /// Fetch all games from user
    async fn fetch_games_from_user(&self, ctx: &Context<'_>, user_id: i64) -> Result<Vec<Game>> {
        let pool = ctx.data::<DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;

        let games = Game::fetch_by_user(&mut conn, user_id).await?;
        Ok(games)
    }
}
