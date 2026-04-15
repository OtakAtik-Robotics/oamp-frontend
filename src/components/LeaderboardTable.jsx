import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Crown, Medal, Trophy, ChevronUp, ChevronDown, Minus, Flame } from "lucide-react";

const rankConfig = {
  1: {
    bg: "bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50",
    border: "border-l-4 border-l-yellow-400",
    badge: "bg-yellow-400 text-yellow-900",
    glow: "shadow-yellow-200/50 shadow-md",
  },
  2: {
    bg: "bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50",
    border: "border-l-4 border-l-slate-400",
    badge: "bg-slate-300 text-slate-800",
    glow: "shadow-slate-200/50 shadow-md",
  },
  3: {
    bg: "bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50",
    border: "border-l-4 border-l-orange-400",
    badge: "bg-orange-300 text-orange-900",
    glow: "shadow-orange-200/50 shadow-md",
  },
};

function getScoreDisplay(row) {
  const score = row.score ?? (row.visuo_spatial_fit != null ? Math.round(row.visuo_spatial_fit * 1000) / 10 : null);
  return score;
}

function getPointDiff(row, data, index) {
  if (index === 0) return null;
  const currentScore = getScoreDisplay(row);
  const prevScore = getScoreDisplay(data[index - 1]);
  if (currentScore == null || prevScore == null) return null;
  return currentScore - prevScore;
}

export function LeaderboardTable({ data, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Trophy className="h-12 w-12 mx-auto mb-3 opacity-20" />
        <p className="text-lg font-medium">Belum ada data leaderboard.</p>
        <p className="text-sm">Mainkan sesi pertama untuk memulai!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Podium — Top 3 */}
      {data.length >= 1 && (
        <div className="flex items-end justify-center gap-3 py-6 px-4">
          {/* 2nd place */}
          {data[1] && (
            <PodiumSlot
              rank={2}
              name={data[1].name}
              grade={data[1].grade}
              score={getScoreDisplay(data[1])}
              height="h-24"
              onClick={() => navigate(`/analytics/${data[1].uid || data[1].participant_id}`)}
            />
          )}
          {/* 1st place */}
          {data[0] && (
            <PodiumSlot
              rank={1}
              name={data[0].name}
              grade={data[0].grade}
              score={getScoreDisplay(data[0])}
              height="h-32"
              onClick={() => navigate(`/analytics/${data[0].uid || data[0].participant_id}`)}
            />
          )}
          {/* 3rd place */}
          {data[2] && (
            <PodiumSlot
              rank={3}
              name={data[2].name}
              grade={data[2].grade}
              score={getScoreDisplay(data[2])}
              height="h-20"
              onClick={() => navigate(`/analytics/${data[2].uid || data[2].participant_id}`)}
            />
          )}
        </div>
      )}

      {/* Full table */}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-16 text-center">Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="text-center">Grade</TableHead>
            <TableHead className="text-center">Score</TableHead>
            <TableHead className="text-center">Gap</TableHead>
            <TableHead className="text-center">Level</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => {
            const config = rankConfig[row.rank];
            const score = getScoreDisplay(row);
            const diff = getPointDiff(row, data, index);

            return (
              <TableRow
                key={row.participant_id || row.uid || index}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:scale-[1.005]",
                  config ? `${config.bg} ${config.border} ${config.glow}` : "hover:bg-accent"
                )}
                onClick={() =>
                  navigate(`/analytics/${row.uid || row.participant_id}`)
                }
              >
                <TableCell className="text-center">
                  {row.rank === 1 ? (
                    <Crown className="h-6 w-6 text-yellow-500 mx-auto drop-shadow-sm" />
                  ) : row.rank === 2 ? (
                    <Medal className="h-5 w-5 text-slate-400 dark:text-slate-300 mx-auto" />
                  ) : row.rank === 3 ? (
                    <Medal className="h-5 w-5 text-orange-400 mx-auto" />
                  ) : (
                    <span className="text-muted-foreground font-bold">#{row.rank}</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                        row.rank === 1
                          ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-sm"
                          : row.rank === 2
                          ? "bg-gradient-to-br from-slate-300 to-slate-400 text-white"
                          : row.rank === 3
                          ? "bg-gradient-to-br from-orange-300 to-orange-400 text-white"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {row.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className={cn(
                        "font-semibold",
                        row.rank <= 3 ? "text-foreground" : "text-foreground/80"
                      )}>
                        {row.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{row.age} yrs</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="font-semibold text-xs">
                    {row.grade}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <span className={cn(
                    "font-black text-lg tabular-nums",
                    row.rank === 1
                      ? "text-yellow-600"
                      : row.rank <= 3
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}>
                    {score != null ? score : "—"}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {diff != null ? (
                    <span className={cn(
                      "inline-flex items-center gap-0.5 text-xs font-semibold",
                      diff < 0 ? "text-red-500" : diff === 0 ? "text-muted-foreground" : "text-green-500"
                    )}>
                      {diff < 0 ? <ChevronDown className="h-3 w-3" /> : diff > 0 ? <ChevronUp className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                      {Math.abs(diff)}
                    </span>
                  ) : (
                    <span className="text-yellow-500 text-xs font-bold flex items-center justify-center gap-0.5">
                      <Flame className="h-3 w-3" /> TOP
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {row.level_reached != null ? (
                    <span className="inline-flex items-center justify-center rounded-full w-8 h-8 bg-muted text-sm font-bold">
                      {row.level_reached}
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function PodiumSlot({ rank, name, grade, score, height, onClick }) {
  const colors = {
    1: {
      bg: "from-yellow-400 to-amber-500",
      text: "text-yellow-900",
      crown: true,
      ring: "ring-4 ring-yellow-300/50",
    },
    2: {
      bg: "from-slate-300 to-slate-400",
      text: "text-slate-800",
      ring: "ring-4 ring-slate-200/50",
    },
    3: {
      bg: "from-orange-300 to-orange-400",
      text: "text-orange-900",
      ring: "ring-4 ring-orange-200/50",
    },
  };

  const c = colors[rank];

  return (
    <div
      className="flex flex-col items-center cursor-pointer group"
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="relative">
        {c.crown && (
          <Crown className="h-6 w-6 text-yellow-500 absolute -top-6 left-1/2 -translate-x-1/2 drop-shadow" />
        )}
        <div
          className={cn(
            "h-14 w-14 rounded-full bg-gradient-to-br flex items-center justify-center text-lg font-bold text-white shadow-lg group-hover:scale-110 transition-transform",
            c.bg,
            c.ring
          )}
        >
          {name?.charAt(0)?.toUpperCase()}
        </div>
      </div>
      {/* Info */}
      <p className="font-bold text-sm mt-2 text-center group-hover:text-primary transition-colors">
        {name}
      </p>
      <Badge variant="outline" className="text-xs mt-0.5">{grade}</Badge>
      {/* Pedestal */}
      <div
        className={cn(
          "w-28 mt-2 rounded-t-lg bg-gradient-to-t flex flex-col items-center justify-start pt-3 pb-2",
          c.bg,
          height
        )}
      >
        <span className={cn("text-2xl font-black", c.text)}>
          {score ?? "—"}
        </span>
        <span className={cn("text-xs font-semibold", c.text, "opacity-70")}>
          pts
        </span>
      </div>
    </div>
  );
}
