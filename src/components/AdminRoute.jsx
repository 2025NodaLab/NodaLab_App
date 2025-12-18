import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const role = localStorage.getItem("role");

  if (!isLoggedIn || role !== "teacher") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
