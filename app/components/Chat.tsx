"use client";
import { useContext, useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useParams, useRouter } from "next/navigation";
import { AuthContext } from "../contexts/AuthContext";
import { MessageModel } from "../models/Message";
import { Message } from "./Message";

export function Chat() {
  const { conversationName } = useParams();
  const router = useRouter();
  const { user } = useContext(AuthContext);
  if (!user) {
    router.push("/login");
    return null;
  }
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [message, setMessage] = useState("");
  const [messageHistory, setMessageHistory] = useState<any>([]);

  const { readyState, sendJsonMessage } = useWebSocket(
    user ? `ws://localhost:8000/${conversationName}/` : null,
    {
      queryParams: {
        token: user ? user.token : "",
      },
      onOpen: () => {
        console.log("Connected!");
      },
      onClose: () => {
        console.log("Disconnected!");
      },
      onMessage: (event) => {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case "welcome_message":
            setWelcomeMessage(data.message);
            break;
          case "last_50_messages":
            setMessageHistory(data.messages);
            break;
          case "chat_message_echo":
            setMessageHistory((prev: any) => prev.concat(data.message));
            break;
          default:
            console.error("Unknown message type:", data.type);
            break;
        }
      },
    },
  );

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  function handleChangeMessage(e: any) {
    setMessage(e.target.value);
  }

  function handleSubmit() {
    sendJsonMessage({
      type: "chat_message",
      message,
      name,
    });
    setMessage("");
  }

  return (
    <div>
      <span>The WebSocket is currently {connectionStatus}</span>
      <p>{welcomeMessage}</p>

      <input
        name="message"
        placeholder="Message"
        onChange={handleChangeMessage}
        value={message}
        className="shadow-sm sm:text-sm border-gray-300 bg-gray-100 rounded-md"
      />
      <button className="ml-3 bg-gray-300 px-3 py-1" onClick={handleSubmit}>
        Submit
      </button>
      <hr />
      <ul className="mt-3 flex flex-col-reverse relative w-full border border-gray-200 overflow-y-auto p-6">
        {messageHistory.map((message: MessageModel) => (
          <Message key={message.id} message={message} />
        ))}
      </ul>
    </div>
  );
}
