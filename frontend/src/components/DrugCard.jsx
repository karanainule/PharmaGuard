import { useState } from 'react'
import { ChevronDown, ChevronUp, Dna, Brain, Pill, Table } from 'lucide-react'
import RiskBadge, { SEVERITY_COLORS } from './RiskBadge'
import RiskGauge from './RiskGauge'

export default function DrugCard({ result, index }) {
  const [expanded, setExpanded] = useState(index === 0)
  const { drug, risk_assessment, pharmacogenomic_profile, clinical_recommendation, llm_generated_explanation, quality_metrics } = result

  const severityColor = SEVERITY_COLORS[risk_assessment.severity] || 'text-slate-400'

  return (
    <div className={`rounded-xl border bg-slate-900/60 backdrop-blur-sm transition-all glow-border ${
      risk_assessment.risk_label === 'Toxic' ? 'border-red-800/50' :
      risk_assessment.risk_label === 'Safe' ? 'border-emerald-900/50' :
      'border-slate-800/60'
    }`}>
      {/* Card header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full px-5 py-4 flex items-center gap-4 text-left"
      >
        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
          <Pill className="w-5 h-5 text-bio-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-bold text-white">{drug}</h3>
            <span className="text-slate-600 text-xs font-mono">→</span>
            <span className="text-sm font-mono text-bio-400">{pharmacogenomic_profile.primary_gene}</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs font-mono text-slate-500">{pharmacogenomic_profile.diplotype}</span>
            <span className="text-slate-700">·</span>
            <span className="text-xs text-slate-400">{pharmacogenomic_profile.phenotype}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <RiskBadge risk={risk_assessment.risk_label} size="sm" />
          <span className={`text-xs font-mono hidden sm:block ${severityColor}`}>
            {risk_assessment.severity !== 'none' ? risk_assessment.severity.toUpperCase() : ''}
          </span>
          <span className="text-xs font-mono text-slate-600">
            {Math.round(risk_assessment.confidence_score * 100)}%
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-800/60 pt-4 space-y-5 animate-slideUp">
          
          {/* Top row: gauge + gene profile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Risk gauge */}
            <div className="flex items-center gap-5 p-4 rounded-lg bg-slate-800/50 border border-slate-700/40">
              <RiskGauge risk={risk_assessment.risk_label} confidence={risk_assessment.confidence_score} />
              <div className="space-y-2">
                <div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Risk Label</div>
                  <RiskBadge risk={risk_assessment.risk_label} size="md" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Confidence</div>
                  <div className="font-display font-bold text-white">
                    {(risk_assessment.confidence_score * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Gene profile */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/40 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Dna className="w-3.5 h-3.5 text-bio-400" />
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Genomic Profile</span>
              </div>
              {[
                { label: 'Gene', value: pharmacogenomic_profile.primary_gene },
                { label: 'Diplotype', value: pharmacogenomic_profile.diplotype },
                { label: 'Phenotype', value: pharmacogenomic_profile.phenotype },
                { label: 'Variants', value: pharmacogenomic_profile.detected_variants.length || 0 },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className="text-xs font-mono text-slate-200">{value}</span>
                </div>
              ))}
              {!quality_metrics.vcf_parsing_success && (
                <div className="text-[10px] font-mono text-amber-500/80 pt-1">
                  ⚠ Demo/estimated profile
                </div>
              )}
            </div>
          </div>

          {/* Clinical recommendation */}
          <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-bio-400" />
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Clinical Recommendation</span>
            </div>
            <p className="text-sm text-slate-200 font-medium mb-2">{clinical_recommendation.action}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{clinical_recommendation.notes}</p>
          </div>

          {/* LLM Explanation */}
          {llm_generated_explanation && (
            <div className="p-4 rounded-lg bg-bio-950/40 border border-bio-900/40 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-3.5 h-3.5 text-bio-400" />
                <span className="text-[10px] font-mono text-bio-400 uppercase tracking-wider">AI Clinical Explanation</span>
              </div>
              
              {[
                { key: 'summary', label: 'Summary' },
                { key: 'mechanism', label: 'Mechanism' },
                { key: 'clinical_impact', label: 'Clinical Impact' },
              ].map(({ key, label }) => (
                llm_generated_explanation[key] && (
                  <div key={key}>
                    <div className="text-[10px] font-mono text-bio-700 uppercase tracking-wider mb-1">{label}</div>
                    <p className="text-xs text-slate-300 leading-relaxed">{llm_generated_explanation[key]}</p>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Variant table */}
          {pharmacogenomic_profile.detected_variants.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Table className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Detected Variants</span>
              </div>
              <div className="rounded-lg border border-slate-800 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-800/70">
                      {['ID', 'Gene', 'Chr:Pos', 'Ref', 'Alt', 'Star'].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-mono text-slate-500 text-[10px] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pharmacogenomic_profile.detected_variants.map((v, i) => (
                      <tr key={i} className="border-t border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                        <td className="px-3 py-2 font-mono text-bio-400">{v.id || '-'}</td>
                        <td className="px-3 py-2 font-mono text-slate-300">{v.gene || '-'}</td>
                        <td className="px-3 py-2 font-mono text-slate-400">{v.chrom}:{v.pos}</td>
                        <td className="px-3 py-2 font-mono text-slate-400">{v.ref}</td>
                        <td className="px-3 py-2 font-mono text-amber-400">{v.alt}</td>
                        <td className="px-3 py-2 font-mono text-slate-500">{v.star_allele || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
