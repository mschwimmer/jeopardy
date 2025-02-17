import styles from "./page.module.css";
import * as React from "react";
import GameBoardGrid from "./GameBoardGrid";
import Scoreboard from "./Scoreboard";
import { GameContextProvider } from "./GameContext";
import { fetchGame, fetchGameBoard } from "@/app/lib/serverQueries";
import { Game, GameBoard } from "@/__generated__/types";

export default async function GamePage({
  params,
}: {
  params: Promise<{ game_uuid: string }>;
}) {
  const { game_uuid } = await params;
  const gameId = parseInt(game_uuid, 10);

  try {
    const game: Game = await fetchGame(gameId);
    const gameBoard: GameBoard = await fetchGameBoard(game.gameBoardId);

    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <GameContextProvider game_uuid={game_uuid}>
            <Scoreboard />
            <GameBoardGrid gameBoard={gameBoard} />
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
