// src/components/AdminRoute.jsx
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const status = Number(localStorage.getItem("status")); // 0 = 先生

  if (!isLoggedIn || status !== 0) {
    return <Navigate to="/" replace />;
  }

  return children;
}
