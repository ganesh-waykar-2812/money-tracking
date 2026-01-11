import React from "react";
import clsx from "clsx";

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg";

const variants = {
  primary:
    "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 shadow-blue-200/50 hover:shadow-blue-300/70",
  secondary:
    "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 hover:from-gray-100 hover:to-gray-200 focus:ring-gray-400 border border-gray-200 shadow-gray-200/30 hover:shadow-gray-300/50",
  outline:
    "border-2 border-gray-300 text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 focus:ring-gray-400 hover:border-gray-400 shadow-gray-200/20 hover:shadow-gray-300/40",
  danger:
    "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500 shadow-red-200/50 hover:shadow-red-300/70",
  success:
    "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 focus:ring-green-500 shadow-green-200/50 hover:shadow-green-300/70",
  warning:
    "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 focus:ring-amber-500 shadow-amber-200/50 hover:shadow-amber-300/70",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  className,
  ...props
}) => {
  return (
    <button
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        loading && "animate-pulse",
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-5 w-5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {!loading && leftIcon && (
        <span className="transition-transform group-hover:scale-110">
          {leftIcon}
        </span>
      )}
      <span className="transition-transform group-hover:scale-105">
        {children}
      </span>
      {!loading && rightIcon && (
        <span className="transition-transform group-hover:scale-110">
          {rightIcon}
        </span>
      )}
    </button>
  );
};
