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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <Trophy className="h-5 w-5 text-primary" />
            OAMP Dashboard
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === item.to
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
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
