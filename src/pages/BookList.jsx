// src/pages/BookList.jsx
import { useEffect, useState } from "react";

export default function BookList({ api }) {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    api.getBooksWithRentInfo().then((data) => {
      setBooks(data);
    });
  }, [api]);

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontFamily: "Zen Maru Gothic", fontWeight: 550 }}>
        図書一覧（貸出状況）
      </h1>

      <ul style={{ marginTop: "25px", listStyle: "none", padding: 0 }}>
        {books.map((book) => (
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

            {book.state === 1 && book.borrowerName ? (
              <span style={{ color: "red" }}>
                貸出中（借りている人: {book.borrowerName} ／ 返却日:
                {book.dueDate || "不明"}）
              </span>
            ) : book.state === 1 ? (
              <span style={{ color: "red" }}>貸出中</span>
            ) : (
              <span style={{ color: "green" }}>在庫あり</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
