import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function ForgotPassword() {
  const [id, setId] = useState(""); // 学籍番号
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const handleSend = async () => {
    const studentId = id.trim();
    if (!studentId) {
      alert("学籍番号を入力してください");
      return;
    }

    const email = `cy${studentId}@shibaura-it.ac.jp`;
    setSending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        alert(`送信失敗: ${error.message}`);
        return;
      }
      alert("パスワード再設定用のメールを送信しました。メールを確認してください。");
      navigate("/");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "350px", margin: "80px auto" }}>
      <h1>パスワード再設定</h1>
      <p style={{ fontSize: "14px", color: "#555" }}>
        学籍番号を入力すると、再設定メールを送ります。
      </p>

      <input
        type="text"
        placeholder="学籍番号"
        value={id}
        onChange={(e) => setId(e.target.value)}
        style={{
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          width: "100%",
          marginBottom: "12px",
        }}
      />

      <button
        onClick={handleSend}
        disabled={sending}
        style={{ padding: "10px", width: "100%" }}
      >
        {sending ? "送信中..." : "再設定メールを送信"}
      </button>

      <button
        onClick={() => navigate("/")}
        style={{ padding: "10px", width: "100%", marginTop: "10px" }}
      >
        戻る
      </button>
    </div>
  );
}
