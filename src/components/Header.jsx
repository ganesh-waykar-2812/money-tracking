import React from "react";

export default function Header({ userName, onLogout }) {
  return (
    <header className="w-full flex justify-between items-center px-6 py-4 bg-white shadow ">
      <div className="text-lg font-semibold text-black">Lend & Borrow</div>
      <div className="flex items-center gap-4">
        {userName && (
          <>
            <span className="text-black">Hello, {userName}</span>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300 transition"
              title="Sign out"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
                />
              </svg>
              <span>Sign out</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
