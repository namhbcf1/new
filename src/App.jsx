import { lazy, Suspense } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Monitor, Cpu, Settings, Phone, MessageCircle, Facebook, Loader2 } from 'lucide-react'

// Lazy load pages
const Builder = lazy(() => import('./pages/Builder.jsx'))
const Components = lazy(() => import('./pages/Components.jsx'))
const ConfigManager = lazy(() => import('./pages/ConfigManager.jsx'))

function Navbar() {
  const location = useLocation()

  const navItemClass = (path) => `
    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300
    ${location.pathname === path
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
      : 'text-slate-400 hover:text-white hover:bg-slate-800'}
  `

  const contactClass = `
    flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
    hover:opacity-90 active:scale-95 text-white shadow-md
  `

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Trường Phát
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Computer Store</p>
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-2 p-1 bg-slate-900/50 rounded-xl border border-slate-800">
            <Link to="/" className={navItemClass('/')}>
              <Monitor size={16} /> Build PC
            </Link>
            <Link to="/components" className={navItemClass('/components')}>
              <Cpu size={16} /> Linh Kiện
            </Link>
            <Link to="/config-manager" className={navItemClass('/config-manager')}>
              <Settings size={16} /> Quản Lý
            </Link>
          </nav>

          {/* Contact (Hidden on small mobile) */}
          <div className="flex items-center gap-3">
            <a href="tel:0836768597" className={`${contactClass} bg-emerald-600 shadow-emerald-500/20`}>
              <Phone size={14} /> 083.6768.597
            </a>
            <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>
            <div className="flex gap-2 hidden sm:flex">
              <a
                href="https://zalo.me/0836768597"
                target="_blank"
                rel="noreferrer"
                className={`${contactClass} bg-blue-500 shadow-blue-500/20`}
              >
                <span className="font-bold">Z</span>
              </a>
              <a
                href="https://www.facebook.com/tpcom.hb"
                target="_blank"
                rel="noreferrer"
                className={`${contactClass} bg-[#1877f2] shadow-blue-600/20`}
              >
                <Facebook size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
      <p className="text-sm font-medium animate-pulse">Đang tải dữ liệu...</p>
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30">
      <Navbar />
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Builder />} />
              <Route path="/components" element={<Components />} />
              <Route path="/config-manager" element={<ConfigManager />} />
            </Routes>
          </Suspense>
        </div>
      </main>

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px]" />
      </div>
    </div>
  )
}
