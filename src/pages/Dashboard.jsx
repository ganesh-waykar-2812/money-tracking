import { useEffect, useState } from "react";
import {
  getPeople,
  getTransactions,
  addPerson,
  addTransaction,
} from "../services/api";
import AddTransactionForm from "../components/AddTransactionForm";
import Summary from "../components/Summary";
import { useNavigate } from "react-router-dom";
import TextInput from "../components/reusable/TextInput";

export default function Dashboard() {
  const [people, setPeople] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [personName, setPersonName] = useState("");
  const [form, setForm] = useState({
    personId: "",
    amount: "",
    type: "",
    note: "",
  });

  const navigate = useNavigate(); // Add this line

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/register");
    }
    loadData();
  }, []);

  const loadData = async () => {
    const peopleRes = await getPeople();
    setPeople(peopleRes.data);
    const txnRes = await getTransactions();
    setTransactions(txnRes.data);
  };

  const handleAddPerson = async () => {
    try {
      await addPerson({ name: personName });
      alert("Person added successfully");
    } catch (error) {
      alert(error?.response?.data?.message);
    }

    setPersonName("");
    loadData();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/register"; // or use navigate("/login") if inside a component with useNavigate
  };

  const handleAddTxn = async (form) => {
    try {
      await addTransaction(form);
      alert("Transaction added successfully");
      setForm({
        personId: "",
        amount: "",
        type: "",
        note: "",
      });
    } catch (error) {
      alert(error?.response?.data?.message);
    }
    loadData();
  };
  console.log("transactions", transactions);
  return (
    <div className="max-w-2xl mx-auto p-4">
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
      >
        Logout
      </button>
      <h2 className="text-xl font-semibold mb-2">Add new person</h2>
      <div className="mb-4 bg-white p-4 rounded shadow text-black">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            value={personName}
            onChangeHandler={setPersonName}
            placeholder="Name"
            inputType="text"
          />
          <button onClick={handleAddPerson} className="button-custom">
            Add Person
          </button>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-2">Create Transaction</h2>
      <AddTransactionForm
        people={people}
        handleAddTxn={handleAddTxn}
        form={form}
        setForm={setForm}
      />

      <Summary transactions={transactions} />

      <h2 className="text-xl font-semibold mb-2">All Transactions</h2>
      <div className="bg-white p-4 rounded shadow text-black">
        <ul>
          {transactions.map((txn) => {
            console.log("txn");
            return (
              <li key={txn._id}>
                {txn.type} ₹{txn.amount} to {txn.personId.name} on{" "}
                {new Date(txn.date).toLocaleDateString()} ({txn.note})
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
