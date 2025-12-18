// src/pages/NewBook.jsx
import { useState } from "react";

export default function NewBook({ api }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [booknumber, setBookNumber] = useState("");
  const [genre, setGenre] = useState("");

  const handleSubmit = async () => {
    if (!title || !author || !booknumber || !genre) {
      alert("全部入力してね！");
      return;
    }

    const id = Number(booknumber);
    if (Number.isNaN(id)) {
      alert("書籍番号は数字で入力してね");
      return;
    }

    await api.addBook({
      id,
      title,
      author,
      genre,
    });

    alert("登録しました！");

    setTitle("");
    setAuthor("");
    setBookNumber("");
    setGenre("");
  };

  return (
    <div
      style={{ padding: "20px", display: "flex", justifyContent: "center" }}
    >
      <div style={{ width: "100%", maxWidth: "480px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "Zen Maru Gothic", fontWeight: 550 }}>
          新しい書籍を登録する
        </h1>

        <div
          style={{
            marginTop: "30px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            width: "100%",
          }}
        >
          <input
            type="text"
            placeholder="書籍名"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          />

          <input
            type="text"
            placeholder="著者名"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          />

          <input
            type="text"
            placeholder="書籍番号"
            value={booknumber}
            onChange={(e) => setBookNumber(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          />

          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          >
            <option value="">ジャンルを選択</option>
            <option value="Linux">Linux</option>
            <option value="自己啓発">自己啓発</option>
            <option value="生成AI">生成AI</option>
            <option value="Java">Java</option>
            <option value="ソフトウェアテスト">ソフトウェアテスト</option>
            <option value="その他">その他</option>
          </select>

          <button
            onClick={handleSubmit}
            style={{
              marginTop: "15px",
              padding: "12px",
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            登録する
          </button>
        </div>
      </div>
    </div>
  );
}
