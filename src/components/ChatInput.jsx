import React, { useState } from "react";

const ChatInput = ({ onSend }) => {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (value.trim()) {
      onSend(value);
      setValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2 mt-4">
      <textarea
        className="flex-1 resize-none rounded-2xl px-4 py-2 border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white shadow-md text-base min-h-[40px] max-h-[120px] transition"
        placeholder="输入你的问题..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
      />
      <button
        className="bg-gradient-to-r from-purple-500 to-pink-400 text-white px-5 py-2 rounded-2xl shadow-lg font-bold hover:scale-105 active:scale-95 transition"
        onClick={handleSend}
      >
        发送
      </button>
    </div>
  );
};

export default ChatInput; 