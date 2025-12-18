import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [borrowedMap, setBorrowedMap] = useState({});

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
        bookid,
        userid,
        rentdate,
        returndate,
        member:userid(name)
      `)
      .order("rentdate", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    // 借りてるものだけ（returndate が null）
    const active = data.filter((r) => r.returndate === null);

    const map = {};
    active.forEach((r) => {
      map[r.bookid] = {
        borrower: r.userid,
        borrowerName: r.member?.name || "不明",
        dueDate: calcDueDate(r.rentdate),
      };
    });

    setBorrowedMap(map);
  };

  // 返却日計算（借りた日 +14日）
  const calcDueDate = (rentdate) => {
    const base = new Date(rentdate);
    base.setDate(base.getDate() + 14);
    return `${base.getFullYear()}/${String(base.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(base.getDate()).padStart(2, "0")}`;
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
                  貸出中（借りている人: {borrowed.borrowerName} ／ 返却日:{" "}
                  {borrowed.dueDate}）
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
