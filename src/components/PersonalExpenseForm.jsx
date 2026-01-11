import React, { useEffect, useState } from "react";
import TextInput from "./reusable/TextInput";
import Dropdown from "./reusable/Dropdown";
import { Button } from "./reusable/Button";
import { FaPlus, FaTrash } from "react-icons/fa";

const categories = [
  "Food",
  "Rent",
  "Travel",
  "Shopping",
  "Bills",
  "Petrol",
  "Health",
  "Entertainment",
  "Insurance",
  "Education",
  "Gifts",
  "Investment",
  "Recharge",
  "Other",
];

export default function PersonalExpenseForm({
  isAdd,
  editData,
  handleSubmit,
  loading,
}) {
  const [form, setForm] = useState({
    category: "",
    date: "",
    items: [{ amount: "", note: "" }],
  });

  const totalAmount = form.items.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );

  // Preprocess data before submission
  const getProcessedData = () => {
    const validItems = form.items.filter(
      (item) => item.amount && Number(item.amount) > 0,
    );
    const summedAmount = validItems.reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );

    // Only concatenate notes with amounts for multiple items
    let concatenatedNotes = "";
    if (validItems.length > 1) {
      concatenatedNotes = validItems
        .map((item) =>
          item.note ? `${item.amount} - ${item.note}` : item.amount,
        )
        .join(", ");
    } else if (validItems.length === 1 && validItems[0].note) {
      // For single item, only use the note if provided
      concatenatedNotes = validItems[0].note;
    }

    return {
      category: form.category,
      date: form.date,
      amount: summedAmount.toString(),
      note: concatenatedNotes,
      ...(form.id && { id: form.id }), // Include id only for edit mode
    };
  };
  function isValidDate(dateStr) {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    const today = new Date();
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return date <= today;
  }
  useEffect(() => {
    if (isAdd) {
      const today = new Date().toISOString().split("T")[0];
      setForm({ category: "", date: today, items: [{ amount: "", note: "" }] });
    } else if (editData) {
      setForm({
        category: editData.category || "",
        date: editData.date
          ? new Date(editData.date).toISOString().split("T")[0]
          : "",
        items: [
          { amount: String(editData.amount || ""), note: editData.note || "" },
        ],
        id: editData._id || "",
      });
    }
  }, [isAdd, editData]);

  const isDateValid = isValidDate(form.date);
  const hasValidItems = form.items.some(
    (item) => item.amount && Number(item.amount) > 0,
  );
  const isValid = form.category && isDateValid && hasValidItems;

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { amount: "", note: "" }],
    });
  };

  const removeItem = (index) => {
    if (form.items.length > 1) {
      setForm({
        ...form,
        items: form.items.filter((_, i) => i !== index),
      });
    }
  };

  const updateItem = (index, field, value) => {
    setForm({
      ...form,
      items: form.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    });
  };

  return (
    <>
      <h2 className="text-xl sm:text-xl font-semibold mb-4 text-gray-800 tracking-tight">
        {isAdd ? "Add New Expense" : "Edit Expense"}
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const processedData = getProcessedData();
          handleSubmit(processedData, isAdd);
          setForm({
            category: "",
            date: "",
            items: [{ amount: "", note: "" }],
          });
        }}
        className="mb-4 text-black group"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dropdown
            onChangeHandler={(selected) =>
              setForm((prev) => ({ ...prev, category: selected._id }))
            }
            options={categories.map((c) => ({
              _id: c,
              name: c,
            }))}
            placeholder="Select Category"
            value={
              form.category
                ? { _id: form.category, name: form.category }
                : { _id: "", name: "" }
            }
          />

          <TextInput
            value={form.date}
            onChangeHandler={(v) => setForm({ ...form, date: v })}
            placeholder="Date"
            inputType="date"
          />
        </div>

        {/* Multiple Expense Items Section */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-gray-800">Expense Items</h3>
            {isAdd && (
              <Button
                type="button"
                onClick={addItem}
                className="text-sm py-1 px-3"
                variant="secondary"
                leftIcon={<FaPlus />}
              >
                Add Item
              </Button>
            )}
          </div>

          {/* Total Amount Display */}
          {totalAmount > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-indigo-900">
                  Total Amount:
                </span>
                <span className="font-bold text-indigo-900 text-lg">
                  Rs {totalAmount}
                </span>
              </div>
            </div>
          )}

          {/* Expense Items List */}
          <div className="space-y-3">
            {form.items.map((item, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <TextInput
                    value={item.amount}
                    onChangeHandler={(v) => updateItem(index, "amount", v)}
                    placeholder="Amount"
                    inputType="number"
                  />
                  <TextInput
                    value={item.note}
                    onChangeHandler={(v) => updateItem(index, "note", v)}
                    placeholder="Note (optional)"
                    inputType="text"
                    isRequired={false}
                  />
                </div>
                {isAdd && form.items.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2"
                    variant="danger"
                    size="sm"
                    leftIcon={<FaTrash />}
                    title="Remove item"
                  ></Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button disabled={!isValid || loading} className="mt-4 w-full">
          {loading ? "Submitting..." : isAdd ? "Add Expense" : "Update Expense"}
        </Button>
      </form>
    </>
  );
}
