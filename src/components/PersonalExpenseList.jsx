import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import React, { useState } from "react";
import PersonalExpenseSummary from "./PersonalExpenseSummary";
import Dropdown from "./reusable/Dropdown";

export default function PersonalExpenseList({ expenses }) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  if (!expenses || expenses.length === 0) {
    return <div className="text-gray-500">No expenses for this month.</div>;
  }

  const filteredExpenses =
    selectedMonth === "all"
      ? expenses
      : expenses.filter((exp) => {
          if (!exp.date) return false;
          const [year, month] = exp.date.split("-");
          return `${year}-${month}` === selectedMonth;
        });
  // Get unique months from expenses
  const allMonths = Array.from(
    new Set(expenses.map((exp) => exp.date?.slice(0, 7)).filter(Boolean))
  )
    .sort()
    .reverse();

  // Calculate summary from filteredExpenses
  const total = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const byCategory = filteredExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(16);
    doc.text("Personal Expenses", 14, 14);

    // Add download date and time at the top-right
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();
    doc.setFontSize(10);
    doc.text(
      `Downloaded: ${dateStr} ${timeStr}`,
      doc.internal.pageSize.getWidth() - 70,
      10
    );

    // Show applied filter
    let filterLabel = "All";
    if (selectedMonth !== "all") {
      filterLabel = new Date(selectedMonth + "-01").toLocaleString("default", {
        year: "numeric",
        month: "long",
      });
    }
    doc.setFontSize(11);
    doc.text(`Filter: ${filterLabel}`, 14, 22);

    // Add summary section with table
    doc.setFontSize(12);
    doc.text("Expense Summary", 14, 30);

    // Total row (bold)
    autoTable(doc, {
      body: [
        [
          { content: "Total", styles: { fontStyle: "bold" } },
          { content: `INR${total}`, styles: { fontStyle: "bold" } },
        ],
      ],
      startY: 34,
      theme: "plain",
      styles: { fontSize: 12 },
      margin: { left: 14 },
      tableLineWidth: 0,
      tableLineColor: 255,
    });

    // By Category table
    const categoryRows = Object.entries(byCategory).map(([cat, amt]) => [
      cat,
      `INR${amt}`,
    ]);
    if (categoryRows.length > 0) {
      autoTable(doc, {
        head: [["Category", "Amount"]],
        body: categoryRows,
        startY: doc.lastAutoTable.finalY + 2,
        styles: { fontSize: 11 },
        headStyles: { fillColor: [230, 230, 230], textColor: 50 },
        margin: { left: 14, right: 14 },
        theme: "grid",
      });
    }

    // Prepare table columns and rows for expenses list
    const columns = [
      { header: "Category", dataKey: "category" },
      { header: "Amount (INR)", dataKey: "amount" },
      { header: "Date", dataKey: "date" },
      { header: "Note", dataKey: "note" },
    ];
    const rows = filteredExpenses.map((exp) => ({
      category: exp.category,
      amount: exp.amount,
      date: new Date(exp.date).toLocaleDateString(),
      note: exp.note || "",
    }));

    // Add heading above the expenses table
    const expensesTableStartY = doc.lastAutoTable
      ? doc.lastAutoTable.finalY + 10
      : 60;
    doc.setFontSize(13);
    doc.text("Expenses List", 14, expensesTableStartY);

    autoTable(doc, {
      columns,
      body: rows,
      startY: expensesTableStartY + 4,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 14, right: 14 },
    });

    doc.save("personal_expenses.pdf");
  };
  if (!expenses || expenses.length === 0) {
    return <div className="text-gray-500">No expenses for this month.</div>;
  }
  let viewportWidth = window.innerWidth;
  console.log("Viewport width (including scrollbar): " + viewportWidth + "px");
  let contentWidth = document.documentElement.clientWidth;
  console.log("Viewport width (excluding scrollbar): " + contentWidth + "px");
  return (
    <>
      <h1 className="text-black">{`Viewport width (including scrollbar)`}</h1>
      <h1 className="text-black text-center">{viewportWidth}</h1>
      <h1 className="text-black ">{`Viewport width (excluding scrollbar)`}</h1>
      <h1 className="text-black text-center">{contentWidth}</h1>
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 tracking-tight">
        Expenses
      </h2>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-2">
        <label
          htmlFor="month"
          className="font-semibold text-gray-700 mb-1 sm:mb-0"
        >
          Filter by Month:
        </label>
        <div className="relative w-full sm:w-56">
          <Dropdown
            onChangeHandler={(value) => setSelectedMonth(value.value)}
            options={[
              { _id: "all", name: "All" },
              ...allMonths.map((month) => ({
                _id: month,
                name: new Date(month + "-01").toLocaleString("default", {
                  year: "numeric",
                  month: "long",
                }),
              })),
            ]}
            placeholder="Select Month"
            value={{
              _id: selectedMonth,
              name:
                selectedMonth === "all"
                  ? "All"
                  : new Date(selectedMonth + "-01").toLocaleString("default", {
                      year: "numeric",
                      month: "long",
                    }),
            }}
          />
        </div>
      </div>
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 tracking-tight">
        Expense Summary
      </h2>
      <button className="button-custom" onClick={handleExportPDF}>
        Export PDF
      </button>
      <PersonalExpenseSummary
        expenses={filteredExpenses}
        byCategory={byCategory}
        total={total}
      />
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 tracking-tight">
        Expenses List
      </h2>
      <div className="bg-white p-4 rounded shadow text-black mb-4">
        <ul className="space-y-2">
          {filteredExpenses.map((exp, idx) => (
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
              <span className="font-bold text-indigo-600">INR{exp.amount}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
