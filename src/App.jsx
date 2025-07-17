import React, { useState, useRef, useEffect } from "react";
import Header from "./components/Header";
import ChatContainer from "./components/ChatContainer";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";

const App = () => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "你好！我是你的AI助手，有什么可以帮你的吗？" },
  ]);
  const listRef = useRef(null);

  // 自动滚动到底部
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // 发送消息
  const handleSend = (text) => {
    setMessages((msgs) => [
      ...msgs,
      { role: "user", content: text },
      // 这里可以接入后端API，暂时用AI回复模拟
      { role: "assistant", content: `你说：${text}\n（这里是AI回复，可接入API）` },
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-blue-100 flex flex-col">
      <Header />
      <ChatContainer>
        <div className="flex-1 flex flex-col" style={{ minHeight: 0 }}>
          <div ref={listRef} className="flex-1 overflow-y-auto">
            <MessageList messages={messages} />
          </div>
          <ChatInput onSend={handleSend} />
        </div>
      </ChatContainer>
    </div>
  );
};

export default App;
