import { useState } from "react";
import { setupDevUser } from "../utils/devUser";
import { books } from "../data/books";

export default function Borrow() {
  setupDevUser();

  const [keyword, setKeyword] = useState("");
  const [genre, setGenre] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "Unknown"; // ★ 追加（借りる人の名前）

  // ユーザーの借りてる本
  const borrowedData = JSON.parse(localStorage.getItem("borrowedBooks") || "{}");
  const userBorrowed = borrowedData[userId] || [];
  const borrowedIds = new Set(userBorrowed.map((b) => b.id));

  // 借りれる本一覧（借り済みを除外）
  const availableBooks = books.filter((b) => !borrowedIds.has(b.id));

  // 検索フィルタ
  const filteredBooks = availableBooks.filter((book) => {
    const matchKeyword = book.title.includes(keyword);
    const matchGenre = genre === "" || book.genre === genre;
    return matchKeyword && matchGenre;
  });

  const handleBorrowClick = (book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  const confirmBorrow = () => {
    const borrowed = JSON.parse(localStorage.getItem("borrowedBooks") || "{}");
    if (!borrowed[userId]) borrowed[userId] = [];

    // 返却予定日計算
    const today = new Date();
    const due = new Date();
    due.setDate(today.getDate() + 14);
    const formattedDue = `${due.getFullYear()}/${String(due.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(due.getDate()).padStart(2, "0")}`;

    // ★ borrowerName と borrower を追加して保存
    borrowed[userId].push({
      ...selectedBook,
      dueDate: formattedDue,
      borrower: userId,
      borrowerName: userName,
    });

    localStorage.setItem("borrowedBooks", JSON.stringify(borrowed));

    setShowModal(false);
    setSelectedBook(null);

    // UI 更新
    setTimeout(() => {
      alert(`「${selectedBook.title}」を借りました！\n返却日は ${formattedDue} です。`);
      window.location.reload();
    }, 0);
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
          <option value="novel">小説</option>
          <option value="study">学習</option>
          <option value="comic">漫画</option>
        </select>
      </div>

      {/* 一覧 */}
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
