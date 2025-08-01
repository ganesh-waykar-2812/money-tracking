import React from "react";

export default function Modal({ show, onClose, title, children }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-black relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {title && <h2 className="text-lg font-bold mb-2">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
