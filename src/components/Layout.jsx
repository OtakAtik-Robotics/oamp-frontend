import { Link, Outlet, useLocation } from "react-router-dom";
import { useHealthCheck } from "@/hooks/useHealthCheck";
import { StatusBanner } from "@/components/StatusBanner";
import { Trophy, UserPlus, Download, LayoutDashboard, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/participants", label: "Participants", icon: Users },
  { to: "/register", label: "Register", icon: UserPlus },
  { to: "/export", label: "Export", icon: Download },
];

export function Layout() {
  const isOnline = useHealthCheck();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-bold text-lg tracking-tight"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-sm">
              <Trophy className="h-4.5 w-4.5 text-white" />
            </div>
            <span>
              OAMP <span className="text-muted-foreground font-normal text-base">Dashboard</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1">
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
                    "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-2">
          <StatusBanner isOnline={isOnline} />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
