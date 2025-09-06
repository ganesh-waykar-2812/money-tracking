import React from "react";

function WhatsNew() {
  return (
    <>
      <div className="mb-4 p-3 rounded bg-indigo-50 border border-indigo-200">
        <h3 className="font-semibold text-indigo-700 mb-1">🚀 What's New</h3>
        <ul className="list-disc ml-5 text-indigo-800 text-base space-y-1">
          <li>
            <b>Transactions UI Revamp:</b> The Lend & Borrow section now matches
            Personal Expenses in structure. Add people or transactions via
            modals, filter and export with a unified, modern look.
          </li>
          <li>
            <b>Consistent Summaries:</b> Status messages and icons for each
            person are now consistent in both the UI and exported PDFs.
          </li>
          <li>
            <b>Unified Font & Layout:</b> Font sizes and layouts are now
            consistent across all lists and summaries.
          </li>
          <li>
            <b>Personal Expenses:</b> Get notified to fill in your personal
            expenses regularly.
          </li>
          <li>
            <b>End-to-End Encryption:</b> Personal expenses are securely
            encrypted so only you can view them.
          </li>
          <li>
            <b>Edit & Delete:</b> Easily edit or remove your personal expenses
            from the list.
          </li>
          <li>
            <b>UI Improvement:</b> Enhanced layouts for transactions, expenses,
            and dropdowns.
          </li>
          <li>
            <b>Sorting:</b> Both transactions and expenses are now sorted in
            descending order of date.
          </li>
          <li>
            <b>Multi-Select Dropdown:</b> New dropdown with checkboxes — select
            multiple options, and see compact labels like <i>“Food +2”</i>.
          </li>
          <li>
            <b>Outside Click Handling:</b> Dropdowns now close automatically
            when you click outside.
          </li>
          <li>
            <b>Category Detection:</b> Categories are auto-extracted uniquely
            from your expenses for a cleaner dropdown.
          </li>
        </ul>
      </div>
      <ul className="list-disc ml-5 space-y-2 text-base text-black">
        <li>
          <b>Welcome Screen:</b> When you log in, you'll see a welcome message.
          Use the sidebar to select a feature and get started.
        </li>
        <li>
          <b>Lend & Borrow:</b> Add people, record money you lend, borrow,
          receive, or repay. View summaries and all transactions.
        </li>
        <li>
          <b>Personal Expenses:</b> Track your own expenses by category, see
          monthly lists and summaries.
        </li>
        <li>
          <b>Export as PDF:</b> Export both transactions and personal expenses
          as PDF files, including summaries and applied filters.
        </li>
        <li>Use the sidebar to switch between features and tabs.</li>
        <li>All your data is securely saved and only visible to you.</li>
      </ul>
    </>
  );
}

export default WhatsNew;
