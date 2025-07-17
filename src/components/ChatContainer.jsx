import React from "react";

const ChatContainer = ({ children }) => (
  <div className="w-full max-w-[60vw] mx-auto my-8 p-10 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-3xl shadow-2xl min-h-[70vh] flex flex-col">
    {children}
  </div>
);

export default ChatContainer; 