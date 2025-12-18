// src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import flowerImg from "./assets/flower.png";

import Home from "./pages/Home";
import BookList from "./pages/BookList";
import NewBook from "./pages/NewBook";
import Borrow from "./pages/Borrow";
import Return from "./pages/Return";
import AdminHome from "./pages/AdminHome";
import Login from "./pages/Login";
import DeleteBook from "./pages/DeleteBook";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Header from "./components/Header";

// ★ Supabase クライアント
const SUPABASE_URL = "https://uuqylozpigroitzafyqf.supabase.co";
const SUPABASE_ANON_KEY =
  "sb_publishable_WIUHaQ9CxUissF-bgB-B6A_u3LHdGho";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ★ 共通 API 関数たち
async function getBooksWithRentInfo() {
  // book 一覧
  const { data: books, error: bookError } = await supabase
    .from("book")
    .select("*")
    .order("id", { ascending: true });

  if (bookError) {
    console.error("book 読み込みエラー:", bookError);
    throw bookError;
  }

  // まだ返却されていない貸出
  const { data: rents, error: rentError } = await supabase
    .from("rent")
    .select("*")
    .is("returndate", null);

  if (rentError) {
    console.error("rent 読み込みエラー:", rentError);
    throw rentError;
  }

  // 借りている人の ID を集めて member から名前を取る
  const userIds = [...new Set(rents.map((r) => r.userid))];
  let membersById = {};

  if (userIds.length > 0) {
    const { data: members, error: memberError } = await supabase
      .from("member")
      .select("*")
      .in("id", userIds);

    if (memberError) {
      console.error("member 読み込みエラー:", memberError);
      throw memberError;
    }

    membersById = Object.fromEntries(
      members.map((m) => [m.id, m])
    );
  }

  // 本に貸出情報をマージ
  return books.map((book) => {
    const rent = rents.find((r) => r.bookid === book.id) || null;

    let borrowerName = null;
    let dueDate = null;

    if (rent) {
      const member = membersById[rent.userid];
      borrowerName = member ? member.name : null;

      if (rent.rentdate) {
        const rentDate = new Date(rent.rentdate);
        const due = new Date(rentDate);
        due.setDate(rentDate.getDate() + 14); // 14日後

        const yyyy = due.getFullYear();
        const mm = String(due.getMonth() + 1).padStart(2, "0");
        const dd = String(due.getDate()).padStart(2, "0");
        dueDate = `${yyyy}/${mm}/${dd}`;
      }
    }

    return {
      ...book,
      currentRent: rent,
      borrowerName,
      dueDate,
    };
  });
}

async function addBook({ id, title, author, genre }) {
  const { error } = await supabase.from("book").insert({
    id,
    title,
    author,
    genre,
    state: 0, // 在庫あり
  });

  if (error) {
    console.error("addBook エラー:", error);
    throw error;
  }
}

async function deleteBook(id) {
  // まず rent の関連レコードを消す（FK制約対策）
  const { error: rentError } = await supabase
    .from("rent")
    .delete()
    .eq("bookid", id);

  if (rentError) {
    console.error("rent 削除エラー:", rentError);
    throw rentError;
  }

  const { error: bookError } = await supabase
    .from("book")
    .delete()
    .eq("id", id);

  if (bookError) {
    console.error("book 削除エラー:", bookError);
    throw bookError;
  }
}

async function borrowBook(bookId, userId) {
  const now = new Date().toISOString();

  // rent に1件追加
  const { error: rentError } = await supabase.from("rent").insert({
    bookid: bookId,
    userid: Number(userId),
    rentdate: now,
    returndate: null,
  });

  if (rentError) {
    console.error("borrow rent 追加エラー:", rentError);
    throw rentError;
  }

  // book.state を 1 = 貸出中 に更新
  const { error: bookError } = await supabase
    .from("book")
    .update({ state: 1 })
    .eq("id", bookId);

  if (bookError) {
    console.error("borrow book 更新エラー:", bookError);
    throw bookError;
  }
}

async function returnBook(bookId, userId) {
  // 未返却レコードを1件取得
  const { data: rents, error: selectError } = await supabase
    .from("rent")
    .select("*")
    .eq("bookid", bookId)
    .eq("userid", Number(userId))
    .is("returndate", null)
    .order("rentdate", { ascending: false })
    .limit(1);

  if (selectError) {
    console.error("return select エラー:", selectError);
    throw selectError;
  }

  const target = rents && rents[0];
  if (!target) {
    console.warn("未返却の貸出が見つかりませんでした");
    return;
  }

  const now = new Date().toISOString();

  // returndate を更新
  const { error: updateError } = await supabase
    .from("rent")
    .update({ returndate: now })
    .eq("bookid", target.bookid)
    .eq("rentdate", target.rentdate);

  if (updateError) {
    console.error("return rent 更新エラー:", updateError);
    throw updateError;
  }

  // book.state を 0 = 在庫あり に戻す
  const { error: bookError } = await supabase
    .from("book")
    .update({ state: 0 })
    .eq("id", bookId);

  if (bookError) {
    console.error("return book 更新エラー:", bookError);
    throw bookError;
  }
}

function App() {
  // ページに渡す共通 API
  const api = {
    getBooksWithRentInfo,
    addBook,
    deleteBook,
    borrowBook,
    returnBook,
  };

  return (
    <BrowserRouter>
      <Header />

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "20px",
          position: "relative",
        }}
      >
        <img
          src={flowerImg}
          alt="flower"
          style={{
            position: "fixed",
            right: "10px",
            bottom: "10px",
            width: "230px",
            opacity: 0.6,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home api={api} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/books"
            element={
              <ProtectedRoute>
                <BookList api={api} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/new-book"
            element={
              <AdminRoute>
                <NewBook api={api} />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/delete-book"
            element={
              <AdminRoute>
                <DeleteBook api={api} />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/borrow-status"
            element={
              <AdminRoute>
                <BookList api={api} />
              </AdminRoute>
            }
          />

          <Route
            path="/borrow"
            element={
              <ProtectedRoute>
                <Borrow api={api} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/return"
            element={
              <ProtectedRoute>
                <Return api={api} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminHome api={api} />
              </AdminRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
