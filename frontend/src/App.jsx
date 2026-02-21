import { useState } from 'react'
import UploadPage from './pages/UploadPage'
import ResultsPage from './pages/ResultsPage'
import Header from './components/Header'
import Footer from './components/Footer'

export default function App() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen helix-bg flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!results ? (
          <UploadPage setResults={setResults} loading={loading} setLoading={setLoading} />
        ) : (
          <ResultsPage results={results} onReset={() => setResults(null)} />
        )}
      </main>
      <Footer />
    </div>
  )
}
