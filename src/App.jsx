import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import { REQUIRED_TOKEN_VERSION } from "./constants/globle";

const TABS = [
  {
    key: "money",
    label: "Money Tracker",
    icon: "💰",
    children: [
      { key: "addPerson", label: "Add Person", icon: "➕" },
      { key: "addTransaction", label: "Create Transaction", icon: "💸" },
      { key: "transactions", label: "Transactions List", icon: "📋" },
    ],
  },
  {
    key: "personalExpenses",
    label: "Personal Expenses",
    icon: "🧾",
  },
  {
    key: "feedback",
    label: "Feedback",
    icon: "💬",
    children: [{ key: "feedbackForm", label: "Feedback Form", icon: "📝" }],
  },
];

function App() {
  const userNameFromStorage = localStorage.getItem("userName") || "";
  const [userName, setUserName] = useState(userNameFromStorage);
  const [activeTab, setActiveTab] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("masterKey");
    window.location.href = "/register";
    setUserName("");
    setActiveTab(null);
    setSidebarOpen(false);
  };
  const storedVersion = localStorage.getItem("tokenVersion") || "";
  useEffect(() => {
    if (storedVersion !== REQUIRED_TOKEN_VERSION) {
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      localStorage.removeItem("masterKey");
      // window.location.href = "/register";
      setUserName("");
      setActiveTab(null);
      setSidebarOpen(false);
    }
  }, [storedVersion, userNameFromStorage]);
  // In App.jsx
  // Local state to track which section is expanded

  const [expandedSection, setExpandedSection] = useState(null);

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
