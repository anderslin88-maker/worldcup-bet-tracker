 "use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

const initialForm = {
  bet_date: new Date().toISOString().slice(0, 10),
  match_name: "",
  bet_type: "獨贏",
  selection: "",
  odds: "",
  stake: "",
  result: "pending",
  note: "",
};

function resultText(result) {
  return {
    pending: "未結算",
    win: "贏",
    lose: "輸",
    push: "走水",
  }[result] || result;
}

function calcPL(bet) {
  const stake = Number(bet.stake || 0);
  const odds = Number(bet.odds || 0);

  if (bet.result === "win") {
    return Math.round((stake * odds - stake) * 100) / 100;
  }
  if (bet.result === "lose") return -stake;
  if (bet.result === "push") return 0;
  return 0;
}

export default function Tracker() {
  const [bets, setBets] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadBets() {
    if (!supabase) {
      setError("尚未設定 Supabase 環境變數。請在 Vercel 加入 NEXT_PUBLIC_SUPABASE_URL 與 NEXT_PUBLIC_SUPABASE_ANON_KEY。");
      return;
    }

    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("bets")
      .select("*")
      .order("bet_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setBets(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadBets();
  }, []);

  const stats = useMemo(() => {
    const settled = bets.filter((b) => b.result !== "pending");
    const totalStake = settled.reduce((sum, b) => sum + Number(b.stake || 0), 0);
    const totalPL = settled.reduce((sum, b) => sum + calcPL(b), 0);
    const wins = settled.filter((b) => b.result === "win").length;
    const winRate = settled.length ? (wins / settled.length) * 100 : 0;
    const roi = totalStake ? (totalPL / totalStake) * 100 : 0;

    return { totalStake, totalPL, winRate, roi };
  }, [bets]);

  async function addBet(e) {
    e.preventDefault();
    if (!supabase) return;

    setLoading(true);
    setError("");

    const payload = {
      ...form,
      odds: Number(form.odds),
      stake: Number(form.stake),
    };

    const { error } = await supabase.from("bets").insert(payload);

    if (error) {
      setError(error.message);
    } else {
      setForm(initialForm);
      await loadBets();
    }

    setLoading(false);
  }

  async function updateResult(id, result) {
    if (!supabase) return;

    const { error } = await supabase
      .from("bets")
      .update({ result })
      .eq("id", id);

    if (error) {
      setError(error.message);
    } else {
      await loadBets();
    }
  }

  async function deleteBet(id) {
    if (!supabase) return;
    if (!confirm("確定刪除這筆投注？")) return;

    const { error } = await supabase.from("bets").delete().eq("id", id);

    if (error) {
      setError(error.message);
    } else {
      await loadBets();
    }
  }

  function exportCSV() {
    const header = ["日期", "比賽", "玩法", "投注內容", "賠率", "注碼", "結果", "損益", "備註"];
    const rows = bets.map((b) => [
      b.bet_date,
      b.match_name,
      b.bet_type,
      b.selection,
      b.odds,
      b.stake,
      resultText(b.result),
      calcPL(b),
      b.note || "",
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "world-cup-bets.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <header>
        <h1>世界盃投注紀錄 Dashboard</h1>
      </header>

      <main>
        <div className="cards">
          <div className="card">
            <div className="label">總下注金額</div>
            <div className="value">{stats.totalStake.toLocaleString()}</div>
          </div>
          <div className="card">
            <div className="label">總損益</div>
            <div className={`value ${stats.totalPL >= 0 ? "profit" : "loss"}`}>
              {stats.totalPL.toLocaleString()}
            </div>
          </div>
          <div className="card">
            <div className="label">ROI</div>
            <div className={`value ${stats.roi >= 0 ? "profit" : "loss"}`}>
              {stats.roi.toFixed(2)}%
            </div>
          </div>
          <div className="card">
            <div className="label">勝率</div>
            <div className="value">{stats.winRate.toFixed(2)}%</div>
          </div>
        </div>

        <section className="panel">
          <h2>新增投注</h2>
          <form className="form-grid" onSubmit={addBet}>
            <div>
              <label>日期</label>
              <input
                type="date"
                value={form.bet_date}
                onChange={(e) => setForm({ ...form, bet_date: e.target.value })}
                required
              />
            </div>
            <div>
              <label>比賽</label>
              <input
                value={form.match_name}
                onChange={(e) => setForm({ ...form, match_name: e.target.value })}
                placeholder="例：西班牙 vs 烏拉圭"
                required
              />
            </div>
            <div>
              <label>玩法</label>
              <select
                value={form.bet_type}
                onChange={(e) => setForm({ ...form, bet_type: e.target.value })}
              >
                <option>獨贏</option>
                <option>讓分</option>
                <option>大小分</option>
                <option>波膽</option>
                <option>串關</option>
                <option>走地</option>
              </select>
            </div>
            <div>
              <label>投注內容</label>
              <input
                value={form.selection}
                onChange={(e) => setForm({ ...form, selection: e.target.value })}
                placeholder="例：大 2.5 / 主 -0.5"
                required
              />
            </div>
            <div>
              <label>賠率</label>
              <input
                type="number"
                step="0.01"
                value={form.odds}
                onChange={(e) => setForm({ ...form, odds: e.target.value })}
                placeholder="1.85"
                required
              />
            </div>
            <div>
              <label>注碼</label>
              <input
                type="number"
                step="1"
                value={form.stake}
                onChange={(e) => setForm({ ...form, stake: e.target.value })}
                placeholder="1000"
                required
              />
            </div>
            <div>
              <label>結果</label>
              <select
                value={form.result}
                onChange={(e) => setForm({ ...form, result: e.target.value })}
              >
                <option value="pending">未結算</option>
                <option value="win">贏</option>
                <option value="lose">輸</option>
                <option value="push">走水</option>
              </select>
            </div>
            <div>
              <label>備註</label>
              <input
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="可不填"
              />
            </div>
            <button disabled={loading} type="submit">
              {loading ? "處理中..." : "新增"}
            </button>
          </form>
          <p className="note">
            損益公式：贏 = 注碼 × 賠率 - 注碼；輸 = -注碼；走水 = 0。未結算不計入總損益。
          </p>
          {error && <p className="error">{error}</p>}
        </section>

        <section className="panel">
          <div className="actions">
            <button className="secondary" onClick={loadBets} disabled={loading}>
              重新整理
            </button>
            <button className="secondary" onClick={exportCSV}>
              匯出 CSV
            </button>
          </div>
        </section>

        <section className="panel">
          <h2>投注紀錄</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>日期</th>
                  <th>比賽</th>
                  <th>玩法</th>
                  <th>投注內容</th>
                  <th>賠率</th>
                  <th>注碼</th>
                  <th>結果</th>
                  <th>損益</th>
                  <th>備註</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {bets.map((bet) => {
                  const pl = calcPL(bet);
                  return (
                    <tr key={bet.id}>
                      <td>{bet.bet_date}</td>
                      <td>{bet.match_name}</td>
                      <td>{bet.bet_type}</td>
                      <td>{bet.selection}</td>
                      <td>{Number(bet.odds).toFixed(2)}</td>
                      <td>{Number(bet.stake).toLocaleString()}</td>
                      <td>
                        <select
                          value={bet.result}
                          onChange={(e) => updateResult(bet.id, e.target.value)}
                        >
                          <option value="pending">未結算</option>
                          <option value="win">贏</option>
                          <option value="lose">輸</option>
                          <option value="push">走水</option>
                        </select>
                      </td>
                      <td className={pl >= 0 ? "profit" : "loss"}>{pl.toLocaleString()}</td>
                      <td>{bet.note}</td>
                      <td>
                        <button className="danger" onClick={() => deleteBet(bet.id)}>
                          刪除
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {bets.length === 0 && (
                  <tr>
                    <td colSpan="10" className="note">
                      尚無投注紀錄
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
