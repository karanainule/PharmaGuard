import { Activity, Shield } from 'lucide-react'

export default function Header() {
  return (
    <header className="border-b border-bio-900/50 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
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
              <span className="font-display font-bold text-xl tracking-tight text-white">
                Pharma<span className="text-bio-400">Guard</span>
              </span>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest -mt-1">
                Pharmacogenomic Risk System
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-bio-500 animate-pulse" />
            <span className="text-xs font-mono text-slate-400">SYSTEM ACTIVE</span>
            <div className="w-1.5 h-1.5 rounded-full bg-bio-400 ml-1 animate-pulse" />
          </div>
        </div>
      </div>
    </header>
  )
}
