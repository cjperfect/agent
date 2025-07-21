import React, { useRef, useState, useEffect } from "react";

const ACCEPTED_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
  "text/csv", // .csv
];
const ACCEPTED_EXTS = [".xlsx", ".xls", ".csv"];

const UploadFile = ({ visible, onClose, onUpload }) => {
  const fileInputRef = useRef();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  // 当弹窗关闭时重置所有状态
  useEffect(() => {
    if (!visible) {
      setFile(null);
      setError("");
      setDragActive(false);
      setUploading(false);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !uploading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, onClose, uploading]);

  const checkFile = (f) => {
    const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
    if (!ACCEPTED_EXTS.includes(ext) || (!ACCEPTED_TYPES.includes(f.type) && ext !== ".csv")) {
      setError("只允许上传 .xlsx, .xls, .csv 文件");
      return false;
    }
    setError("");
    return true;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (checkFile(f)) {
        setFile(f);
      } else {
        setFile(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file) {
      setUploading(true);
      try {
        await onUpload({ file });
        setFile(null);
        onClose();
      } finally {
        setUploading(false);
      }
    }
  };

  // 拖拽相关
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
      const f = e.dataTransfer.files[0];
      if (checkFile(f)) {
        setFile(f);
      } else {
        setFile(null);
      }
    }
  };
  const handleAreaClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div
      className={`fixed left-0 top-0 w-full h-full flex justify-center items-center z-50 transition-transform duration-500 ${
        visible ? "translate-y-0" : "-translate-y-full"
      } bg-black/30 backdrop-blur-sm`}
      style={{ pointerEvents: visible ? "auto" : "none", minHeight: "100vh" }}
      onClick={() => {
        if (!uploading) onClose();
      }}
    >
      <form
        className="bg-white rounded-2xl shadow-2xl w-[50vw] h-[50vh] flex flex-col items-center border-b-4 border-purple-200 relative justify-center p-8"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-4 right-4 text-2xl font-bold text-gray-400 hover:text-purple-500"
          onClick={() => {
            if (!uploading) onClose();
          }}
        >
          ×
        </button>
        <h2 className="mb-6 text-2xl font-bold text-purple-700">上传文件</h2>
        <div
          className={`flex flex-col items-center justify-center w-full mb-4 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
            dragActive ? "bg-purple-50 border-purple-500" : "border-purple-200 bg-purple-50/50"
          } py-8 hover:border-purple-400`}
          onClick={handleAreaClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept=".xlsx,.xls,.csv"
          />
          {file ? (
            <span className="font-semibold text-purple-700">已选择文件：{file.name}</span>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mb-2 w-10 h-10 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16"
                />
              </svg>
              <span className="text-gray-500">点击或拖拽 .xlsx/.xls/.csv 文件到此处上传</span>
            </>
          )}
        </div>
        {error && <div className="mb-2 text-sm font-semibold text-red-500">{error}</div>}
        {uploading && (
          <div className="flex justify-center items-center mb-2">
            <svg
              className="w-5 h-5 text-purple-400 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span className="ml-2 text-purple-400">正在分析数据...</span>
          </div>
        )}
        <button
          type="submit"
          className="px-6 py-2 mb-2 w-full font-bold text-white bg-gradient-to-r from-purple-500 to-pink-400 rounded-xl shadow transition hover:scale-105"
          disabled={!file || uploading}
        >
          提交
        </button>
      </form>
    </div>
  );
};

export default UploadFile;
