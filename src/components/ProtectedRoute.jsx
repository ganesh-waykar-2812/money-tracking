import { Navigate } from "react-router-dom";
import { REQUIRED_TOKEN_VERSION } from "../constants/globle";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const storedVersion = localStorage.getItem("tokenVersion");
  const isAuthenticated = !!token && storedVersion === REQUIRED_TOKEN_VERSION;
  if (storedVersion !== REQUIRED_TOKEN_VERSION) {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("hasSeenHelpModal");
    localStorage.removeItem("masterKey");
    localStorage.removeItem("isAdmin");
  }
  if (!isAuthenticated) {
    return <Navigate to="/register" replace />;
  }
  return children;
}
