"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

const worldCupMatches = [
  "墨西哥 VS 南非",
  "南韓 VS 捷克",
  "加拿大 VS 波士尼亞",
  "美國 VS 巴拉圭",
  "卡達 VS 瑞士",
  "巴西 VS 摩洛哥",
  "海地 VS 蘇格蘭",
  "澳洲 VS 土耳其",
  "德國 VS 庫拉索",
  "荷蘭 VS 日本",
  "象牙海岸 VS 厄瓜多",
  "瑞典 VS 突尼西亞",
  "西班牙 VS 維德角",
  "比利時 VS 埃及",
  "沙烏地阿拉伯 VS 烏拉圭",
  "伊朗 VS 紐西蘭",
  "法國 VS 塞內加爾",
  "伊拉克 VS 挪威",
  "阿根廷 VS 阿爾及利亞",
  "奧地利 VS 約旦",
  "葡萄牙 VS 剛果民主共和國",
  "英格蘭 VS 克羅埃西亞",
  "迦納 VS 巴拿馬",
  "烏茲別克 VS 哥倫比亞",
  "捷克 VS 南非",
  "瑞士 VS 波士尼亞",
  "加拿大 VS 卡達",
  "墨西哥 VS 南韓",
  "美國 VS 澳洲",
  "蘇格蘭 VS 摩洛哥",
  "巴西 VS 海地",
  "土耳其 VS 巴拉圭",
  "荷蘭 VS 瑞典",
  "德國 VS 象牙海岸",
  "厄瓜多 VS 庫拉索",
  "突尼西亞 VS 日本",
  "西班牙 VS 沙烏地阿拉伯",
  "比利時 VS 伊朗",
  "烏拉圭 VS 維德角",
  "紐西蘭 VS 埃及",
  "阿根廷 VS 奧地利",
  "法國 VS 伊拉克",
  "挪威 VS 塞內加爾",
  "約旦 VS 阿爾及利亞",
  "葡萄牙 VS 烏茲別克",
  "英格蘭 VS 迦納",
  "巴拿馬 VS 克羅埃西亞",
  "哥倫比亞 VS 剛果民主共和國",
  "瑞士 VS 加拿大",
  "波士尼亞 VS 卡達",
  "蘇格蘭 VS 巴西",
  "摩洛哥 VS 海地",
  "捷克 VS 墨西哥",
  "南非 VS 南韓",
  "厄瓜多 VS 德國",
  "庫拉索 VS 象牙海岸",
  "突尼西亞 VS 荷蘭",
  "日本 VS 瑞典",
  "土耳其 VS 美國",
  "巴拉圭 VS 澳洲",
  "挪威 VS 法國",
  "塞內加爾 VS 伊拉克",
  "烏拉圭 VS 西班牙",
  "維德角 VS 沙烏地阿拉伯",
  "紐西蘭 VS 比利時",
  "埃及 VS 伊朗",
  "巴拿馬 VS 英格蘭",
  "克羅埃西亞 VS 迦納",
  "哥倫比亞 VS 葡萄牙",
  "剛果民主共和國 VS 烏茲別克",
  "約旦 VS 阿根廷",
  "阿爾及利亞 VS 奧地利",
];

