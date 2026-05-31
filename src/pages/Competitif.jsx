import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Layers, AlertCircle, Swords, Trophy, DoorOpen, Users } from "lucide-react";

function getScore(row) {
  return row.score ?? null;
}

export function Competitif() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("live");
  const [selectedBatchId, setSelectedBatchId] = useState("all");

  const { data: batchesRes } = useQuery({
    queryKey: ["batches"],
    queryFn: () => api.get("/batches"),
  });

  const allBatches = useMemo(() => batchesRes?.data || [], [batchesRes]);

  const batchParams =
    selectedBatchId !== "all"
      ? { params: { batch_id: selectedBatchId, mode: "competition" } }
      : { params: { batch_id: "all", mode: "competition" } };

  const { data: boardRes, isLoading, isError } = useQuery({
    queryKey: ["leaderboard-duel", "competition", selectedBatchId],
    queryFn: () => api.get("/leaderboard", batchParams),
    refetchInterval: 5000,
  });

  const { data: roomsRes } = useQuery({
    queryKey: ["rooms-duel"],
    queryFn: () => api.get("/rooms"),
    refetchInterval: 3000,
  });

  const rooms = useMemo(() => {
    const raw = roomsRes?.data?.data || roomsRes?.data || [];
    return raw.filter((r) => ["waiting", "ready", "playing"].includes(r.status));
  }, [roomsRes]);

  const data = useMemo(() => boardRes?.data?.data || boardRes?.data || [], [boardRes]);

  const p1 = data[0] || null;
  const p2 = data[1] || null;
  const rest = data.slice(2);

  const s1 = p1 ? getScore(p1) : 0;
  const s2 = p2 ? getScore(p2) : 0;
  const leadSide = s1 > s2 ? 1 : s2 > s1 ? 2 : 0;
  const gap = Math.abs(s1 - s2);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* HEADER */}
      <header className="flex justify-between items-center px-6 py-5 mx-5 mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Swords className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">OAMP Duel</h1>
            <p className="text-xs text-slate-400 font-medium tracking-wider uppercase">Block Design Test</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
            <SelectTrigger className="w-[180px] h-9 bg-white border-slate-200 text-slate-700 text-sm">
              <SelectValue placeholder="Pilih sesi..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Sesi</SelectItem>
              {allBatches.map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>
                  {b.name}{!b.is_active ? " (arsip)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            {isLoading ? "Loading..." : "Live"}
          </div>
          <div className="text-sm text-slate-400 font-medium">{data.length} players</div>
        </div>
      </header>

      {/* NAV TABS */}
      <div className="flex justify-center mt-8 mb-10 px-5">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="p-1 rounded-2xl bg-slate-100 border border-slate-200">
            <TabsTrigger
              value="live"
              className="rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-500 hover:text-slate-800"
            >
              Live Duel
            </TabsTrigger>
            <TabsTrigger
              value="ranking"
              className="rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-500 hover:text-slate-800"
            >
              Peringkat
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* TAB CONTENT */}
      <div className="px-5 pb-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <Loader2 className="h-10 w-10 animate-spin mb-4" />
            <p className="text-lg font-bold">Memuat data...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
            <p className="text-lg font-bold text-red-600">Gagal memuat leaderboard</p>
            <p className="text-sm text-slate-400 mt-2">Server tidak tersedia</p>
          </div>
        ) : (
        <>
        {tab === "live" && (
          <div>
            {/* ACTIVE ROOMS */}
            {rooms.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-4 pl-2">Room Aktif</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {rooms.map((room) => (
                    <Card
                      key={room.id}
                      className="cursor-pointer hover:shadow-md transition-all border-slate-200"
                      onClick={() => navigate(`/match/${room.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={`text-[10px] px-2 py-0.5 ${
                            room.status === "playing"
                              ? "bg-green-100 text-green-700"
                              : room.status === "ready"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-amber-100 text-amber-700"
                          }`}>
                            {room.status === "playing" ? "Berlangsung" : room.status === "ready" ? "Siap" : "Menunggu"}
                          </Badge>
                          <span className="text-[10px] font-mono text-slate-400">{room.id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-slate-600">
                            {room.player1_name || "?"} vs {room.player2_name || "?"}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                          <DoorOpen className="h-3 w-3" />
                          <span>Klik untuk spectator →</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* ROOM SECTION */}
            {p1 && p2 ? (
              <div className="mb-10">
                {/* Room header */}
                <div className="flex items-center gap-4 mb-6 pl-2">
                  <Badge className="px-4 py-2 text-xs font-bold tracking-widest rounded-xl bg-blue-600 text-white">
                    Room Live
                  </Badge>
                  <div className="text-sm text-slate-500 font-medium">2 players</div>
                </div>

                {/* Player cards row */}
                <div className="flex flex-row gap-6 relative items-stretch">
                  {/* P1 Card */}
                  <div
                    className="flex-1 rounded-2xl p-6 border cursor-pointer transition-all duration-300 group hover:scale-[1.01] bg-white"
                    style={{
                      borderColor: leadSide === 1 ? "#3b82f6" : "#e2e8f0",
                    }}
                    onClick={() => navigate(`/analytics/${p1.uid || p1.participant_id}`)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-extrabold mb-1 text-slate-900">{p1.name}</h2>
                        <p className="text-sm text-slate-500 font-medium">
                          Avg: <span className="text-slate-900 font-bold">{s1 > 0 ? `${(p1.total_time || 0).toFixed(1)}s` : "—"}</span>
                          {" · "}
                          Selesai: <span className="text-slate-900 font-bold">{(p1.level_reached || 0)}/8</span>
                        </p>
                      </div>
                      <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                        leadSide === 1
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-slate-50 text-slate-400 border-slate-200"
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
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-300"
                            }`}
                          >
                            {completed ? `L${i + 1}` : ""}
                          </div>
                        );
                      })}
                    </div>

                    {/* Score */}
                    <div className="mt-4 flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Score
                      </span>
                      <span className="text-2xl font-extrabold tabular-nums text-slate-900">
                        {s1}
                      </span>
                    </div>
                  </div>

                  {/* VS badge */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl flex items-center justify-center font-black text-base italic z-10 bg-blue-600 text-white border-4 border-slate-50">
                    VS
                  </div>

                  {/* P2 Card */}
                  <div
                    className="flex-1 rounded-2xl p-6 border cursor-pointer transition-all duration-300 group hover:scale-[1.01] bg-white"
                    style={{
                      borderColor: leadSide === 2 ? "#3b82f6" : "#e2e8f0",
                    }}
                    onClick={() => navigate(`/analytics/${p2.uid || p2.participant_id}`)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-extrabold mb-1 text-slate-900">{p2.name}</h2>
                        <p className="text-sm text-slate-500 font-medium">
                          Avg: <span className="text-slate-900 font-bold">{s2 > 0 ? `${(p2.total_time || 0).toFixed(1)}s` : "—"}</span>
                          {" · "}
                          Selesai: <span className="text-slate-900 font-bold">{(p2.level_reached || 0)}/8</span>
                        </p>
                      </div>
                      <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                        leadSide === 2
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-slate-50 text-slate-400 border-slate-200"
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
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-300"
                            }`}
                          >
                            {completed ? `L${i + 1}` : ""}
                          </div>
                        );
                      })}
                    </div>

                    {/* Score */}
                    <div className="mt-4 flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Score
                      </span>
                      <span className="text-2xl font-extrabold tabular-nums text-slate-900">
                        {s2}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gap indicator */}
                {gap > 0 && (
                  <div className="flex justify-center mt-4">
                    <Badge className="px-4 py-2 text-xs font-bold tracking-widest rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                      Selisih +{gap} poin
                    </Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                <Trophy className="h-12 w-12 mb-4 text-slate-300" />
                <p className="text-xl font-bold text-slate-600">Menunggu Duel...</p>
                <p className="text-sm mt-2 text-slate-400">Butuh minimal 2 peserta untuk duel</p>
              </div>
            )}

            {/* REMAINING RANKS */}
            {rest.length > 0 && (
              <div className="mt-12">
                <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-4 pl-2">Peringkat #{data[2]?.rank || 3}+</h3>
                <Card className="rounded-2xl overflow-hidden py-0 border border-slate-200 bg-white shadow-sm">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-b border-slate-100">
                          <TableHead className="text-slate-400 uppercase text-xs font-bold tracking-wider py-3 px-5">#</TableHead>
                          <TableHead className="text-slate-400 uppercase text-xs font-bold tracking-wider py-3 px-5">Pemain</TableHead>
                          <TableHead className="text-slate-400 uppercase text-xs font-bold tracking-wider py-3 px-5">Kelas</TableHead>
                          <TableHead className="text-slate-400 uppercase text-xs font-bold tracking-wider py-3 px-5 text-right">Skor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rest.map((row) => {
                          const score = getScore(row);
                          return (
                            <TableRow
                              key={row.participant_id || row.uid || row.rank}
                              className="cursor-pointer transition-all duration-200 hover:bg-slate-50 border-b border-slate-50"
                              onClick={() => navigate(`/analytics/${row.uid || row.participant_id}`)}
                            >
                              <TableCell className="text-slate-500 py-3 px-5">#{row.rank}</TableCell>
                              <TableCell className="py-3 px-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                                    {row.name?.charAt(0)?.toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-bold text-sm text-slate-900">{row.name}</div>
                                    <div className="text-xs text-slate-400">{row.age} th</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-3 px-5">
                                <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1 rounded-lg">
                                  {row.grade}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-3 px-5 text-right">
                                <span className="text-xl font-black tabular-nums text-slate-900">
                                  {score ?? "—"}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {tab === "ranking" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Peringkat</h2>
              <Button
                variant="outline"
                onClick={() => navigate("/export")}
                className="rounded-xl text-sm font-bold"
              >
                📥 Export
              </Button>
            </div>

            {data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                <Trophy className="h-12 w-12 mb-4 text-slate-300" />
                <p className="text-xl font-bold text-slate-600">Ayo Mulai!</p>
                <p className="text-sm mt-2 text-slate-400">Belum ada data peserta</p>
              </div>
            ) : (
              <Card className="rounded-2xl overflow-hidden py-0 border border-slate-200 bg-white shadow-sm">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-slate-100">
                        <TableHead className="text-slate-400 uppercase text-xs font-bold tracking-wider py-4 px-5">#</TableHead>
                        <TableHead className="text-slate-400 uppercase text-xs font-bold tracking-wider py-4 px-5">Pemain</TableHead>
                        <TableHead className="text-slate-400 uppercase text-xs font-bold tracking-wider py-4 px-5">Kelas</TableHead>
                        <TableHead className="text-slate-400 uppercase text-xs font-bold tracking-wider py-4 px-5">Usia</TableHead>
                        <TableHead className="text-slate-400 uppercase text-xs font-bold tracking-wider py-4 px-5 text-right">Skor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((row) => {
                        const score = getScore(row);
                        return (
                          <TableRow
                            key={row.participant_id || row.uid || row.rank}
                            className={`cursor-pointer transition-all duration-200 hover:bg-slate-50 border-b border-slate-50 ${
                              row.rank === 1 ? "border-l-4 border-l-amber-300 bg-amber-50/30"
                              : row.rank === 2 ? "border-l-4 border-l-slate-300 bg-slate-50/30"
                              : row.rank === 3 ? "border-l-4 border-l-orange-300 bg-orange-50/30"
                              : ""
                            }`}
                            onClick={() => navigate(`/analytics/${row.uid || row.participant_id}`)}
                          >
                            <TableCell className="py-3 px-5">
                              {row.rank === 1 ? (
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">1</span>
                              ) : row.rank === 2 ? (
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">2</span>
                              ) : row.rank === 3 ? (
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">3</span>
                              ) : (
                                <span className="font-bold text-slate-400">#{row.rank}</span>
                              )}
                            </TableCell>
                            <TableCell className="py-3 px-5">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm ${
                                  row.rank === 1 ? "bg-gradient-to-br from-amber-400 to-orange-500"
                                  : row.rank === 2 ? "bg-gradient-to-br from-slate-300 to-slate-400"
                                  : row.rank === 3 ? "bg-gradient-to-br from-orange-300 to-orange-400"
                                  : "bg-gradient-to-br from-violet-400 to-purple-500"
                                }`}>
                                  {row.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-sm text-slate-900">{row.name}</div>
                                  <div className="text-xs text-slate-400">{row.age} th</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 px-5">
                              <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1 rounded-full">
                                {row.grade}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-3 px-5 text-slate-500 text-sm">{row.age}</TableCell>
                            <TableCell className="py-3 px-5 text-right">
                              <span className="text-xl font-black tabular-nums text-slate-900">
                                {score ?? "—"}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </>
      )}
      </div>
    </div>
  );
}
