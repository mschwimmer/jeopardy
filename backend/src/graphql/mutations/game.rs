// graphql/mutations/game.rs

use async_graphql::{Context, InputObject, Object, Result};

use crate::db::pool::DBPool;
use crate::models::game::{Game, NewGame};
use crate::models::player::{NewPlayer, Player};

#[derive(InputObject)]
pub struct CreateGameInput {
    pub user_id: i64,
    pub game_board_id: i64,
}

#[derive(Default)]
pub struct GameMutation;

#[Object]
impl GameMutation {
    async fn create_game(&self, ctx: &Context<'_>, input: CreateGameInput) -> Result<Game> {
        let pool = ctx.data::<DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;

        let new_game: NewGame = NewGame {
            user_id: input.user_id,
            game_board_id: input.game_board_id,
        };
        let game: Game = Game::create(&mut conn, new_game).await?;

        // Create default 3 players
        let default_players = vec![
            NewPlayer {
                game_id: game.id,
                player_name: "Player 1".to_string(),
            },
            NewPlayer {
                game_id: game.id,
                player_name: "Player 2".to_string(),
            },
            NewPlayer {
                game_id: game.id,
                player_name: "Player 3".to_string(),
            },
        ];

        for player in default_players {
            Player::create(&mut conn, player).await?;
        }

        Ok(game)
    }
}
