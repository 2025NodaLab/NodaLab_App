import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Login() {
  const [id, setId] = useState(""); // 学籍番号
  const [pw, setPw] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const studentId = id.trim();

    if (!studentId || !pw) {
      alert("学籍番号とパスワードを入力してください");
      return;
    }

    // 学籍番号 → 内部メール形式
    const email = `cy${studentId}@shibaura-it.ac.jp`;

    try {
      // Authログイン
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pw,
      });

      if (error) {
        alert(`ログイン失敗: ${error.message}`);
        return;
      }

      // auth.uid を取得
      const { data: u, error: uErr } = await supabase.auth.getUser();
      if (uErr || !u?.user) {
        alert("ログインユーザー情報が取得できません");
        return;
      }

      // member を auth_uid で取得
      const { data: member, error: mErr } = await supabase
        .from("member")
        .select("id, name, role, is_active")
        .eq("auth_uid", u.user.id)
        .maybeSingle();

      if (mErr || !member) {
        alert("member情報が見つかりません。管理者に確認してください。");
        return;
      }

      if (member.is_active !== 1) {
        alert("このアカウントは停止中です。");
        return;
      }

      // localStorage をセット
      localStorage.setItem("isLoggedIn", "1");
      localStorage.setItem("userId", String(member.id)); // 学籍番号
      localStorage.setItem("userName", member.name);
      // role=2 の場合は先生としてログイン
      localStorage.setItem("status", String(member.role));

      navigate("/home");
    } catch (e) {
      console.error(e);
      alert("予期しないエラーが発生しました");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "350px", margin: "80px auto" }}>
      <h1>ログイン</h1>

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

      <input
        type="password"
        placeholder="パスワード"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        style={{
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          width: "100%",
          marginBottom: "12px",
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
          width: "100%",
        }}
      >
        ログイン
      </button>

      <div
        style={{
          marginTop: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <button onClick={() => navigate("/signup")} style={{ padding: "10px", width: "100%" }}>
          新規登録
        </button>

        <button onClick={() => navigate("/forgot-password")} style={{ padding: "10px", width: "100%" }}>
          パスワードを忘れた
        </button>
      </div>
    </div>
  );
}
