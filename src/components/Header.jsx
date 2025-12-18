// src/components/Header.jsx
import { useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/") return null;

  const userName = localStorage.getItem("userName");
  const status = Number(localStorage.getItem("status"));

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <header
      style={{
        width: "100%",
        padding: "8px 20px",
        background: "#333",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "55px",       // ★ 高さを小さく
        boxSizing: "border-box",
      }}
    >
      <h2
        onClick={() => navigate("/home")}
        style={{
          cursor: "pointer",
          fontSize: "20px",   // ★ 少し小さめに
          margin: 0,
        }}
      >
        NodaLab's Library
      </h2>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span style={{ fontSize: "14px" }}>
          {userName} さんログイン中（{status === 0 ? "先生" : "生徒"}）
        </span>

        <button
          onClick={logout}
          style={{
            background: "red",
            color: "white",
            border: "none",
            padding: "6px 12px",
            cursor: "pointer",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          ログアウト
        </button>
      </div>
    </header>
  );
}
