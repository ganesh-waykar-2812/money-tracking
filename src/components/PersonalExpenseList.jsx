import React from "react";

export default function PersonalExpenseList({ expenses }) {
  if (!expenses || expenses.length === 0) {
    return <div className="text-gray-500">No expenses for this month.</div>;
  }
  return (
    <div className="bg-white p-4 rounded shadow text-black mb-4">
      <h3 className="text-lg font-semibold mb-2">Expenses</h3>
      <ul className="space-y-2">
        {expenses.map((exp, idx) => (
          <li
            key={idx}
            className="flex justify-between items-center border-b last:border-b-0 py-2"
          >
            <div>
              <span className="font-medium">{exp.category}</span>
              <span className="ml-2 text-gray-600 text-sm">
                {exp.note && `(${exp.note})`}
              </span>
              <div className="text-xs text-gray-400">
                {new Date(exp.date).toLocaleDateString()}
              </div>
            </div>
            <span className="font-bold text-indigo-600">₹{exp.amount}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
