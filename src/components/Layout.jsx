import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useHealthCheck } from "@/hooks/useHealthCheck";
import { useAdminMode } from "@/contexts/AdminModeContext";
import { StatusBanner } from "@/components/StatusBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { UserPlus, Download, LayoutDashboard, Users, Swords, Trophy, Shield, ShieldCheck, ShieldOff } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, emoji: "🏠" },
  { to: "/participants", label: "Peserta", icon: Users, emoji: "👥" },
  { to: "/tournaments", label: "Cup", icon: Trophy, emoji: "🏆" },
  { to: "/register", label: "Daftar", icon: UserPlus, emoji: "✏️" },
  { to: "/duel", label: "Duel", icon: Swords, emoji: "⚔️" },
  { to: "/export", label: "Export", icon: Download, emoji: "📥" },
];

export function Layout() {
  const isOnline = useHealthCheck();
  const location = useLocation();
  const { adminMode, showPinDialog, setShowPinDialog, attemptActivate, deactivate } = useAdminMode();
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  function handlePinSubmit(e) {
    e.preventDefault();
    if (!attemptActivate(pin)) {
      setPinError(true);
      setPin("");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40">
        <div className="bg-white border-b-2 border-[#171717]">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center border-2 border-[#171717] shadow-[3px_3px_0_0_#171717] transition-all group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[2px_2px_0_0_#171717]">
                  <span className="text-xl">🧩</span>
                </div>
                <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-[#10b981] rounded-full border-2 border-[#171717]" />
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight text-foreground" style={{ fontFamily: '"Fredoka", sans-serif' }}>
                  OAMP
                </span>
                <span className="text-muted-foreground text-sm font-bold ml-1.5">
                  Block Design Test
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <nav className="flex items-center gap-1 bg-muted p-1.5 rounded-2xl border-2 border-[#171717] shadow-[3px_3px_0_0_#171717]">
                {navItems.map((item) => {
                  const isActive =
                    item.to === "/"
                      ? location.pathname === "/"
                      : location.pathname.startsWith(item.to);

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all",
                        isActive
                          ? "bg-white text-foreground border-2 border-[#171717] shadow-[3px_3px_0_0_#171717]"
                          : "text-muted-foreground hover:text-foreground hover:bg-white hover:border-2 hover:border-[#171717] hover:shadow-[3px_3px_0_0_#171717]"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Admin mode toggle */}
              {adminMode ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5"
                  onClick={deactivate}
                  title="Admin mode aktif — klik untuk matikan"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    setShowPinDialog(true);
                    setPinError(false);
                    setPin("");
                  }}
                  title="Aktifkan admin mode"
                >
                  <ShieldOff className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pt-1 pb-1">
          <StatusBanner isOnline={isOnline} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="animate-slide-up">
          <Outlet />
        </div>
      </main>

      {/* PIN Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              Admin Mode
            </DialogTitle>
            <DialogDescription>
              Masukkan PIN untuk mengaktifkan tombol admin.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePinSubmit} className="space-y-3 pt-2">
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ""));
                setPinError(false);
              }}
              className={cn("text-center text-lg tracking-[0.5em]", pinError && "border-red-300 focus-visible:ring-red-200")}
              autoFocus
            />
            {pinError && (
              <p className="text-xs text-red-500 text-center">PIN salah</p>
            )}
            <Button type="submit" className="w-full">Buka</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
