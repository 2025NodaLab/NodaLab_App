// src/pages/Borrow.jsx
import { useEffect, useState } from "react";
import { setupDevUser } from "../utils/devUser";
import { api } from "../supabaseClient";

export default function Borrow() {
  setupDevUser();

  const [keyword, setKeyword] = useState("");
  const [genre, setGenre] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [books, setBooks] = useState([]);

  const userId = localStorage.getItem("userId");

  // ▼ 初回ロード：Supabase からデータ取得
  useEffect(() => {
    api.getBooksWithRentInfo().then((data) => {
      // isBorrowed = true のものは貸出中 → 表示しない
      setBooks(data.filter((b) => !b.isBorrowed));
    });
  }, []);

  // ▼ 検索
  const filteredBooks = books.filter((book) => {
    const matchKeyword = book.title.includes(keyword);
    const matchGenre = genre === "" || book.genre === genre;
    return matchKeyword && matchGenre;
  });

  const handleBorrowClick = (book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  // ▼ 貸出処理
  const confirmBorrow = async () => {
    if (!selectedBook) return;

    // rent 追加
    await api.borrowBook(selectedBook.id, userId);

    // 返却日
    const today = new Date();
    const due = new Date();
    due.setDate(today.getDate() + 14);
    const formattedDue = `${due.getFullYear()}/${String(
      due.getMonth() + 1
    ).padStart(2, "0")}/${String(due.getDate()).padStart(2, "0")}`;

    alert(`「${selectedBook.title}」を借りました！\n返却日は ${formattedDue} です。`);

    setShowModal(false);
    setSelectedBook(null);

    // 📌 再取得（貸出済みは除外される）
    const all = await api.getBooksWithRentInfo();
    setBooks(all.filter((b) => !b.isBorrowed));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontFamily: "Zen Maru Gothic", fontWeight: 550 }}>
        書籍を借りる
      </h1>

      {/* 検索欄 */}
      <div style={{ marginTop: "25px" }}>
        <input
          type="text"
          placeholder="書籍名で検索"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{
            padding: "10px",
            width: "240px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginRight: "10px",
          }}
        />

        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "8px",
            fontSize: "16px",
          }}
        >
          <option value="">全ジャンル</option>
          <option value="Linux">Linux</option>
          <option value="自己啓発">自己啓発</option>
          <option value="生成AI">生成AI</option>
          <option value="Java">Java</option>
          <option value="ソフトウェアテスト">ソフトウェアテスト</option>
        </select>
      </div>

      {/* 検索結果 */}
      <div style={{ marginTop: "30px" }}>
        <h2 style={{ fontFamily: "Zen Maru Gothic", fontWeight: 450 }}>
          検索結果
        </h2>

        <ul style={{ marginTop: "10px", listStyle: "none", padding: 0 }}>
          {filteredBooks.map((book) => (
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
                onClick={() => handleBorrowClick(book)}
                style={{
                  padding: "5px 12px",
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                借りる
              </button>
            </li>
          ))}

          {filteredBooks.length === 0 && (
            <p style={{ opacity: 0.6 }}>借りられる本がありません。</p>
          )}
        </ul>
      </div>

      {/* モーダル */}
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
            <p>本当に「{selectedBook?.title}」を借りますか？</p>

            <div
              style={{
                marginTop: "20px",
                display: "flex",
                gap: "10px",
                justifyContent: "center",
              }}
            >
              <button onClick={confirmBorrow} style={{ padding: "8px 16px" }}>
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
