import { useEffect, useMemo, useState } from "react";
import {
  getPeople,
  getTransactions,
  addPerson,
  addTransaction,
  addPersonalExpense,
  getPersonalExpenses,
  sendFeedback,
} from "../services/api";
import AddTransactionForm from "../components/AddTransactionForm";
import PersonalExpenseForm from "../components/PersonalExpenseForm";
import PersonalExpenseList from "../components/PersonalExpenseList";
import PersonalExpenseSummary from "../components/PersonalExpenseSummary";
import Summary from "../components/Summary";
import { useNavigate } from "react-router-dom";
import TextInput from "../components/reusable/TextInput";
import LoadingPopup from "../components/reusable/LoadingPopup";
import TransactionList from "../components/TransactionList";
import Dropdown from "../components/reusable/Dropdown";
import { REQUIRED_TOKEN_VERSION } from "../constants/globle";

export default function Dashboard({
  activeTab,
  setActiveTab,
  tabs,
  expandedSection,
  setExpandedSection,
}) {
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
  const [personalExpenses, setPersonalExpenses] = useState([]);

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

  // Handler for adding a new expense via API
  const handleAddPersonalExpense = async (expense) => {
    setLoading(true);
    try {
      await addPersonalExpense({ ...expense, amount: Number(expense.amount) });
      alert("Expense added successfully");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to add expense");
    }
    await fetchExpenses();
    setLoading(false);
  };

  async function fetchExpenses() {
    setLoading(true);
    try {
      const expenseRes = await getPersonalExpenses();
      setPersonalExpenses(expenseRes.data);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to fetch expenses");
    }

    setLoading(false);
  }

  useEffect(() => {
    if (expandedSection === "personalExpenses") {
      fetchExpenses();
    }
  }, [expandedSection]);

  const [feedback, setFeedback] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const handleSendFeedback = async () => {
    if (!feedback.trim()) {
      alert("Please enter your feedback.");
      return;
    }
    setFeedbackLoading(true);
    try {
      await sendFeedback({ message: feedback });
      alert("Thank you for your feedback!");
      setFeedback("");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to send feedback");
    }
    setFeedbackLoading(false);
  };
  const summary = useMemo(() => {
    const summaryByPerson = {};

    transactions.forEach((txn) => {
      const { personId } = txn;
      const { name } = personId;

      if (!summaryByPerson[name]) {
        summaryByPerson[name] = { lend: 0, borrowed: 0, received: 0, repay: 0 };
      }

      if (txn.type === "lend") {
        summaryByPerson[name].lend += txn.amount;
      } else if (txn.type === "borrowed") {
        summaryByPerson[name].borrowed += txn.amount;
      } else if (txn.type === "received") {
        summaryByPerson[name].received += txn.amount;
      } else if (txn.type === "repay") {
        summaryByPerson[name].repay += txn.amount;
      }
    });
    return summaryByPerson;
  }, [transactions]);

  return (
    <div className=" w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex font-sans relative">
      <aside
        className={`
          fixed top-16 hidden left-0 h-[calc(100vh-4rem)] z-20 bg-white/90 shadow-lg rounded-r-2xl p-4 min-w-[180px] max-w-[260px]
          flex-col gap-2 transition-transform duration-300 sm:static sm:translate-x-0 sm:flex sm:mt-8 sm:ml-4 sm:h-fit 
        `}
      >
        <div className="flex flex-col gap-2">
          {tabs.map((section) => (
            <div key={section.key}>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition text-left w-full ${
                  expandedSection === section.key
                    ? "bg-indigo-500 text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-indigo-100"
                }`}
                onClick={() => {
                  setExpandedSection(
                    expandedSection === section.key ? null : section.key
                  );
                  setActiveTab(null); // default to first sub-tab
                }}
              >
                <span>{section.icon}</span>
                <span>{section.label}</span>
                <span className="ml-auto">
                  {expandedSection === section.key ? "▲" : "▼"}
                </span>
              </button>
              {/* Sub-tabs: only show if this section is expanded */}
              {expandedSection === section.key && (
                <div className="flex flex-col gap-2 pl-4 pt-4">
                  {section?.children?.map((tabItem) => (
                    <button
                      key={tabItem.key}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition text-left ${
                        activeTab === tabItem.key
                          ? "bg-indigo-400 text-white shadow"
                          : "bg-gray-100 text-gray-700 hover:bg-indigo-100"
                      }`}
                      onClick={() => {
                        setActiveTab(tabItem.key);
                      }}
                    >
                      <span>{tabItem.icon}</span>
                      <span>{tabItem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-4 sm:py-8 w-full ml-0 sm:ml-0">
        <div className="max-w-4xl max-sm:max-w-[390px] bg-white/90 rounded-2xl shadow-xl p-2 sm:p-4 md:p-8 flex flex-col min-w-[300px]">
          <div className="flex-1 min-w-0">
            {!activeTab && (
              <div className="text-center py-16">
                <h1 className="text-3xl font-bold mb-4 text-indigo-700">
                  Welcome to your Dashboard!
                </h1>
                <p className="text-lg text-gray-700 mb-2">
                  Use the sidebar to navigate between Lend & Borrow, Personal
                  Expenses, and Feedback.
                </p>
                <p className="text-md text-gray-500">
                  Click a section on the left to get started.
                </p>
              </div>
            )}
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

            {activeTab === "transactions" && (
              <>
                <TransactionList
                  transactions={transactions}
                  summary={summary}
                />
              </>
            )}

            {expandedSection === "personalExpenses" && (
              <>
                {activeTab === "addExpense" && (
                  <>
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 tracking-tight">
                      Add New Expense
                    </h2>
                    <PersonalExpenseForm onAdd={handleAddPersonalExpense} />
                  </>
                )}
                {activeTab === "expenseList" && (
                  <PersonalExpenseList expenses={personalExpenses} />
                )}
              </>
            )}
            {activeTab === "feedbackForm" && (
              <>
                <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 tracking-tight">
                  Feedback
                </h2>
                <div className="bg-white p-4 rounded shadow text-black">
                  <p>
                    We would love to hear your feedback! Please type your
                    message and send it.
                  </p>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded mt-2"
                    rows="4"
                    placeholder="Type your feedback here..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    disabled={feedbackLoading}
                  />
                  <button
                    className="mt-2 button-custom"
                    onClick={handleSendFeedback}
                    disabled={feedbackLoading || !feedback.trim()}
                  >
                    {feedbackLoading ? "Sending..." : "Send Feedback"}
                  </button>
                </div>
              </>
            )}
          </div>

          <LoadingPopup show={loading} />
        </div>
      </main>
    </div>
  );
}
