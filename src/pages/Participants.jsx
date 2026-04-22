import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  FileText,
  Loader2,
  ArrowUpDown,
  Flame,
  Trophy,
  Gamepad2,
  Eye,
  Filter,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function Participants() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [downloadingRapor, setDownloadingRapor] = useState({});
  const [selectedBatch, setSelectedBatch] = useState("all");

  const { data: batchesRes } = useQuery({
    queryKey: ["batches"],
    queryFn: () => api.get("/batches"),
  });

  const allBatches = useMemo(
    () => batchesRes?.data || [],
    [batchesRes]
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["participants", selectedBatch],
    staleTime: 0,
    queryFn: async () => {
      const params = selectedBatch !== "all" ? { params: { batch_id: selectedBatch } } : {};
      try {
        const res = await api.get("/participants", params);
        return res.data;
      } catch {
        const res = await api.get("/leaderboard", params);
        return res.data;
      }
    },
    select: (raw) => {
      if (!Array.isArray(raw)) return [];
      return raw.map((p) => ({
        id: p.participant_id || p.id,
        uid: p.uid,
        name: p.name,
        grade: p.grade,
        age: p.age,
        gender: p.gender || null,
        created_at: p.created_at || null,
        score: p.score ?? null,
        visuo_spatial_fit: p.visuo_spatial_fit ?? null,
        total_time: p.total_time ?? null,
        level_reached: p.level_reached ?? null,
        dexterity_score: p.dexterity_score ?? null,
      }));
    },
  });

  const participants = useMemo(() => data || [], [data]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const result = participants.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.uid.toLowerCase().includes(q) ||
        p.grade.toLowerCase().includes(q)
    );

    const sorted = [...result].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA == null) return 1;
      if (valB == null) return -1;
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [participants, search, sortField, sortDir]);

  function toggleSort(field) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  async function handleDownloadRapor(uid) {
    setDownloadingRapor((prev) => ({ ...prev, [uid]: true }));
    try {
      const res = await api.get(`/export/rapor/${uid}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(res);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `rapor-${uid}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Rapor berhasil diunduh!");
    } catch {
      toast.error("Gagal mengunduh rapor.");
    } finally {
      setDownloadingRapor((prev) => ({ ...prev, [uid]: false }));
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Participants</h1>
          <p className="text-sm text-muted-foreground">
            Daftar lengkap peserta terdaftar
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm px-3 py-1.5 gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {participants.length} peserta
          </Badge>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-4">
        <StatMini
          icon={<Users className="h-4 w-4" />}
          label="Total"
          value={participants.length}
          color="blue"
        />
        <StatMini
          icon={<Trophy className="h-4 w-4" />}
          label="Highest Score"
          value={
            participants.length > 0
              ? Math.max(
                  ...participants
                    .filter((p) => p.score != null)
                    .map((p) => p.score)
                ) || "N/A"
              : "N/A"
          }
          color="amber"
        />
        <StatMini
          icon={<Gamepad2 className="h-4 w-4" />}
          label="With Sessions"
          value={participants.filter((p) => p.score != null).length}
          color="green"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, UID, atau kelas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedBatch} onValueChange={setSelectedBatch}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Semua Sesi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Sesi</SelectItem>
            {allBatches.map((b) => (
              <SelectItem key={b.id} value={String(b.id)}>
                {b.name}
                {!b.is_active && " (arsip)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Participant Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError || participants.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>
                {isError
                  ? "Gagal memuat data peserta."
                  : "Belum ada peserta terdaftar."}
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Tidak ada peserta yang cocok dengan "{search}".</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortTh field="name">Name</SortTh>
                    <SortTh field="uid">UID</SortTh>
                    <SortTh field="grade">Grade</SortTh>
                    <SortTh field="age" className="text-center">Age</SortTh>
                    <TableHead className="text-center">Gender</TableHead>
                    <SortTh field="score" className="text-center">Score</SortTh>
                    <SortTh field="level_reached" className="text-center">Level</SortTh>
                    <TableHead className="text-center">Actions</TableHead>
                    <SortTh field="created_at">Registered</SortTh>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow
                      key={p.id}
                      className="cursor-pointer group transition-all hover:bg-accent/80 hover:shadow-sm"
                      onClick={() => navigate(`/analytics/${p.uid}`)}
                    >
                      <TableCell className="font-semibold group-hover:text-primary transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {p.name?.charAt(0)?.toUpperCase()}
                          </div>
                          {p.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                          {p.uid}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-semibold">
                          {p.grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {p.age}
                      </TableCell>
                      <TableCell className="text-center capitalize text-muted-foreground">
                        {p.gender || "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        {p.score != null ? (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                            <Flame className="h-3.5 w-3.5" />
                            {p.score}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {p.level_reached != null ? (
                          <span className="inline-flex items-center justify-center rounded-full w-7 h-7 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-sm font-bold">
                            {p.level_reached}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/analytics/${p.uid}`);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-red-500"
                            disabled={downloadingRapor[p.uid]}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadRapor(p.uid);
                            }}
                          >
                            {downloadingRapor[p.uid] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {p.created_at
                          ? new Date(p.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  function SortTh({ field, children, className }) {
    return (
      <TableHead
        className={cn("cursor-pointer select-none hover:bg-accent/50", className)}
        onClick={() => toggleSort(field)}
      >
        <span className="flex items-center gap-1">
          {children}
          <ArrowUpDown
            className={cn(
              "h-3 w-3 transition-opacity",
              sortField === field ? "opacity-100" : "opacity-30"
            )}
          />
        </span>
      </TableHead>
    );
  }
}

const statColors = {
  blue: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
  amber: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  green: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
};

function StatMini({ icon, label, value, color }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-lg border p-4", statColors[color])}>
      <div className="p-2 rounded-md bg-white/60">{icon}</div>
      <div>
        <p className="text-xs font-medium opacity-70 uppercase tracking-wide">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
}
