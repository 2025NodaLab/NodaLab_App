// src/components/AdminRoute.jsx
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const status = Number(localStorage.getItem("status")); // 先生=2

  if (!isLoggedIn || status !== 2) {
    return <Navigate to="/" replace />;
  }

  return children;
}
