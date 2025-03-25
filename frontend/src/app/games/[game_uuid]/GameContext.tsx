"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { GameBoardQuestion } from "@/__generated__/types";

interface GameContextValue {
  game_uuid: string;
  currentGameBoardQuestion: GameBoardQuestion | null;
  setCurrentGameBoardQuestion: (question: GameBoardQuestion | null) => void;
  socket: WebSocket | null;
  messages: string[];
  sendBuzz: () => void;
  sendReset: () => void;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

/**
 * Props for your GameContextProvider.
 * Children = nested React elements
 * gameUuid = the UUID you want to provide
 */
interface GameContextProviderProps {
  children: React.ReactNode;
  game_uuid: string;
}

export function GameContextProvider({
  children,
  game_uuid,
}: GameContextProviderProps) {
  // State to hold the current detailed board question
  const [currentGameBoardQuestion, setCurrentGameBoardQuestion] =
    useState<GameBoardQuestion | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/ws?game_uuid=" + game_uuid);

    ws.onopen = () => {
      console.log("connection established");
    };

    ws.onmessage = (event) => {
      console.log("Received:", event.data);
      setMessages((prev) => [...prev, event.data]);
    };

    ws.onclose = (event) => {
      if (event.wasClean) {
        console.log(
          `Connection closed cleanly, code=${event.code}, reason=${event.reason}`
        );
      } else {
        console.log("Connection died");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [game_uuid]);

  const sendBuzz = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send("buzz");
    }
  };

  const sendReset = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket?.send("reset");
    }
  };

  const value: GameContextValue = {
    game_uuid,
    currentGameBoardQuestion,
    setCurrentGameBoardQuestion,
    socket,
    messages,
    sendBuzz,
    sendReset,
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
