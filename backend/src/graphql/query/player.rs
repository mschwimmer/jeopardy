// graphql/query/player.rs

use crate::db::pool::DBPool;
use crate::models::player::Player;
use async_graphql::{Context, Object, Result};

#[derive(Default)]
pub struct PlayerQuery;

#[Object]
impl PlayerQuery {
    /// Find a single player by id
    async fn find_player(&self, ctx: &Context<'_>, player_id: i64) -> Result<Player> {
        let pool = ctx.data::<DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;
        let player: Player = Player::find_by_id(&mut conn, player_id).await?;
        Ok(player)
    }

    /// Fetch all players by game id
    async fn fetch_players_from_game(
        &self,
        ctx: &Context<'_>,
        game_id: i64,
    ) -> Result<Vec<Player>> {
        let pool = ctx.data::<DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;

        let players = Player::fetch_by_game_id(&mut conn, game_id).await?;
        Ok(players)
    }
}
