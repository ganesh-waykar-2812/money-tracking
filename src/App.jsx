import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";

import Dashboard from "./pages/Dashboard";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const REQUIRED_TOKEN_VERSION = "2"; // Increment this after deployment

  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || ""
  );
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

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header userName={userName} onLogout={handleLogout} />
        <div className="flex-1 flex">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/register"
              element={<RegisterPage setUserName={setUserName} />}
            />
            {/* <Route path="/login" element={<LoginPage />} /> */}
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
