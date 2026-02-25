import { Activity, Shield } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header
      className="border-b backdrop-blur-sm sticky top-0 z-50"
      style={{
        backgroundColor: "var(--header-bg)",
        borderBottomColor: "var(--border-color)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-bio-500/20 border border-bio-500/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-bio-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-bio-400 border-2 border-slate-950">
                <div className="w-full h-full rounded-full bg-bio-400 animate-ping opacity-75" />
              </div>
            </div>
            <div>
              <span
                className="font-display font-bold text-xl tracking-tight"
                style={{ color: "var(--header-text)" }}
              >
                Pharma<span className="text-bio-400">Guard</span>
              </span>
              <div
                className="text-[10px] font-mono uppercase tracking-widest -mt-1"
                style={{ color: "var(--muted)" }}
              >
                Pharmacogenomic Risk System
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Activity className="w-4 h-4 text-bio-500 animate-pulse" />
            <span
              className="text-xs font-mono"
              style={{ color: "var(--muted)" }}
            >
              SYSTEM ACTIVE
            </span>
            <div
              className="w-1.5 h-1.5 rounded-full ml-1 animate-pulse"
              style={{ backgroundColor: "var(--bio-400)" }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
