import React, { useState, useRef, useEffect } from "react";
import Header from "./components/Header";
import ChatContainer from "./components/ChatContainer";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";
import TableView from "./components/TableView";
import * as XLSX from "xlsx";
import { AnimatePresence } from "framer-motion";

const URL = "http://localhost:5678/webhook/b98afb4f-8822-4b65-8634-fdd550dd46b0/chat";

const sessionId = +new Date();

const App = () => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "你好！我是你的AI助手，有什么可以帮你的吗？" },
  ]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);
  // 已不需要上传弹窗
  const [dragActive, setDragActive] = useState(false);
  const [tableData, setTableData] = useState(null);

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
        body: JSON.stringify({ chatInput: text, sessionId }),
      });
      if (!response.ok) throw new Error("无响应体");

      const result = await response.json();

      setMessages((msgs) => {
        // 更新最后一条 assistant 消息内容
        const newMsgs = [...msgs];
        for (let i = newMsgs.length - 1; i >= 0; i--) {
          if (newMsgs[i].role === "assistant") {
            newMsgs[i] = { ...newMsgs[i], content: result.data?.output };
            break;
          }
        }
        return newMsgs;
      });
    } catch {
      setMessages((msgs) => {
        // 替换最后一条 assistant 消息内容
        const newMsgs = [...msgs];
        for (let i = newMsgs.length - 1; i >= 0; i--) {
          if (newMsgs[i].role === "assistant") {
            newMsgs[i] = { ...newMsgs[i], content: `服务器繁忙，请稍后再试！` };
            break;
          }
        }
        return newMsgs;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append("data", file);
    formData.append("sessionId", sessionId);
    const ext = file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase();
    const isTableFile = ["xlsx", "xls", "csv"].includes(ext);
    const pendingId = Date.now() + Math.random();
    setMessages((msgs) => [...msgs, { id: pendingId, role: "assistant", content: "正在分析中，请稍等..." }]);
    let parsedData = null;
    if (isTableFile) {
      try {
        // 解析表格文件
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        parsedData = XLSX.utils.sheet_to_json(worksheet);
        setTableData(parsedData);
      } catch {
        // 本地解析失败才隐藏表格
        setTableData(null);
      }
    }
    try {
      const res = await fetch(URL, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("上传失败");
      const result = await res.json();
      setMessages((msgs) => msgs.map((msg) => (msg.id === pendingId ? { ...msg, content: result.data.output } : msg)));
      return true;
    } catch (e) {
      setMessages((msgs) =>
        msgs.map((msg) => (msg.id === pendingId ? { ...msg, content: "文件上传失败: " + e.message } : msg))
      );
      // fetch 失败时不影响表格显示
      return false;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-blue-100">
      <Header />
      <div className="flex flex-1 gap-4 p-4">
        {/* 左侧表格区 */}
        <AnimatePresence mode="wait">
          {tableData ? (
            <div className="w-1/2 h-[91vh] flex flex-col" style={{ minHeight: 0 }}>
              <div className="overflow-auto flex-1" style={{ maxHeight: "100%" }}>
                <TableView data={tableData} />
              </div>
            </div>
          ) : null}
        </AnimatePresence>
        {/* 右侧聊天区 */}
        <div className={`flex-1 flex flex-col h-full ${tableData ? "w-1/2" : ""}`} style={{ minHeight: 0 }}>
          <ChatContainer>
            <div className="flex flex-col flex-1" style={{ minHeight: 0 }}>
              <div ref={listRef} className="overflow-y-auto flex-1">
                <MessageList messages={messages} loading={loading} dragActive={dragActive} />
              </div>
              <ChatInput onSend={handleSend} dragActive={dragActive} loading={loading} />
            </div>
          </ChatContainer>
        </div>
      </div>
    </div>
  );
};

export default App;
