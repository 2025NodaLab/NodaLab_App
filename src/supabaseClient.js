import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://uuqylozpigroitzafyqf.supabase.co",
  "sb_publishable_WIUHaQ9CxUissF-bgB-B6A_u3LHdGho"
);

export const api = {
  // ---------------------------------------------------------
  // 書籍一覧 + 貸出状態を rent テーブルから判断
  // ---------------------------------------------------------
  async getBooksWithRentInfo() {
    // book 全部取得
    const { data: books, error: bookErr } = await supabase
      .from("book")
      .select("*");

    if (bookErr) {
      console.error("getBooksWithRentInfo error:", bookErr);
      return [];
    }

    // rent の最新状態も取得
    const { data: rents, error: rentErr } = await supabase
      .from("rent")
      .select("*");

    if (rentErr) {
      console.error("rent fetch error:", rentErr);
      return books.map((b) => ({ ...b, isBorrowed: false }));
    }

    // 各本が借りられているか判断
    const isBorrowedMap = {};
    rents.forEach((r) => {
      if (!r.returndate) {
        // returndate が NULL → 貸出中
        isBorrowedMap[r.bookid] = true;
      }
    });

    return books.map((b) => ({
      ...b,
      isBorrowed: !!isBorrowedMap[b.id],
    }));
  },

  // ---------------------------------------------------------
  // 本を借りる → rent に 返却日なしで追加
  // ---------------------------------------------------------
  async borrowBook(bookId, userId) {
    const today = new Date().toISOString();

    const { error } = await supabase.from("rent").insert({
      bookid: bookId,
      userid: userId,
      rentdate: today,
      returndate: null, // 貸出中を示す
    });

    if (error) {
      console.error("borrowBook error:", error);
    }
  },

  // ---------------------------------------------------------
  // 本を返す → rent テーブルの returndate を更新
  // ---------------------------------------------------------
  async returnBook(rentId) {
    const returndate = new Date().toISOString();

    const { error } = await supabase
      .from("rent")
      .update({ returndate })
      .eq("id", rentId);

    if (error) {
      console.error("returnBook error:", error);
    }
  },

  // ---------------------------------------------------------
  // 自分が借りている本一覧を取得
  // ---------------------------------------------------------
  async getBorrowedBooks(userId) {
    const { data, error } = await supabase
      .from("rent")
      .select("id, bookid, rentdate, book(title)")
      .eq("userid", userId)
      .is("returndate", null); // 返却してないものだけ

    if (error) {
      console.error("getBorrowedBooks error:", error);
      return [];
    }

    return data.map((r) => ({
      rentId: r.id,
      id: r.bookid,
      title: r.book.title,
      rentdate: r.rentdate,
    }));
  },
};
