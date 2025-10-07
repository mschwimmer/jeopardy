// This React component provides a simple interface for the host to control the buzzer system.
// It allows the host to send "buzz" and "reset" signals to the WebSocket server, and displays
// incoming messages from connected clients for debugging or monitoring purposes.

'use client';

import { useContext, useEffect, useState } from 'react';
import { WebsocketContext } from './WebSocketContext';

export const HostBuzzer = ({ room_code }: { room_code: string }) => {
  const context = useContext(WebsocketContext);
  const [messages, setMessages] = useState<string[]>([]);

  // When a new WebSocket message is received, format and store it in the local state
  useEffect(() => {
    if (context?.value) {
      try {
        // const wsContextVal = context.value;
        // const messageText = `${context.value.type}: ${JSON.stringify(context.value)}`;
        const statusText = `${context.value.data.status}`;

        // append messageText to messages
        setMessages((prev) => [...prev, statusText]);
      } catch (error) {
        setMessages((prev) => [...prev, `Error parsing message: ${error}`]);
      }
    }
  }, [context?.value]);

  // In case the context is not provided, handle it appropriately.
  if (!context) {
    return <div>Error: WebSocket context is not available.</div>;
  }

  const { ready, sendBuzz, sendReset } = context;

  // TODO create component that displays the current buzzer, should update state depending on buzzes and resets

  return (
    <div>
      <h1>Buzzer Control</h1>
      <p>Room Code: {room_code}</p>
      <p>Connection Status: {ready ? 'Connected' : 'Disconnected'}</p>

      <button onClick={sendBuzz} disabled={!ready}>
        Buzz
      </button>
      <button onClick={sendReset} disabled={!ready}>
        Reset Buzzer
      </button>
      <button onClick={() => setMessages([])} disabled={!ready}>
        Clear Messages
      </button>
      <div>
        <h2>Messages</h2>
        {messages.length === 0 ? (
          <p>No messages received yet</p>
        ) : (
          <ul>
            {messages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
