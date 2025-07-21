import React, { useState, useRef, useEffect } from "react";
import Header from "./components/Header";
import ChatContainer from "./components/ChatContainer";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";

const URL = "http://localhost:5678/webhook-test/upload";

const App = () => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "你好！我是你的AI助手，有什么可以帮你的吗？" },
  ]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);
  // 已不需要上传弹窗
  const [dragActive, setDragActive] = useState(false);

  // 自动滚动到底部
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // 拖拽上传相关
  useEffect(() => {
    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(true);
    };
    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
    };
    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleUpload({ file: e.dataTransfer.files[0] });
      }
    };
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);
    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  // 发送消息
  const handleSend = async (text) => {
    setMessages((msgs) => [...msgs, { role: "user", content: text }]);
    // 先插入一个空的 assistant 消息
    setMessages((msgs) => [...msgs, { role: "assistant", content: "" }]);
    setLoading(true);
    try {
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ msg: text }),
      });
      if (!response.ok) throw new Error("无响应体");
      const result = await response.text();
      setMessages((msgs) => {
        // 更新最后一条 assistant 消息内容
        const newMsgs = [...msgs];
        for (let i = newMsgs.length - 1; i >= 0; i--) {
          if (newMsgs[i].role === "assistant") {
            newMsgs[i] = { ...newMsgs[i], content: JSON.parse(result).data.output };
            break;
          }
        }
        return newMsgs;
      });
    } catch (error) {
      setMessages((msgs) => [...msgs, { role: "assistant", content: `请求失败: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append("data", file);
    // 获取文件扩展名
    const ext = file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase();
    // 1. 插入“正在分析中”消息
    const pendingId = Date.now() + Math.random();
    setMessages((msgs) => [...msgs, { id: pendingId, role: "assistant", content: "正在分析中，请稍等..." }]);
    try {
      const res = await fetch(`${URL}?type=${ext}`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("上传失败");
      // 假设接口返回文本内容
      const result = await res.text();
      setMessages((msgs) =>
        msgs.map((msg) => (msg.id === pendingId ? { ...msg, content: JSON.parse(result).data.output } : msg))
      );
      return true;
    } catch (e) {
      setMessages((msgs) =>
        msgs.map((msg) => (msg.id === pendingId ? { ...msg, content: "文件上传失败: " + e.message } : msg))
      );
      return false;
    }
  };

  // 检查用户最后一条消息是否包含“上传”

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-blue-100">
      <Header />
      <ChatContainer>
        <div className="flex flex-col flex-1" style={{ minHeight: 0 }}>
          <div ref={listRef} className="overflow-y-auto flex-1">
            <MessageList messages={messages} loading={loading} dragActive={dragActive} />
          </div>
          <ChatInput onSend={handleSend} dragActive={dragActive} loading={loading} />
        </div>
      </ChatContainer>
    </div>
  );
};

export default App;
