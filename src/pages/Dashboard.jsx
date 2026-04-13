import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "@/lib/axios";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Gamepad2, UserPlus, Download, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const PLAYER_COLORS = [
  "#ef4444",
  "#3b82f6",
  "#22c55e",
  "#eab308",
  "#a855f7",
  "#ec4899",
  "#06b6d4",
  "#f97316",
  "#8b5cf6",
  "#14b8a6",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const uniquePayload = payload.filter(
      (v, i, a) => a.findIndex((t) => t.dataKey === v.dataKey) === i
    );

    const sortedPayload = [...uniquePayload].sort((a, b) => b.value - a.value);

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg z-50">
        <p className="text-slate-500 dark:text-slate-400 text-xs font-mono mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          {label}
        </p>
        <div className="flex flex-col gap-1.5">
          {sortedPayload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                  {entry.name}
                </span>
              </div>
              <span className="text-slate-900 dark:text-white text-sm font-bold tabular-nums">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const { data: boardRes, isLoading, isError } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => api.get("/leaderboard"),
    refetchInterval: 5000,
  });

  const { data: timeRes } = useQuery({
    queryKey: ["timeline"],
    queryFn: () => api.get("/leaderboard/timeline"),
    refetchInterval: 5000,
  });

  const leaderboard = useMemo(() => boardRes?.data?.data || boardRes?.data || [], [boardRes]);
  const rawTimeline = useMemo(() => timeRes?.data?.data || timeRes?.data || [], [timeRes]);

  const [fireEvent, setFireEvent] = useState(null);
  const prevRank1 = useRef(null);
  const fireTimerRef = useRef(null);

  useEffect(() => {
    if (leaderboard.length > 0) {
      const currentRank1 = leaderboard[0].name;
      if (prevRank1.current && prevRank1.current !== currentRank1) {
        if (fireTimerRef.current) clearTimeout(fireTimerRef.current);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFireEvent(currentRank1);
        fireTimerRef.current = setTimeout(() => setFireEvent(null), 4000);
      }
      prevRank1.current = currentRank1;
    }
  }, [leaderboard]);

  const totalParticipants = leaderboard.length;
  const bestScore = leaderboard.length > 0 ? leaderboard[0].score.toFixed(0) : "N/A";
  const avgScore =
    leaderboard.length > 0
      ? (leaderboard.reduce((a, b) => a + b.score, 0) / leaderboard.length).toFixed(0)
      : "N/A";

  const topPlayers = leaderboard.slice(0, 8).map((p) => p.name);

  const { processedTimeline, playerLatestScores } = useMemo(() => {
    const timeline = [];
    const scores = {};

    topPlayers.forEach((p) => {
      scores[p] = 0;
    });

    if (rawTimeline.length > 0) {
      const firstDate = new Date(rawTimeline[0].created_at);
      firstDate.setMinutes(firstDate.getMinutes() - 1);
      timeline.push({
        time: firstDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        ...scores,
      });
    }

    rawTimeline.forEach((entry) => {
      if (!topPlayers.includes(entry.name)) return;

      const timeStr = new Date(entry.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (!scores[entry.name] || entry.score > scores[entry.name]) {
        scores[entry.name] = entry.score;
      }

      timeline.push({ time: timeStr, ...scores });
    });

    return { processedTimeline: timeline, playerLatestScores: scores };
  }, [rawTimeline, topPlayers]);

  const legendOrder = useMemo(() => {
    return [...topPlayers].sort((a, b) => (playerLatestScores[b] || 0) - (playerLatestScores[a] || 0));
  }, [topPlayers, playerLatestScores]);

  return (
    <div className="space-y-6 relative">
      {fireEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex flex-col items-center animate-bounce scale-125">
            <Flame className="h-32 w-32 text-orange-500 fill-orange-500" />
            <h1 className="text-5xl font-black text-white mt-4 tracking-wider text-center drop-shadow-[0_0_20px_rgba(239,68,68,0.9)]">
              {fireEvent.toUpperCase()} TOP #1 !
            </h1>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">OAMP Leaderboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/register">
              <UserPlus className="h-4 w-4 mr-2" />
              Register New
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/export">
              <Download className="h-4 w-4 mr-2" />
              Report
            </Link>
          </Button>
        </div>
      </div>

      {isError && (
        <div className="bg-red-100 text-red-800 px-4 py-3 rounded-md text-sm font-medium dark:bg-red-900/30 dark:text-red-400">
          Gagal memuat leaderboard. Server offline.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Players" value={totalParticipants} icon={<Users className="h-5 w-5" />} color="blue" />
        <StatCard title="Highest Score" value={bestScore} icon={<Flame className="h-5 w-5" />} color="amber" />
        <StatCard title="Average Score" value={avgScore} icon={<Gamepad2 className="h-5 w-5" />} color="green" />
      </div>

      {processedTimeline.length > 0 && (
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="bg-slate-100 dark:bg-slate-900 px-6 pt-5 pb-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500 dark:bg-green-400" />
                  <div className="absolute inset-0 rounded-full bg-green-500 dark:bg-green-400 animate-ping opacity-75" />
                </div>
                <h3 className="text-slate-800 dark:text-white font-bold text-sm tracking-widest uppercase">
                  Score Timeline
                </h3>
              </div>
              <span className="text-slate-500 dark:text-slate-400 text-xs font-mono">
                top {legendOrder.length} players
              </span>
            </div>
          </div>

          <div className="h-[300px] md:h-[420px] px-4 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedTimeline}>
                <defs>
                  {topPlayers.map((player, index) => (
                    <linearGradient
                      key={`grad-${player}`}
                      id={`grad-${player}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={PLAYER_COLORS[index % PLAYER_COLORS.length]}
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="100%"
                        stopColor={PLAYER_COLORS[index % PLAYER_COLORS.length]}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  ))}
                </defs>

                <CartesianGrid
                  strokeDasharray="1 0"
                  stroke="var(--color-border, #e2e8f0)"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11 }}
                  tickMargin={10}
                  minTickGap={30}
                  tickLine={false}
                />
                <YAxis
                  domain={["dataMin - 20", "dataMax + 50"]}
                  tick={{ fontSize: 11 }}
                  width={50}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "var(--color-border, #e2e8f0)", strokeWidth: 1, strokeDasharray: "3 3" }}
                />

                {topPlayers.map((player) => (
                  <Line
                    key={`area-${player}`}
                    type="monotone"
                    dataKey={player}
                    stroke="transparent"
                    fill={`url(#grad-${player})`}
                    dot={false}
                    activeDot={false}
                    strokeWidth={0}
                  />
                ))}

                {topPlayers.map((player, index) => {
                  const color = PLAYER_COLORS[index % PLAYER_COLORS.length];
                  return (
                    <Line
                      key={`glow-${player}`}
                      type="monotone"
                      dataKey={player}
                      stroke={color}
                      strokeWidth={index === 0 ? 10 : 5}
                      dot={false}
                      activeDot={false}
                      opacity={0.2}
                    />
                  );
                })}

                {topPlayers.map((player, index) => {
                  const color = PLAYER_COLORS[index % PLAYER_COLORS.length];
                  return (
                    <Line
                      key={player}
                      type="monotone"
                      dataKey={player}
                      stroke={color}
                      strokeWidth={index === 0 ? 3.5 : 2}
                      dot={false}
                      activeDot={{
                        r: 5,
                        strokeWidth: 2,
                        stroke: "#fff",
                        fill: color,
                      }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 px-6 py-5 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {legendOrder.map((player, index) => {
                const colorIndex = topPlayers.indexOf(player);
                const color = PLAYER_COLORS[colorIndex % PLAYER_COLORS.length];
                const score = playerLatestScores[player] || 0;
                const rank = index + 1;

                return (
                  <div
                    key={player}
                    className="flex items-center gap-2.5 group cursor-default"
                  >
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-mono w-4 text-right">
                      {rank}.
                    </span>
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0 transition-all group-hover:scale-125"
                      style={{
                        backgroundColor: color,
                        boxShadow: `0 0 ${index === 0 ? 10 : 5}px ${color}60`,
                      }}
                    />
                    <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                      {player}
                    </span>
                    <span
                      className="text-xs font-bold tabular-nums"
                      style={{ color }}
                    >
                      {score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-slate-100 dark:bg-slate-900 py-4">
          <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-white">
            <Users className="h-5 w-5" />
            Global Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <LeaderboardTable data={leaderboard} loading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}

const colorMap = {
  blue: "bg-blue-100 text-blue-600",
  amber: "bg-amber-100 text-amber-600",
  green: "bg-green-100 text-green-600",
};

function StatCard({ title, value, icon, color }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`p-3 rounded-lg ${colorMap[color] || "bg-primary/10 text-primary"}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-black tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}