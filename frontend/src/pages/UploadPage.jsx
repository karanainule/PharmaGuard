import { useState, useRef, useCallback } from 'react'
import axios from 'axios'
import { Upload, FileText, X, Dna, AlertCircle, Loader2, FlaskConical, ChevronRight } from 'lucide-react'

const SUPPORTED_DRUGS = ['CODEINE', 'WARFARIN', 'CLOPIDOGREL', 'SIMVASTATIN', 'AZATHIOPRINE', 'FLUOROURACIL']

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function UploadPage({ setResults, loading, setLoading }) {
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [selectedDrugs, setSelectedDrugs] = useState([])
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef(null)

  const handleFile = useCallback((f) => {
    setError('')
    if (!f) return
    if (!f.name.endsWith('.vcf')) {
      setError('Only .vcf files are accepted')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB')
      return
    }
    setFile(f)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  const toggleDrug = (drug) => {
    setSelectedDrugs(prev =>
      prev.includes(drug) ? prev.filter(d => d !== drug) : [...prev, drug]
    )
  }

  const handleSubmit = async () => {
    if (!file) { setError('Please upload a VCF file'); return }
    if (selectedDrugs.length === 0) { setError('Please select at least one drug'); return }

    setLoading(true)
    setError('')
    setProgress(0)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('drugs', selectedDrugs.join(','))

    try {
      const res = await axios.post(`${API_URL}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded * 60) / e.total))
        }
      })
      setProgress(100)
      setResults(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please check your file and try again.')
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  const handleDemo = async () => {
    if (selectedDrugs.length === 0) { setError('Please select at least one drug for demo'); return }
    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('drugs', selectedDrugs.join(','))

    try {
      const res = await axios.post(`${API_URL}/analyze/demo`, formData)
      setResults(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Demo failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fadeIn">
      {/* Hero */}
      <div className="text-center mb-12 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bio-500/10 border border-bio-500/20 text-bio-400 text-xs font-mono mb-6 uppercase tracking-wider">
          <Dna className="w-3.5 h-3.5" />
          AI-Powered Genomic Analysis
        </div>
        <h1 className="font-display text-5xl font-bold text-white mb-4 tracking-tight">
          Predict Drug-Gene<br />
          <span className="text-bio-400">Interactions</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
          Upload a patient VCF file to get personalized pharmacogenomic risk predictions powered by AI clinical reasoning.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">

        {/* Upload Zone */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded bg-bio-500/20 flex items-center justify-center">
              <span className="text-bio-400 text-xs font-mono font-bold">01</span>
            </div>
            <h2 className="font-display text-sm font-semibold text-slate-300 uppercase tracking-wider">Upload VCF File</h2>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer glow-border
              ${dragOver ? 'border-bio-400 bg-bio-500/10' : 'border-bio-900 hover:border-bio-700 bg-slate-900/50'}
              ${file ? 'border-bio-600 bg-bio-500/5 cursor-default' : ''}`}
          >
            {!file ? (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-bio-500/10 border border-bio-500/20 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6 text-bio-400" />
                </div>
                <div>
                  <p className="text-slate-300 font-medium">Drop your VCF file here</p>
                  <p className="text-slate-500 text-sm mt-1">or click to browse</p>
                </div>
                <p className="text-xs font-mono text-slate-600">.vcf format • max 5MB</p>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-bio-500/15 border border-bio-500/30 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-bio-400" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{file.name}</p>
                  <p className="text-slate-500 text-xs font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null) }}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {loading && progress > 0 && (
              <div className="mt-4">
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-bio-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs font-mono text-bio-500 mt-1">{progress}% uploaded</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".vcf"
            onChange={(e) => handleFile(e.target.files[0])}
            className="hidden"
          />

          {/* Demo hint */}
          <p className="text-xs text-slate-600 text-center">
            No VCF file? Try the{' '}
            <button onClick={handleDemo} disabled={loading} className="text-bio-500 hover:text-bio-400 underline">
              demo mode
            </button>
            {' '}with synthetic patient data
          </p>
        </div>

        {/* Drug Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded bg-bio-500/20 flex items-center justify-center">
              <span className="text-bio-400 text-xs font-mono font-bold">02</span>
            </div>
            <h2 className="font-display text-sm font-semibold text-slate-300 uppercase tracking-wider">Select Drugs to Analyze</h2>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {SUPPORTED_DRUGS.map(drug => {
              const selected = selectedDrugs.includes(drug)
              const DRUG_GENES = {
                CODEINE: 'CYP2D6', WARFARIN: 'CYP2C9', CLOPIDOGREL: 'CYP2C19',
                SIMVASTATIN: 'SLCO1B1', AZATHIOPRINE: 'TPMT', FLUOROURACIL: 'DPYD'
              }
              return (
                <button
                  key={drug}
                  onClick={() => toggleDrug(drug)}
                  className={`relative p-3 rounded-lg border text-left transition-all ${
                    selected
                      ? 'bg-bio-500/15 border-bio-500/50 text-white'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-bio-800'
                  }`}
                >
                  {selected && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-bio-500 flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">✓</span>
                    </div>
                  )}
                  <p className="font-display text-sm font-semibold">{drug}</p>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">{DRUG_GENES[drug]}</p>
                </button>
              )
            })}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setSelectedDrugs(SUPPORTED_DRUGS)}
              className="text-xs text-bio-500 hover:text-bio-400 font-mono"
            >
              Select all
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => setSelectedDrugs([])}
              className="text-xs text-slate-500 hover:text-slate-400 font-mono"
            >
              Clear
            </button>
            <span className="ml-auto text-xs font-mono text-slate-600">
              {selectedDrugs.length}/{SUPPORTED_DRUGS.length} selected
            </span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-4xl mx-auto mt-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="max-w-4xl mx-auto mt-6 flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={loading || !file || selectedDrugs.length === 0}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-bio-500 hover:bg-bio-400 disabled:bg-bio-900 disabled:text-bio-800 text-white font-display font-semibold text-sm transition-all disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing Genome...
            </>
          ) : (
            <>
              <FlaskConical className="w-4 h-4" />
              Run Pharmacogenomic Analysis
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>

        <button
          onClick={handleDemo}
          disabled={loading || selectedDrugs.length === 0}
          className="px-5 py-3.5 rounded-xl border border-bio-900 hover:border-bio-700 text-slate-400 hover:text-slate-300 font-display text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Demo Mode
        </button>
      </div>

      {/* Info strip */}
      <div className="max-w-4xl mx-auto mt-8 grid grid-cols-3 gap-4">
        {[
          { label: 'Genes Analyzed', value: '6', sub: 'CPIC Level A/B' },
          { label: 'Drugs Supported', value: '6', sub: 'High-impact' },
          { label: 'AI Explanations', value: 'LLM', sub: 'GPT-4 / Gemini' },
        ].map(item => (
          <div key={item.label} className="text-center py-3 px-4 rounded-lg bg-slate-900/40 border border-slate-800/50">
            <div className="font-display text-2xl font-bold text-bio-400">{item.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{item.label}</div>
            <div className="text-[10px] font-mono text-slate-600">{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
