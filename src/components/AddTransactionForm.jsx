import { Button } from "./reusable/Button";
import Dropdown from "./reusable/Dropdown";
import TextInput from "./reusable/TextInput";

const AddTransactionForm = ({
  people,
  handleAddTxn,
  form,
  setForm,
  isEdit,
}) => {
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

  const isFormValid = form.personId && form.amount && form.type && form.date;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleAddTxn(form);
      }}
      className=" bg-white rounded  text-black"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Dropdown
          onChangeHandler={(value) => {
            setForm({ ...form, personId: value._id });
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
          onChangeHandler={(value) => {
            setForm({ ...form, type: value._id });
          }}
          options={transactionOptions}
          placeholder="Select Transaction Type"
          value={{
            _id: form.type || "",
            name: form.type || "",
          }}
        />
        <TextInput
          value={form.date}
          onChangeHandler={(v) => setForm({ ...form, date: v })}
          placeholder="Date"
          inputType="date"
        />
        <TextInput
          value={form.note}
          onChangeHandler={(value) => setForm({ ...form, note: value })}
          placeholder="Note (optional)"
          inputType="text"
          isRequired={false}
        />
      </div>
      <Button className="mt-4 w-full" disabled={!isFormValid}>
        {isEdit ? "Update Transaction" : "Add Transaction"}
      </Button>
    </form>
  );
};

export default AddTransactionForm;
