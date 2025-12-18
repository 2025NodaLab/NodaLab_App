// src/pages/Return.jsx
import { useEffect, useState } from "react";
import { setupDevUser } from "../utils/devUser";

export default function Return({ api }) {
  setupDevUser();

  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const userId = localStorage.getItem("userId");
  const userIdNum = Number(userId);

  useEffect(() => {
    api.getBooksWithRentInfo().then((data) => {
      setBooks(
        data.filter(
          (b) => b.currentRent && b.currentRent.userid === userIdNum
        )
      );
    });
  }, [api, userIdNum]);

  const handleReturnClick = (book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  const confirmReturn = async () => {
    if (!selectedBook) return;

    await api.returnBook(selectedBook.id, userIdNum);

    alert(`「${selectedBook.title}」を返却しました！`);

    setShowModal(false);
    setSelectedBook(null);

    const all = await api.getBooksWithRentInfo();
    setBooks(
      all.filter(
        (b) => b.currentRent && b.currentRent.userid === userIdNum
      )
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontFamily: "Zen Maru Gothic", fontWeight: 550 }}>
        書籍を返却する
      </h1>

      <p style={{ marginTop: "10px", opacity: 0.7 }}>借りている書籍一覧</p>

      <ul style={{ marginTop: "25px", listStyle: "none", padding: 0 }}>
        {books.map((book) => (
          <li
            key={book.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 4px",
              borderBottom: "1px solid #eee",
            }}
          >
            <span>
              {book.title}
              {book.dueDate && (
                <span
                  style={{
                    color: "gray",
                    marginLeft: "8px",
                    fontSize: "13px",
                  }}
                >
                  （返却予定日: {book.dueDate}）
                </span>
              )}
            </span>

            <button
              onClick={() => handleReturnClick(book)}
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

        {books.length === 0 && (
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
