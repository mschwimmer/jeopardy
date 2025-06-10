import pageStyles from "./page.module.css";
import styles from "../../styles/common.module.css";
import * as React from "react";
import GameBoardGrid from "./GameBoardGrid";
import Scoreboard from "./Scoreboard";
import { Buzzer } from "./Buzzer";
import { GameContextProvider } from "./GameContext";
import { fetchGame, fetchGameBoard } from "@/app/lib/serverQueries";
import { Game, GameBoard } from "@/__generated__/types";

export default async function GamePage({
  params,
}: {
  params: Promise<{ game_id: string }>;
}) {
  const { game_id } = await params;
  const gameId = parseInt(game_id, 10);

  try {
    const game: Game = await fetchGame(gameId);
    const gameBoard: GameBoard = await fetchGameBoard(game.gameBoardId);

    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <GameContextProvider>
            <Buzzer room_code={game.roomCode} />
            <div className={pageStyles.gameContainer}>
              <Scoreboard className={pageStyles.scoreboard} game_id={game_id} />
              <GameBoardGrid
                gameBoard={gameBoard}
                className={pageStyles.gameBoard}
              />
            </div>
          </GameContextProvider>
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error fetching game info:", error);

    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <p>Failed to load the game info. Please try again later.</p>
        </main>
      </div>
    );
  }
}
