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
import TransactionList from "../components/TransactionList";

export default function Dashboard({ activeTab, setActiveTab, tabs }) {
  const [people, setPeople] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [personName, setPersonName] = useState("");
  const [form, setForm] = useState({
    personId: "",
    amount: "",
    type: "",
    note: "",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/register");
    }
    loadData();
    // eslint-disable-next-line
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const peopleRes = await getPeople();
      setPeople(peopleRes.data);
      const txnRes = await getTransactions();
      setTransactions(txnRes.data);
    } finally {
      setLoading(false);
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
    <div className=" w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex font-sans relative">
      <aside
        className={`
          fixed top-16 hidden left-0 h-[calc(100vh-4rem)] z-20 bg-white/90 shadow-lg rounded-r-2xl p-4 min-w-[180px] max-w-[220px]
          flex-col gap-2 transition-transform duration-300 sm:static sm:translate-x-0 sm:flex sm:mt-8 sm:ml-4 sm:h-fit 
        `}
      >
        <div className="flex flex-col gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition text-left ${
                activeTab === tab.key
                  ? "bg-indigo-500 text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-indigo-100"
              }`}
              onClick={() => {
                setActiveTab(tab.key);
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-4 sm:py-8 w-full ml-0 sm:ml-0">
        <div className="max-w-4xl bg-white/90 rounded-2xl shadow-xl p-2 sm:p-4 md:p-8 flex flex-col ">
          <div className="flex-1 min-w-0">
            {activeTab === "addPerson" && (
              <>
                <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 tracking-tight">
                  Add new person
                </h2>
                <div className="mb-8 bg-white p-4 rounded-xl shadow text-black">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                      value={personName}
                      onChangeHandler={setPersonName}
                      placeholder="Name"
                      inputType="text"
                    />
                    <button
                      onClick={handleAddPerson}
                      className="button-custom"
                      disabled={!personName}
                    >
                      Add Person
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === "addTransaction" && (
              <>
                <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 tracking-tight">
                  Create Transaction
                </h2>
                <AddTransactionForm
                  people={people}
                  handleAddTxn={handleAddTxn}
                  form={form}
                  setForm={setForm}
                />
              </>
            )}

            {activeTab === "summary" && <Summary transactions={transactions} />}

            {activeTab === "transactions" && (
              <TransactionList transactions={transactions} />
            )}
          </div>

          <LoadingPopup show={loading} />
        </div>
      </main>
    </div>
  );
}
