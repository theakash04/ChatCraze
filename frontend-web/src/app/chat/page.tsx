"use client";
import { useEffect, useState } from "react";
import { chat } from "@/types/messages";

export default function Page() {
  const [messages, setMessage] = useState<chat[]>([
    { message: "hello", from: "other", time: new Date() },
  ]);
  const [text, setText] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ws = new WebSocket(`${process.env.web_socket}/ws`);
      ws.onopen = () => {
        console.log("websocket connected!");
      };

      ws.onmessage = (event) => {
        setMessage((prevMsg) => [
          ...prevMsg,
          { message: event.data, from: "sender", time: new Date() },
        ]);
      };

      ws.onerror = (err) => {
        console.error("websocket error:", err);
      };

      return () => {
        ws.close();
      };
    }
  }, []);

  function sendMsg(event: React.FormEvent) {
    event.preventDefault();
    if (text.trim() === "") return;

    setMessage((prevmsg) => [
      ...prevmsg,
      { message: text, from: "me", time: new Date() },
    ]);
    setText("");
  }

  // Function to format message time
  const formatTime = (time: Date) => {
    if (typeof window !== "undefined") {
      const now = new Date();

      // Check if the message is today
      const isToday = time.toDateString() === now.toDateString();

      // Check if the message is yesterday
      const isYesterday =
        time.toDateString() ===
        new Date(now.setDate(now.getDate() - 1)).toDateString();

      if (isToday) {
        // Format time as "12:20 PM"
        return time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      } else if (isYesterday) {
        // Format date as "day month"
        return time.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        });
      } else {
        // For any other day, show full date
        return time.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-between p-10 flex-col">
      <h1 className="text-4xl font-bold">chat app</h1>
      <div className="w-full bg-gray-800 h-full my-5 rounded-md overflow-y-auto flex flex-col">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`w-full flex items-center p-4 ${
              msg.from === "me" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex w-max px-3 py-0.5 rounded-lg items-end justify-end gap-1 ${
                msg.from === "me"
                  ? "bg-green-800 rounded-tr-none"
                  : "bg-slate-700 rounded-tl-none"
              }`}
              key={index}
            >
              <p className="text-white p-2 text-lg">{msg.message}</p>
              <p className="text-xs">{formatTime(msg.time)}</p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMsg}>
        <div className="flex gap-3">
          <input
            type="text"
            className="bg-gray-800 px-4 py-3 text-white border-gray-500 rounded-md"
            placeholder="text here..."
            onChange={(e) => setText(e.target.value)}
            value={text}
          />
          <button
            className="bg-green-700 px-7 rounded-md font-bold text-lg"
            type="submit"
          >
            send
          </button>
        </div>
      </form>
    </div>
  );
}
