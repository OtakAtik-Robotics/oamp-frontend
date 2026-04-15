import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "@/lib/axios";
import { ParticipantCard } from "@/components/ParticipantCard";
import { EmotionPieChart } from "@/components/EmotionPieChart";
import { SessionBarChart } from "@/components/SessionBarChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  Zap,
  Target,
  TrendingUp,
  FileText,
  Trophy,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function Analytics() {
  const { uid } = useParams();
  const [downloadingRapor, setDownloadingRapor] = useState(false);

  async function handleDownloadRapor() {
    setDownloadingRapor(true);
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
      toast.error("Gagal mengunduh rapor. Server tidak tersedia.");
    } finally {
      setDownloadingRapor(false);
    }
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics", uid],
    queryFn: () => api.get(`/app/auth/${uid}`),
    select: (res) => res.data,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading participant data...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold">Peserta tidak ditemukan</h2>
        <p className="text-muted-foreground">
          UID "{uid}" tidak terdaftar di sistem.
        </p>
        <Button asChild variant="outline">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  const { participant, sessions } = data;
  const totalSessions = sessions?.length || 0;

  // Support both `score` and `visuo_spatial_fit` fields
  function getSessionScore(s) {
    return s.score ?? (s.visuo_spatial_fit != null ? s.visuo_spatial_fit * 100 : null);
  }

  const bestScore =
    totalSessions > 0
      ? Math.max(...sessions.map(getSessionScore).filter((v) => v != null))
      : null;
  const avgTime =
    totalSessions > 0
      ? (sessions.reduce((a, s) => a + (s.total_time || 0), 0) / totalSessions).toFixed(1)
      : null;
  const maxLevel =
    totalSessions > 0
      ? Math.max(...sessions.map((s) => s.level_reached ?? 0))
      : null;
  const totalScore =
    totalSessions > 0
      ? sessions.reduce((a, s) => a + (getSessionScore(s) || 0), 0)
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Participant Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Detailed performance & health data
            </p>
          </div>
        </div>
        <Button
          onClick={handleDownloadRapor}
          disabled={downloadingRapor}
          className="bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 shadow-md"
        >
          {downloadingRapor ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Download Rapor
            </>
          )}
        </Button>
      </div>

      {/* Profile card */}
      <ParticipantCard participant={participant} sessions={sessions} />

      {/* Session summary cards */}
      {totalSessions > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <MiniStat
            icon={<Flame className="h-5 w-5" />}
            label="Best Score"
            value={bestScore != null ? Math.round(bestScore) : "N/A"}
            accent="amber"
          />
          <MiniStat
            icon={<Trophy className="h-5 w-5" />}
            label="Total Points"
            value={totalScore != null ? Math.round(totalScore) : "N/A"}
            accent="yellow"
          />
          <MiniStat
            icon={<TrendingUp className="h-5 w-5" />}
            label="Max Level"
            value={maxLevel ?? "N/A"}
            accent="green"
          />
          <MiniStat
            icon={<Clock className="h-5 w-5" />}
            label="Avg Time"
            value={avgTime ? `${avgTime}s` : "N/A"}
            accent="blue"
          />
          <MiniStat
            icon={<Zap className="h-5 w-5" />}
            label="Sessions"
            value={totalSessions}
            accent="purple"
          />
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="sessions">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="sessions" className="gap-2">
            <Zap className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="emotions" className="gap-2">
            Emotion Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4 mt-4">
          {/* Session table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Session History</span>
                <Badge variant="secondary">{totalSessions} sessions</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {totalSessions === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Zap className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Belum ada sesi dimainkan.</p>
                  <p className="text-sm">Data sesi akan muncul setelah peserta bermain.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead className="text-center">Level</TableHead>
                        <TableHead className="text-center">Time</TableHead>
                        <TableHead className="text-center">Score</TableHead>
                        <TableHead className="text-center">Dexterity</TableHead>
                        <TableHead className="text-center">Cognitive Age</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map((s, i) => {
                        const score = getSessionScore(s);
                        const isBest = bestScore != null && score === bestScore;
                        const isMaxLevel = maxLevel != null && s.level_reached === maxLevel;

                        return (
                          <TableRow key={s.id} className="group">
                            <TableCell className="font-mono text-muted-foreground">
                              {i + 1}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={s.mode === "normal" ? "secondary" : "outline"}
                                className="capitalize"
                              >
                                {s.mode}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <span
                                className={cn(
                                  "inline-flex items-center justify-center rounded-full w-8 h-8 text-sm font-bold",
                                  isMaxLevel
                                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 dark:ring-green-700 ring-2 ring-green-300"
                                    : "bg-muted text-foreground dark:bg-slate-800 dark:text-slate-200"
                                )}
                              >
                                {s.level_reached}
                              </span>
                            </TableCell>
                            <TableCell className="text-center font-mono text-muted-foreground">
                              {s.total_time?.toFixed(1)}s
                            </TableCell>
                            <TableCell className="text-center">
                              <span
                                className={cn(
                                  "font-bold text-base tabular-nums",
                                  isBest ? "text-amber-600 dark:text-amber-400" : "text-foreground dark:text-slate-100"
                                )}
                              >
                                {score != null ? Math.round(score) : "—"}
                              </span>
                              {isBest && (
                                <Flame className="inline h-3.5 w-3.5 ml-1 text-amber-500" />
                              )}
                            </TableCell>
                            <TableCell className="text-center font-mono">
                              {s.dexterity_score?.toFixed(1) ?? "—"}
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">
                              {s.cognitive_age ?? "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {new Date(s.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Score chart */}
          {totalSessions > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Score Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SessionBarChart sessions={sessions} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="emotions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Emotion Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmotionPieChart />
              <div className="mt-6 rounded-lg border border-dashed border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
                <strong>Note:</strong> Data emosi saat ini menggunakan sample
                data. Menunggu endpoint backend untuk data real-time.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const accentStyles = {
  blue: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950",
  green: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950",
  amber: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950",
  yellow: "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950",
  purple: "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950",
};

const accentText = {
  blue: "text-blue-600 dark:text-blue-400",
  green: "text-green-600 dark:text-green-400",
  amber: "text-amber-600 dark:text-amber-400",
  yellow: "text-yellow-600 dark:text-yellow-400",
  purple: "text-purple-600 dark:text-purple-400",
};

function MiniStat({ icon, label, value, accent }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-lg border p-4", accentStyles[accent])}>
      <div className={cn("rounded-md bg-white/70 p-2", accentText[accent])}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
}
