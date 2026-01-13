import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [borrowedMap, setBorrowedMap] = useState({});
  const status = Number(localStorage.getItem("status")); // 先生=2

  // 本一覧取得
  const loadBooks = async () => {
    const { data, error } = await supabase.from("book").select("*");
    if (error) {
      console.error(error);
      return;
    }
    setBooks(data);
  };

  // 貸出状況取得
const loadBorrowInfo = async () => {
  const { data, error } = await supabase
    .from("rent")
    .select(`
      book_id,
      member_id,
      rent_date,
      due_date,
      return_date,
      member:member_id(name)
    `)
    .order("rent_date", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  // 借りてるものだけ（return_date が null）
  const active = data.filter((r) => r.return_date === null);

  const map = {};
  active.forEach((r) => {
    map[r.book_id] = {
      borrower: r.member_id,
      borrowerName: r.member?.name || "不明",
      dueDate: formatDate(r.due_date),
    };
  });

  setBorrowedMap(map);
};


  // 返却日計算
  const calcDueDate = (rentdate) => {
    const base = new Date(rentdate);
    base.setDate(base.getDate() + 14);
    return `${base.getFullYear()}/${String(base.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(base.getDate()).padStart(2, "0")}`;
  };
  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
      d.getDate()
    ).padStart(2, "0")}`;
  };
  useEffect(() => {
    loadBooks();
    loadBorrowInfo();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontFamily: "Zen Maru Gothic", fontWeight: 550 }}>
        図書一覧（貸出状況）
      </h1>

      <ul style={{ marginTop: "25px", listStyle: "none", padding: 0 }}>
        {books.map((book) => {
          const borrowed = borrowedMap[book.id];

          return (
            <li
              key={book.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "13px 4px",
                borderBottom: "1px solid #eee",
              }}
            >
              <span>{book.title}</span>

              {borrowed ? (
                <span style={{ color: "red" }}>
                  {status === 2 ? (
                    <>
                      貸出中（借りている人: {borrowed.borrowerName} ／ 返却日:{" "}
                      {borrowed.dueDate}）
                    </>
                  ) : (
                    <>貸出中</>
                  )}
                </span>
              ) : (
                <span style={{ color: "green" }}>在庫あり</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
