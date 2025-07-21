import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MessageItem = ({ role, content }) => {
  const isUser = role === "user";
  const [showFullContent, setShowFullContent] = useState(false);
  const [fullVisible, setFullVisible] = useState(false); // 控制DOM挂载
  const [animatingIn, setAnimatingIn] = useState(false); // 控制入场动画
  const contentLength = content.length;
  const shouldShowMore = !isUser && contentLength > 500;
  const displayContent = shouldShowMore && !showFullContent ? content.slice(0, 500) + "..." : content;
  const closeTimeout = useRef();

  // ESC键关闭弹窗
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && fullVisible) {
        handleCloseFull();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullVisible]);

  // 控制动画和DOM移除
  useEffect(() => {
    if (showFullContent) {
      setFullVisible(true);
      setAnimatingIn(false);
      // 下一帧再切换到translate-x-0，触发动画
      setTimeout(() => setAnimatingIn(true), 20);
    }
  }, [showFullContent]);

  const handleShowFull = () => setShowFullContent(true);
  const handleCloseFull = () => {
    setAnimatingIn(false); // 先切回translate-x-full
    closeTimeout.current = setTimeout(() => {
      setFullVisible(false);
      setShowFullContent(false);
    }, 500); // 动画500ms
  };
  useEffect(() => () => clearTimeout(closeTimeout.current), []);

  return (
    <>
      <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
        {!isUser && (
          <div className="flex relative justify-center items-center mr-2 w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full shadow">
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
          {isUser ? (
            content
          ) : (
            <>
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
              </div>
              {shouldShowMore && !showFullContent && (
                <button
                  onClick={handleShowFull}
                  className="mt-2 px-3 py-1 text-sm text-purple-600 hover:text-purple-800 bg-purple-100 hover:bg-purple-200 rounded-full transition-colors"
                >
                  查看更多
                </button>
              )}
            </>
          )}
        </div>
        {isUser && (
          <div className="flex justify-center items-center ml-2 w-8 h-8 bg-gradient-to-br from-pink-400 to-orange-300 rounded-full shadow">
            <span className="text-lg">🧑</span>
          </div>
        )}
      </div>

      {/* 全屏弹窗，动画右进左出 */}
      {fullVisible && (
        <div
          className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300`}
          onClick={handleCloseFull}
        >
          <div
            className={`fixed inset-0 w-full bg-white shadow-2xl transform transition-transform duration-500 ease-out
              ${animatingIn ? "translate-x-0" : "translate-x-full"}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-400 text-white shadow-lg">
                <h2 className="text-xl font-bold">详细内容</h2>
                <button
                  onClick={handleCloseFull}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                  title="关闭 (ESC)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <div className="markdown-body prose max-w-none bg-white rounded-lg p-6 shadow-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageItem; 