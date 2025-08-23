import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import React, { useEffect, useMemo, useState } from "react";
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
import { Button } from "./reusable/Button";
import MultiSelectDropdown from "./reusable/MultiSelectDropdown";

export default function PersonalExpenseList() {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);

  const [deleteExpenseId, setDeleteExpenseId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [editData, setEditData] = useState(null);
  const [isAdd, setIsAdd] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const initialValue = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    return {
      _id: initialValue,
      name: new Date(initialValue + "-01").toLocaleString("default", {
        year: "numeric",
        month: "long",
      }),
    };
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const filteredExpenses = useMemo(() => {
    return selectedMonth._id === "all"
      ? expenses.filter((exp) => {
          if (
            selectedCategories.length > 0 &&
            !selectedCategories.includes(exp.category)
          ) {
            return false;
          }
          return true;
        })
      : expenses.filter((exp) => {
          if (
            selectedCategories.length > 0 &&
            !selectedCategories.includes(exp.category)
          ) {
            return false;
          }
          if (!exp.date) return false;
          const [year, month] = exp.date.split("-");
          return `${year}-${month}` === selectedMonth._id;
        });
  }, [expenses, selectedMonth, selectedCategories]);
  // Get unique months from expenses
  const allMonths = useMemo(
    () =>
      Array.from(
        new Set(expenses.map((exp) => exp.date?.slice(0, 7)).filter(Boolean))
      )
        .sort()
        .reverse(),
    [expenses]
  );

  // Build options
  const monthOptions = useMemo(() => {
    return [
      { _id: "all", name: "All" },
      ...allMonths.map((month) => ({
        _id: month,
        name: new Date(month + "-01").toLocaleString("default", {
          year: "numeric",
          month: "long",
        }),
      })),
    ];
  }, [allMonths]);

  const total = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0),
    [filteredExpenses]
  );
  const byCategory = useMemo(
    () =>
      filteredExpenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
        return acc;
      }, {}),
    [filteredExpenses]
  );
  console.log("byCategory", byCategory);

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
      const selectedCategoriesFromApi = Array.from(
        new Set(decryptedExpenses.map((exp) => exp.category).filter(Boolean))
      ) // unique strings
        .sort();
      // .map((cat) => ({ _id: cat, name: cat })); // convert to objects
      setSelectedCategories(selectedCategoriesFromApi);
      const allCategories = selectedCategoriesFromApi.map((cat) => ({
        _id: cat,
        name: cat,
      }));

      console.log("allCategories", allCategories, selectedCategoriesFromApi);
      setCategories(allCategories);
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
      {/* Loader */}
      <LoadingPopup show={loading} />

      {/* Delete Confirmation */}
      <Modal
        show={isDeleteConfirmationOpen}
        onClose={() => {
          setIsDeleteConfirmationOpen(false);
          setDeleteExpenseId(null);
        }}
        title="Delete Expense"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteConfirmationOpen(false);
                setDeleteExpenseId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={loading}
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
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to delete this expense?
        </p>
      </Modal>

      {/* Add/Edit Form */}
      <Modal show={isFormModalOpen} onClose={() => setIsFormModalOpen(false)}>
        <PersonalExpenseForm
          isAdd={isAdd}
          editData={editData}
          handleSubmit={handleAddPersonalExpense}
        />
      </Modal>

      {/* Filter + Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sticky top-0 bg-white z-[1] py-1 ">
        <div className="flex gap-2">
          <Dropdown
            label="Filter by Month"
            value={selectedMonth}
            onChangeHandler={setSelectedMonth}
            options={monthOptions}
            placeholder="Select Month"
          />

          <MultiSelectDropdown
            label="Filter by Category"
            options={categories}
            selectedValues={selectedCategories}
            onChange={(v) => {
              console.log("'v' is ", v);
              setSelectedCategories(v);
            }}
            placeholder="Choose people"
          />
        </div>

        <div className="flex gap-2 ">
          <Button onClick={handleExportPDF}>Export PDF</Button>
          <Button
            onClick={() => {
              setIsFormModalOpen(true);
              setEditData(null);
              setIsAdd(true);
            }}
          >
            + New Expense
          </Button>
        </div>
      </div>

      {/* Expense Summary */}
      <div className=" flex flex-col ">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 tracking-tight">
          Expense Summary
        </h2>
        <div className="bg-white rounded-xl shadow-sm  ">
          <PersonalExpenseSummary
            expenses={filteredExpenses}
            byCategory={byCategory}
            total={total}
          />
        </div>

        {/* Expense List */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-gray-900 tracking-tight font-semibold mt-1">
            Expenses List
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm ">
          {filteredExpenses.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              No expenses found for this month.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredExpenses.map((exp, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center py-2 hover:bg-gray-50 rounded-lg px-2 transition "
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">
                        {exp.category}
                      </span>{" "}
                      <span className="text-xs text-gray-400">
                        {new Date(exp.date).toLocaleDateString()}
                      </span>
                    </div>

                    {exp.note && (
                      <span className="text-gray-500 text-sm flex wrap-anywhere pr-1">
                        ({exp.note})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-col">
                    <span className="font-semibold text-indigo-600 whitespace-nowrap">
                      INR {exp.amount}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(exp)}
                        className="text-blue-500 hover:text-blue-700 transition"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(exp)}
                        className="text-red-500 hover:text-red-700 transition"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
