import { useMemo, useRef, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";

function getScore(row) {
  return row.score ?? (row.visuo_spatial_fit != null ? Math.round(row.visuo_spatial_fit * 1000) / 10 : null);
}

const TABS = [
  { key: "live", label: "Live Duel" },
  { key: "ranking", label: "Ranking" },
];

export function Competitif() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("live");
  const [fireEvent, setFireEvent] = useState(null);
  const prevRank1 = useRef(null);
  const fireTimer = useRef(null);

  const { data: boardRes } = useQuery({
    queryKey: ["leaderboard-competitif"],
    queryFn: () => api.get("/leaderboard"),
    refetchInterval: 5000,
  });

  const data = useMemo(() => boardRes?.data?.data || boardRes?.data || [], [boardRes]);

  // Rank change detection
  useEffect(() => {
    if (data.length > 0) {
      const current = data[0].name;
      if (prevRank1.current && prevRank1.current !== current) {
        if (fireTimer.current) clearTimeout(fireTimer.current);
        setFireEvent(current);
        fireTimer.current = setTimeout(() => setFireEvent(null), 4000);
      }
      prevRank1.current = current;
    }
    return () => { if (fireTimer.current) clearTimeout(fireTimer.current); };
  }, [data]);

  const p1 = data[0] || null;
  const p2 = data[1] || null;
  const rest = data.slice(2);

  const s1 = p1 ? getScore(p1) : 0;
  const s2 = p2 ? getScore(p2) : 0;
  const leadSide = s1 > s2 ? 1 : s2 > s1 ? 2 : 0;
  const gap = Math.abs(s1 - s2);

  return (
    <div
      className="min-h-screen bg-[#111827] text-white flex flex-col"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* FIRE OVERLAY */}
      {fireEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
          <div className="flex flex-col items-center gap-3">
            <div className="text-[80px] animate-[bounce_1s_ease-in-out_infinite]">🔥</div>
            <div
              className="text-[52px] leading-none tracking-[6px]"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                color: "#ef4444",
                textShadow: "0 0 40px rgba(239,68,68,0.7), 0 0 100px rgba(239,68,68,0.3)",
              }}
            >
              NEW #1
            </div>
            <div
              className="text-[24px] tracking-wider text-white/80"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              {fireEvent.toUpperCase()}
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="flex justify-between items-center px-6 py-5 bg-[#1f2937] rounded-2xl mx-5 mt-5 border border-[#374151] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="text-[#ef4444]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#ef4444] tracking-tight">OAMP</h1>
            <p className="text-[11px] text-white/50 font-medium">Block Design Test</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-green-400">
            <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)] animate-pulse" />
            Realtime Aktif
          </div>
          <div className="text-sm text-white/50 font-medium">{data.length} players</div>
        </div>
      </header>

      {/* NAV TABS */}
      <nav className="flex justify-center gap-4 mt-8 mb-10 px-5">
        {TABS.map(({ key, label }) => (
          <div
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all border ${
              tab === key
                ? "bg-[#ef4444] text-white border-[#ef4444] shadow-[0_4px_12px_rgba(220,38,38,0.25)]"
                : "bg-[#1f2937] text-white/80 border-[#374151] hover:bg-[#374151]"
            }`}
          >
            {label}
          </div>
        ))}
      </nav>

      {/* TAB CONTENT */}
      <div className="px-5 pb-8">
        {tab === "live" && (
          <div>
            {/* ROOM SECTION */}
            {p1 && p2 ? (
              <div className="mb-10">
                {/* Room header */}
                <div className="flex items-center gap-4 mb-6 pl-2">
                  <div className="bg-[#ef4444] text-white px-4 py-2 rounded-full text-xs font-extrabold tracking-widest shadow-[0_2px_8px_rgba(220,38,38,0.2)]">
                    ROOM: LIVE
                  </div>
                  <div className="text-sm text-white/60 font-medium">2 players</div>
                </div>

                {/* Player cards row */}
                <div className="flex flex-row gap-6 relative items-stretch">
                  {/* P1 Card */}
                  <div
                    className="flex-1 bg-[#1f2937] rounded-2xl p-6 border border-[#374151] cursor-pointer hover:border-[#ef4444]/50 transition-all group"
                    onClick={() => navigate(`/analytics/${p1.uid || p1.participant_id}`)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-extrabold mb-1">{p1.name}</h2>
                        <p className="text-sm text-white/60 font-medium">
                          Avg: <span className="text-white font-bold">{s1 > 0 ? `${(s1 / Math.max(s1, 1)).toFixed(1)}s` : "—"}</span>
                          {" · "}
                          Selesai: <span className="text-white font-bold">{(p1.level_reached || 0)}/8</span>
                        </p>
                      </div>
                      <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                        leadSide === 1
                          ? "bg-[#374151] text-[#ef4444] border-[#ef4444]/30 animate-pulse"
                          : "bg-[#374151] text-white/50 border-[#374151]"
                      }`}>
                        {leadSide === 1 ? "▶ " : ""}LEVEL {(p1.level_reached || 0) || "?"}
                      </div>
                    </div>

                    {/* Level bar */}
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 8 }, (_, i) => {
                        const completed = i < (p1.level_reached || 0);
                        return (
                          <div
                            key={i}
                            className={`flex-1 h-8 rounded-md flex items-center justify-center text-xs font-bold transition-all ${
                              completed
                                ? "bg-[#ef4444] text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]"
                                : "bg-[#374151] text-white/20"
                            }`}
                          >
                            {completed ? `L${i + 1}` : ""}
                          </div>
                        );
                      })}
                    </div>

                    {/* Score */}
                    <div className="mt-4 flex items-center justify-between bg-[#374151] rounded-xl px-4 py-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                        Score
                      </span>
                      <span
                        className="text-2xl font-extrabold tabular-nums"
                        style={{
                          fontFamily: "'Bebas Neue', sans-serif",
                          color: leadSide === 1 ? "#ef4444" : "white",
                          textShadow: leadSide === 1 ? "0 0 20px rgba(239,68,68,0.5)" : "none",
                        }}
                      >
                        {s1}
                      </span>
                    </div>
                  </div>

                  {/* VS badge */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-[#ef4444] to-[#b91c1c] text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-sm shadow-[0_4px_10px_rgba(220,38,38,0.4)] border-4 border-[#111827] z-10 italic">
                    VS
                  </div>

                  {/* P2 Card */}
                  <div
                    className="flex-1 bg-[#1f2937] rounded-2xl p-6 border border-[#374151] cursor-pointer hover:border-[#ef4444]/50 transition-all group"
                    onClick={() => navigate(`/analytics/${p2.uid || p2.participant_id}`)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-extrabold mb-1">{p2.name}</h2>
                        <p className="text-sm text-white/60 font-medium">
                          Avg: <span className="text-white font-bold">{s2 > 0 ? `${(s2 / Math.max(s1, 1)).toFixed(1)}s` : "—"}</span>
                          {" · "}
                          Selesai: <span className="text-white font-bold">{(p2.level_reached || 0)}/8</span>
                        </p>
                      </div>
                      <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                        leadSide === 2
                          ? "bg-[#374151] text-[#ef4444] border-[#ef4444]/30 animate-pulse"
                          : "bg-[#374151] text-white/50 border-[#374151]"
                      }`}>
                        {leadSide === 2 ? "▶ " : ""}LEVEL {(p2.level_reached || 0) || "?"}
                      </div>
                    </div>

                    {/* Level bar */}
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 8 }, (_, i) => {
                        const completed = i < (p2.level_reached || 0);
                        return (
                          <div
                            key={i}
                            className={`flex-1 h-8 rounded-md flex items-center justify-center text-xs font-bold transition-all ${
                              completed
                                ? "bg-[#ef4444] text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]"
                                : "bg-[#374151] text-white/20"
                            }`}
                          >
                            {completed ? `L${i + 1}` : ""}
                          </div>
                        );
                      })}
                    </div>

                    {/* Score */}
                    <div className="mt-4 flex items-center justify-between bg-[#374151] rounded-xl px-4 py-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                        Score
                      </span>
                      <span
                        className="text-2xl font-extrabold tabular-nums"
                        style={{
                          fontFamily: "'Bebas Neue', sans-serif",
                          color: leadSide === 2 ? "#ef4444" : "white",
                          textShadow: leadSide === 2 ? "0 0 20px rgba(239,68,68,0.5)" : "none",
                        }}
                      >
                        {s2}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gap indicator */}
                {gap > 0 && (
                  <div className="flex justify-center mt-4">
                    <div className="text-xs font-bold tracking-widest text-[#f59e0b] bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] px-4 py-1.5 rounded-full">
                      LEAD +{gap} pts
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-white/40">
                <div className="text-5xl mb-5">🎮</div>
                <p className="text-lg font-bold">Belum ada duel aktif</p>
              </div>
            )}

            {/* REMAINING RANKS */}
            {rest.length > 0 && (
              <div className="mt-12">
                <h3 className="text-sm font-bold tracking-widest text-white/40 uppercase mb-4 pl-2">Peringkat #{data[2]?.rank || 3}+</h3>
                <div className="bg-[#1f2937] rounded-2xl border border-[#374151] overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#374151]">
                        <th className="py-3 px-5 text-xs font-semibold text-white/50 uppercase tracking-wider">Rank</th>
                        <th className="py-3 px-5 text-xs font-semibold text-white/50 uppercase tracking-wider">Player</th>
                        <th className="py-3 px-5 text-xs font-semibold text-white/50 uppercase tracking-wider">Grade</th>
                        <th className="py-3 px-5 text-xs font-semibold text-white/50 uppercase tracking-wider text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rest.map((row) => {
                        const score = getScore(row);
                        return (
                          <tr
                            key={row.participant_id || row.uid || row.rank}
                            className="border-t border-[#374151] hover:bg-[#374151]/50 cursor-pointer transition-colors"
                            onClick={() => navigate(`/analytics/${row.uid || row.participant_id}`)}
                          >
                            <td className="py-3 px-5 text-sm font-bold text-white/60">#{row.rank}</td>
                            <td className="py-3 px-5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#6b7280] flex items-center justify-center text-sm font-bold text-white">
                                  {row.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-sm">{row.name}</div>
                                  <div className="text-xs text-white/40">{row.age} yrs</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-5">
                              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#374151] border border-[#4b5563]">{row.grade}</span>
                            </td>
                            <td className="py-3 px-5 text-right">
                              <span className="text-xl font-extrabold tabular-nums" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                                {score ?? "—"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "ranking" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold">🏆 Ranking Peserta</h2>
              <button
                onClick={() => navigate("/export")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#ef4444] text-[#ef4444] text-sm font-semibold hover:bg-[#ef4444] hover:text-white transition-all"
              >
                ⬇ Export
              </button>
            </div>

            {data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-white/40">
                <div className="text-5xl mb-5">🏆</div>
                <p className="text-lg font-bold">Belum ada data peserta</p>
              </div>
            ) : (
              <div className="bg-[#1f2937] rounded-2xl border border-[#374151] overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#374151]">
                      <th className="py-3 px-5 text-xs font-semibold text-white/50 uppercase tracking-wider">Rank</th>
                      <th className="py-3 px-5 text-xs font-semibold text-white/50 uppercase tracking-wider">Player</th>
                      <th className="py-3 px-5 text-xs font-semibold text-white/50 uppercase tracking-wider">Grade</th>
                      <th className="py-3 px-5 text-xs font-semibold text-white/50 uppercase tracking-wider">Usia</th>
                      <th className="py-3 px-5 text-xs font-semibold text-white/50 uppercase tracking-wider text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row) => {
                      const score = getScore(row);
                      let rowClass = "";
                      if (row.rank === 1) rowClass = "bg-[rgba(255,183,3,0.08)] border-l-4 border-l-[#ffb703]";
                      else if (row.rank === 2) rowClass = "bg-[rgba(174,184,196,0.08)] border-l-4 border-l-[#aeb8c4]";
                      else if (row.rank === 3) rowClass = "bg-[rgba(244,140,6,0.08)] border-l-4 border-l-[#f48c06]";
                      return (
                        <tr
                          key={row.participant_id || row.uid || row.rank}
                          className={`border-t border-[#374151] hover:bg-[#374151]/50 cursor-pointer transition-colors ${rowClass}`}
                          onClick={() => navigate(`/analytics/${row.uid || row.participant_id}`)}
                        >
                          <td className="py-3 px-5">
                            {row.rank === 1 ? "👑" : row.rank === 2 ? "🥈" : row.rank === 3 ? "🥉" : (
                              <span className="font-bold text-white/40">#{row.rank}</span>
                            )}
                          </td>
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                                row.rank === 1 ? "bg-gradient-to-br from-[#ffb703] to-[#fb8500]"
                                : row.rank === 2 ? "bg-gradient-to-br from-[#aeb8c4] to-[#8d99ae]"
                                : row.rank === 3 ? "bg-gradient-to-br from-[#f48c06] to-[#dc2f02]"
                                : "bg-[#6b7280]"
                              }`}>
                                {row.name?.charAt(0)?.toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-sm">{row.name}</div>
                                <div className="text-xs text-white/40">{row.age} yrs</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-5">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#374151] border border-[#4b5563]">{row.grade}</span>
                          </td>
                          <td className="py-3 px-5 text-sm text-white/60">{row.age}</td>
                          <td className="py-3 px-5 text-right">
                            <span className="text-xl font-extrabold tabular-nums" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                              {score ?? "—"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}