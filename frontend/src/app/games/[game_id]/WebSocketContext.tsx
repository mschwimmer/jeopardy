"use client";
import React, { createContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/lib/AuthProvider";

export type ServerMessageType = "buzz" | "reset" | "status";

export interface ServerData {
  user_id?: string;
  buzz_time?: number;
  status?: string;
}

export interface ServerMessage {
  type: ServerMessageType;
  data: ServerData;
  timestamp: number;
}

interface WebsocketContextValue {
  ready: boolean;
  value: ServerMessage | null;
  send: (message: string) => void;
  sendBuzz: () => void;
  sendReset: () => void;
}

export const WebsocketContext = createContext<
  WebsocketContextValue | undefined
>({
  ready: false,
  value: null,
  send: () => {},
  sendBuzz: () => {},
  sendReset: () => {},
});
// ready, value, send

interface WebsocketContextProviderProps {
  children: React.ReactNode;
  room_code: string;
  display_name?: string; // Optional display name for the host
}

// helpers
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

// Make sure to put WebsocketProvider higher up in
// the component tree than any consumer.
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
