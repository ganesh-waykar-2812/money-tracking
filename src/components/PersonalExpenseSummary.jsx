import React from "react";

function PersonalExpenseSummary({ expenses, total, byCategory }) {
  if (!expenses || expenses.length === 0) return null;

  return (
    <div className="bg-indigo-50 p-4 rounded shadow text-indigo-900 mb-4">
      <h3 className="text-lg font-semibold mb-2">Summary</h3>
      <div className="mb-2">
        <span className="font-bold">Total:</span> ₹{total}
      </div>
      <div>
        <span className="font-bold">By Category:</span>
        <ul className="ml-4 mt-1">
          {Object.entries(byCategory).map(([cat, amt]) => (
            <li key={cat}>
              {cat}: ₹{amt}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
export default PersonalExpenseSummary;
