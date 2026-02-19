export const RISK_COLORS = {
  Safe: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'Adjust Dosage': { bg: 'bg-amber-500/15', border: 'border-amber-500/40', text: 'text-amber-400', dot: 'bg-amber-400' },
  Toxic: { bg: 'bg-red-500/15', border: 'border-red-500/40', text: 'text-red-400', dot: 'bg-red-400' },
  Ineffective: { bg: 'bg-slate-500/15', border: 'border-slate-500/40', text: 'text-slate-300', dot: 'bg-slate-400' },
  Unknown: { bg: 'bg-slate-700/30', border: 'border-slate-600/30', text: 'text-slate-500', dot: 'bg-slate-600' },
}

export const SEVERITY_COLORS = {
  none: 'text-emerald-400',
  low: 'text-yellow-400',
  moderate: 'text-amber-400',
  high: 'text-orange-400',
  critical: 'text-red-400',
}

export default function RiskBadge({ risk, size = 'md' }) {
  const colors = RISK_COLORS[risk] || RISK_COLORS.Unknown
  const sizes = {
    sm: 'px-2 py-0.5 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-sm gap-2',
    lg: 'px-4 py-2 text-base gap-2.5',
  }

  return (
    <span className={`inline-flex items-center rounded-full border font-mono font-medium ${colors.bg} ${colors.border} ${colors.text} ${sizes[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} ${risk === 'Toxic' ? 'animate-pulse' : ''}`} />
      {risk}
    </span>
  )
}
