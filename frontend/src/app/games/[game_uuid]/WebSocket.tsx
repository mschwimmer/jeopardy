"use client";

import { useGameContext } from "./GameContext";

export const WebSocketTest = () => {
  const { sendBuzz, sendReset, messages } = useGameContext();
  return (
    <div>
      <h1>Game Control</h1>
      <button onClick={sendBuzz}>Buzz</button>
      <button onClick={sendReset}>Reset</button>
      <div>
        <h2>Messages</h2>
        <ul>
          {messages.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
