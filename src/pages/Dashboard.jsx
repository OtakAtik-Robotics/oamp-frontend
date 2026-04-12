import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "@/lib/axios";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Gamepad2, Star, UserPlus, Download, TrendingUp } from "lucide-react";
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
  const { data, isLoading, isError } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => api.get("/leaderboard"),
    refetchInterval: 15000,
    select: (res) => res.data,
  });

  const leaderboard = data || [];

  const totalParticipants = leaderboard.length;
  const bestScore =
    leaderboard.length > 0
      ? (leaderboard[0].visuo_spatial_fit * 100).toFixed(1) + "%"
      : "N/A";
  const avgScore =
    leaderboard.length > 0
      ? (
          (leaderboard.reduce((a, b) => a + b.visuo_spatial_fit, 0) /
            leaderboard.length) *
          100
        ).toFixed(1) + "%"
      : "N/A";

  const chartData = leaderboard.map((row) => ({
    name: row.name,
    visuoSpatial: Math.round(row.visuo_spatial_fit * 1000) / 10,
    dexterity: Math.round(row.dexterity_score * 10) / 10,
    level: row.level_reached,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">OAMP Leaderboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/register">
              <UserPlus className="h-4 w-4 mr-2" />
              Register New Participant
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/export">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Link>
          </Button>
        </div>
      </div>

      {isError && (
        <div className="bg-yellow-100 text-yellow-800 px-4 py-3 rounded-md text-sm">
          Gagal memuat leaderboard. Server mungkin tidak tersedia.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Participants"
          value={totalParticipants}
          icon={<Users className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Best Score"
          value={bestScore}
          icon={<Star className="h-5 w-5" />}
          color="amber"
        />
        <StatCard
          title="Average Score"
          value={avgScore}
          icon={<Gamepad2 className="h-5 w-5" />}
          color="green"
        />
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Score Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    angle={-20}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="visuoSpatial"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ r: 5, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 7 }}
                    name="VisuoSpatial %"
                  />
                  <Line
                    type="monotone"
                    dataKey="dexterity"
                    stroke="#22c55e"
                    strokeWidth={2.5}
                    dot={{ r: 5, fill: "#22c55e", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 7 }}
                    name="Dexterity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Top 10 Participants</CardTitle>
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
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
