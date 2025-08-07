import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import React, { useEffect, useState } from "react";
import PersonalExpenseSummary from "./PersonalExpenseSummary";
import Dropdown from "./reusable/Dropdown";
import {
  addPersonalExpense,
  deletePersonalExpense,
  getPersonalExpenses,
  updatePersonalExpense,
} from "../services/api";
import PersonalExpenseForm from "./PersonalExpenseForm";
import LoadingPopup from "./reusable/LoadingPopup";
import { encryptData, safeDecrypt } from "../utils/cryptoUtils";
import Modal from "./reusable/Modal";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function PersonalExpenseList() {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);

  const [deleteExpenseId, setDeleteExpenseId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [editData, setEditData] = useState(null);
  const [isAdd, setIsAdd] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

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

  async function fetchExpenses() {
    setLoading(true);
    try {
      const expenseRes = await getPersonalExpenses();
      const masterKey = localStorage.getItem("masterKey");
      let decryptedExpenses = expenseRes.data;
      if (masterKey) {
        decryptedExpenses = expenseRes.data.map((exp) => {
          const shouldDecrypt = exp.amount !== "" && isNaN(Number(exp.amount));
          if (!shouldDecrypt) {
            return exp; // No decryption needed
          }
          return {
            ...exp,
            amount: exp.amount ? Number(safeDecrypt(exp.amount, masterKey)) : 0,
            note: exp.note ? safeDecrypt(exp.note, masterKey) : "",
          };
        });
      }

      setExpenses(decryptedExpenses);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to fetch expenses");
    }
    setLoading(false);
  }

  const handleAddPersonalExpense = async (expense, isAdd) => {
    setLoading(true);
    if (isAdd) {
      try {
        const masterKey = localStorage.getItem("masterKey");
        if (!masterKey) {
          alert("Master key not found. Please re-login.");
          setLoading(false);
          return;
        }
        const encryptedAmount = encryptData(String(expense.amount), masterKey);
        const encryptedNote = expense.note
          ? encryptData(expense.note, masterKey)
          : "";

        await addPersonalExpense({
          ...expense,
          amount: encryptedAmount,
          note: encryptedNote,
        });
        alert("Expense added successfully");
      } catch (error) {
        alert(error?.response?.data?.message || "Failed to add expense");
      }
    } else {
      // handle edit api call
      try {
        const masterKey = localStorage.getItem("masterKey");
        if (!masterKey) {
          alert("Master key not found. Please re-login.");
          setLoading(false);
          return;
        }
        const encryptedAmount = encryptData(String(expense.amount), masterKey);
        const encryptedNote = expense.note
          ? encryptData(expense.note, masterKey)
          : "";
        const { id, ...expenseData } = expense;
        await updatePersonalExpense(id, {
          ...expenseData,
          amount: encryptedAmount,
          note: encryptedNote,
        });
        alert("Expense updated successfully");
      } catch (error) {
        alert(error?.response?.data?.message || "Failed to update expense");
      }
    }
    setIsFormModalOpen(false);
    await fetchExpenses();
    setLoading(false);
  };

  const handleEdit = (expense) => {
    // Logic to handle edit expense
    setEditData(expense);
    setIsFormModalOpen(true);
    setIsAdd(false);
  };

  const handleDelete = (exp) => {
    // Logic to handle delete expense
    setIsDeleteConfirmationOpen(true);
    setDeleteExpenseId(exp._id);
  };

  return (
    <>
      <LoadingPopup show={loading} />
      <Modal
        show={isDeleteConfirmationOpen}
        onClose={() => {
          setIsDeleteConfirmationOpen(false);
          setDeleteExpenseId(null);
        }}
        title="Delete Expense"
      >
        <div>
          <p>Are you sure you want to delete this expense?</p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="button-custom"
              onClick={() => {
                setIsDeleteConfirmationOpen(false);
                setDeleteExpenseId(null);
              }}
            >
              Cancel
            </button>
            <button
              className="button-custom bg-red-500 hover:bg-red-600 text-white"
              onClick={async () => {
                setLoading(true);
                try {
                  await deletePersonalExpense(deleteExpenseId);
                  alert("Expense deleted successfully");
                  await fetchExpenses();
                } catch (error) {
                  alert(
                    error?.response?.data?.message || "Failed to delete expense"
                  );
                }
                setIsDeleteConfirmationOpen(false);
                setDeleteExpenseId(null);
                setLoading(false);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      <Modal show={isFormModalOpen} onClose={() => setIsFormModalOpen(false)}>
        <>
          <PersonalExpenseForm
            isAdd={isAdd}
            editData={editData}
            handleSubmit={handleAddPersonalExpense}
          />
        </>
      </Modal>

      <>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-2">
          <label
            htmlFor="month"
            className="font-semibold text-gray-700 mb-1 sm:mb-0"
          >
            Filter by Month:
          </label>
          <div className="relative ">
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
                    : new Date(selectedMonth + "-01").toLocaleString(
                        "default",
                        {
                          year: "numeric",
                          month: "long",
                        }
                      ),
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
        <button
          className="button-custom"
          onClick={() => {
            setIsFormModalOpen(true);
            setEditData(null);
            setIsAdd(true);
          }}
        >
          + Add New Expense
        </button>
        <div className="bg-white p-4 rounded shadow text-black mb-4">
          <ul className="space-y-2">
            {filteredExpenses.map((exp, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center border-b last:border-b-0 py-2"
              >
                <div className="flex flex-col wrap-anywhere">
                  <div>
                    <span className="font-medium">{exp.category}</span>
                    <span className="ml-2 text-gray-600 text-sm">
                      {exp.note && `(${exp.note})`}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(exp.date).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-indigo-600 whitespace-nowrap">
                    INR {exp.amount}
                  </span>

                  {/* Edit & Delete Icons */}
                  <button
                    onClick={() => handleEdit(exp)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(exp)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </>
    </>
  );
}
