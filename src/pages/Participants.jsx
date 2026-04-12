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
  Users,
  Search,
  FileText,
  Loader2,
  ArrowUpDown,
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

  const { data, isLoading, isError } = useQuery({
    queryKey: ["participants"],
    queryFn: async () => {
      try {
        const res = await api.get("/participants");
        return res.data;
      } catch {
        // Fallback: use leaderboard data if /participants not yet available
        const res = await api.get("/leaderboard");
        return res.data;
      }
    },
    select: (data) => {
      if (!Array.isArray(data)) return [];
      return data.map((p) => ({
        id: p.participant_id || p.id,
        uid: p.uid,
        name: p.name,
        grade: p.grade,
        age: p.age,
        gender: p.gender || null,
        created_at: p.created_at || null,
        // leaderboard-specific fields (may be null for plain participants)
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
    let result = participants.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.uid.toLowerCase().includes(q) ||
        p.grade.toLowerCase().includes(q)
    );

    result.sort((a, b) => {
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

    return result;
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

  const SortHeader = ({ field, children, className }) => (
    <TableHead
      className={cn("cursor-pointer select-none hover:bg-accent/50", className)}
      onClick={() => toggleSort(field)}
    >
      <span className="flex items-center gap-1">
        {children}
        <ArrowUpDown
          className={cn(
            "h-3 w-3",
            sortField === field ? "opacity-100" : "opacity-30"
          )}
        />
      </span>
    </TableHead>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Participants</h1>
          <p className="text-sm text-muted-foreground">
            Daftar lengkap peserta terdaftar
          </p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          <Users className="h-3.5 w-3.5 mr-1.5" />
          {participants.length} peserta
        </Badge>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama, UID, atau kelas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
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
              <p>Tidak ada peserta yang cocok dengan pencarian "{search}".</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortHeader field="name">Name</SortHeader>
                    <SortHeader field="uid">UID</SortHeader>
                    <SortHeader field="grade">Grade</SortHeader>
                    <SortHeader field="age" className="text-center">
                      Age
                    </SortHeader>
                    <TableHead className="text-center">Gender</TableHead>
                    <SortHeader field="visuo_spatial_fit" className="text-center">
                      VisuoSpatial
                    </SortHeader>
                    <SortHeader field="level_reached" className="text-center">
                      Level
                    </SortHeader>
                    <TableHead className="text-center">Rapor</TableHead>
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow
                      key={p.id}
                      className="cursor-pointer group"
                      onClick={() => navigate(`/analytics/${p.uid}`)}
                    >
                      <TableCell className="font-medium group-hover:text-primary transition-colors">
                        {p.name}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {p.uid}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{p.grade}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{p.age}</TableCell>
                      <TableCell className="text-center capitalize">
                        {p.gender || "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        {p.visuo_spatial_fit != null ? (
                          <span className="font-semibold text-blue-600">
                            {(p.visuo_spatial_fit * 100).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {p.level_reached != null ? (
                          <span className="inline-flex items-center justify-center rounded-full w-7 h-7 bg-muted text-sm font-bold">
                            {p.level_reached}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
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
}
