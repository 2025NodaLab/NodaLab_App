import { Link } from "react-router-dom";

export default function AdminHome() {
  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1  style={{ fontFamily: "Zen Maru Gothic", fontWeight: 550,marginBottom: "20px" }}>先生専用ページ</h1>
      <p style={{ marginBottom: "30px", opacity: 0.8 }}>
        操作を選んでください。
      </p>

      {/* 丸ボタン3つを横並びに */}
      <div
        style={{
          display: "flex",
          gap: "60px",
          justifyContent: "center",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        {/* 書籍追加 */}
        <Link
          to="/admin/new-book"
          style={circleButtonStyle("#fbd49b")}
        >
          <span style={japaneseTitle}>書籍追加</span>
          <span style={englishLabel}>Add</span>
        </Link>

        {/* 書籍削除 */}
        <Link
          to="/admin/delete-book"
          style={circleButtonStyle("#ffb097")}
        >
          <span style={japaneseTitle}>書籍削除</span>
          <span style={englishLabel}>Delete</span>
        </Link>

        {/* 貸出状況を見る */}
        <Link
          to="/admin/borrow-status"
          style={circleButtonStyle("#9ad0ec")}
        >
          <span style={japaneseTitle}>貸出状況</span>
          <span style={englishLabel}>Status</span>
        </Link>

        {/* 生徒アカウント管理 */}
        <Link
          to="/admin/students"
          style={circleButtonStyle("#b7e4c7")}
        >
          <span style={japaneseTitle}>生徒管理</span>
          <span style={englishLabel}>Users</span>
        </Link>
      </div>
    </div>
  );
}

const circleButtonStyle = (bg) => ({
  width: "160px",
  height: "160px",
  borderRadius: "50%",
  background: bg,
  color: "#333",
  textDecoration: "none",
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
  transition: "transform 0.15s",
});

const japaneseTitle = {
  fontSize: "22px",
  fontFamily: '"Kiwi Maru", sans-serif',
  zIndex: 2,
  transform: "translateY(-8px)",
};

const englishLabel = {
  position: "absolute",
  bottom: "15px",
  left: "5px",
  fontSize: "30px",
  fontFamily: '"Playwrite US Trad", cursive',
  color: "white",
  opacity: 0.9,
  pointerEvents: "none",
};
