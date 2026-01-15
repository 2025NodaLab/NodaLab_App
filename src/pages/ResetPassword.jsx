import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function ResetPassword() {
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase Auth (PKCE) の code をセッションに交換
    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
          // URLからcodeを消す（リロード時のループ防止）
          url.searchParams.delete("code");
          window.history.replaceState({}, document.title, url.toString());
        }
      } finally {
        setReady(true);
      }
    };
    run();
  }, []);

  const handleUpdate = async () => {
    if (!newPw || !confirmPw) {
      alert("新しいパスワードを入力してください");
      return;
    }
    if (newPw !== confirmPw) {
      alert("パスワードが一致しません");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) {
        alert(`変更失敗: ${error.message}`);
        return;
      }
      alert("パスワードを変更しました。ログインしてください。");
      navigate("/");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "350px", margin: "80px auto" }}>
      <h1>新しいパスワード設定</h1>

      {!ready ? (
        <p>準備中...</p>
      ) : (
        <>
          <input
            type="password"
            placeholder="新しいパスワード"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
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
            placeholder="新しいパスワード（確認）"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              width: "100%",
              marginBottom: "12px",
            }}
          />

          <button onClick={handleUpdate} disabled={saving} style={{ padding: "10px", width: "100%" }}>
            {saving ? "変更中..." : "パスワードを変更"}
          </button>
        </>
      )}
    </div>
  );
}
