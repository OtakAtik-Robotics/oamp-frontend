import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { Trophy, Swords, Activity, Clock, User, Hash, Zap, Users, ChevronRight } from "lucide-react";

function useClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function ClockDisplay() {
  const t = useClock();
  return t.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function ModeBadge({ mode }) {
  if (mode === "competition" || mode === "tournament")
    return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">DUEL</span>;
  return <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">LATIH</span>;
}

function StatusDot({ mode }) {
  const color = mode === "playing" ? "bg-green-400" : mode === "idle" ? "bg-amber-400" : "bg-gray-500";
  return <span className={cn("inline-block w-3 h-3 rounded-full mr-2", color)} />;
}

function TabButton({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-6 py-3 text-lg font-bold rounded-xl transition-all duration-200 border-2",
        active
          ? "bg-white/10 border-white/30 text-white shadow-lg"
          : "border-transparent text-white/50 hover:text-white/80 hover:bg-white/5"
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
      {count != null && (
        <span className="ml-1 px-2 py-0.5 text-sm rounded-full bg-white/10">{count}</span>
      )}
    </button>
  );
}

function LeaderboardPanel({ mode }) {
  const batchParams = { params: { batch_id: "all", mode } };
  const { data, isLoading } = useQuery({
    queryKey: ["event-leaderboard", mode],
    queryFn: () => api.get("/leaderboard", batchParams),
    refetchInterval: 5000,
  });
  const leaderboard = useMemo(() => data?.data?.data || data?.data || [], [data]);
  const top = leaderboard.slice(0, 8);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-white/40 text-lg">Memuat...</div>;
  }

  if (top.length === 0) {
    return <div className="flex flex-col items-center justify-center h-64 text-white/30 gap-3">
      <Trophy className="h-12 w-12 opacity-30" />
      <p className="text-lg">Belum ada data</p>
    </div>;
  }

  return (
    <div className="space-y-3">
      {top.map((row, i) => (
        <div
          key={row.participant_id || i}
          className={cn(
            "flex items-center gap-4 px-4 py-3 rounded-xl transition-colors",
            i === 0 ? "bg-amber-500/10 border border-amber-500/20" :
            i === 1 ? "bg-gray-400/10 border border-gray-400/10" :
            i === 2 ? "bg-orange-700/10 border border-orange-700/10" :
            "bg-white/3"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-lg font-black shrink-0",
            i === 0 ? "bg-amber-500 text-black" :
            i === 1 ? "bg-gray-300 text-black" :
            i === 2 ? "bg-orange-600 text-white" :
            "bg-white/10 text-white/60"
          )}>
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-lg truncate">{row.name}</div>
            <div className="text-white/50 text-sm">{row.grade} · {row.age} th</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-white font-black text-2xl tabular-nums">{row.score != null ? Math.round(row.score) : "—"}</div>
            <div className="text-white/40 text-xs">Lv.{row.level_reached || 0}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CompetitionPanel() {
  const { data: roomsRes, isLoading: roomsLoading } = useQuery({
    queryKey: ["event-rooms"],
    queryFn: () => api.get("/rooms"),
    refetchInterval: 3000,
  });
  const rooms = useMemo(() => roomsRes?.data?.data || roomsRes?.data || [], [roomsRes]);
  const active = rooms.filter(r => ["waiting", "ready", "playing"].includes(r.status));

  const { data: boardRes, isLoading: boardLoading } = useQuery({
    queryKey: ["event-leaderboard", "competition"],
    queryFn: () => api.get("/leaderboard", { params: { batch_id: "all", mode: "competition" } }),
    refetchInterval: 5000,
  });
  const board = useMemo(() => boardRes?.data?.data || boardRes?.data || [], [boardRes]);
  const top4 = board.slice(0, 4);

  const isLoading = roomsLoading || boardLoading;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-white/40 text-lg">Memuat...</div>;
  }

  return (
    <div className="space-y-6">
      {active.length > 0 && (
        <div>
          <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" /> Room Aktif ({active.length})
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {active.map((room) => (
              <div key={room.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 font-mono text-sm">{room.id}</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-xs font-bold",
                    room.status === "playing" ? "bg-green-500/20 text-green-400" :
                    room.status === "ready" ? "bg-amber-500/20 text-amber-400" :
                    "bg-blue-500/20 text-blue-400"
                  )}>{room.status.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="text-white font-bold truncate max-w-[45%]">{room.player1_name || "—"}</span>
                  <span className="text-white/40 font-black text-xl">VS</span>
                  <span className="text-white font-bold truncate max-w-[45%] text-right">{room.player2_name || "—"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
          <Trophy className="h-4 w-4" /> Top Duel
        </h3>
        {top4.length === 0 ? (
          <p className="text-white/30 text-sm">Belum ada data duel</p>
        ) : (
          <div className="space-y-2">
            {top4.map((row, i) => (
              <div key={row.participant_id || i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/3">
                <span className="text-white/40 font-bold w-6 text-right">{i + 1}</span>
                <span className="flex-1 text-white truncate">{row.name}</span>
                <span className="text-amber-400 font-black text-lg tabular-nums">{row.score != null ? Math.round(row.score) : "—"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TournamentPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ["event-tournaments"],
    queryFn: () => api.get("/tournaments"),
    refetchInterval: 3000,
  });
  const tournaments = useMemo(() => data?.data?.data || data?.data || [], [data]);
  const active = tournaments.filter(t => t.status === "in_progress");

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-white/40 text-lg">Memuat...</div>;
  }
  if (active.length === 0) {
    return <div className="flex flex-col items-center justify-center h-64 text-white/30 gap-3">
      <Swords className="h-12 w-12 opacity-30" />
      <p className="text-lg">Belum ada turnamen berlangsung</p>
    </div>;
  }

  return (
    <div className="space-y-4">
      {active.map(t => (
        <TournamentBracketCard key={t.id} tournament={t} />
      ))}
    </div>
  );
}

function TournamentBracketCard({ tournament }) {
  const { data, isLoading } = useQuery({
    queryKey: ["event-tournament", tournament.id],
    queryFn: () => api.get(`/tournaments/${tournament.id}`),
    refetchInterval: 3000,
  });
  const matches = useMemo(() => data?.data?.data?.matches || data?.data?.matches || data?.matches || [], [data]);
  const maxRound = Math.max(...matches.map(m => m.round), 1);
  const rounds = [];
  for (let r = 1; r <= maxRound; r++) {
    rounds.push({ round: r, matches: matches.filter(m => m.round === r) });
  }
  const roundLabels = { 1: "R1", 2: "QF", 3: "SF", 4: "Final" };

  if (isLoading) {
    return <div className="flex items-center justify-center py-8 text-white/40">Memuat bracket...</div>;
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold text-lg">{tournament.name}</h3>
        <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-500/20 text-green-400">RONDE {tournament.current_round || 1}</span>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {rounds.map(({ round, matches: roundMatches }) => (
          <div key={round} className="flex-1 min-w-[150px]">
            <div className="text-white/40 text-xs font-bold mb-2 text-center">{roundLabels[round] || `R${round}`}</div>
            <div className="space-y-2">
              {roundMatches.slice(0, 8).map(m => (
                <div key={m.id} className={cn(
                  "px-2 py-1.5 rounded text-center text-xs border",
                  m.status === "finished" ? "bg-white/5 border-white/10" :
                  m.status === "playing" ? "bg-green-500/10 border-green-500/30" :
                  m.status === "ready" ? "bg-amber-500/10 border-amber-500/30" :
                  m.status === "bye" ? "bg-white/3 border-white/5 opacity-50" :
                  "bg-white/3 border-white/5"
                )}>
                  <div className={cn("truncate", m.winner_id && m.player1_id && m.winner_id !== m.player1_id && "text-white/40")}>
                    {m.player1_name || "TBD"}
                  </div>
                  {m.status !== "bye" && (
                    <div className="text-white/60 text-[10px]">
                      {m.status === "finished" ? `${m.player1_score} — ${m.player2_score}` : "vs"}
                    </div>
                  )}
                  <div className={cn("truncate", m.winner_id && m.player2_id && m.winner_id !== m.player2_id && "text-white/40")}>
                    {m.player2_name || "TBD"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StationPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ["event-stations"],
    queryFn: () => api.get("/stations"),
    refetchInterval: 10000,
  });
  const stations = useMemo(() => data?.data?.data || data?.data || [], [data]);
  const active = stations.filter(s => s.status === "playing");

  if (isLoading) return <div className="flex items-center gap-2 text-white/40 text-sm"><Activity className="h-3 w-3 animate-pulse" /> Memuat station...</div>;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-white/40 text-xs font-bold uppercase tracking-wider">Station:</span>
      {stations.length === 0 && <span className="text-white/30 text-sm">Tidak ada station terdeteksi</span>}
      {stations.map((s, i) => (
        <span key={i} className="flex items-center gap-1.5 px-2 py-1 rounded text-sm bg-white/5 border border-white/10">
          <StatusDot mode={s.status} />
          <span className="text-white font-medium">{s.player_name}</span>
          <ModeBadge mode={s.mode} />
        </span>
      ))}
      <span className="text-white/20 text-xs ml-auto">{active.length} aktif</span>
    </div>
  );
}

const TABS = [
  { key: "training", icon: Trophy, label: "Latihan" },
  { key: "competition", icon: Swords, label: "Duel" },
  { key: "tournament", icon: Zap, label: "Turnamen" },
];

export function EventDisplay() {
  const [tab, setTab] = useState("training");

  return (
    <div className="min-h-screen bg-[#0f0f14] text-white font-sans flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-black tracking-tight">
            <span className="text-white">OAMP</span>
            <span className="text-amber-400"> EVENT</span>
          </h1>
          <nav className="flex gap-1">
            {TABS.map(({ key, icon, label }) => (
              <TabButton key={key} active={tab === key} onClick={() => setTab(key)} icon={icon} label={label} />
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <StationPanel />
          <div className="text-white/60 font-mono text-xl tabular-nums shrink-0">
            <Clock className="h-4 w-4 inline mr-1 -mt-0.5" />
            <ClockDisplay />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          {tab === "training" && <LeaderboardPanel mode="training" />}
          {tab === "competition" && <CompetitionPanel />}
          {tab === "tournament" && <TournamentPanel />}
        </div>
      </main>

      <footer className="px-8 py-2 border-t border-white/5 text-white/20 text-xs text-center shrink-0">
        OAMP Event Display — refresh otomatis setiap 3–10 detik
      </footer>
    </div>
  );
}
