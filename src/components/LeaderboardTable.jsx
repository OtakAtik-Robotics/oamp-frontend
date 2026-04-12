import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const rankStyles = {
  1: "bg-yellow-100 border-yellow-300",
  2: "bg-gray-100 border-gray-300",
  3: "bg-orange-100 border-orange-300",
};

const rankMedal = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export function LeaderboardTable({ data, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Belum ada data leaderboard.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Rank</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Grade</TableHead>
          <TableHead className="text-center">Age</TableHead>
          <TableHead className="text-center">VisuoSpatial</TableHead>
          <TableHead className="text-center">Time (s)</TableHead>
          <TableHead className="text-center">Level</TableHead>
          <TableHead className="text-center">Dexterity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow
            key={row.participant_id}
            className={cn(
              "cursor-pointer transition-colors hover:bg-accent",
              rankStyles[row.rank]
            )}
            onClick={() => navigate(`/analytics/${row.uid || row.participant_id}`)}
          >
            <TableCell className="font-bold">
              {rankMedal[row.rank] || `#${row.rank}`}
            </TableCell>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell>{row.grade}</TableCell>
            <TableCell className="text-center">{row.age}</TableCell>
            <TableCell className="text-center">
              {(row.visuo_spatial_fit * 100).toFixed(1)}%
            </TableCell>
            <TableCell className="text-center">{row.total_time?.toFixed(1)}</TableCell>
            <TableCell className="text-center">{row.level_reached}</TableCell>
            <TableCell className="text-center">{row.dexterity_score?.toFixed(1)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
