import React, { useState, useRef, useEffect } from "react";

function MultiSelectDropdown({
  label,
  options = [],
  selectedValues = [],
  onChange,
  placeholder = "Select options",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (value) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const displayText =
    selectedValues.length === 0
      ? placeholder
      : selectedValues.length === 1
      ? options.find((opt) => opt._id === selectedValues[0])?.name || ""
      : `${options.find((opt) => opt._id === selectedValues[0])?.name || ""} +${
          selectedValues.length - 1
        }`;

  return (
    <div className="w-full" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium mb-1 text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full flex justify-between items-center px-4 py-2 border rounded-lg bg-white border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span
            className={
              selectedValues.length === 0
                ? "text-gray-400 truncate"
                : "truncate"
            }
          >
            {displayText}
          </span>
          <span className="ml-2 text-gray-500">▼</span>
        </button>

        {/* Dropdown Options */}
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <label
                key={option._id}
                className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option._id)}
                  onChange={() => toggleOption(option._id)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-gray-800">{option.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default MultiSelectDropdown;
