import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (id === "" || pw === "") {
      alert("ID と パスワードを入力してください");
      return;
    }

    // ★ 先生ログイン
    if (id === "teacher" && pw === "teacher") {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role", "teacher");
      localStorage.setItem("userId", "teacher");

      alert("先生としてログインしました！");
      navigate("/home");
      return;
    }

    // ★ 生徒ログイン
    if (id === "student" && pw === "student") {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role", "student");
      localStorage.setItem("userId", "student");

      alert("生徒としてログインしました！");
      navigate("/home");
      return;
    }

    // ★ それ以外はログイン禁止
    alert("ID またはパスワードが正しくありません");
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "350px",
        margin: "0 auto",
        marginTop: "80px",
      }}
    >
      <h1 style={{ marginBottom: "30px" }}>ログイン</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input
          type="text"
          placeholder="ユーザー ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="password"
          placeholder="パスワード"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            padding: "12px",
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            marginTop: "10px",
            cursor: "pointer",
          }}
        >
          ログイン
        </button>
      </div>

      <p style={{ opacity: 0.6, marginTop: "20px", fontSize: "14px" }}>
        先生用: teacher / teacher  
        <br />
        生徒用: student / student
      </p>
    </div>
  );
}
