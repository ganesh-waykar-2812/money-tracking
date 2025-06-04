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
import LoadingPopup from "../components/reusable/LoadingPopup";

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
  const [loading, setLoading] = useState(false); // <-- Add loading state

  const navigate = useNavigate(); // Add this line

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/register");
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true); // Start loading
    try {
      const peopleRes = await getPeople();
      setPeople(peopleRes.data);
      const txnRes = await getTransactions();
      setTransactions(txnRes.data);
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleAddPerson = async () => {
    setLoading(true);
    try {
      await addPerson({ name: personName });
      alert("Person added successfully");
    } catch (error) {
      alert(error?.response?.data?.message);
    }
    setPersonName("");
    await loadData();
    setLoading(false);
  };

  const handleAddTxn = async (form) => {
    setLoading(true);
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
    await loadData();
    setLoading(false);
  };

  return (
    <div className="w-full p-4 bg-black">
      <h2 className="text-xl font-semibold mb-2">Add new person</h2>
      <div className="mb-4 bg-white p-4 rounded shadow text-black">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            value={personName}
            onChangeHandler={setPersonName}
            placeholder="Name"
            inputType="text"
          />
          <button
            onClick={handleAddPerson}
            className="button-custom "
            disabled={!personName}
          >
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
      <LoadingPopup show={loading} />
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
