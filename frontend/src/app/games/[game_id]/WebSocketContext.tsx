// This file sets up a React Context to provide WebSocket functionality to child components.
// It manages the WebSocket connection lifecycle and exposes methods to send structured messages
// (like "buzz" and "reset") to a game server. It should be placed high in the React component tree.

"use client";
import React, { createContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/lib/AuthProvider";

// Types of messages the server can send or receive
export type ServerMessageType = "buzz" | "reset" | "status";

// Structure of the data field in a server message
export interface ServerData {
  user_id?: string;
  buzz_time?: number;
  status?: string;
}

// Full structure of a message sent between client and server
export interface ServerMessage {
  type: ServerMessageType;
  data: ServerData;
  timestamp: number;
}

// Shape of the WebSocket context available to consumers
interface WebsocketContextValue {
  ready: boolean; // Whether the WebSocket is open and ready
  value: ServerMessage | null; // Latest message received from the server
  send: (message: string) => void; // Raw message sender
  sendBuzz: () => void;
  sendReset: () => void;
}

// Default context value (used before provider is initialized)
export const WebsocketContext = createContext<
  WebsocketContextValue | undefined
>({
  ready: false,
  value: null,
  send: () => {},
  sendBuzz: () => {},
  sendReset: () => {},
});

// Props expected by the WebSocket provider
interface WebsocketContextProviderProps {
  children: React.ReactNode;
  room_code: string;
  display_name?: string; // Optional display name for the host
}

// Helper to construct the WebSocket URL with query parameters
const buildSocketUrl = (
  room_code: string,
  host_id: string,
  display_name: string
) => {
  const params = new URLSearchParams({
    room_code,
    host_id,
    display_name,
  });
  return `ws://localhost:8080/ws?${params.toString()}`;
};

/**
 * WebSocket provider that establishes the connection and shares it via React Context.
 * Wrap components that need to send/receive WebSocket messages inside this provider.
 */
export const WebsocketProvider = ({
  children,
  room_code,
  display_name = "HOST", // Default display name for the host
}: WebsocketContextProviderProps) => {
  const [isReady, setIsReady] = useState(false);
  const [val, setVal] = useState<ServerMessage | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const { backendUser } = useAuth();

  const sendStructured = (
    type: ServerMessageType,
    data: Partial<ServerData> = {}
  ) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const msg: ServerMessage = {
        type,
        data: {
          ...data,
        },
        timestamp: Date.now(),
      };
      ws.current.send(JSON.stringify(msg));
    }
  };

  // Function to send messages safely
  const sendMessage = (message: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    }
  };

  const sendBuzz = () => sendStructured("buzz");
  const sendReset = () => sendStructured("reset");

  // Establish WebSocket connection on mount and clean up on unmount
  useEffect(() => {
    if (!backendUser?.id) {
      console.error("No backend user found");
      return;
    }

    const socketUrl = buildSocketUrl(
      room_code,
      backendUser.id.toString(),
      display_name
    );
    console.log("Connecting to WebSocket:", socketUrl);
    const socket = new WebSocket(socketUrl);
    ws.current = socket;

    socket.onopen = () => {
      setIsReady(true);
      console.log("WebSocket connected");
    };
    socket.onclose = () => {
      setIsReady(false);
      console.log("WebSocket disconnected");
    };
    socket.onerror = (e) => {
      console.warn("WebSocket error", e);
    };
    socket.onmessage = (event) => {
      console.log("Raw WebSocket message:", event.data);
      try {
        const parsed: ServerMessage = JSON.parse(event.data);
        console.log("Received structured:", parsed);
        setVal(parsed);
      } catch {
        console.log("Received raw (malformed):", event.data);
        setVal(null);
      }
    };

    return () => {
      socket.close();
      ws.current = null;
    };
  }, [backendUser, room_code, display_name]); // Add backendUser and room_code as dependencies

  // Create the context value object with the proper structure
  const contextValue: WebsocketContextValue = {
    ready: isReady,
    value: val,
    send: sendMessage,
    sendBuzz,
    sendReset,
  };

  return (
    <WebsocketContext.Provider value={contextValue}>
      {children}
    </WebsocketContext.Provider>
  );
};
