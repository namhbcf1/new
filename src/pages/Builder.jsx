import { useMemo, useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import html2canvas from 'html2canvas'
import { getCatalogs, formatPrice as fmt } from '../data/components'
import { generateSmartConfig, getCompatibleMainboards, getCompatibleRAMs, totalPrice } from '../lib/configGen'

// Toggle D1 usage. Set to true to fetch inventory/configs from Cloudflare D1
const USE_D1 = true
const API_URL = 'https://tp-pc-builder-api.bangachieu2.workers.dev'

const ALL_GAMES = [
  { id: 'valorant', name: 'Valorant', image: '/images/valorant.jpg' },
  { id: 'csgo', name: 'CS:GO', image: '/images/csgo.jpg' },
  { id: 'pubg', name: 'PUBG', image: '/images/pubg.jpg' },
  { id: 'lol', name: 'League of Legends', image: '/images/lol.jpg' },
  { id: 'gta-v', name: 'GTA V', image: '/images/gta-v.jpg' },
  { id: 'elden-ring', name: 'Elden Ring', image: '/images/elden-ring.jpg' },
  { id: 'naraka', name: 'Naraka Bladepoint', image: '/images/naraka.jpg' },
  { id: 'genshin', name: 'Genshin Impact', image: '/images/genshin.jpg' },
  { id: 'fo4', name: 'Fallout 4', image: '/images/fo4.jpg' },
  { id: 'black-myth-wukong', name: 'Black Myth: Wukong', image: '/images/black-myth-wukong.jpg' },
  { id: 'audition', name: 'Audition', image: '/images/audition.jpg' },
  { id: 'battle-teams-2', name: 'Battle Teams 2', image: '/images/battle-teams-2.jpg' },
  { id: 'crossfire', name: 'CrossFire', image: '/images/crossfire.jpg' },
  { id: 'delta-force', name: 'Delta Force', image: '/images/delta-force.jpg' },
  { id: 'mu-origin', name: 'MU Origin', image: '/images/mu-origin.jpg' },
]

const COMPONENT_LABELS = {
  cpu: 'CPU',
  mainboard: 'Mainboard',
  vga: 'Card Đồ Họa',
  ram: 'RAM',
  ssd: 'SSD',
  psu: 'Nguồn',
  case: 'Case',
  cpuCooler: 'Tản Nhiệt CPU',
}

const formatPrice = fmt

export default function Builder() {
  const [step, setStep] = useState(1)
  const [budget, setBudget] = useState(15)
  const [cpuType, setCpuType] = useState(null)
  const [game, setGame] = useState(null)
  const [gameSearch, setGameSearch] = useState('')
  const [config, setConfig] = useState(null)
  const [allConfigs, setAllConfigs] = useState(null)
  const [inventory, setInventory] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [customPrices, setCustomPrices] = useState({}) // Store custom prices/quantities/warranties
  const catalogs = useMemo(()=> getCatalogs(), [config])

  // Filtered games based on search
  const filteredGames = useMemo(() => {
    if (!gameSearch) return ALL_GAMES
    return ALL_GAMES.filter(g =>
      g.name.toLowerCase().includes(gameSearch.toLowerCase())
    )
  }, [gameSearch])

  const canStep2 = useMemo(() => !!budget, [budget])
  const canStep3 = useMemo(() => !!budget && !!cpuType, [budget, cpuType])
  const canStep4 = useMemo(() => !!budget && !!cpuType && !!game, [budget, cpuType, game])

  // Fetch configs and inventory from D1 (disabled when USE_D1 = false)
  useEffect(() => {
    if (!USE_D1) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    Promise.all([
      fetch(`${API_URL}/configs`).then(r => r.json()),
      fetch(`${API_URL}/inventory`).then(r => r.json())
    ]).then(([configs, inv]) => {
      setAllConfigs(configs)
      setInventory(inv)
      setIsLoading(false)
    }).catch(err => {
      console.error('Failed to load data:', err)
      setIsLoading(false)
      Swal.fire({ title: 'Lỗi', text: 'Không thể tải dữ liệu từ server', icon: 'error' })
    })
  }, [])

  function computeConfig(gameId = game) {
    // Find config from D1 based on cpuType, game, and budget
    const budgetKey = `${budget}M`
    // Don't convert game key - D1 uses the same format as game IDs (with dashes)
    const gameKey = gameId

    if (allConfigs && allConfigs[cpuType]) {
      if (allConfigs[cpuType][gameKey]) {
        if (allConfigs[cpuType][gameKey][budgetKey]) {
          const d1Config = allConfigs[cpuType][gameKey][budgetKey]
          setConfig(d1Config)
          return
        }
      } else {
        // Try without underscore conversion
        const gameKeyNoConvert = game
        if (allConfigs[cpuType][gameKeyNoConvert]) {
          if (allConfigs[cpuType][gameKeyNoConvert][budgetKey]) {
            const d1Config = allConfigs[cpuType][gameKeyNoConvert][budgetKey]
            setConfig(d1Config)
            return
          }
        }
      }
    }

    const cfg = generateSmartConfig({ budgetM: budget, cpuType, game: gameId })
    if (cfg) {
      setConfig(cfg)
    } else {
      Swal.fire({ title: 'Lỗi', text: 'Không thể tạo cấu hình phù hợp. Vui lòng thử lại hoặc chọn game khác.', icon: 'error' })
    }
  }

  // Heuristics to enrich D1 items (which may lack socket/DDR metadata)
  function inferSocketFromName(name='') {
    if (/\bAM5\b/i.test(name)) return 'AM5'
    if (/\bAM4\b/i.test(name)) return 'AM4'
    const lga = name.match(/LGA\s*(\d{3,4})/i)
    if (lga) return `LGA${lga[1]}`
    return null
  }
  function inferDDRFromName(name='') {
    if (/\bDDR5\b/i.test(name)) return 'DDR5'
    if (/\bDDR4\b/i.test(name)) return 'DDR4'
    return null
  }

  function normalizeSocket(value) {
    if (!value) return null
    const v = String(value).toUpperCase()
    if (/AM\s*5/.test(v)) return 'AM5'
    if (/AM\s*4/.test(v)) return 'AM4'
    const lga = v.match(/LGA\s*(\d{3,4})/)
    if (lga) return `LGA${lga[1]}`
    return null
  }

  function normalizeDDR(value) {
    if (!value) return null
    const v = String(value).toUpperCase()
    if (/DDR5/.test(v)) return 'DDR5'
    if (/DDR4/.test(v)) return 'DDR4'
    if (/DDR3/.test(v)) return 'DDR3'
    return null
  }
  function inferBoardSocketByChipset(name='') {
    const n = name.toUpperCase()
    const has = (re) => re.test(n)
    // Intel LGA1700 chipsets
    if (has(/\b(H610(M)?|B660(M)?|B760(M)?|H770|Z690|Z790)\b/)) return 'LGA1700'
    // Intel LGA1200 chipsets
    if (has(/\b(H410(M)?|B460(M)?|Z490|H510(M)?|B560(M)?|Z590)\b/)) return 'LGA1200'
    // Intel LGA1151/1151-v2 chipsets
    if (has(/\b(H310(M)?|B360(M)?|B365(M)?|Z370|Z390)\b/)) return 'LGA1151'
    if (has(/\b(H110(M)?|B150(M)?|B250(M)?|Z270)\b/)) return 'LGA1151'
    // Intel LGA1150/1155 legacy
    if (has(/\b(H81(M)?|B85(M)?|Z87|Z97)\b/)) return 'LGA1150'
    // H61 but NOT H610; allow H61M variants
    if (has(/\bH61(?!0)\w*\b/) || has(/\bB75(M)?\b/) || has(/\bZ77\b/)) return 'LGA1155'
    // AMD AM5/AM4 chipsets
    if (has(/\b(B650(M)?|X670(E)?|A620(M)?)\b/)) return 'AM5'
    if (has(/\b(B550(M)?|X570|A520(M)?|B450(M)?|X470|A320(M)?)\b/)) return 'AM4'
    return null
  }

  function inferCpuSocketFromName(name='') {
    const up = name.toUpperCase()
    // Xeon E3 mapping by generation
    const xeonE3 = up.match(/XEON\s*E3[-\s]?(\d{4}).*?V\s*([1-6])/)
    if (xeonE3) {
      const gen = parseInt(xeonE3[2], 10)
      if (gen === 1 || gen === 2) return 'LGA1155' // Sandy/Ivy
      if (gen === 3 || gen === 4) return 'LGA1150' // Haswell/Broadwell
      if (gen === 5 || gen === 6) return 'LGA1151' // Skylake/Kaby
    }
    // Intel Core mapping by model number
    const core = up.match(/INTEL\s*CORE\s*i[3-9][-\s]?([0-9]{4,5})/)
    if (core) {
      const model = parseInt(core[1], 10)
      if (model >= 14000) return 'LGA1700'
      if (model >= 12000) return 'LGA1700'
      if (model >= 10000) return 'LGA1200'
      if (model >= 6000) return 'LGA1151'
      if (model >= 4000) return 'LGA1150'
      if (model >= 2000) return 'LGA1155'
    }
    // Intel Core i-12400F/13400F/14600KF -> LGA1700
    if (/\b1(2|3|4)\d{3}\w*/i.test(name)) return 'LGA1700'
    // 10th/11th gen -> LGA1200
    if (/\b(10|11)\d{3}\w*/i.test(name)) return 'LGA1200'
    // 6th/7th/8th/9th gen -> LGA1151 (v1/v2)
    if (/\b(6|7|8|9)\d{3}\w*/i.test(name)) return 'LGA1151'
    // Older clues sometimes mention socket directly
    const s = inferSocketFromName(name)
    if (s) return s
    // AMD 7xxx -> AM5, 5xxx -> AM4
    if (/\b7\d{3}\w*/i.test(name) && /Ryzen\s*\d/i.test(name)) return 'AM5'
    if (/\b5\d{3}\w*/i.test(name) && /Ryzen\s*\d/i.test(name)) return 'AM4'
    if (/\b3\d{3}\w*/i.test(name) && /Ryzen\s*\d/i.test(name)) return 'AM4'
    if (/\b1\d{3}\w*/i.test(name) && /Ryzen\s*\d/i.test(name)) return 'AM4'
    return null
  }

  function getCpuMeta(id) {
    const local = catalogs.cpu?.[id]
    const inv = inventory?.cpu?.[id]
    if (inv && inv.name) {
      const socket = inv?.socket || inferSocketFromName(inv.name) || inferCpuSocketFromName(inv.name) || local?.socket
      const brand = /AMD/i.test(inv.name) ? 'amd' : (/INTEL|XEON|CORE/i.test(inv.name) ? 'intel' : (socket && socket.startsWith('LGA') ? 'intel' : (socket && socket.startsWith('AM') ? 'amd' : undefined)))
      // Prioritize inventory DDR data over local data
      let ddr = inv?.ddr || inv?.ram_support || local?.ddr
      if (!ddr) {
        if (/XEON\s*E3[^V]*V\s*[1-2]/i.test(inv.name)) ddr = 'DDR3'
        if (/XEON\s*E3[^V]*V\s*[3-4]/i.test(inv.name)) ddr = 'DDR3' // Haswell/Broadwell use DDR3/3L
        if (/XEON\s*E3[^V]*V\s*[5-6]/i.test(inv.name)) ddr = 'DDR4'
        if (/\b1(2|3|4)\d{3}/.test(inv.name)) ddr = 'DDR4' // Alder/Raptor minimal constraint
        if (/\b(10|11)\d{3}/.test(inv.name)) ddr = 'DDR4'
        if (/\b(6|7|8|9)\d{3}/.test(inv.name)) ddr = 'DDR4'
        if (/Ryzen\s*7\d{3}/i.test(inv.name)) ddr = 'DDR5'
        if (/Ryzen\s*5\d{3}/i.test(inv.name)) ddr = 'DDR4'
        if (/Ryzen\s*(1|2|3)\d{3}/i.test(inv.name)) ddr = 'DDR4'
      }
      return { socket, ddr, brand }
    }
    return local || {}
  }
  function getMainboardsForCpu(cpuId) {
    const meta = getCpuMeta(cpuId)
    const list = []
    if (inventory?.mainboard) {
      Object.values(inventory.mainboard).forEach(item => {
        // Use actual socket field if available, otherwise infer from name
        let sock = normalizeSocket(item.socket) || normalizeSocket((item.sockets && item.sockets[0])) || normalizeSocket(item.name) || inferBoardSocketByChipset(item.name)
        // Use actual memoryType field if available, otherwise infer from name
        const ddr = normalizeDDR(item.memoryType || item.ddr) || inferDDRFromName(item.name)

        // If CPU has a socket, strictly require board socket to be detected and equal
        if (meta.socket) {
          const cpuSock = normalizeSocket(meta.socket) || meta.socket
          if (!sock) return // cannot determine board socket → skip to avoid sai
          if (sock !== cpuSock) return
        }
        // Brand separation (avoid mixing Intel vs AMD boards)
        if (meta.brand) {
          const boardBrand = sock && sock.startsWith('AM') ? 'amd' : (sock && sock.startsWith('LGA') ? 'intel' : undefined)
          if (boardBrand && boardBrand !== meta.brand) return
        }
        const cpuDdr = normalizeDDR(meta.ddr) || meta.ddr
        if (!cpuDdr || !ddr || ddr === cpuDdr) {
          list.push({ id: item.id, name: item.name, price: item.price })
        }
      })
    }
    if (list.length > 0) return list
    // fallback to local compatible
    return getCompatibleMainboards(cpuId).map(m => ({ id: m.id, name: m.name, price: m.price }))
  }
  function getRamsForMainboard(mbId) {
    const invMb = inventory?.mainboard?.[mbId]
    const localMb = catalogs.mainboard?.[mbId]
    const ddr = normalizeDDR(invMb?.memoryType || invMb?.ddr) || (invMb?.name && inferDDRFromName(invMb.name)) || localMb?.ddr
    const list = []
    if (inventory?.ram && ddr) {
      Object.values(inventory.ram).forEach(item => {
        const rddr = normalizeDDR(item.type || item.ddr) || inferDDRFromName(item.name)
        if (rddr === ddr) list.push({ id: item.id, name: item.name, price: item.price })
      })
    }
    if (list.length > 0) return list
    // fallback to local
    return getCompatibleRAMs(mbId).map(r => ({ id: r.id, name: r.name, price: r.price }))
  }

  function next() {
    if (step === 2 && !cpuType) {
      Swal.fire({ title: 'Thông báo', text: 'Vui lòng chọn CPU!', icon: 'warning' })
      return
    }
    if (step === 3 && !game) {
      Swal.fire({ title: 'Thông báo', text: 'Vui lòng chọn game!', icon: 'warning' })
      return
    }
    if (step === 3) { computeConfig() }
    setStep(s => Math.min(4, s + 1))
  }

  function goTo(target) {
    if (target === 1) { setStep(1); return }
    if (target === 2 && canStep2) { setStep(2); return }
    if (target === 3 && canStep3) { setStep(3); return }
    if (target === 4 && canStep4) { if (!config) computeConfig(); setStep(4); return }
  }

  return (
    <div>
      {/* Loading Overlay */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          flexDirection: 'column',
          gap: 20
        }}>
          <div style={{
            width: 60,
            height: 60,
            border: '6px solid #334155',
            borderTop: '6px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>Đang tải dữ liệu...</div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      {/* Steps */}
      <div style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 8,
        padding: 16,
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: 900, margin: '0 auto', position: 'relative' }}>
          {[1,2,3,4].map(n => (
            <div key={n} onClick={() => goTo(n)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: (n===1)|| (n===2 && canStep2) || (n===3 && canStep3) || (n===4 && canStep4) ? 1 : 0.5 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step>=n ? '#3b82f6' : '#334155', color: step>=n ? '#fff' : '#94a3b8',
                border: '2px solid #475569',
                fontWeight: 700,
                fontSize: 16
              }}>{n}</div>
              <div style={{ fontSize: 13, color: step>=n ? '#3b82f6' : '#94a3b8', fontWeight: 600 }}>
                {n===1 && 'Chọn Ngân Sách'}
                {n===2 && 'Chọn CPU'}
                {n===3 && 'Chọn Game'}
                {n===4 && 'Hoàn Thành'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(79,172,254,0.3)', borderRadius: 16, padding: 24 }}>
          <h2 style={{ marginBottom: 8, background: 'linear-gradient(135deg,#4facfe,#00f2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: 28, textAlign: 'center' }}>💰 Chọn Ngân Sách</h2>
          <p style={{ color: '#94a3b8', marginBottom: 24, textAlign: 'center', fontSize: 15 }}>Chọn mức giá phù hợp với nhu cầu của bạn</p>

          {/* Preset Budget Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12, marginBottom: 24 }}>
            {[8, 10, 12, 15, 20, 25, 30].map(price => (
              <button
                key={price}
                onClick={() => setBudget(price)}
                style={{
                  padding: '16px 12px',
                  borderRadius: 12,
                  border: budget === price ? '3px solid #4facfe' : '2px solid #334155',
                  background: budget === price ? 'linear-gradient(135deg,#4facfe,#00f2fe)' : '#1e293b',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 18,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  transform: budget === price ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                {price}M
              </button>
            ))}
          </div>

          {/* Slider for custom amount */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: '#94a3b8', marginBottom: 12, fontSize: 14 }}>Hoặc kéo thanh trượt để chọn số tiền tùy chỉnh:</p>
            <input
              type="range"
              min={3}
              max={30}
              step={1}
              value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value))}
              style={{
                width: '100%',
                height: 8,
                borderRadius: 4,
                outline: 'none',
                background: 'linear-gradient(to right, #4facfe, #00f2fe)'
              }}
            />
          </div>

          <div style={{
            fontSize: 42,
            fontWeight: 900,
            marginTop: 20,
            marginBottom: 20,
            textAlign: 'center',
            background: 'linear-gradient(135deg,#4facfe,#00f2fe)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {budget} triệu VNĐ
          </div>

          <button
            onClick={() => setStep(2)}
            style={{
              width: '100%',
              marginTop: 16,
              padding: '16px 24px',
              borderRadius: 12,
              border: 0,
              background: 'linear-gradient(135deg,#4facfe,#00f2fe)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            Tiếp theo → Chọn CPU
          </button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(79,172,254,0.3)', borderRadius: 16, padding: 24 }}>
          <h2 style={{ marginBottom: 8, background: 'linear-gradient(135deg,#4facfe,#00f2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: 28, textAlign: 'center' }}>⚡ Chọn Loại CPU</h2>
          <p style={{ color: '#94a3b8', marginBottom: 24, textAlign: 'center', fontSize: 15 }}>Chọn Intel hoặc AMD phù hợp với nhu cầu của bạn</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, maxWidth: 800, margin: '0 auto' }}>
            {[
              { type: 'intel', icon: '🔵', color: '#0071c5', desc: 'Hiệu năng ổn định, tối ưu gaming', pros: ['• Xung nhịp cao', '• Tối ưu game', '• Ổn định'] },
              { type: 'amd', icon: '🔴', color: '#ed1c24', desc: 'Đa nhiệm mạnh mẽ, giá tốt', pros: ['• Nhiều nhân/luồng', '• Giá cạnh tranh', '• Đa nhiệm tốt'] }
            ].map(({ type, icon, color, desc, pros }) => (
              <div
                key={type}
                onClick={() => { setCpuType(type); setTimeout(()=> setStep(3), 200) }}
                style={{
                  background: cpuType===type ? `linear-gradient(135deg, ${color}, #4facfe)` : '#1e293b',
                  color: '#fff',
                  border: cpuType===type ? `4px solid ${color}` : '2px solid #334155',
                  borderRadius: 16,
                  padding: 32,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  transform: cpuType===type ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: cpuType===type ? `0 8px 32px ${color}40` : 'none'
                }}
                onMouseOver={(e) => !cpuType && (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseOut={(e) => !cpuType && (e.currentTarget.style.transform = 'scale(1)')}
              >
                <div style={{ fontSize: 64, marginBottom: 16 }}>{icon}</div>
                <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 12, textTransform: 'uppercase' }}>
                  {type}
                </div>
                <div style={{
                  color: cpuType===type ? 'rgba(255,255,255,0.95)' : '#94a3b8',
                  fontSize: 14,
                  marginBottom: 16,
                  fontWeight: 600
                }}>
                  {desc}
                </div>
                <div style={{
                  textAlign: 'left',
                  fontSize: 13,
                  color: cpuType===type ? 'rgba(255,255,255,0.85)' : '#64748b',
                  lineHeight: 1.8
                }}>
                  {pros.map((pro, i) => <div key={i}>{pro}</div>)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center' }}>
            <button
              onClick={() => setStep(1)}
              style={{
                padding: '14px 28px',
                borderRadius: 12,
                border: 0,
                background: '#334155',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 15,
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.background = '#475569'}
              onMouseOut={(e) => e.target.style.background = '#334155'}
            >
              ← Quay lại
            </button>
            <button
              onClick={next}
              style={{
                padding: '14px 28px',
                borderRadius: 12,
                border: 0,
                background: 'linear-gradient(135deg,#4facfe,#00f2fe)',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 15,
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              Tiếp theo → Chọn Game
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(79,172,254,0.3)', borderRadius: 16, padding: 24 }}>
          <h2 style={{ marginBottom: 8, background: 'linear-gradient(135deg,#4facfe,#00f2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: 28, textAlign: 'center' }}>🎮 Chọn Game Yêu Thích</h2>
          <p style={{ color: '#94a3b8', marginBottom: 24, textAlign: 'center', fontSize: 15 }}>Chọn game bạn chơi để tối ưu cấu hình máy tính</p>

          {/* Search Box */}
          <div style={{ marginBottom: 24, maxWidth: 600, margin: '0 auto 24px' }}>
            <input
              type="text"
              placeholder="🔍 Tìm kiếm game... (VD: Valorant, PUBG, GTA)"
              value={gameSearch}
              onChange={(e) => setGameSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: 12,
                border: '2px solid #334155',
                background: '#1e293b',
                color: '#fff',
                fontSize: 15,
                fontWeight: 500,
                outline: 'none',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4facfe'}
              onBlur={(e) => e.target.style.borderColor = '#334155'}
            />
            {gameSearch && (
              <div style={{ textAlign: 'center', marginTop: 12, color: '#94a3b8', fontSize: 14 }}>
                Tìm thấy {filteredGames.length} game
              </div>
            )}
          </div>

          {/* Games Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 16,
            maxHeight: 600,
            overflowY: 'auto',
            padding: 4,
            marginBottom: 20
          }}>
            {filteredGames.map(g => (
              <div
                key={g.id}
                onClick={() => { setGame(g.id); setTimeout(()=> { computeConfig(g.id); setStep(4) }, 150) }}
                style={{
                  background: game===g.id ? 'linear-gradient(135deg,#4facfe,#00f2fe)' : '#1e293b',
                  border: game===g.id ? '3px solid #4facfe' : '2px solid #334155',
                  borderRadius: 12,
                  padding: 10,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'hidden',
                  transform: game===g.id ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: game===g.id ? '0 4px 20px rgba(79,172,254,0.4)' : 'none'
                }}
                onMouseOver={(e) => !game && (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseOut={(e) => !game && (e.currentTarget.style.transform = 'scale(1)')}
              >
                <div style={{
                  width: '100%',
                  paddingTop: '133%',
                  position: 'relative',
                  marginBottom: 10,
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <img
                    src={g.image}
                    alt={g.name}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div style={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: game===g.id ? '#fff' : '#f1f5f9',
                  padding: '4px 0',
                  lineHeight: 1.3
                }}>{g.name}</div>
              </div>
            ))}
          </div>

          {filteredGames.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: 40,
              color: '#94a3b8',
              fontSize: 16
            }}>
              Không tìm thấy game nào 😔
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'center' }}>
            <button
              onClick={() => setStep(2)}
              style={{
                padding: '14px 28px',
                borderRadius: 12,
                border: 0,
                background: '#334155',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 15,
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.background = '#475569'}
              onMouseOut={(e) => e.target.style.background = '#334155'}
            >
              ← Quay lại
            </button>
            <button
              onClick={next}
              style={{
                padding: '14px 28px',
                borderRadius: 12,
                border: 0,
                background: 'linear-gradient(135deg,#4facfe,#00f2fe)',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 15,
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              Hoàn thành → Xem Cấu Hình
            </button>
          </div>
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <div>
          {!config ? (
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>Chưa có cấu hình</div>
          ) : (
            <>
              {/* Red Banner */}
              <div style={{
                background: '#dc2626',
                color: '#fff',
                padding: '20px 24px',
                marginBottom: 20,
                borderRadius: 8,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                  TRƯỜNG PHÁT COMPUTER XIN GỬI BẢNG CHI TIẾT CẤU HÌNH MÁY TÍNH
                </div>
                <div style={{ fontSize: 14, opacity: 0.95 }}>
                  lúc {new Date().toLocaleString('vi-VN', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      // Reset all states and go back to step 1
                      setStep(1)
                      setBudget(15)
                      setCpuType(null)
                      setGame(null)
                      setGameSearch('')
                      setConfig(null)
                      setCustomPrices({})
                    }}
                    style={{
                      background: '#f59e0b',
                      color: '#fff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 15,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    🔄 Bắt Đầu Lại
                  </button>
                  <button
                    onClick={async () => {
                      const el = document.getElementById('printable-area')
                      const banner = document.querySelector('.print-header')
                      if (!el) return

                      // Get all input and select elements in the table
                      const inputs = el.querySelectorAll('input, select')
                      const originalStyles = []

                      // Temporarily show banner and clean up input fields for capture
                      if (banner) banner.style.setProperty('display', 'block', 'important')

                      // Make inputs look like plain text
                      inputs.forEach((input, idx) => {
                        originalStyles[idx] = {
                          border: input.style.border,
                          background: input.style.background
                        }
                        input.style.border = 'none'
                        input.style.background = 'transparent'
                      })

                      // Wait for render
                      await new Promise(resolve => setTimeout(resolve, 150))

                      // Capture
                      const canvas = await html2canvas(el, { backgroundColor: '#fff', scale: 2 })

                      // Restore original styles
                      if (banner) banner.style.setProperty('display', 'none', 'important')
                      inputs.forEach((input, idx) => {
                        input.style.border = originalStyles[idx].border
                        input.style.background = originalStyles[idx].background
                      })

                      // Download
                      const link = document.createElement('a')
                      link.download = `pc-config-${Date.now()}.png`
                      link.href = canvas.toDataURL('image/png')
                      link.click()
                    }}
                    style={{
                      background: '#22c55e',
                      color: '#fff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 15,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    📷 Lưu Ảnh HD
                  </button>
                  <button
                    onClick={() => window.print()}
                    style={{
                      background: '#22c55e',
                      color: '#fff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 15,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    🖨️ In Cấu Hình
                  </button>
                </div>
              </div>

              {/* Editable Info Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                color: '#fff',
                padding: '16px 24px',
                marginBottom: 16,
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 24 }}>✏️</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Có thể chỉnh sửa trực tiếp</div>
                    <div style={{ fontSize: 13, opacity: 0.9 }}>Bạn có thể chỉnh sửa Số lượng, Đơn giá, Bảo hành và Ghi chú ngay trong bảng bên dưới</div>
                  </div>
                </div>
                {Object.keys(customPrices).length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Bạn có chắc muốn đặt lại tất cả các giá trị về mặc định?')) {
                        setCustomPrices({})
                      }
                    }}
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 14,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#dc2626'}
                    onMouseOut={(e) => e.target.style.background = '#ef4444'}
                  >
                    🔄 Đặt Lại Mặc Định
                  </button>
                )}
              </div>

              {/* Configuration Table */}
              <div style={{ overflowX: 'auto', marginBottom: 20 }}>
                <div id="printable-area">
                  {/* Header Banner - visible when printing or capturing */}
                  <div className="print-header" style={{ background: '#dc2626', padding: '12px 20px', textAlign: 'center', marginBottom: 12 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      TRƯỜNG PHÁT COMPUTER XIN GỬI BẢNG CHI TIẾT CẤU HÌNH MÁY TÍNH
                    </h2>
                    <p style={{ fontSize: 11, color: '#fff', margin: 0, opacity: 0.95 }}>
                      lúc {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} Thứ {['Chủ Nhật', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy'][new Date().getDay()]}, {new Date().getDate()} tháng {new Date().getMonth() + 1}, {new Date().getFullYear()}
                    </p>
                  </div>
                <table id="final-config" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1200, background: '#fff', color: '#000' }}>
                  <thead>
                    <tr style={{ background: 'linear-gradient(135deg, #3b82f6, #1e40af)' }}>
                      <th style={{ padding: '14px 8px', color: '#fff', fontWeight: 700, fontSize: 13, border: '1px solid #2563eb', width: '50px' }}>STT</th>
                      <th style={{ padding: '14px 8px', color: '#fff', fontWeight: 700, fontSize: 13, border: '1px solid #2563eb', width: '80px' }}>Hình ảnh</th>
                      <th style={{ padding: '14px 16px', color: '#fff', fontWeight: 700, fontSize: 13, textAlign: 'left', border: '1px solid #2563eb', minWidth: '280px' }}>Tên, mã, loại linh kiện</th>
                      <th style={{ padding: '14px 8px', color: '#fff', fontWeight: 700, fontSize: 13, border: '1px solid #2563eb', width: '60px' }}>ĐVT</th>
                      <th style={{ padding: '14px 8px', color: '#fff', fontWeight: 700, fontSize: 13, border: '1px solid #2563eb', width: '80px' }}>Số lượng</th>
                      <th style={{ padding: '14px 16px', color: '#fff', fontWeight: 700, fontSize: 13, textAlign: 'right', border: '1px solid #2563eb', minWidth: '120px' }}>Đơn giá</th>
                      <th style={{ padding: '14px 16px', color: '#fff', fontWeight: 700, fontSize: 13, textAlign: 'right', border: '1px solid #2563eb', minWidth: '130px' }}>Thành tiền</th>
                      <th style={{ padding: '14px 8px', color: '#fff', fontWeight: 700, fontSize: 13, border: '1px solid #2563eb', width: '90px' }}>Bảo hành</th>
                      <th style={{ padding: '14px 8px', color: '#fff', fontWeight: 700, fontSize: 13, border: '1px solid #2563eb', width: '80px' }}>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(config).filter(([k,v]) => v !== null && v !== undefined).map(([k,v], idx) => {
                      const localItem = catalogs[k]?.[v]
                      const invItem = inventory?.[k]?.[v]
                      const item = { ...(localItem || {}), ...(invItem || {}) }

                      // Get custom values or fall back to defaults
                      const customData = customPrices[k] || {}
                      const price = customData.price !== undefined ? customData.price : (item?.price || 0)
                      const quantity = customData.quantity !== undefined ? customData.quantity : (item?.quantity || 1)
                      const warranty = customData.warranty || item?.warranty || '36 tháng'
                      const condition = customData.condition || (item?.condition === '2ND' || item?.condition === '2nd' ? '2ND' : 'NEW')

                      const brand = item?.brand || ''
                      const socket = item?.socket || item?.sockets?.[0] || ''
                      const ddr = item?.ddr || item?.memoryType || ''
                      const image = item?.image || '/images/placeholder.jpg'

                      const updateCustomValue = (field, value) => {
                        setCustomPrices(prev => ({
                          ...prev,
                          [k]: { ...prev[k], [field]: value }
                        }))
                      }

                      return (
                        <tr key={k} style={{ background: idx % 2 === 0 ? '#f1f5f9' : '#fff' }}>
                          <td style={{ padding: '12px 8px', textAlign: 'center', color: '#1e293b', fontSize: 13, fontWeight: 700, border: '1px solid #cbd5e1' }}>{idx + 1}</td>
                          <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>
                            <img src={image} alt={item?.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} />
                          </td>
                          <td style={{ padding: '12px 16px', border: '1px solid #cbd5e1' }}>
                            <div style={{ color: '#0f172a', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{item?.name || v}</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: 6 }}>
                              {brand && <span style={{ fontSize: 11, padding: '2px 8px', background: '#e0e7ff', color: '#3730a3', borderRadius: 4, fontWeight: 600 }}>🏢 {brand}</span>}
                              {socket && <span style={{ fontSize: 11, padding: '2px 8px', background: '#fef3c7', color: '#92400e', borderRadius: 4, fontWeight: 600 }}>🔌 {socket}</span>}
                              {ddr && <span style={{ fontSize: 11, padding: '2px 8px', background: '#dbeafe', color: '#1e40af', borderRadius: 4, fontWeight: 600 }}>💾 {ddr}</span>}
                            </div>
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center', color: '#475569', fontSize: 13, fontWeight: 600, border: '1px solid #cbd5e1' }}>Chiếc</td>
                          <td style={{ padding: '6px 4px', textAlign: 'center', border: '1px solid #cbd5e1' }}>
                            <input
                              type="number"
                              min="1"
                              value={quantity}
                              onChange={(e) => updateCustomValue('quantity', parseInt(e.target.value) || 1)}
                              style={{
                                width: '60px',
                                padding: '6px',
                                textAlign: 'center',
                                border: '2px solid #3b82f6',
                                borderRadius: 4,
                                fontSize: 13,
                                fontWeight: 700,
                                color: '#dc2626',
                                background: '#fff'
                              }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #cbd5e1' }}>
                            <input
                              type="number"
                              min="0"
                              step="10000"
                              value={price}
                              onChange={(e) => updateCustomValue('price', parseInt(e.target.value) || 0)}
                              style={{
                                width: '120px',
                                padding: '6px',
                                textAlign: 'right',
                                border: '2px solid #3b82f6',
                                borderRadius: 4,
                                fontSize: 12,
                                fontWeight: 700,
                                color: '#0f172a',
                                background: '#fff'
                              }}
                            />
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', color: '#059669', fontWeight: 800, fontSize: 14, border: '1px solid #cbd5e1' }}>{formatPrice(price * quantity)}</td>
                          <td style={{ padding: '6px 4px', textAlign: 'center', border: '1px solid #cbd5e1' }}>
                            <input
                              type="text"
                              value={warranty}
                              onChange={(e) => updateCustomValue('warranty', e.target.value)}
                              style={{
                                width: '80px',
                                padding: '6px',
                                textAlign: 'center',
                                border: '2px solid #3b82f6',
                                borderRadius: 4,
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#0f172a',
                                background: '#fff'
                              }}
                            />
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>
                            <select
                              value={condition}
                              onChange={(e) => updateCustomValue('condition', e.target.value)}
                              style={{
                                padding: '5px 8px',
                                borderRadius: 6,
                                border: '2px solid #3b82f6',
                                background: condition === 'NEW' ? '#10b981' : '#f59e0b',
                                color: '#fff',
                                fontSize: 11,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="NEW">NEW</option>
                              <option value="2ND">2ND</option>
                            </select>
                          </td>
                        </tr>
                      )
                    })}
                    <tr style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                      <td colSpan="6" style={{ padding: '18px', textAlign: 'center', color: '#fff', fontWeight: 800, fontSize: 16, border: '1px solid #047857', letterSpacing: '1px' }}>TỔNG CỘNG</td>
                      <td style={{ padding: '18px', textAlign: 'right', color: '#fff', fontWeight: 900, fontSize: 18, border: '1px solid #047857' }}>
                        {formatPrice(Object.entries(config).filter(([k,v]) => v !== null && v !== undefined).reduce((sum, [k,v]) => {
                          const item = inventory?.[k]?.[v] || catalogs[k]?.[v]
                          const customData = customPrices[k] || {}
                          const price = customData.price !== undefined ? customData.price : (item?.price || 0)
                          const quantity = customData.quantity !== undefined ? customData.quantity : (item?.quantity || 1)
                          return sum + (price * quantity)
                        }, 0))} VNĐ
                      </td>
                      <td colSpan="2" style={{ border: '1px solid #047857', background: 'linear-gradient(135deg, #10b981, #059669)' }}></td>
                    </tr>
                  </tbody>
                </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      {/* Component selectors when config is available */}
      {step === 4 && config && (
        <div style={{ marginTop: 24, background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: 24 }}>
          <h3 style={{ marginBottom: 20, textAlign: 'center', fontSize: 18, fontWeight: 700, color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span>✏️</span> Tùy Chỉnh Linh Kiện
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            {/* CPU select */}
            <div style={{ background: '#334155', borderRadius: 8, padding: 16, border: '1px solid #475569' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#3b82f6', fontWeight: 600, fontSize: 14 }}>
                <span>🔷</span> CPU - Bộ Vi Xử Lý
              </label>
              <select value={config.cpu} onChange={(e)=>{
                const cpu = e.target.value
                const mbs = getMainboardsForCpu(cpu)
                const newMb = mbs[0]?.id || config.mainboard
                const rams = getRamsForMainboard(newMb)
                const newRam = rams[0]?.id || config.ram
                setConfig(prev => ({ ...prev, cpu, mainboard: newMb, ram: newRam }))
              }} style={{ width: '100%', padding: 10, borderRadius: 6, background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: 13, cursor: 'pointer' }}>
                {Object.values(inventory?.cpu || catalogs.cpu || {}).filter(item => item && item.id).map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              <div style={{ marginTop: 8, fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>✓</span> đã sẵn sàng chọn
              </div>
            </div>

            {/* Mainboard select */}
            <div style={{ background: '#334155', borderRadius: 8, padding: 16, border: '1px solid #475569' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#3b82f6', fontWeight: 600, fontSize: 14 }}>
                <span>🔌</span> Mainboard - Bo Mạch Chủ
              </label>
              <select value={config.mainboard} onChange={(e)=>{
                const mainboard = e.target.value
                const rams = getRamsForMainboard(mainboard)
                const newRam = rams[0]?.id || config.ram
                setConfig(prev => ({ ...prev, mainboard, ram: newRam }))
              }} style={{ width: '100%', padding: 10, borderRadius: 6, background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: 13, cursor: 'pointer' }}>
                {getMainboardsForCpu(config.cpu).filter(item => item && item.id).map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              <div style={{ marginTop: 8, fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>✓</span> đã sẵn sàng chọn
              </div>
            </div>

            {/* VGA select */}
            <div style={{ background: '#334155', borderRadius: 8, padding: 16, border: '1px solid #475569' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#3b82f6', fontWeight: 600, fontSize: 14 }}>
                <span>🎮</span> VGA - Card Đồ Họa
              </label>
              <select value={config.vga} onChange={(e)=> setConfig(prev => ({ ...prev, vga: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 6, background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: 13, cursor: 'pointer' }}>
                {Object.values(inventory?.vga || catalogs.vga || {}).filter(item => item && item.id).map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              <div style={{ marginTop: 8, fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>✓</span> đã sẵn sàng chọn
              </div>
            </div>

            {/* RAM select */}
            <div style={{ background: '#334155', borderRadius: 8, padding: 16, border: '1px solid #475569' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#3b82f6', fontWeight: 600, fontSize: 14 }}>
                <span>💾</span> RAM - Bộ Nhớ
              </label>
              <select value={config.ram} onChange={(e)=> setConfig(prev => ({ ...prev, ram: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 6, background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: 13, cursor: 'pointer' }}>
                {getRamsForMainboard(config.mainboard).filter(item => item && item.id).map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              <div style={{ marginTop: 8, fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>✓</span> đã sẵn sàng chọn
              </div>
            </div>

            {/* SSD select */}
            <div style={{ background: '#334155', borderRadius: 8, padding: 16, border: '1px solid #475569' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#3b82f6', fontWeight: 600, fontSize: 14 }}>
                <span>💾</span> SSD - Ổ Cứng
              </label>
              <select value={config.ssd} onChange={(e)=> setConfig(prev => ({ ...prev, ssd: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 6, background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: 13, cursor: 'pointer' }}>
                {Object.values(inventory?.ssd || catalogs.ssd || {}).filter(item => item && item.id).map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              <div style={{ marginTop: 8, fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>✓</span> đã sẵn sàng chọn
              </div>
            </div>

            {/* HDD select */}
            <div style={{ background: '#334155', borderRadius: 8, padding: 16, border: '1px solid #475569' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#3b82f6', fontWeight: 600, fontSize: 14 }}>
                <span>💿</span> HDD - Ổ Cứng Cơ
              </label>
              <select value={config.hdd || ''} onChange={(e)=> setConfig(prev => ({ ...prev, hdd: e.target.value || undefined }))} style={{ width: '100%', padding: 10, borderRadius: 6, background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: 13, cursor: 'pointer' }}>
                <option value="">- Chọn HDD -</option>
                {Object.values(inventory?.hdd || catalogs.hdd || {}).filter(item => item && item.id).map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              <div style={{ marginTop: 8, fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>✓</span> đã sẵn sàng chọn
              </div>
            </div>

            {/* Monitor select */}
            <div style={{ background: '#334155', borderRadius: 8, padding: 16, border: '1px solid #475569' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#3b82f6', fontWeight: 600, fontSize: 14 }}>
                <span>🖥️</span> Monitor - Màn Hình
              </label>
              <select value={config.monitor || ''} onChange={(e)=> setConfig(prev => ({ ...prev, monitor: e.target.value || undefined }))} style={{ width: '100%', padding: 10, borderRadius: 6, background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: 13, cursor: 'pointer' }}>
                <option value="">- Chọn MONITOR -</option>
                {Object.values(inventory?.monitor || catalogs.monitor || {}).filter(item => item && item.id).map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              <div style={{ marginTop: 8, fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>✓</span> đã sẵn sàng chọn
              </div>
            </div>

            {/* PSU select */}
            <div style={{ background: '#334155', borderRadius: 8, padding: 16, border: '1px solid #475569' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#3b82f6', fontWeight: 600, fontSize: 14 }}>
                <span>⚡</span> PSU - Nguồn
              </label>
              <select value={config.psu} onChange={(e)=> setConfig(prev => ({ ...prev, psu: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 6, background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: 13, cursor: 'pointer' }}>
                {Object.values(inventory?.psu || catalogs.psu || {}).filter(item => item && item.id).map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              <div style={{ marginTop: 8, fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>✓</span> đã sẵn sàng chọn
              </div>
            </div>

            {/* Case select */}
            <div style={{ background: '#334155', borderRadius: 8, padding: 16, border: '1px solid #475569' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#3b82f6', fontWeight: 600, fontSize: 14 }}>
                <span>🏠</span> Case - Vỏ Máy
              </label>
              <select value={config.case} onChange={(e)=> setConfig(prev => ({ ...prev, case: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 6, background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: 13, cursor: 'pointer' }}>
                {Object.values(inventory?.case || catalogs.case || {}).filter(item => item && item.id).map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              <div style={{ marginTop: 8, fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>✓</span> đã sẵn sàng chọn
              </div>
            </div>

            {/* CPU Cooler select */}
            <div style={{ background: '#334155', borderRadius: 8, padding: 16, border: '1px solid #475569' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#3b82f6', fontWeight: 600, fontSize: 14 }}>
                <span>🌀</span> CPU Cooler - Tản Nhiệt
              </label>
              <select value={config.cpuCooler} onChange={(e)=> setConfig(prev => ({ ...prev, cpuCooler: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 6, background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: 13, cursor: 'pointer' }}>
                {Object.values(inventory?.cpuCooler || catalogs.cpuCooler || {}).filter(item => item && item.id).map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              <div style={{ marginTop: 8, fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>✓</span> đã sẵn sàng chọn
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer with contact info */}
      {step === 4 && (
        <div style={{ marginTop: 24, background: '#3b82f6', borderRadius: 8, padding: 24, textAlign: 'center' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 20 }}>
            Liên Hệ Trường Phát Computer Hòa Bình
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 20 }}>
            <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#3b82f6', marginBottom: 8 }}>📱</div>
              <a href="tel:0836768597" style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', textDecoration: 'none' }}>083.6768.597</a>
            </div>
            <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#3b82f6', marginBottom: 8 }}>💬</div>
              <a href="https://id.zalo.me/account?continue=http%3A%2F%2Fzalo.me%2F0836768597" target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', textDecoration: 'none' }}>zalo.me/0836768597</a>
            </div>
            <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#3b82f6', marginBottom: 8 }}>👥</div>
              <a href="https://www.facebook.com/tpcom.hb" target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', textDecoration: 'none' }}>facebook.com/tpcom.hb</a>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Trường Phát Computer Hòa Bình</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#fff', opacity: 0.9 }}>
            © AMD | © INTEL | © NVIDIA - Cam kết chất lượng
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          /* Hide everything except the printable area */
          body * {
            visibility: hidden;
          }

          #printable-area, #printable-area * {
            visibility: visible;
          }

          /* Position the printable area */
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          /* A4 page settings - auto set như hình user cung cấp */
          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          /* Force print settings */
          html {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Compact banner */
          .print-header {
            padding: 8px 16px !important;
            margin-bottom: 8px !important;
          }

          .print-header h2 {
            font-size: 14px !important;
            margin-bottom: 3px !important;
          }

          .print-header p {
            font-size: 10px !important;
          }

          /* Compact table */
          #final-config {
            font-size: 9px !important;
            min-width: 100% !important;
          }

          #final-config th,
          #final-config td {
            padding: 4px 3px !important;
            font-size: 9px !important;
            line-height: 1.3;
          }

          #final-config img {
            max-width: 40px !important;
            max-height: 40px !important;
          }

          /* Make input fields look like regular text when printing */
          #final-config input,
          #final-config select {
            border: none !important;
            background: transparent !important;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
          }

          /* Prevent page breaks */
          #printable-area {
            page-break-inside: avoid;
          }

          #final-config tr {
            page-break-inside: avoid;
          }
        }

        /* Hide banner on screen, only show when printing or capturing */
        @media screen {
          .print-header {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}


