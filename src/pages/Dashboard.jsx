import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "@/lib/axios";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Gamepad2, UserPlus, Download, TrendingUp, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

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

  const leaderboard = boardRes?.data?.data || boardRes?.data || [];
  const rawTimeline = timeRes?.data?.data || timeRes?.data || [];

  const [fireEvent, setFireEvent] = useState(null);
  const prevRank1 = useRef(null);

  useEffect(() => {
    if (leaderboard.length > 0) {
      const currentRank1 = leaderboard[0].name;
      if (prevRank1.current && prevRank1.current !== currentRank1) {
        setFireEvent(currentRank1);
        setTimeout(() => setFireEvent(null), 4000);
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

  const topPlayers = leaderboard.slice(0, 5).map((p) => p.name);
  const processedTimeline = [];
  const playerScores = {};

  rawTimeline.forEach((entry) => {
    if (!topPlayers.includes(entry.name)) return;
    
    const timeObj = new Date(entry.created_at);
    const timeStr = timeObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (!playerScores[entry.name] || entry.score > playerScores[entry.name]) {
      playerScores[entry.name] = entry.score;
    }

    processedTimeline.push({
      time: timeStr,
      ...playerScores,
    });
  });

  const colors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7"];

  return (
    <div className="space-y-6 relative">
      {fireEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex flex-col items-center animate-bounce scale-125">
            <Flame className="h-32 w-32 text-orange-500 fill-orange-500" />
            <h1 className="text-5xl font-black text-white mt-4 tracking-wider text-center drop-shadow-[0_0_20px_rgba(239,68,68,0.9)]">
              {fireEvent.toUpperCase()} MENGAMBIL ALIH!
            </h1>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">OAMP CTF Leaderboard</h1>
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
        <div className="bg-red-100 text-red-800 px-4 py-3 rounded-md text-sm font-medium">
          Gagal memuat leaderboard. Server offline.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Players" value={totalParticipants} icon={<Users className="h-5 w-5" />} color="blue" />
        <StatCard title="Highest Point" value={bestScore} icon={<Flame className="h-5 w-5" />} color="amber" />
        <StatCard title="Average Point" value={avgScore} icon={<Gamepad2 className="h-5 w-5" />} color="green" />
      </div>

      {processedTimeline.length > 0 && (
        <Card className="border-2 border-slate-800/10 shadow-lg">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <TrendingUp className="h-5 w-5 text-red-500" />
              The Race (Live Top 5)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }} 
                    tickMargin={12} 
                    minTickGap={20} 
                  />
                  <YAxis 
                    domain={["dataMin - 100", "dataMax + 200"]} 
                    tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }} 
                    width={60} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      fontWeight: "bold",
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                  {topPlayers.map((player, index) => (
                    <Line
                      key={player}
                      type="stepAfter"
                      dataKey={player}
                      stroke={colors[index % colors.length]}
                      strokeWidth={index === 0 ? 5 : 2.5}
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 0, fill: colors[index % colors.length] }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Global Rankings</CardTitle>
        </CardHeader>
        <CardContent>
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