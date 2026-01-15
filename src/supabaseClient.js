import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export const api = {
  // ---------------------------------------------------------
  // settings: 現在の貸出期間（日）と同時貸出上限を取得
  // ※ settings が1行テーブル前提
  // ---------------------------------------------------------
  async getSettings() {
    const { data, error } = await supabase.from("settings").select("*").maybeSingle();
    if (error) {
      console.error("getSettings error:", error);
      return { loan_days_current: 14, borrow_limit_current: 3 }; // フォールバック
    }
    return data ?? { loan_days_current: 14, borrow_limit_current: 3 };
  },

  // ---------------------------------------------------------
  // 書籍一覧 + 貸出状態を rent テーブルから判断
  // ---------------------------------------------------------
  async getBooksWithRentInfo() {
    const { data: books, error: bookErr } = await supabase.from("book").select("*");
    if (bookErr) {
      console.error("getBooksWithRentInfo(book) error:", bookErr);
      return [];
    }

    const { data: rents, error: rentErr } = await supabase
      .from("rent")
      .select("book_id, return_date");

    if (rentErr) {
      console.error("getBooksWithRentInfo(rent) error:", rentErr);
      return books.map((b) => ({ ...b, isBorrowed: false }));
    }

    const borrowedSet = new Set();
    rents.forEach((r) => {
      if (r.return_date == null) borrowedSet.add(r.book_id);
    });

    return books.map((b) => ({
      ...b,
      isBorrowed: borrowedSet.has(b.id),
    }));
  },

  // ---------------------------------------------------------
  // 本を借りる → rent に追加（idは送らない：IDENTITYで自動採番）
  // ---------------------------------------------------------
  async borrowBook(bookId, userId) {
  const now = new Date();
  const rent_date = now.toISOString();
  
  const settings = await this.getSettings();
  const loanDays = Number(settings.loan_days_current ?? 14);

  const due = new Date(now);
  due.setDate(due.getDate() + loanDays);
  const due_date = due.toISOString();

  const { data: u, error: uErr } = await supabase.auth.getUser();
  console.log("auth user id:", u?.user?.id, "err:", uErr);

  const { data: cm, error: cmErr } = await supabase.rpc("current_member_id");
  console.log("current_member_id():", cm, "err:", cmErr);

  console.log("member_id to insert (userId):", userId, "bookId:", bookId);
  const { error } = await supabase.from("rent").insert({
    book_id: Number(bookId),
    member_id: Number(userId),
    rent_date,
    due_date,
    return_date: null,
  });

  if (error) {

    alert(`borrowBook failed: ${error.message}`);
    console.error("borrowBook error:", error);
    return false;
  }
  return true;
},


  // ---------------------------------------------------------
  // 本を返す → rent.return_date を更新
  // ---------------------------------------------------------
  async returnBook(rentId) {
    const return_date = new Date().toISOString();

    const { error } = await supabase
      .from("rent")
      .update({ return_date })
      .eq("id", rentId);

    if (error) {
      console.error("returnBook error:", error);
    }
  },
  // ---------------------------------------------------------
  // 自分が借りている本一覧を取得（未返却だけ）
  // ---------------------------------------------------------
  async getBorrowedBooks(userId) {
    const { data, error } = await supabase
      .from("rent")
      .select("id, book_id, rent_date, due_date, return_date, book(title)")
      .eq("member_id", Number(userId))
      .is("return_date", null);

    if (error) {
      alert(`getBorrowedBooks failed: ${error.message}`);
      console.error("getBorrowedBooks error:", error);
      return [];
    }

    console.log("getBorrowedBooks raw:", data); // ★これも追加

    return (data ?? []).map((r) => ({
      rentId: r.id,
      id: r.book_id,
      title: r.book?.title ?? "(unknown)",
      rentdate: r.rent_date,
      due_date: r.due_date,
    }));
  },

  // ---------------------------------------------------------
  // 同時貸出数（未返却）を数える：上限チェック用
  // ---------------------------------------------------------
  async countActiveBorrows(userId) {
    const { count, error } = await supabase
      .from("rent")
      .select("*", { count: "exact", head: true })
      .eq("member_id", Number(userId))
      .is("return_date", null);

    if (error) {
      console.error("countActiveBorrows error:", error);
      return 0;
    }
    return count ?? 0;
  },
};
