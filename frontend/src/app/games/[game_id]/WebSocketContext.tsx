"use client";
import React, { createContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/lib/AuthProvider";

type ServerMessage = {
  type: string;
  // TODO find data structure
  timestamp?: number;
};

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
}

// Make sure to put WebsocketProvider higher up in
// the component tree than any consumer.
export const WebsocketProvider = ({
  children,
  room_code,
}: WebsocketContextProviderProps) => {
  const [isReady, setIsReady] = useState(false);
  const [val, setVal] = useState(null);
  const ws = useRef<WebSocket | null>(null);
  const { backendUser } = useAuth();

  // Function to send messages safely
  const sendMessage = (message: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    }
  };

  const sendBuzz = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send("buzz");
    }
  };

  const sendReset = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send("reset");
    }
  };

  useEffect(() => {
    if (!backendUser?.id) {
      console.error("No backend user found");
      return;
    }
    const socket = new WebSocket(
      "ws://localhost:8080/ws?room_code=" +
        room_code +
        "&host_id=" +
        backendUser?.id
    );

    socket.onopen = () => setIsReady(true);
    socket.onclose = () => setIsReady(false);
    socket.onmessage = (event) => {
      console.log("Received:", event.data);
      setVal(event.data);
    };

    ws.current = socket;

    return () => {
      socket.close();
    };
  }, [backendUser, room_code]); // Add backendUser and room_code as dependencies

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
