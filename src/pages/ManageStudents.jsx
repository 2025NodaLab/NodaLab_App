import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

export default function ManageStudents() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");

  const loadMembers = async () => {
    setLoading(true);
    try {
      // 生徒（role=1）だけ取得
      const { data, error } = await supabase
        .from("member")
        .select("id, name, role, is_active")
        .eq("role", 1)
        .order("id", { ascending: true });

      if (error) {
        console.error(error);
        alert("生徒一覧の取得に失敗しました");
        return;
      }
      setMembers(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const filtered = useMemo(() => {
    const k = keyword.trim();
    if (!k) return members;
    return members.filter((m) => {
      return String(m.id).includes(k) || (m.name || "").includes(k);
    });
  }, [members, keyword]);

  const setActive = async (memberId, nextActive) => {
    const msg = nextActive === 0
      ? "この生徒アカウントを停止します。よろしいですか？"
      : "この生徒アカウントを再開します。よろしいですか？";

    if (!window.confirm(msg)) return;

    const { error } = await supabase
      .from("member")
      .update({ is_active: nextActive })
      .eq("id", memberId);

    if (error) {
      console.error(error);
      alert("更新に失敗しました");
      return;
    }

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, is_active: nextActive } : m))
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontFamily: "Zen Maru Gothic", fontWeight: 550 }}>
        生徒アカウント管理
      </h1>

      <div style={{ marginTop: "12px", display: "flex", gap: "10px", alignItems: "center" }}>
        <input
          type="text"
          placeholder="学籍番号 or 氏名で検索"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            width: "320px",
          }}
        />

        <button onClick={loadMembers} style={{ padding: "10px 14px" }}>
          再読み込み
        </button>
      </div>

      <div style={{ marginTop: "18px", opacity: 0.8 }}>
        {loading ? "読み込み中..." : `生徒: ${filtered.length} 件`}
      </div>

      <div style={{ marginTop: "18px", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: "10px" }}>学籍番号</th>
              <th style={{ padding: "10px" }}>氏名</th>
              <th style={{ padding: "10px" }}>状態</th>
              <th style={{ padding: "10px" }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => {
              const active = m.is_active === 1;
              return (
                <tr key={m.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "10px" }}>{m.id}</td>
                  <td style={{ padding: "10px" }}>{m.name}</td>
                  <td style={{ padding: "10px", color: active ? "green" : "red" }}>
                    {active ? "在籍" : "停止"}
                  </td>
                  <td style={{ padding: "10px" }}>
                    {active ? (
                      <button
                        onClick={() => setActive(m.id, 0)}
                        style={{
                          background: "#e74c3c",
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        停止
                      </button>
                    ) : (
                      <button
                        onClick={() => setActive(m.id, 1)}
                        style={{
                          background: "#2ecc71",
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        再開
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}

            {(!loading && filtered.length === 0) && (
              <tr>
                <td colSpan={4} style={{ padding: "16px", opacity: 0.7 }}>
                  該当する生徒がいません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: "16px", opacity: 0.8, fontSize: "13px" }}>
        ※ 停止したアカウントはログインできなくなります（member.is_active=0）。
      </p>
    </div>
  );
}
