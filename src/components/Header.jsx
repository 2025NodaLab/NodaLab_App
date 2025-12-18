import { useLocation, useNavigate } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  // ★ ログインページではヘッダー非表示
  if (location.pathname === "/") {
    return null;
  }

  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
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
        height: "70px",       
        boxSizing: "border-box",
      }}
    >
      <h2
        onClick={() => navigate("/home")}
        style={{ 
            cursor: "pointer", 
            fontFamily: '"Kiwi Maru", sans-serif',
            fontSize: "20px",
            margin: 0,

         }}
      >
        NodaLab's Library
      </h2>

      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        {role && (
          <span style={{ opacity: 0.8 }}>
            {role === "teacher" ? "先生ログイン中" : "生徒ログイン中"}
          </span>
        )}

        <button
          onClick={logout}
          style={{
            padding: "6px 12px",
            background: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          ログアウト
        </button>
      </div>
    </header>
  );
}
