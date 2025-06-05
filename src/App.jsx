import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";

const TABS = [
  {
    key: "lendBorrow",
    label: "Lend & Borrow",
    icon: "🤝",
    children: [
      { key: "addPerson", label: "Add Person", icon: "➕" },
      { key: "addTransaction", label: "Create Transaction", icon: "💸" },
      // { key: "summary", label: "Summary", icon: "📊" },
      { key: "transactions", label: "Transactions List", icon: "📋" },
    ],
  },
  {
    key: "personalExpenses",
    label: "Personal Expenses",
    icon: "🧾",
    children: [
      { key: "addExpense", label: "Add Expense", icon: "➕" },
      { key: "expenseList", label: "Expense List", icon: "📄" },
      // { key: "expenseSummary", label: "Summary", icon: "📊" },
    ],
  },
  {
    key: "feedback",
    label: "Feedback",
    icon: "💬",
  },
];

function App() {
  const REQUIRED_TOKEN_VERSION = "2"; // Increment this after deployment

  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || ""
  );
  const [activeTab, setActiveTab] = useState(TABS[0].children[0].key);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    window.location.href = "/register";
  };

  useEffect(() => {
    const storedVersion = localStorage.getItem("tokenVersion");
    if (storedVersion !== REQUIRED_TOKEN_VERSION) {
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      localStorage.setItem("tokenVersion", REQUIRED_TOKEN_VERSION);
      window.location.href = "/register";
    }
  }, []);
  // In App.jsx
  // Local state to track which section is expanded

  const [expandedSection, setExpandedSection] = useState(TABS[0].key);

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header
          userName={userName}
          onLogout={handleLogout}
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen((v) => !v)}
          tabs={TABS}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          expandedSection={expandedSection}
          setExpandedSection={setExpandedSection}
        />
        <div className="flex-1 flex">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    tabs={TABS}
                    expandedSection={expandedSection}
                    setExpandedSection={setExpandedSection}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/register"
              element={<RegisterPage setUserName={setUserName} />}
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
