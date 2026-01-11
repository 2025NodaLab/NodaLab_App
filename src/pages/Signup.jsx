import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Signup() {
  const [id, setId] = useState("");      // 学籍番号
  const [name, setName] = useState("");  // 氏名
  const [pw, setPw] = useState("");
  const [isTeacher, setIsTeacher] = useState(false); // 先生として登録
  const navigate = useNavigate();

  const handleSignup = async () => {
    const studentId = id.trim();
    if (!studentId || !name.trim() || !pw) {
      alert("学籍番号・氏名・パスワードを入力してください");
      return;
    }

    const email = `cy${studentId}@shibaura-it.ac.jp`;

    // 1) Supabase Auth に登録
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pw,
    });

    if (error) {
      alert(`登録失敗: ${error.message}`);
      return;
    }

    // Supabase設定で「メール確認必須」にしていると user が null のことがあります
    const authUser = data.user;

    // 2) member テーブルに紐づけ情報を保存
    // role: 生徒=1 / 先生=2, is_active: 在籍=1 / 停止=0
    if (authUser) {
      const { error: memberErr } = await supabase
        .from("member")
        .insert([
          {
            id: Number(studentId),
            name: name.trim(),
            role: isTeacher ? 2 : 1,
            is_active: 1,
            auth_uid: authUser.id, // ★後述：RLSで重要
          },
        ]);

      if (memberErr) {
        alert(`member登録失敗: ${memberErr.message}`);
        return;
      }

      // 3) 既存UIが見ているlocalStorageを埋める（暫定）
      localStorage.setItem("isLoggedIn", "1");
      localStorage.setItem("userId", studentId);
      localStorage.setItem("userName", name.trim());
      localStorage.setItem("status", isTeacher ? "2" : "1");
    }

    alert("登録しました。ログインして利用してください。");
    navigate("/");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "350px", margin: "80px auto" }}>
      <h1>ユーザー登録</h1>

      <input
        type="text"
        placeholder="学籍番号"
        value={id}
        onChange={(e) => setId(e.target.value)}
        style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", width: "100%", marginBottom: "12px" }}
      />
      <input
        type="text"
        placeholder="氏名"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", width: "100%", marginBottom: "12px" }}
      />
      <input
        type="password"
        placeholder="パスワード"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", width: "100%", marginBottom: "12px" }}
      />

      {/* ✅ 新規登録時のみ：先生として登録するチェック */}
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <input
          type="checkbox"
          checked={isTeacher}
          onChange={(e) => setIsTeacher(e.target.checked)}
        />
        先生として登録（チェックを付けると先生用アカウントになります）
      </label>

      <button onClick={handleSignup} style={{ padding: "10px", width: "100%" }}>
        登録
      </button>

      <div style={{ marginTop: "12px" }}>
        <button onClick={() => navigate("/")} style={{ padding: "10px", width: "100%" }}>
          ログインに戻る
        </button>
      </div>
    </div>
  );
}
