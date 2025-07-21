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
        <MessageItem
          key={idx}
          {...msg}
        />
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