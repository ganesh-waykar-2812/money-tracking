import React from "react";

function TextInput({
  value,
  onChangeHandler,
  placeholder,
  inputType = "text",
  isRequired = true,
}) {
  return (
    <input
      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-black placeholder-black placeholder:opacity-50 text-black"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChangeHandler(e.target.value)}
      required={isRequired}
      type={inputType}
    />
  );
}

export default TextInput;
