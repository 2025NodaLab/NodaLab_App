import { useState } from "react";

export default function NewBook() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [booknumber, setBookNumber] = useState("");
  const [genre, setGenre] = useState("");

  const handleSubmit = () => {
    alert(`登録しました！\nタイトル: ${title}\n著者: ${author}\n書籍番号: ${booknumber}\nジャンル: ${genre}`);
    setTitle("");
    setAuthor("");
    setBookNumber("");
    setGenre("");
  };

  return (
    <div style={{ padding: "20px", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: "480px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "Zen Maru Gothic", fontWeight: 550 }}>
          新しい書籍を登録する
        </h1>

        {/* 入力フォーム */}
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
            type="int"
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
            <option value="novel">小説</option>
            <option value="study">学習</option>
            <option value="comic">漫画</option>
            <option value="others">その他</option>
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