const initialForm = {
  bet_date: new Date().toISOString().slice(0, 10),
  match_name: "",
  actual_score: "",
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

function formatDateShort(dateString) {
  if (!dateString) return "";
  const parts = String(dateString).split("-");
  if (parts.length >= 3) return `${Number(parts[1])}/${Number(parts[2])}`;
  return dateString;
}

function splitMatch(matchName) {
  if (!matchName) return ["", ""];
  const normalized = String(matchName)
    .replace(/\s+vs\s+/i, " VS ")
    .replace(/\s+VS\s+/g, " VS ");
  const parts = normalized.split(" VS ");
  if (parts.length >= 2) return [parts[0].trim(), parts.slice(1).join(" VS ").trim()];
  return [matchName, ""];
}

export default function Tracker() {
  const [bets, setBets] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [matchSearch, setMatchSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredMatches = useMemo(() => {
    const keyword = matchSearch.trim();
    if (!keyword) return [];
    return worldCupMatches.filter((match) => match.includes(keyword)).slice(0, 10);
  }, [matchSearch]);

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

    if (error) setError(error.message);
    else setBets(data || []);

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

    if (!form.match_name) {
      setError("請先從建議選項中選擇比賽。");
      return;
    }

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
      setMatchSearch("");
      setShowSuggestions(false);
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

    if (error) setError(error.message);
    else await loadBets();
  }

  async function updateScore(id, actual_score) {
    if (!supabase) return;

    const { error } = await supabase
      .from("bets")
      .update({ actual_score })
      .eq("id", id);

    if (error) setError(error.message);
    else await loadBets();
  }

  async function updateNote(id, note) {
    if (!supabase) return;

    const { error } = await supabase
      .from("bets")
      .update({ note })
      .eq("id", id);

    if (error) setError(error.message);
    else await loadBets();
  }

  async function deleteBet(id) {
    if (!supabase) return;
    if (!confirm("確定刪除這筆投注？")) return;

    const { error } = await supabase.from("bets").delete().eq("id", id);

    if (error) setError(error.message);
    else await loadBets();
  }

  function exportCSV() {
    const header = ["日期", "比賽", "實際比分", "玩法", "投注內容", "賠率", "注碼", "結果", "損益", "備註"];
    const rows = bets.map((b) => [
      b.bet_date,
      b.match_name,
      b.actual_score || "",
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
        <h1>神奇的慶2026世界盃戰績</h1>
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
          <form className="aligned-form" onSubmit={addBet}>
            <div className="form-head date-col">日期</div>
            <div className="form-head match-col">比賽搜尋</div>
            <div className="form-head score-col">實際比分</div>
            <div className="form-head type-col">玩法</div>
            <div className="form-head selection-col">投注內容</div>
            <div className="form-head odds-col">賠率</div>
            <div className="form-head stake-col">注碼</div>
            <div className="form-head result-col">結果</div>
            <div className="form-head note-col">備註</div>
            <div className="form-head action-col">操作</div>

            <div className="form-cell date-col">
              <input
                type="date"
                value={form.bet_date}
                onChange={(e) => setForm({ ...form, bet_date: e.target.value })}
                required
              />
            </div>

            <div className="form-cell match-col suggestion-wrap">
              <input
                value={matchSearch}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setMatchSearch(e.target.value);
                  setForm({ ...form, match_name: "" });
                  setShowSuggestions(true);
                }}
                placeholder="輸入隊名，例如：巴西"
                required
              />

              {showSuggestions && filteredMatches.length > 0 && (
                <div className="suggestions">
                  {filteredMatches.map((match) => (
                    <div
                      key={match}
                      onMouseDown={() => {
                        setForm({ ...form, match_name: match });
                        setMatchSearch(match);
                        setShowSuggestions(false);
                      }}
                      className="suggestion-item"
                    >
                      {match}
                    </div>
                  ))}
                </div>
              )}

              {matchSearch && showSuggestions && filteredMatches.length === 0 && (
                <div className="suggestions empty-suggestion">找不到符合的比賽</div>
              )}
            </div>

            <div className="form-cell score-col">
              <input
                value={form.actual_score}
                onChange={(e) => setForm({ ...form, actual_score: e.target.value })}
                placeholder="2-1"
                maxLength={6}
              />
            </div>

            <div className="form-cell type-col">
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

            <div className="form-cell selection-col">
              <input
                value={form.selection}
                onChange={(e) => setForm({ ...form, selection: e.target.value })}
                placeholder="例：大 2.5 / 主 -0.5"
                required
              />
            </div>

            <div className="form-cell odds-col">
              <input
                type="number"
                step="0.01"
                value={form.odds}
                onChange={(e) => setForm({ ...form, odds: e.target.value })}
                placeholder="1.85"
                required
              />
            </div>

            <div className="form-cell stake-col">
              <input
                type="number"
                step="1"
                value={form.stake}
                onChange={(e) => setForm({ ...form, stake: e.target.value })}
                placeholder="1000"
                required
              />
            </div>

            <div className="form-cell result-col">
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

            <div className="form-cell note-col">
              <input
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>

            <div className="form-cell action-col">
              <button disabled={loading} type="submit">
                {loading ? "處理中" : "新增"}
              </button>
            </div>
          </form>

          <p className="note">
            V6.2 更新：新增投注區與下方表格欄位對齊，投注紀錄比賽欄已移除「VS」。
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
            <table className="bet-table">
              <thead>
                <tr>
                  <th className="date-col">日期</th>
                  <th className="match-col">比賽</th>
                  <th className="score-col">實際比分</th>
                  <th className="type-col">玩法</th>
                  <th className="selection-col">投注內容</th>
                  <th className="odds-col">賠率</th>
                  <th className="stake-col">注碼</th>
                  <th className="result-col">結果</th>
                  <th className="pl-col">損益</th>
                  <th className="note-col">備註</th>
                  <th className="action-col">操作</th>
                </tr>
              </thead>
              <tbody>
                {bets.map((bet) => {
                  const pl = calcPL(bet);
                  const [homeTeam, awayTeam] = splitMatch(bet.match_name);
                  return (
                    <tr key={bet.id}>
                      <td className="date-cell">{formatDateShort(bet.bet_date)}</td>
                      <td className="match-cell">
                        <div className="team-line">{homeTeam}</div>
                        {awayTeam && <div className="team-line away-team">{awayTeam}</div>}
                      </td>
                      <td className="score-cell">
                        <input
                          className="table-input score-input"
                          defaultValue={bet.actual_score || ""}
                          maxLength={6}
                          onBlur={(e) => updateScore(bet.id, e.target.value)}
                        />
                      </td>
                      <td>{bet.bet_type}</td>
                      <td>{bet.selection}</td>
                      <td className="odds-cell">{Number(bet.odds).toFixed(2)}</td>
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
                      <td className={pl >= 0 ? "profit" : "loss"}>
                        {pl.toLocaleString()}
                      </td>
                      <td>
                        <input
                          className="table-input note-input"
                          defaultValue={bet.note || ""}
                          onBlur={(e) => updateNote(bet.id, e.target.value)}
                        />
                      </td>
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
                    <td colSpan="11" className="note">
                      尚無投注紀錄
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <style jsx>{`
            .aligned-form {
              display: grid;
              grid-template-columns: 90px 170px 95px 100px 160px 90px 95px 100px 150px 78px;
              column-gap: 14px;
              row-gap: 9px;
              align-items: end;
              overflow-x: auto;
              padding-bottom: 4px;
            }
            .form-head {
              font-size: 13px;
              font-weight: 700;
              color: #334155;
              white-space: nowrap;
            }
            .form-cell input,
            .form-cell select {
              width: 100%;
              min-width: 0;
              box-sizing: border-box;
            }
            .suggestion-wrap {
              position: relative;
            }
            .suggestions {
              position: absolute;
              top: 46px;
              left: 0;
              right: 0;
              background: white;
              border: 1px solid #d1d5db;
              border-radius: 10px;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
              z-index: 20;
              max-height: 260px;
              overflow-y: auto;
            }
            .suggestion-item {
              padding: 11px;
              cursor: pointer;
              border-bottom: 1px solid #f3f4f6;
              font-size: 14px;
            }
            .empty-suggestion {
              padding: 11px;
              color: #6b7280;
              font-size: 14px;
            }
            .bet-table {
              table-layout: fixed;
              width: 100%;
            }
            .date-col { width: 90px; }
            .match-col { width: 170px; }
            .score-col { width: 95px; }
            .type-col { width: 100px; }
            .selection-col { width: 160px; }
            .odds-col { width: 90px; white-space: nowrap; }
            .stake-col { width: 95px; }
            .result-col { width: 100px; }
            .pl-col { width: 90px; }
            .note-col { width: 150px; }
            .action-col { width: 78px; }
            .date-cell {
              white-space: nowrap;
              font-weight: 600;
            }
            .match-cell {
              line-height: 1.45;
              white-space: normal;
            }
            .team-line {
              display: block;
              font-weight: 600;
            }
            .away-team {
              color: #4b5563;
              font-weight: 600;
            }
            .score-input {
              width: 76px;
              min-width: 76px;
              max-width: 76px;
              text-align: center;
              padding-left: 6px;
              padding-right: 6px;
            }
            .note-input {
              width: 130px;
              min-width: 130px;
              max-width: 130px;
            }
            .odds-cell {
              white-space: nowrap;
              text-align: center;
            }
            .table-input {
              border: 1px solid #d1d5db;
              border-radius: 10px;
              padding: 8px 9px;
              font-size: 14px;
              background: white;
            }
            th { white-space: nowrap; }
          `}</style>
        </section>
      </main>
    </>
  );
}
