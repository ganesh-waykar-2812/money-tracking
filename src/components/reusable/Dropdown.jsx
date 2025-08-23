import React from "react";

function Dropdown({
  label,
  value = { _id: "", name: "" },
  onChangeHandler,
  options = [],
  placeholder = "Select an option",
  disabled = false,
  required = false,
  error = "",
  className = "",
  showClear = false,
}) {
  const handleChange = (e) => {
    const selected = options.find((opt) => opt._id === e.target.value);
    onChangeHandler(selected || { _id: "", name: "" });
  };

  const handleClear = () => {
    onChangeHandler({ _id: "", name: "" });
  };

  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="mb-1 text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          onChange={handleChange}
          value={value._id}
          disabled={disabled}
          required={required}
          className={`w-full appearance-none px-4 py-2 pr-10 border rounded-lg bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 
            disabled:opacity-50 disabled:cursor-not-allowed
            ${value._id ? "text-black" : "text-gray-400"}
            ${error ? "border-red-500" : "border-gray-300"}
            ${className}`}
        >
          <option value="" disabled={required}>
            {placeholder}
          </option>

          {options.length > 0 ? (
            options.map((opt) => (
              <option key={opt._id} value={opt._id} className="text-black">
                {opt.name}
              </option>
            ))
          ) : (
            <option disabled>No options available</option>
          )}
        </select>

        {/* Dropdown arrow */}
        <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
          ▼
        </span>

        {/* Clear button */}
        {showClear && value._id && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-8 flex items-center text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Error message */}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default Dropdown;
