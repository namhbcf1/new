import { lazy, Suspense } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'

// Lazy load pages for code splitting
const Builder = lazy(() => import('./pages/Builder.jsx'))
const Components = lazy(() => import('./pages/Components.jsx'))
const ConfigManager = lazy(() => import('./pages/ConfigManager.jsx'))

function Navbar() {
  const location = useLocation()
  return (
    <header style={{
      background: 'rgba(30,41,59,0.98)',
      borderBottom: '1px solid rgba(79,172,254,0.3)',
      padding: '16px 0',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 16px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 24,
            fontWeight: 700
          }}>
            <span style={{ fontSize: 32 }}>🖥️</span>
            <span>Trường Phát Computer</span>
          </div>
          <div style={{
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <Link
              to="/"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              🖥️ BUILD PC
            </Link>
            <Link
              to="/components"
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              🔧 Xem Tất Cả Linh Kiện
            </Link>
            <Link
              to="/config-manager"
              style={{
                background: 'linear-gradient(135deg, #64748b, #0ea5e9)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              ⚙️ Đổi Cấu Hình (Admin)
            </Link>
            <a
              href="tel:0836768597"
              style={{
                background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              📞 0836.768.597
        </a>
            <a
              href="https://zalo.me/0836768597"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#0084ff',
                color: 'white',
                padding: '12px 24px',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Zalo
            </a>
            <a
              href="https://www.facebook.com/tpcom.hb/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#1877f2',
                color: 'white',
                padding: '12px 24px',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Facebook
        </a>
      </div>
        </div>
      </div>
    </header>
  )
}

function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      fontSize: 24,
      color: '#4facfe'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
        <div>Đang tải...</div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a,#1e293b)', color: '#f8fafc' }}>
      <Navbar />
      <main style={{ padding: '20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Builder />} />
              <Route path="/components" element={<Components />} />
              <Route path="/config-manager" element={<ConfigManager />} />
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  )
}
