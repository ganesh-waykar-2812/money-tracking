import React, { useEffect, useState } from "react";
import TextInput from "./reusable/TextInput";
import Dropdown from "./reusable/Dropdown";
import { Button } from "./reusable/Button";

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
  "Other",
];

export default function PersonalExpenseForm({ isAdd, editData, handleSubmit }) {
  const [form, setForm] = useState({
    amount: "",
    category: "",
    date: "",
    note: "",
  });
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
      setForm({ amount: "", category: "", date: today, note: "" });
    } else if (editData) {
      setForm({
        amount: editData.amount || "",
        category: editData.category || "",
        date: editData.date
          ? new Date(editData.date).toISOString().split("T")[0]
          : "",
        note: editData.note || "",
        id: editData._id || "",
      });
    }
  }, [isAdd, editData]);

  const isDateValid = isValidDate(form.date);
  const isValid = form.amount && form.category && isDateValid;

  return (
    <>
      <h2 className="text-xl sm:text-xl font-semibold mb-4 text-gray-800 tracking-tight">
        {isAdd ? "Add New Expense" : "Edit Expense"}
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(form, isAdd);
          setForm({ amount: "", category: "", date: "", note: "" });
        }}
        className="mb-4   text-black"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            value={form.amount}
            onChangeHandler={(v) => setForm({ ...form, amount: v })}
            placeholder="Amount"
            inputType="number"
          />

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
          <TextInput
            value={form.note}
            onChangeHandler={(v) => setForm({ ...form, note: v })}
            placeholder="Note (optional)"
            inputType="text"
            isRequired={false}
          />
        </div>

        <Button disabled={!isValid} className="mt-4 w-full">
          {isAdd ? "Add Expense" : "Update Expense"}
        </Button>
      </form>
    </>
  );
}
