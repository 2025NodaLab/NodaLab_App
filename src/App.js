// src/App.js2026/1/09
// src/App.js
import { supabase } from "./supabaseClient";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import flowerImg from "./assets/flower.png";

import Home from "./pages/Home";
import BookList from "./pages/BookList";
import NewBook from "./pages/NewBook";
import Borrow from "./pages/Borrow";
import Return from "./pages/Return";
import AdminHome from "./pages/AdminHome";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import DeleteBook from "./pages/DeleteBook";
import ManageStudents from "./pages/ManageStudents";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Header from "./components/Header";

/**
 * settings テーブルは「基本1行」の想定（bool id で新規行を作らせない制約）
 * 取得できない場合はデフォルト値を使う
 */
async function getCurrentSettings() {
  const defaults = {
    loan_days_current: 14,
    borrow_limit_current: 3,
  };

  const { data, error } = await supabase
    .from("settings")
    .select("loan_days_current, borrow_limit_current")
    .limit(1);

  if (error) {
    console.error("settings 読み込みエラー:", error);
    return defaults;
  }

  const row = data?.[0];
  if (!row) return defaults;

  return {
    loan_days_current:
      typeof row.loan_days_current === "number"
        ? row.loan_days_current
        : defaults.loan_days_current,
    borrow_limit_current:
      typeof row.borrow_limit_current === "number"
        ? row.borrow_limit_current
        : defaults.borrow_limit_current,
  };
}

// ★ book 一覧 + 未返却 rent + 借り手の名前 + 返却期限（due_date）をマージ
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

  // 未返却の貸出のみ（return_date が null）
  const { data: rents, error: rentError } = await supabase
    .from("rent")
    .select("*")
    .is("return_date", null);

  if (rentError) {
    console.error("rent 読み込みエラー:", rentError);
    throw rentError;
  }

  // 借りている人のIDを集め、member から名前を取る
  const memberIds = [...new Set((rents || []).map((r) => r.member_id))];
  let membersById = {};

  if (memberIds.length > 0) {
    const { data: members, error: memberError } = await supabase
      .from("member")
      .select("id, name, role, is_active")
      .in("id", memberIds);

    if (memberError) {
      console.error("member 読み込みエラー:", memberError);
      throw memberError;
    }

    membersById = Object.fromEntries((members || []).map((m) => [m.id, m]));
  }

  // 本に貸出情報をマージ
  return (books || []).map((book) => {
    const rent = (rents || []).find((r) => r.book_id === book.id) || null;

    let borrowerName = null;
    let dueDate = null;

    if (rent) {
      const member = membersById[rent.member_id];
      borrowerName = member ? member.name : null;

      if (rent.due_date) {
        const d = new Date(rent.due_date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        dueDate = `${yyyy}/${mm}/${dd}`;
      }
    }

    return {
      ...book,
      currentRent: rent, // 未返却 rent があれば入る
      borrowerName,
      dueDate,
    };
  });
}

// ★ book 追加（schema: id, title, author, genre）
async function addBook({ id, title, author, genre }) {
  const bookId = Number(id);
  if (Number.isNaN(bookId)) {
    throw new Error("書籍番号（id）が不正です");
  }

  const { error } = await supabase.from("book").insert({
    id: bookId,
    title,
    author: author || null, // author は空なら null
    genre,
  });

  if (error) {
    console.error("addBook エラー:", error);
    throw new Error(error.message || "書籍追加に失敗しました");
  }
}

// ★ book 削除（FKがある想定なので rent → book の順で削除）
async function deleteBook(id) {
  const bookId = Number(id);
  if (Number.isNaN(bookId)) {
    throw new Error("削除対象の書籍IDが不正です");
  }

  // 先に rent を消す
  const { error: rentError } = await supabase
    .from("rent")
    .delete()
    .eq("book_id", bookId);

  if (rentError) {
    console.error("rent 削除エラー:", rentError);
    throw new Error(rentError.message || "貸出データの削除に失敗しました");
  }

  // book を消す
  const { error: bookError } = await supabase.from("book").delete().eq("id", bookId);

  if (bookError) {
    console.error("book 削除エラー:", bookError);
    throw new Error(bookError.message || "書籍削除に失敗しました");
  }
}

// ★ 貸出（schema: rent.member_id, book_id, rent_date, due_date, return_date）
async function borrowBook(bookId, userId) {
  const bId = Number(bookId);
  const mId = Number(userId);

  if (Number.isNaN(bId) || Number.isNaN(mId)) {
    throw new Error("貸出パラメータが不正です");
  }

  const settings = await getCurrentSettings();

  // 同じ本が既に貸出中でないか確認（未返却があるなら貸出不可）
  const { data: existingActive, error: existingError } = await supabase
    .from("rent")
    .select("id")
    .eq("book_id", bId)
    .is("return_date", null)
    .limit(1);

  if (existingError) {
    console.error("borrow 既存貸出チェックエラー:", existingError);
    throw new Error(existingError.message || "貸出チェックに失敗しました");
  }

  if (existingActive && existingActive.length > 0) {
    throw new Error("この本はすでに貸出中です");
  }

  // 同時貸出上限チェック（未返却件数）
  const { count, error: countError } = await supabase
    .from("rent")
    .select("id", { count: "exact", head: true })
    .eq("member_id", mId)
    .is("return_date", null);

  if (countError) {
    console.error("borrow 上限チェックエラー:", countError);
    throw new Error(countError.message || "貸出上限チェックに失敗しました");
  }

  const activeCount = typeof count === "number" ? count : 0;
  if (activeCount >= settings.borrow_limit_current) {
    throw new Error(`同時貸出は最大 ${settings.borrow_limit_current} 冊までです`);
  }

  const now = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString();
  const due = new Date(now);
  due.setDate(due.getDate() + settings.loan_days_current);

  const { error } = await supabase.from("rent").insert({
    book_id: bId,
    member_id: mId,
    rent_date: now.toISOString(),
    due_date: due.toISOString(),
    return_date: null,
  });

  if (error) {
    console.error("borrow rent 追加エラー:", error);
    throw new Error(error.message || "貸出に失敗しました");
  }
}

// ★ 返却（未返却 rent を探して return_date を埋める）
async function returnBook(bookId, userId) {
  const bId = Number(bookId);
  const mId = Number(userId);

  if (Number.isNaN(bId) || Number.isNaN(mId)) {
    throw new Error("返却パラメータが不正です");
  }

  // 未返却の貸出を1件取得（最新）
  const { data: rents, error: selectError } = await supabase
    .from("rent")
    .select("*")
    .eq("book_id", bId)
    .eq("member_id", mId)
    .is("return_date", null)
    .order("rent_date", { ascending: false })
    .limit(1);

  if (selectError) {
    console.error("return select エラー:", selectError);
    throw new Error(selectError.message || "返却対象の取得に失敗しました");
  }

  const target = rents?.[0];
  if (!target) {
    // 返却対象なし（すでに返却済み等）
    return;
  }

  const now = new Date().toISOString();

  // 主キー id で更新
  const { error: updateError } = await supabase
    .from("rent")
    .update({ return_date: now })
    .eq("id", target.id);

  if (updateError) {
    console.error("return rent 更新エラー:", updateError);
    throw new Error(updateError.message || "返却に失敗しました");
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
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

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

          <Route
            path="/admin/students"
            element={
              <AdminRoute>
                <ManageStudents />
              </AdminRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
