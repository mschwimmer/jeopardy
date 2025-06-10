import { createContext, useContext, useEffect, useState } from "react";

interface PlayerContextValue {
  room_code: string;
  player_id: string;
  socket: WebSocket | null;
  messages: string[];
  sendBuzz: () => void;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

/**
 * Props for your PlayerContextProvider.
 * Children = nested React elements
 * game_id = the ID of the game
 * player_id = the ID of the playe
 */
interface PlayerContextProviderProps {
  children: React.ReactNode;
  room_code: string;
  player_id: string;
}

export function PlayerContextProvider({
  children,
  room_code,
  player_id,
}: PlayerContextProviderProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const ws = new WebSocket(
      "ws://localhost:8080/ws?room_code=" +
        room_code +
        "&player_id=" +
        player_id
    );

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
  }, [room_code, player_id]);

  const sendBuzz = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send("buzz");
    }
  };

  const value: PlayerContextValue = {
    room_code,
    player_id,
    socket,
    messages,
    sendBuzz,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

/**
 * Custom hook to consume the PlayerContext
 */
export function usePlayerContext() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error(
      "usePlayerContext must be used within a PlayerContextProvider"
    );
  }
  return context;
}
