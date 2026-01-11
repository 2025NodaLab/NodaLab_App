import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

export default function ManageMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("member")
      .select("id, name, role, is_active")
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      alert("メンバー情報の取得に失敗しました");
      setLoading(false);
      return;
    }

    // 先生(=2)も表示したい場合はフィルタを外してください。
    setMembers((data || []).filter((m) => m.role === 1));
    setLoading(false);
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim();
    if (!q) return members;
    return members.filter(
      (m) =>
        String(m.id).includes(q) ||
        (m.name || "").toLowerCase().includes(q.toLowerCase())
    );
  }, [members, search]);

  const setActive = async (memberId, nextActive) => {
    const label = nextActive === 1 ? "復帰" : "停止";
    const ok = window.confirm(`この生徒アカウントを${label}しますか？`);
    if (!ok) return;

    const { error } = await supabase
      .from("member")
      .update({ is_active: nextActive })
      .eq("id", memberId);

    if (error) {
      console.error(error);
      alert("更新に失敗しました");
      return;
    }

    // ローカル反映
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, is_active: nextActive } : m))
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontFamily: "Zen Maru Gothic", fontWeight: 550 }}>
        生徒アカウント管理
      </h1>

      <p style={{ opacity: 0.8, marginTop: "8px" }}>
        停止にすると、その生徒はログインできません（is_active = 0）。
      </p>

      <div style={{ marginTop: "18px", display: "flex", gap: "10px" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="学籍番号 or 氏名で検索"
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            width: "320px",
          }}
        />

        <button
          onClick={loadMembers}
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          再読み込み
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        {loading ? (
          <p>読み込み中…</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
                <th style={{ padding: "10px 6px" }}>学籍番号</th>
                <th style={{ padding: "10px 6px" }}>氏名</th>
                <th style={{ padding: "10px 6px" }}>状態</th>
                <th style={{ padding: "10px 6px" }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const isActive = m.is_active === 1;
                return (
                  <tr key={m.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "10px 6px" }}>{m.id}</td>
                    <td style={{ padding: "10px 6px" }}>{m.name}</td>
                    <td style={{ padding: "10px 6px" }}>
                      <span style={{ color: isActive ? "green" : "red" }}>
                        {isActive ? "在籍" : "停止"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 6px" }}>
                      {isActive ? (
                        <button
                          onClick={() => setActive(m.id, 0)}
                          style={{
                            background: "#ff5c5c",
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
                            background: "#4caf50",
                            color: "white",
                            border: "none",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          復帰
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: "14px 6px", opacity: 0.7 }}>
                    該当する生徒がいません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
