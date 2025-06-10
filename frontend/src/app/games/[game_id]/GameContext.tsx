"use client";

import React, { createContext, useContext, useState } from "react";

import { GameBoardQuestion } from "@/__generated__/types";

interface GameContextValue {
  currentGameBoardQuestion: GameBoardQuestion | null;
  setCurrentGameBoardQuestion: (question: GameBoardQuestion | null) => void;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

/**
 * Props for your GameContextProvider.
 * Children = nested React elements
 * room_code = Room Code of host's game
 * host_id = User ID of the host
 */
interface GameContextProviderProps {
  children: React.ReactNode;
}

export function GameContextProvider({ children }: GameContextProviderProps) {
  // State to hold the current detailed board question
  const [currentGameBoardQuestion, setCurrentGameBoardQuestion] =
    useState<GameBoardQuestion | null>(null);

  const value: GameContextValue = {
    currentGameBoardQuestion,
    setCurrentGameBoardQuestion,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

/**
 * Custom hook to consume the GameContext
 */
export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameContextProvider");
  }
  return context;
}
