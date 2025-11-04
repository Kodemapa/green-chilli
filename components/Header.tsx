import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white p-4 shadow-md">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-center tracking-wide">
          🌶️ Green Chilli Disease Detection System
        </h1>
      </div>
    </header>
  );
};
