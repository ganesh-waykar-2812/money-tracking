import React, { useState } from "react";
import { addPerson, addTransaction } from "../services/api";
import TextInput from "./reusable/TextInput";
import Dropdown from "./reusable/Dropdown";

const AddTransactionForm = ({ people, handleAddTxn, form, setForm }) => {
  const transactionOptions = [
    {
      _id: "lend",
      name: "Lend (Money given to someone)",
    },
    {
      _id: "borrowed",
      name: "Borrowed (Money taken from someone)",
    },
    {
      _id: "received",
      name: "Received (Money received from someone)",
    },
    {
      _id: "repay",
      name: "Repay (Money given back to someone)",
    },
  ];

  const isFormValid = form.personId && form.amount && form.type;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleAddTxn(form);
      }}
      className="mb-4 bg-white p-4 rounded shadow text-black"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Dropdown
          onChangeHandler={(value) => {
            setForm({ ...form, personId: value.value });
          }}
          options={people}
          placeholder="Select Person"
          value={{
            _id: form.personId,
            name: people.find((p) => p._id === form.personId)?.name || "",
          }}
        />

        <TextInput
          value={form.amount}
          onChangeHandler={(value) => setForm({ ...form, amount: value })}
          placeholder="Amount"
          inputType="number"
        />

        <Dropdown
          onChangeHandler={(value) => setForm({ ...form, type: value.value })}
          options={transactionOptions}
          placeholder="Select Transaction Type"
          value={{
            _id: form.type || "",
            name: form.type || "",
          }}
        />

        <TextInput
          value={form.note}
          onChangeHandler={(value) => setForm({ ...form, note: value })}
          placeholder="Note (optional)"
          inputType="text"
          isRequired={false}
        />
      </div>
      <button className="mt-4 w-full button-custom" disabled={!isFormValid}>
        Add Transaction
      </button>
    </form>
  );
};

export default AddTransactionForm;
