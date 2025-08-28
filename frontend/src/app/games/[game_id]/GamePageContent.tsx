"use client";

import { WebsocketProvider } from "./WebSocketContext";
import { GameContextProvider } from "./GameContext";
import GameBoardGrid from "./GameBoardGrid";
import Scoreboard from "./Scoreboard";
import { HostBuzzer } from "./HostBuzzer";
import pageStyles from "./page.module.css";
import { Game, GameBoard, useFullGameQuery } from "@/__generated__/graphql";

export default function GamePageContent({ gameId }: { gameId: number }) {
  // use generated query hooks to fetch game and game board data

  const {
    data: gameData,
    loading: gameLoading,
    error: gameError,
  } = useFullGameQuery({
    variables: { gameId },
  });

  if (gameLoading) return <p>Loading...</p>;
  if (gameError || !gameData?.findGame) {
    console.error("Error loading game or game board:", gameError);
    return <p>Failed to load game data.</p>;
  }

  const game: Game = gameData.findGame;
  const gameBoard: GameBoard = game.gameBoard;

  return (
    <GameContextProvider>
      <WebsocketProvider room_code={game.roomCode}>
        <HostBuzzer room_code={game.roomCode} />
        <div className={pageStyles.gameContainer}>
          <Scoreboard className={pageStyles.scoreboard} gameId={gameId} />
          <GameBoardGrid
            gameBoard={gameBoard}
            className={pageStyles.gameBoard}
          />
        </div>
      </WebsocketProvider>
    </GameContextProvider>
  );
}
