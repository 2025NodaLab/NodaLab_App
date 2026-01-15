import { useEffect, useState } from "react";
import { api } from "../supabaseClient";

export default function Return() {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ★ userId キーを統一（学籍番号）
  const userId = Number(localStorage.getItem("userId"));

  const refresh = async () => {
    console.log("Return.jsx loaded: API version")//
    console.log("Return page userId:", userId, localStorage.getItem("userId"));//
    if (!Number.isFinite(userId) || userId <= 0) {
      alert("学籍番号が取得できません。ログインし直してください。");
      return;
    }
    const list = await api.getBorrowedBooks(userId);
    setBorrowedBooks(list);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleReturnClick = (item) => {
    setSelectedBook(item);
    setShowModal(true);
  };

  const confirmReturn = async () => {
    if (!selectedBook) return;

    const ok = await api.returnBook(selectedBook.rentId);
    if (ok === false) return; // returnBook側でalert出す場合に備える

    setShowModal(false);
    setSelectedBook(null);

    alert(`「${selectedBook.title}」を返却しました！`);
    refresh();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontFamily: "Zen Maru Gothic", fontWeight: 550 }}>
        書籍を返却する
      </h1>

      <p style={{ marginTop: "10px", opacity: 0.7 }}>借りている書籍一覧</p>

      <ul style={{ marginTop: "25px", listStyle: "none", padding: 0 }}>
        {borrowedBooks.map((item) => (
          <li
            key={item.rentId}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 4px",
              borderBottom: "1px solid #eee",
            }}
          >
            <span>{item.title}</span>

            <button
              onClick={() => handleReturnClick(item)}
              style={{
                padding: "5px 12px",
                background: "#f5ba4cff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              返す
            </button>
          </li>
        ))}

        {borrowedBooks.length === 0 && (
          <p style={{ opacity: 0.6, marginTop: "10px" }}>
            借りている書籍はありません。
          </p>
        )}
      </ul>

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "300px",
              textAlign: "center",
            }}
          >
            <h3>確認</h3>
            <p>本当に「{selectedBook?.title}」を返しますか？</p>

            <div
              style={{
                marginTop: "20px",
                display: "flex",
                gap: "10px",
                justifyContent: "center",
              }}
            >
              <button onClick={confirmReturn} style={{ padding: "8px 16px" }}>
                はい
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: "8px 16px" }}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
