import React from "react";

function Dropdown({
  value = { _id: "", name: "" },
  onChangeHandler,
  options = [],
  placeholder = "Select an option",
}) {
  return (
    <select
      onChange={(e) => onChangeHandler({ value: e.target.value })}
      className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-black ${
        value._id ? "text-black" : "text-black/50"
      }`}
      value={value._id}
    >
      <option value="" className="">
        {placeholder}
      </option>
      {options.map((p) => {
        return (
          <option key={p._id} value={p._id} className="text-black">
            {p.name}
          </option>
        );
      })}
    </select>
  );
}

export default Dropdown;
