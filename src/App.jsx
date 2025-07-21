import React, { useState, useRef, useEffect } from "react";
import Header from "./components/Header";
import ChatContainer from "./components/ChatContainer";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";
import UploadFile from "./components/UploadFile";
import ReactMarkdown from "react-markdown";

const App = () => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "你好！我是你的AI助手，有什么可以帮你的吗？" },
  ]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);
  const [uploadVisible, setUploadVisible] = useState(false);

  // 自动滚动到底部
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // 发送消息
  const handleSend = async (text) => {
    setMessages((msgs) => [...msgs, { role: "user", content: text }]);
    // 先插入一个空的 assistant 消息
    setMessages((msgs) => [...msgs, { role: "assistant", content: "" }]);
    setLoading(true);
    try {
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer sk-a67c6d6504085f741448f32c48de05bf745", // 请替换为你的 deepseek API 密钥
        },
        body: JSON.stringify({
          model: "deepseek-chat", // 可根据需要更换模型名
          stream: true,
          messages: [
            {
              role: "system",
              content: `你是一位顶级数据分析大师，擅长深入理解结构化数据（如 Excel、CSV 表格），能够快速提取关键字段、进行统计分析、生成可视化建议，并输出结构化结论，帮助用户洞察数据背后的价值。：
                        👉「是否有 Excel 或 CSV 数据文件需要我分析？」`,
            },
            { role: "user", content: text },
          ],
        }),
      });
      if (!response.body) throw new Error("无响应体");
      const reader = response.body.getReader();
      let result = "";
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          // deepseek SSE 每行以 data: 开头，需处理
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));
          for (const line of lines) {
            const jsonStr = line.replace(/^data: /, "");
            if (jsonStr === "[DONE]") continue;
            try {
              const data = JSON.parse(jsonStr);
              const delta = data.choices?.[0]?.delta?.content || "";
              result += delta;
              setMessages((msgs) => {
                // 更新最后一条 assistant 消息内容
                const newMsgs = [...msgs];
                for (let i = newMsgs.length - 1; i >= 0; i--) {
                  if (newMsgs[i].role === "assistant") {
                    newMsgs[i] = { ...newMsgs[i], content: result };
                    break;
                  }
                }
                return newMsgs;
              });
            } catch {
              console.log("first");
            }
          }
        }
      }
    } catch (error) {
      setMessages((msgs) => [...msgs, { role: "assistant", content: `请求失败: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append("data", file);
    // 1. 插入“正在分析中”消息
    const pendingId = Date.now() + Math.random();
    setMessages((msgs) => [
      ...msgs,
      { id: pendingId, role: "assistant", content: "正在分析中，请稍等..." },
    ]);
    try {
      const res = await fetch("http://localhost:5678/webhook-test/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("上传失败");
      // 假设接口返回文本内容
      const result = await res.text();
      setMessages((msgs) =>
        msgs.map((msg) =>
          msg.id === pendingId ? { ...msg, content: result } : msg
        )
      );
      return true;
    } catch (e) {
      setMessages((msgs) =>
        msgs.map((msg) =>
          msg.id === pendingId ? { ...msg, content: "文件上传失败: " + e.message } : msg
        )
      );
      return false;
    }
  };

  // 新增：处理 markdown 链接点击
  const handleMarkdownLinkClick = (href, event) => {
    if (href.includes("点击打开文件上传页面")) {
      event.preventDefault();
      setUploadVisible(true);
    }
  };

  // 检查用户最后一条消息是否包含“上传”
  const showUploadBtn = messages.some((msg) => msg.role === "user" && /上传/.test(msg.content));

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-blue-100">
      <Header />
      {showUploadBtn && (
        <button
          className="flex fixed top-6 right-10 z-40 gap-2 items-center px-6 py-2 font-bold text-white bg-gradient-to-r from-blue-500 via-purple-400 to-pink-400 rounded-full border-2 shadow-xl drop-shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 border-white/60"
          style={{ boxShadow: "0 4px 24px 0 rgba(168,139,250,0.18)" }}
          onClick={() => setUploadVisible(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
          </svg>
          上传文件
        </button>
      )}
      <UploadFile visible={uploadVisible} onClose={() => setUploadVisible(false)} onUpload={handleUpload} />
      <ChatContainer>
        <div className="flex flex-col flex-1" style={{ minHeight: 0 }}>
          <div ref={listRef} className="overflow-y-auto flex-1">
            <MessageList
              messages={messages}
              loading={loading}
              components={{
                a: ({ href, children, ...props }) => (
                  <a href={href} {...props} onClick={(e) => handleMarkdownLinkClick(href, e)}>
                    {children}
                  </a>
                ),
              }}
            />
          </div>
          <ChatInput onSend={handleSend} />
        </div>
      </ChatContainer>
    </div>
  );
};

export default App;
