import "@fontsource/roboto";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import { REQUIRED_TOKEN_VERSION } from "./constants/globle";
import Dashboard, { DashboardHome, FeedbackForm } from "./pages/Dashboard";
import Trips from "./pages/Trips";
import RegisterPage from "./pages/RegisterPage";
import LandingPage from "./pages/LandingPage";
import TransactionList from "./components/TransactionList";
import PersonalExpenseList from "./components/PersonalExpenseList";
import UserManagement from "./pages/UserManagement";
import FeedbackManagement from "./pages/FeedbackManagement";
import { deleteSubscription } from "./services/api";

const TABS = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: "🏠",
  },
  { key: "transactions", label: "Lend & Borrow", icon: "📋" },
  {
    key: "personalExpenses",
    label: "Personal Expenses",
    icon: "🧾",
  },
  {
    key: "trips",
    label: "Trips",
    icon: "✈️",
  },
  {
    key: "feedback",
    label: "Feedback",
    icon: "💬",
    children: [{ key: "feedbackForm", label: "Feedback Form", icon: "📝" }],
  },
  {
    key: "adminFeatures",
    label: "Admin Features",
    icon: "🛠️",
    children: [
      { key: "userManagement", label: "User Management", icon: "👥" },
      { key: "systemLogs", label: "System Logs", icon: "📜" },
      { key: "settings", label: "Settings", icon: "⚙️" },
      { key: "feedbackManagement", label: "Feedback Management", icon: "🗂️" },
    ],
  },
];

function App() {
  const userNameFromStorage = localStorage.getItem("userName") || "";
  const [userName, setUserName] = useState(userNameFromStorage);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const filteredTabs = TABS.filter(
    (tab) =>
      tab.key !== "adminFeatures" || localStorage.getItem("isAdmin") === "true"
  );
  const isAuthenticated = !!localStorage.getItem("token") && localStorage.getItem("tokenVersion") === REQUIRED_TOKEN_VERSION;

  const handleLogout = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        await deleteSubscription(); // Call API to remove subscription from backend
      }
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications:", error);
    }

    // Clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("masterKey");
    localStorage.removeItem("isAdmin");

    // Reset UI state
    setUserName("");
    setSidebarOpen(false);
  };
  const storedVersion = localStorage.getItem("tokenVersion") || "";
  useEffect(() => {
    if (storedVersion !== REQUIRED_TOKEN_VERSION) {
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      localStorage.removeItem("masterKey");
      localStorage.removeItem("isAdmin");
      // window.location.href = "/register";
      setUserName("");
      setSidebarOpen(false);
    }
  }, [storedVersion, userNameFromStorage]);
  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen w-screen bg-gray-100 overflow-hidden">
        {isAuthenticated && (
          <Header
            userName={userName}
            onLogout={handleLogout}
            sidebarOpen={sidebarOpen}
            onSidebarToggle={() => setSidebarOpen((v) => !v)}
            tabs={filteredTabs}
          />
        )}
        <div className="flex-1 flex overflow-hidden">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard tabs={filteredTabs} /></ProtectedRoute>}>
              <Route index element={<DashboardHome />} />
              <Route path="transactions" element={<TransactionList />} />
              <Route path="personalExpenses" element={<PersonalExpenseList />} />
              <Route path="feedbackForm" element={<FeedbackForm />} />
              <Route path="userManagement" element={<UserManagement />} />
              <Route path="feedbackManagement" element={<FeedbackManagement />} />
            </Route>
            <Route
              path="/trips"
              element={
                <ProtectedRoute>
                  <Trips />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips/:id"
              element={
                <ProtectedRoute>
                  <Trips />
                </ProtectedRoute>
              }
            />
            <Route
              path="/register"
              element={<RegisterPage setUserName={setUserName} />}
            />
          </Routes>
        </div>
        <footer className="text-center text-gray-400 text-sm m-1">
          Money Tracker &copy; 2026 Ganesh Waykar
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
