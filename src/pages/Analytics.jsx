import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  Sparkles,
  WifiOff,
  Lock,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function Analytics() {
  const { uid } = useParams();
  const [downloadingRapor, setDownloadingRapor] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [aiPaymentRequired, setAiPaymentRequired] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const snapScriptInjected = useRef(false);

  // Inject Midtrans Snap script once
  useEffect(() => {
    if (snapScriptInjected.current) return;
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
    if (!clientKey) return;
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", clientKey);
    script.async = true;
    document.body.appendChild(script);
    snapScriptInjected.current = true;
  }, []);

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

  async function handleGenerateAI() {
    setAiLoading(true);
    setAiError(false);
    setAiAnalysis(null);
    setAiPaymentRequired(false);

    try {
      const res = await api.get(`/participants/analysis/${uid}`, { timeout: 60000 });

      if (res.status === "success") {
        setAiAnalysis(res.data?.analysis || "");
        setAiPaymentRequired(false);
        toast.success("✨ Analisis AI berhasil dibuat!");
      } else if (res.status === "fallback") {
        setAiAnalysis(res.data?.analysis || "");
        setAiPaymentRequired(false);
        toast.warning("⚠️ AI sedang sibuk. Menampilkan pesan fallback.");
      } else if (res.status === "payment_required") {
        setAiPaymentRequired(true);
        toast.info("🔒 Hasil analisis terkunci. Selesaikan pembayaran untuk membuka.");
      } else {
        throw new Error("Invalid response status");
      }
    } catch {
      setAiError(true);
      toast.error("❌ Gagal terhubung ke server.");
    } finally {
      setAiLoading(false);
    }
  }

  async function handlePaymentSuccess() {
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
    setProcessingPayment(true);
    setPaymentModalOpen(false);

    try {
      // Step 1: Checkout → get snap_token
      const checkoutRes = await api.post(`/payment/checkout/${uid}`);
      if (checkoutRes.status !== "success") {
        throw new Error("Checkout failed");
      }
      const snapToken = checkoutRes.data?.snap_token;
      if (!snapToken) {
        throw new Error("No snap_token returned");
      }

      // Step 2: Open Midtrans Snap popup
      if (clientKey && window.snap) {
        window.snap.pay(snapToken, {
          onSuccess(_result) {
            toast.success("✅ Pembayaran berhasil! Mengambil hasil analisis...");
            setAiPaymentRequired(false);
            setAiLoading(true);
            setAiError(false);
            api.get(`/participants/analysis/${uid}`, { timeout: 60000 })
              .then((res) => {
                if (res.status === "success") {
                  setAiAnalysis(res.data?.analysis || "");
                  toast.success("✨ Analisis AI berhasil dibuka!");
                } else if (res.status === "fallback") {
                  setAiAnalysis(res.data?.analysis || "");
                } else {
                  throw new Error("Invalid response status");
                }
              })
              .catch(() => {
                setAiError(true);
                toast.error("❌ Gagal mengambil hasil analisis.");
              })
              .finally(() => setAiLoading(false));
          },
          onPending(_result) {
            toast.info("⏳ Pembayaran pending. Selesaikan pembayaran untuk membuka hasil.");
          },
          onError(_result) {
            toast.error("❌ Pembayaran gagal. Silakan coba lagi.");
          },
        });
      } else {
        // Fallback: simulate success if Midtrans not configured
        const transactionId = checkoutRes.data?.transaction_id;
        await api.post(`/payment/simulate-success/${uid}`, { transaction_id: transactionId });
        toast.success("✅ Pembayaran berhasil! Mengambil hasil analisis...");
        setAiPaymentRequired(false);
        setAiLoading(true);
        setAiError(false);
        const res = await api.get(`/participants/analysis/${uid}`, { timeout: 60000 });
        if (res.status === "success") {
          setAiAnalysis(res.data?.analysis || "");
          toast.success("✨ Analisis AI berhasil dibuka!");
        } else if (res.status === "fallback") {
          setAiAnalysis(res.data?.analysis || "");
        } else {
          throw new Error("Invalid response status");
        }
      }
    } catch {
      toast.error("❌ Pembayaran gagal. Coba lagi.");
    } finally {
      setProcessingPayment(false);
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
    return s.score ?? (s.visuo_spatial_fit != null ? Math.round(s.visuo_spatial_fit * 100) : null);
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

  const isPremium = participant?.is_premium || false;

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

      {/* Premium gate banner */}
      {!isPremium && (
        <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800 text-amber-800 dark:text-amber-300 px-4 py-3 rounded-md text-sm flex items-center justify-between gap-3">
          <span className="flex items-center gap-2"><Lock className="h-4 w-4" />Data peserta terkunci. Bayar untuk membuka akses penuh.</span>
          <Button size="sm" asChild>
            <Link to={`/paywall/${uid}`}><CreditCard className="h-3.5 w-3.5 mr-1" />Bayar Rp 10.000</Link>
          </Button>
        </div>
      )}

      {/* Profile card */}
      <ParticipantCard participant={participant} sessions={sessions} />

      {/* Session summary cards */}
      {totalSessions > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <PremiumLock locked={!isPremium}>
            <MiniStat
              icon={<Flame className="h-5 w-5" />}
              label="Best Score"
              value={bestScore != null ? Math.round(bestScore) : "N/A"}
              accent="amber"
            />
          </PremiumLock>
          <PremiumLock locked={!isPremium}>
            <MiniStat
              icon={<Trophy className="h-5 w-5" />}
              label="Total Points"
              value={totalScore != null ? Math.round(totalScore) : "N/A"}
              accent="yellow"
            />
          </PremiumLock>
          <PremiumLock locked={!isPremium}>
            <MiniStat
              icon={<TrendingUp className="h-5 w-5" />}
              label="Max Level"
              value={maxLevel ?? "N/A"}
              accent="green"
            />
          </PremiumLock>
          <PremiumLock locked={!isPremium}>
            <MiniStat
              icon={<Clock className="h-5 w-5" />}
              label="Avg Time"
              value={avgTime ? `${avgTime}s` : "N/A"}
              accent="blue"
            />
          </PremiumLock>
          <MiniStat
            icon={<Zap className="h-5 w-5" />}
            label="Sessions"
            value={totalSessions}
            accent="purple"
          />
        </div>
      )}

      {/* AI Health Consultant Card */}
      <Card className="border-purple-200 dark:border-purple-800 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Health Consultant
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!aiAnalysis && !aiLoading && !aiError && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-4">
                <Sparkles className="h-8 w-8 text-purple-500" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">
                  Dapatkan analisis kesehatan bertenaga AI
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  AI akan menganalisis data performa peserta
                  {sessions?.some((s) => s.emotion || s.face_tracking || s.voice)
                    ? " dan emosi"
                    : ""}{" "}
                  untuk memberikan rekomendasi kesehatan kognitif.
                </p>
              </div>
              <Button
                onClick={handleGenerateAI}
                className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white shadow-md"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate AI Health Analysis
              </Button>
            </div>
          )}

          {aiLoading && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              <p className="text-sm text-muted-foreground">
                AI sedang menganalisis data peserta...
              </p>
              <div className="w-full max-w-md space-y-2">
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
                <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
                <div className="h-3 w-4/6 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
              </div>
            </div>
          )}

          {aiPaymentRequired && !aiLoading && (
            <div className="relative flex flex-col items-center justify-center py-10 gap-4">
              {/* Blurred dummy content */}
              <div className="absolute inset-0 flex flex-col gap-3 px-6 opacity-30 pointer-events-none select-none blur-[2px]">
                <div className="h-4 w-full bg-slate-300 dark:bg-slate-700 rounded" />
                <div className="h-4 w-5/6 bg-slate-300 dark:bg-slate-700 rounded" />
                <div className="h-4 w-4/6 bg-slate-300 dark:bg-slate-700 rounded" />
                <div className="h-4 w-full bg-slate-300 dark:bg-slate-700 rounded" />
                <div className="h-4 w-3/4 bg-slate-300 dark:bg-slate-700 rounded" />
              </div>
              {/* Lock overlay */}
              <div className="relative flex flex-col items-center gap-4 text-center">
                <div className="rounded-full bg-amber-100 dark:bg-amber-900/40 p-5">
                  <Lock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-lg">
                    🔒 Analisis Premium
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                    Hasil lengkap AI Health Consultant hanya tersedia untuk pengguna premium.
                  </p>
                </div>
                <Button
                  onClick={() => setPaymentModalOpen(true)}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg font-semibold px-6"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Buka Rapor AI Premium — Rp 50.000
                </Button>
                <p className="text-xs text-muted-foreground">
                  Pembayaran aman via QRIS • Proses instant
                </p>
              </div>
            </div>
          )}

          {aiError && (
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4">
                <WifiOff className="h-8 w-8 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">
                  AI Consultant sedang offline
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Koneksi ke server AI terputus, namun data profil dan skor Anda
                  tetap aman.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleGenerateAI}
                className="mt-2"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Coba Lagi
              </Button>
            </div>
          )}

          {aiAnalysis && !aiLoading && !aiError && (
            <div className="space-y-4">
              <div className="rounded-lg bg-purple-50 dark:bg-purple-950/50 p-6 prose prose-sm prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {aiAnalysis}
                </ReactMarkdown>
              </div>
              <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                ⚠️ Hasil ini di-generate oleh AI untuk tujuan edukasi dan
                skrining awal, bukan sebagai diagnosis medis pengganti dokter.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
              <PremiumLock locked={!isPremium}>
                <EmotionPieChart
                  data={sessions?.flatMap((s) => s?.emotions ?? s?.emotion_data ?? []).filter(Boolean)?.length > 0
                    ? sessions.flatMap((s) => s?.emotions ?? s?.emotion_data ?? []).filter(Boolean)
                    : null}
                />
              </PremiumLock>
              {!isPremium && (
                <div className="mt-4 rounded-lg border border-dashed border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950 px-4 py-3 text-sm text-amber-800 dark:text-amber-200 text-center">
                  <Lock className="h-4 w-4 inline mr-1 mb-0.5" />
                  Data emosi hanya tersedia untuk pengguna premium.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mock Payment Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-amber-600" />
              Pembayaran OAMP Premium
            </DialogTitle>
            <DialogDescription>
              Scan QRIS berikut untuk menyelesaikan pembayaran sebesar{" "}
              <strong>Rp 50.000</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            {/* QRIS Dummy */}
            <div className="w-48 h-48 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-900">
              <div className="text-center">
                <div className="text-4xl mb-2">📱</div>
                <p className="text-xs text-muted-foreground font-medium">QRIS DUMMY</p>
                <p className="text-[10px] text-muted-foreground mt-1">Gopay • OVO • Dana • Shopeepay</p>
              </div>
            </div>

            <div className="w-full text-center space-y-1">
              <p className="text-sm font-semibold text-foreground">Total: Rp 50.000</p>
              <p className="text-xs text-muted-foreground">
                Pembayaran aman &amp; instant via QRIS
              </p>
            </div>

            <div className="w-full border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
              <Button
                onClick={handlePaymentSuccess}
                disabled={processingPayment}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold"
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Konfirmasi Pembayaran
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setPaymentModalOpen(false)}
                disabled={processingPayment}
                className="w-full"
              >
                Batal
              </Button>
            </div>

            {/* Test simulation button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePaymentSuccess}
              disabled={processingPayment}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ⚙️ [TEST] Simulasikan Bayar Sukses
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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

function PremiumLock({ children, locked }) {
  if (!locked) return children;
  return (
    <div className="relative">
      <div className="opacity-20 pointer-events-none select-none blur-[2px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3 shadow-sm">
          <Lock className="h-5 w-5 text-slate-400" />
        </div>
      </div>
    </div>
  );
}
