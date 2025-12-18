import { useState } from "react";
import { books } from "../data/books";

export default function DeleteBook() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleDelete = (book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  const confirmDelete = () => {
    alert(`「${selectedBook.title}」を削除しました！`);
    setShowModal(false);
    setSelectedBook(null);

    // ★ 本番はDB/APIで削除する処理に差し替える
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontFamily: "Zen Maru Gothic", fontWeight: 550 }}>
        登録済み書籍を削除する
      </h1>

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
            <span>{book.title}</span>

            <button
              onClick={() => handleDelete(book)}
              style={{
                padding: "5px 12px",
                background: "#F44336",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              削除
            </button>
          </li>
        ))}
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
            <p>本当に「{selectedBook?.title}」を削除しますか？</p>

            <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={confirmDelete} style={{ padding: "8px 16px" }}>
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
