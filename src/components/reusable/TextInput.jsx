import React from "react";

function TextInput({
  label,
  value,
  onChangeHandler,
  placeholder = "",
  inputType = "text",
  isRequired = false,
  disabled = false,
  error = "",
  className = "",
}) {
  const baseStyles =
    "w-full px-3 py-2 rounded-lg border shadow-sm text-sm focus:outline-none focus:ring-2 transition-colors";

  const enabledStyles =
    "border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400";

  const disabledStyles =
    "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed";

  const errorStyles =
    "border-red-500 focus:border-red-500 focus:ring-red-500 text-red-600 placeholder-red-400";

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={inputType}
        value={value}
        onChange={(e) => onChangeHandler(e.target.value)}
        placeholder={placeholder}
        required={isRequired}
        disabled={disabled}
        className={`${baseStyles} ${
          disabled ? disabledStyles : error ? errorStyles : enabledStyles
        } ${inputType === "date" ? "calendar-black" : ""}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default TextInput;
