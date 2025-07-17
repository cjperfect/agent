import React from "react";

const MessageItem = ({ role, content }) => {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center mr-2 shadow">
          <span className="text-lg">🤖</span>
        </div>
      )}
      <div
        className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-md text-base whitespace-pre-line ${
          isUser
            ? "bg-gradient-to-r from-pink-400 to-orange-300 text-white ml-8"
            : "bg-white text-gray-800 mr-8"
        }`}
      >
        {content}
      </div>
      {isUser && (
        <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-orange-300 rounded-full flex items-center justify-center ml-2 shadow">
          <span className="text-lg">🧑</span>
        </div>
      )}
    </div>
  );
};

export default MessageItem; 