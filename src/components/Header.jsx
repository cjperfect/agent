import React from "react";

const Header = () => (
  <header className="flex justify-between items-center px-8 py-4 w-full bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400 rounded-b-2xl shadow-lg">
    <div className="flex gap-3 items-center">
      <div className="flex justify-center items-center w-10 h-10 bg-white bg-opacity-80 rounded-full shadow-md">
        <span className="text-2xl font-bold text-purple-600">🤖</span>
      </div>
      <h1 className="text-2xl font-extrabold tracking-wide text-white drop-shadow-lg">ChatGPT Plus</h1>
    </div>
  </header>
);

export default Header; 