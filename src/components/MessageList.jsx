import React from "react";
import MessageItem from "./MessageItem";

const MessageList = ({ messages }) => (
  <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
    {messages.map((msg, idx) => (
      <MessageItem key={idx} {...msg} />
    ))}
  </div>
);

export default MessageList; 