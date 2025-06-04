import React from "react";

export default function LoadingPopup({ show, message = "Loading..." }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-gray-200/50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow text-black flex flex-col items-center">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="mt-4">{message}</span>
      </div>
    </div>
  );
}
