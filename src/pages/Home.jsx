import { Link } from "react-router-dom";

export default function Home() {
  const role = localStorage.getItem("role");

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>Home</h1>
      <p style={{ marginBottom: "30px", opacity: 0.8 }}>
        操作を選んでください。
      </p>

      {/* 🔥 丸ボタン2つを横並びに */}
      <div
        style={{
          display: "flex",
          gap: "60px",
          justifyContent: "center",
          marginBottom: "30px"
        }}
      >
        {/* 借りる */}
        <Link
          to="/borrow"
          style={{
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            background: "#f2c3dfff",
            color: "#333",
            textDecoration: "none",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            transition: "transform 0.15s"
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {/* 日本語（中央） */}
          <span
            style={{
              fontSize: "22px",
              fontFamily: '"Kiwi Maru", sans-serif',
              zIndex: 2,
              transform: "translateY(-8px)"   
            }}
          >
            借りる
          </span>

          {/* 英語（左下） */}
          <span
            style={{
              position: "absolute",
              bottom: "15px",
              left: "10px",
              fontSize: "28px",
              fontFamily: '"Playwrite US Trad", cursive',
              color: "white",
              opacity: 0.9,
              pointerEvents: "none"
            }}
          >
            Borrow
          </span>
        </Link>

        {/* 返す */}
        <Link
          to="/return"
          style={{
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            background: "#c9dcf3ff",
            color: "#333",
            textDecoration: "none",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            transition: "transform 0.15s"
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {/* 日本語 */}
          <span
            style={{
              fontSize: "22px",
              fontFamily: '"Kiwi Maru", sans-serif',
              zIndex: 2,
              transform: "translateY(-8px)"
            }}
          >
            返却
          </span>

          {/* 英語 */}
          <span
            style={{
              position: "absolute",
              bottom: "15px",
              left: "10px",
              fontSize: "28px",
              fontFamily: '"Playwrite US Trad", cursive',
              color: "white",
              opacity: 0.9,
              pointerEvents: "none",
              transform: "scaleX(1.1)",
              transformOrigin: "left"
            }}
          >
            Return
          </span>
        </Link>
      </div>

    {/* 🔥 先生用ページ（丸ボタン） */}
        {role === "teacher" && (
        <Link
            to="/admin"
            style={{
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            background: "#f8d9abff",
            color: "#333",
            textDecoration: "none",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            transition: "transform 0.15s",
            marginTop: "25px"
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
            {/* 日本語（中央） */}
            <span
            style={{
                fontSize: "20px",
                fontFamily: '"Kiwi Maru", sans-serif',
                zIndex: 2,
                transform: "translateY(-8px)",
            }}
            >
            先生用ページ
            </span>

            {/* 英語アクセント（左下） */}
            <span
            style={{
                position: "absolute",
                bottom: "15px",
                left: "10px",
                fontSize: "30px",
                fontFamily: '"Playwrite US Trad", cursive',
                color: "white",
                opacity: 0.9,
                pointerEvents: "none",
            }}
            >
            Admin
            </span>
        </Link>
        )}

    </div>
  );
}
