import { useState } from 'react'
import { ArrowLeft, Download, Copy, Check, User, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import DrugCard from '../components/DrugCard'

export default function ResultsPage({ results, onReset }) {
  const [copied, setCopied] = useState(false)

  // Normalize: single result or multi
  const isSingle = !results.results
  const allResults = isSingle ? [results] : results.results
  const patientId = results.patient_id
  const timestamp = results.timestamp
  const overallSummary = results.overall_risk_summary || ''

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(results, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pharmaguard_${patientId}_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Overall risk level for banner
  const hasToxi = allResults.some(r => r.risk_assessment.risk_label === 'Toxic')
  const hasModerate = allResults.some(r => ['Adjust Dosage', 'Ineffective'].includes(r.risk_assessment.risk_label))
  const allSafe = allResults.every(r => r.risk_assessment.risk_label === 'Safe')

  const bannerConfig = hasToxi
    ? { bg: 'bg-red-950/60 border-red-800/50', icon: AlertTriangle, iconColor: 'text-red-400', textColor: 'text-red-200' }
    : hasModerate
    ? { bg: 'bg-amber-950/60 border-amber-800/50', icon: Info, iconColor: 'text-amber-400', textColor: 'text-amber-200' }
    : { bg: 'bg-emerald-950/60 border-emerald-800/50', icon: CheckCircle, iconColor: 'text-emerald-400', textColor: 'text-emerald-200' }

  const BannerIcon = bannerConfig.icon

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto">
      
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          New Analysis
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-mono transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-bio-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bio-500/20 border border-bio-500/40 text-bio-400 hover:text-bio-300 text-xs font-mono transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Download Report
          </button>
        </div>
      </div>

      {/* Patient summary card */}
      <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 glow-border mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-bio-500/15 border border-bio-500/25 flex items-center justify-center">
            <User className="w-5 h-5 text-bio-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="font-display font-bold text-white text-lg">{patientId}</span>
              <span className="text-xs font-mono text-slate-600 bg-slate-800 px-2 py-0.5 rounded">
                {allResults.length} drug{allResults.length > 1 ? 's' : ''} analyzed
              </span>
            </div>
            <div className="text-xs font-mono text-slate-500 mt-0.5">
              {new Date(timestamp).toLocaleString()} · VCF Analysis Complete
            </div>
          </div>
          
          <div className="ml-auto flex gap-2">
            {allResults.map(r => (
              <div
                key={r.drug}
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  r.risk_assessment.risk_label === 'Toxic' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                  r.risk_assessment.risk_label === 'Safe' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                  'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}
              >
                {r.drug.slice(0, 4)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overall summary banner */}
      {overallSummary && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border mb-5 ${bannerConfig.bg}`}>
          <BannerIcon className={`w-5 h-5 flex-shrink-0 ${bannerConfig.iconColor}`} />
          <p className={`text-sm ${bannerConfig.textColor}`}>{overallSummary}</p>
        </div>
      )}

      {/* Drug results */}
      <div className="space-y-3">
        <h2 className="font-display text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
          Drug-Gene Interaction Results
        </h2>
        {allResults.map((result, i) => (
          <DrugCard key={result.drug} result={result} index={i} />
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-8 p-4 rounded-lg bg-slate-900/40 border border-slate-800/40 text-center">
        <p className="text-xs text-slate-600 leading-relaxed">
          PharmaGuard is a clinical decision support tool. Results should be interpreted by qualified healthcare professionals.
          Pharmacogenomic data is one factor among many in prescribing decisions.
        </p>
      </div>
    </div>
  )
}
