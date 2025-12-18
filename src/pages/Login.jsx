import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Login() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (id === "" || pw === "") {
      alert("ID と パスワードを入力してください");
      return;
    }

    // --- Supabase でユーザー取得 ---
    const { data: member, error } = await supabase
      .from("member")
      .select("*")
      .eq("id", Number(id))
      .single();

    if (error || !member) {
      alert("ID が存在しません");
      return;
    }

    // PW は id と同じ仕様
    if (pw !== String(member.id)) {
      alert("パスワードが違います");
      return;
    }

    // --- ログイン情報保存 ---
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userId", member.id);
    localStorage.setItem("userName", member.name);
    localStorage.setItem("role", member.status === 0 ? "teacher" : "student");

    alert(`${member.name} としてログインしました！`);

    navigate("/home"); // ← 前と同じ挙動
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
    </div>
  );
}
