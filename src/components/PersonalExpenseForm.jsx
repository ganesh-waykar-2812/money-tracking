import React, { useState } from "react";
import TextInput from "./reusable/TextInput";
import Dropdown from "./reusable/Dropdown";

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

export default function PersonalExpenseForm({ onAdd }) {
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

  const isDateValid = isValidDate(form.date);
  const isValid = form.amount && form.category && isDateValid;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onAdd(form);
        setForm({ amount: "", category: "", date: "", note: "" });
      }}
      className="mb-4 bg-white  rounded shadow text-black"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          value={form.amount}
          onChangeHandler={(v) => setForm({ ...form, amount: v })}
          placeholder="Amount"
          inputType="number"
        />

        <Dropdown
          onChangeHandler={(value) =>
            setForm({ ...form, category: value.value })
          }
          options={categories.map((c) => ({ _id: c, name: c }))}
          placeholder="Select Category"
          value={{ _id: form.category, name: form.category }}
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
      <button className="mt-4 w-full button-custom" disabled={!isValid}>
        Add Expense
      </button>
    </form>
  );
}
