export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-slate-800 bg-slate-950/80 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm">
        © {year} PharmaGuard. All rights reserved.
      </div>
    </footer>
  )
}
