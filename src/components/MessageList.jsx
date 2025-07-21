import React, { useEffect, useRef } from "react";
import MessageItem from "./MessageItem";
import "../index.css";

const MessageList = ({ messages, loading }) => {
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={listRef}
      className="flex-1 overflow-y-auto space-y-4 py-4 pr-2 max-h-[60vh] custom-scrollbar"
    >
      {messages.map((msg, idx) => (
        <div key={idx} className="relative">
          <MessageItem {...msg} />
          {msg.role === "assistant" && msg.content === "正在分析中，请稍等..." && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-purple-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            </span>
          )}
        </div>
      ))}
      {loading && (
        <div className="flex justify-start pb-0 pl-12">
          <span className="loading-dots">
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default MessageList; 