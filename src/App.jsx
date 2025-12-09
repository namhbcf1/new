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
      background: '#1e293b',
      borderBottom: '2px solid #334155',
      padding: '12px 0',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '0 20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 22,
            fontWeight: 700,
            color: '#f8fafc'
          }}>
            <span style={{ fontSize: 28 }}>🖥️</span>
            <span>Trường Phát Computer</span>
          </div>
          <div style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <Link
              to="/"
              style={{
                background: location.pathname === '/' ? '#8b5cf6' : '#6b7280',
                color: 'white',
                padding: '10px 20px',
                borderRadius: 6,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 14
              }}
            >
              Xem Cấu Hình
            </Link>
            <Link
              to="/components"
              style={{
                background: location.pathname === '/components' ? '#22c55e' : '#6b7280',
                color: 'white',
                padding: '10px 20px',
                borderRadius: 6,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 14
              }}
            >
              Xem Tất Cả Linh Kiện
            </Link>
            <Link
              to="/config-manager"
              style={{
                background: location.pathname === '/config-manager' ? '#f59e0b' : '#6b7280',
                color: 'white',
                padding: '10px 20px',
                borderRadius: 6,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 14
              }}
            >
              Quản Lý Cấu Hình
            </Link>
            <a
              href="tel:0836768597"
              style={{
                background: '#3b82f6',
                color: 'white',
                padding: '10px 20px',
                borderRadius: 6,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              📞 083.6768.597
            </a>
            <a
              href="https://id.zalo.me/account?continue=http%3A%2F%2Fzalo.me%2F0836768597"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#0084ff',
                color: 'white',
                padding: '10px 20px',
                borderRadius: 6,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 14
              }}
            >
              Zalo
            </a>
            <a
              href="https://www.facebook.com/tpcom.hb"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#1877f2',
                color: 'white',
                padding: '10px 20px',
                borderRadius: 6,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 14
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
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc' }}>
      <Navbar />
      <main style={{ padding: '20px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
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
