import { Link, Outlet, useLocation } from "react-router-dom";
import { useHealthCheck } from "@/hooks/useHealthCheck";
import { StatusBanner } from "@/components/StatusBanner";
import { UserPlus, Download, LayoutDashboard, Users, Swords, Trophy } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40">
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-sm transition-all group-hover:scale-105 duration-300">
                  <span className="text-xl">🧩</span>
                </div>
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-slate-900" style={{ fontFamily: '"Fredoka", sans-serif' }}>
                  OAMP
                </span>
                <span className="text-slate-500 text-sm font-medium ml-1.5">
                  Block Design Test
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-0.5 bg-slate-100/80 p-1 rounded-2xl backdrop-blur">
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
                      "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                      isActive
                        ? "bg-white text-foreground shadow-sm scale-[1.02]"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/60"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
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


    </div>
  );
}
