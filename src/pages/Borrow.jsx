// src/pages/Borrow.jsx
import { useEffect, useMemo, useState } from "react";
// import { setupDevUser } from "../utils/devUser";
import { api } from "../supabaseClient";

export default function Borrow() {
  // setupDevUser();

  const [keyword, setKeyword] = useState("");
  const [genre, setGenre] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [books, setBooks] = useState([]);

  const [borrowLimit, setBorrowLimit] = useState(10);
  const [activeCount, setActiveCount] = useState(0);
  const [limitLoading, setLimitLoading] = useState(true);

  // ★ 学籍番号は数値で扱う
  const userId = Number(localStorage.getItem("userId"));

  // ▼ 初回ロード：settings + 現在の貸出数 + 本一覧を取得
  useEffect(() => {
    const load = async () => {
      setLimitLoading(true);

      // settings（上限）
      const settings = await api.getSettings();
      const limit = Number(settings?.borrow_limit_current ?? 10);
      setBorrowLimit(limit);

      // 現在の未返却数
      if (Number.isFinite(userId) && userId > 0) {
        const cnt = await api.countActiveBorrows(userId);
        setActiveCount(cnt);
      }

      // 本一覧（貸出中は除外）
      const data = await api.getBooksWithRentInfo();
      setBooks(data.filter((b) => !b.isBorrowed));

      setLimitLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ▼ 検索
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchKeyword = book.title.includes(keyword);
      const matchGenre = genre === "" || book.genre === genre;
      return matchKeyword && matchGenre;
    });
  }, [books, keyword, genre]);

  // ★ 上限到達判定
  const isLimitReached = !limitLoading && activeCount >= borrowLimit;

  const handleBorrowClick = (book) => {
    if (limitLoading) return;

    if (!Number.isFinite(userId) || userId <= 0) {
      alert("学籍番号が取得できません。ログインし直してください。");
      return;
    }

    if (activeCount >= borrowLimit) {
      alert(`同時貸出上限（${borrowLimit}冊）に達しています。返却してから借りてください。`);
      return;
    }

    setSelectedBook(book);
    setShowModal(true);
  };

  // ▼ 貸出処理
  const confirmBorrow = async () => {
    if (!selectedBook) return;

    if (!Number.isFinite(userId) || userId <= 0) {
      alert("学籍番号が取得できません。ログインし直してください。");
      return;
    }

    // rent 追加
    const ok = await api.borrowBook(selectedBook.id, userId);
    if (!ok) return;

    // ★ 借りたら現在数を再計算して即反映
    const cnt = await api.countActiveBorrows(userId);
    setActiveCount(cnt);

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

      {/* ★ 同時貸出状況 */}
      <p style={{ marginTop: "6px", opacity: 0.75 }}>
        同時貸出：{limitLoading ? "確認中…" : `${activeCount} / ${borrowLimit}冊`}
      </p>

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
          <option value="雑誌">雑誌</option>
          <option value="参考書">参考書</option>
          <option value="その他">その他</option>
        </select>
      </div>

      {/* 検索結果 */}
      <div style={{ marginTop: "30px" }}>
        <h2 style={{ fontFamily: "Zen Maru Gothic", fontWeight: 450 }}>
          検索結果
        </h2>

        <ul style={{ marginTop: "10px", listStyle: "none", padding: 0 }}>
          {filteredBooks.map((book) => {
            const disabled = limitLoading || isLimitReached;

            return (
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
                  disabled={disabled}
                  style={{
                    padding: "5px 12px",
                    background: disabled ? "#999" : "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.6 : 1,
                  }}
                  title={
                    disabled && !limitLoading
                      ? `同時貸出上限（${borrowLimit}冊）に達しています`
                      : ""
                  }
                >
                  借りる
                </button>
              </li>
            );
          })}

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
