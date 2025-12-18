import { books } from "../data/books";

export default function BookList() {
  const borrowedData = JSON.parse(localStorage.getItem("borrowedBooks") || "{}");

  const borrowedMap = {};
  for (const uid of Object.keys(borrowedData)) {
    borrowedData[uid].forEach((b) => {
      borrowedMap[b.id] = {
        borrower: b.borrower,
        borrowerName: b.borrowerName,
        dueDate: b.dueDate,
      };
    });
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontFamily: "Zen Maru Gothic", fontWeight: 550 }}>図書一覧（貸出状況）</h1>

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
                  貸出中（借りている人: {borrowed.borrowerName} ／ 返却日: {borrowed.dueDate}）
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
