import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Return() {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const userId = localStorage.getItem("userId");

  // --- 借りている本を取得 ---
  useEffect(() => {
    const fetchBorrowed = async () => {
      const { data, error } = await supabase
        .from("rent")
        .select(`
          bookid,
          rentdate,
          returndate,
          book:bookid (title)
        `)
        .eq("userid", userId)
        .is("returndate", null);

      if (error) {
        console.error(error);
        return;
      }

      setBorrowedBooks(data);
    };

    fetchBorrowed();
  }, [userId]);

  const handleReturnClick = (book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  const confirmReturn = async () => {
    if (!selectedBook) return;

    const { error } = await supabase
      .from("rent")
      .update({ returndate: new Date() })
      .eq("bookid", selectedBook.bookid)
      .eq("userid", userId)
      .is("returndate", null); // ← rentid 不要！

    if (error) {
      alert("返却処理でエラーが発生しました");
      console.error(error);
      return;
    }

    setShowModal(false);
    setSelectedBook(null);

    alert(`「${selectedBook.book.title}」を返却しました！`);

    // 再読み込み
    const refreshed = await supabase
      .from("rent")
      .select(`
        bookid,
        rentdate,
        returndate,
        book:bookid (title)
      `)
      .eq("userid", userId)
      .is("returndate", null);

    setBorrowedBooks(refreshed.data || []);
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
            key={item.bookid + item.rentdate}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 4px",
              borderBottom: "1px solid #eee",
            }}
          >
            <span>{item.book.title}</span>

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
            <p>本当に「{selectedBook?.book.title}」を返しますか？</p>

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
