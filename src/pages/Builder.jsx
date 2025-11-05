import { useMemo, useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import html2canvas from 'html2canvas'
import { getCatalogs, formatPrice as fmt } from '../data/components'
import { generateSmartConfig, getCompatibleMainboards, getCompatibleRAMs, totalPrice } from '../lib/configGen'

// Toggle D1 usage. Set to true to fetch inventory/configs from Cloudflare D1
const USE_D1 = true
const API_URL = 'https://tp-pc-builder-api.bangachieu4.workers.dev'

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
  const [config, setConfig] = useState(null)
  const [allConfigs, setAllConfigs] = useState(null)
  const [inventory, setInventory] = useState(null)
  const catalogs = useMemo(()=> getCatalogs(), [config])

  const canStep2 = useMemo(() => !!budget, [budget])
  const canStep3 = useMemo(() => !!budget && !!cpuType, [budget, cpuType])
  const canStep4 = useMemo(() => !!budget && !!cpuType && !!game, [budget, cpuType, game])

  // Fetch configs and inventory from D1 (disabled when USE_D1 = false)
  useEffect(() => {
    if (!USE_D1) return
    Promise.all([
      fetch(`${API_URL}/configs`).then(r => r.json()),
      fetch(`${API_URL}/inventory`).then(r => r.json())
    ]).then(([configs, inv]) => {
      setAllConfigs(configs)
      setInventory(inv)
    }).catch(err => {
      console.error('Failed to load data:', err)
      Swal.fire({ title: 'Lỗi', text: 'Không thể tải dữ liệu từ server', icon: 'error' })
    })
  }, [])

  function computeConfig() {
    // Find config from D1 based on cpuType, game, and budget
    const budgetKey = `${budget}M`
    const gameKey = (game || '').replace(/-/g, '_')

    if (allConfigs && allConfigs[cpuType] && allConfigs[cpuType][gameKey] && allConfigs[cpuType][gameKey][budgetKey]) {
      const d1Config = allConfigs[cpuType][gameKey][budgetKey]
      setConfig(d1Config)
    } else {
      const cfg = generateSmartConfig({ budgetM: budget, cpuType, game })
      setConfig(cfg)
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
      const socket = inferSocketFromName(inv.name) || inferCpuSocketFromName(inv.name) || local?.socket
      const brand = /AMD/i.test(inv.name) ? 'amd' : (/INTEL|XEON|CORE/i.test(inv.name) ? 'intel' : (socket && socket.startsWith('LGA') ? 'intel' : (socket && socket.startsWith('AM') ? 'amd' : undefined)))
      // Simple DDR inference for Intel gens
      let ddr = local?.ddr
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
      {/* Steps */}
      <div style={{
        background: 'rgba(30,41,59,0.8)',
        border: '1px solid rgba(79,172,254,0.3)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: 800, margin: '0 auto', position: 'relative' }}>
          {[1,2,3,4].map(n => (
            <div key={n} onClick={() => goTo(n)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: (n===1)|| (n===2 && canStep2) || (n===3 && canStep3) || (n===4 && canStep4) ? 1 : 0.5 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step>=n ? 'linear-gradient(135deg,#4facfe,#00f2fe)' : '#334155', color: step>=n ? '#fff' : '#94a3b8',
                border: '2px solid rgba(79,172,254,0.3)'
              }}>{n}</div>
              <div style={{ fontSize: 12, color: step>=n ? '#4facfe' : '#94a3b8' }}>
                {n===1 && 'Ngân sách'}
                {n===2 && 'CPU'}
                {n===3 && 'Game'}
                {n===4 && 'Hoàn thành'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(79,172,254,0.3)', borderRadius: 16, padding: 24 }}>
          <h2 style={{ marginBottom: 8, background: 'linear-gradient(135deg,#4facfe,#00f2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>💰 Chọn Ngân Sách</h2>
          <p style={{ color: '#94a3b8', marginBottom: 16 }}>Kéo thanh trượt để chọn mức giá phù hợp</p>
          <input type="range" min={3} max={30} step={1} value={budget} onChange={(e) => setBudget(parseInt(e.target.value))} style={{ width: '100%' }} />
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 12, background: 'linear-gradient(135deg,#4facfe,#00f2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{budget} triệu VNĐ</div>
          <button onClick={() => setStep(2)} style={{ marginTop: 16, padding: '12px 20px', borderRadius: 12, border: 0, background: 'linear-gradient(135deg,#4facfe,#00f2fe)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Tiếp theo →</button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(79,172,254,0.3)', borderRadius: 16, padding: 24 }}>
          <h2 style={{ marginBottom: 8, background: 'linear-gradient(135deg,#4facfe,#00f2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>⚡ Chọn CPU</h2>
          <p style={{ color: '#94a3b8', marginBottom: 16 }}>Intel hoặc AMD</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {['intel','amd'].map(type => (
              <div key={type} onClick={() => { setCpuType(type); setTimeout(()=> setStep(3), 150) }} style={{
                background: cpuType===type ? 'linear-gradient(135deg,#4facfe,#00f2fe)' : '#334155',
                color: cpuType===type ? '#fff' : '#f8fafc',
                border: '3px solid #475569', borderRadius: 16, padding: 24, cursor: 'pointer', textAlign: 'center'
              }}>
                <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{type.toUpperCase()}</div>
                <div style={{ color: cpuType===type ? 'rgba(255,255,255,0.8)' : '#94a3b8' }}>{type==='intel' ? 'Hiệu năng ổn định, tối ưu gaming' : 'Đa nhiệm mạnh mẽ, giá tốt'}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button onClick={() => setStep(1)} style={{ padding: '12px 16px', borderRadius: 12, border: 0, background: '#334155', color: '#fff', cursor: 'pointer' }}>← Quay lại</button>
            <button onClick={next} style={{ padding: '12px 16px', borderRadius: 12, border: 0, background: 'linear-gradient(135deg,#4facfe,#00f2fe)', color: '#fff', cursor: 'pointer' }}>Tiếp theo →</button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(79,172,254,0.3)', borderRadius: 16, padding: 24 }}>
          <h2 style={{ marginBottom: 8, background: 'linear-gradient(135deg,#4facfe,#00f2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🎮 Chọn Game</h2>
          <p style={{ color: '#94a3b8', marginBottom: 16 }}>Chọn game bạn chơi để tối ưu cấu hình</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {ALL_GAMES.map(g => (
              <div key={g.id} onClick={() => { setGame(g.id); setTimeout(()=> { computeConfig(); setStep(4) }, 150) }} style={{
                background: game===g.id ? 'linear-gradient(135deg,#4facfe,#00f2fe)' : '#334155',
                color: game===g.id ? '#fff' : '#f8fafc', border: '3px solid #475569', borderRadius: 12, padding: 16, textAlign: 'center', cursor: 'pointer'
              }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{g.name}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button onClick={() => setStep(2)} style={{ padding: '12px 16px', borderRadius: 12, border: 0, background: '#334155', color: '#fff', cursor: 'pointer' }}>← Quay lại</button>
            <button onClick={next} style={{ padding: '12px 16px', borderRadius: 12, border: 0, background: 'linear-gradient(135deg,#4facfe,#00f2fe)', color: '#fff', cursor: 'pointer' }}>Hoàn thành →</button>
          </div>
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <div style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(79,172,254,0.3)', borderRadius: 16, padding: 24 }}>
          <h2 style={{ marginBottom: 12, background: 'linear-gradient(135deg,#4facfe,#00f2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>📋 Cấu hình đề xuất</h2>
          <div style={{ marginBottom: 12 }}>
            <a href="/config-manager" style={{
              display: 'inline-block',
              padding: '8px 12px',
              borderRadius: 8,
              background: 'linear-gradient(135deg,#64748b,#0ea5e9)',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 700
            }}>⚙️ Thay đổi logic theo tầm tiền (Admin)</a>
            <span style={{ marginLeft: 8, color: '#94a3b8', fontSize: 12 }}>(Mật khẩu: namhbcf12)</span>
          </div>
          {!config ? (
            <div style={{ color: '#94a3b8' }}>Chưa có cấu hình</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table id="final-config" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg,#1e40af,#3b82f6)' }}>
                    <th style={{ padding: '12px 8px', color: '#fff', fontWeight: 600, fontSize: 14, border: '1px solid rgba(255,255,255,0.1)' }}>STT</th>
                    <th style={{ padding: '12px 8px', color: '#fff', fontWeight: 600, fontSize: 14, border: '1px solid rgba(255,255,255,0.1)' }}>ICON</th>
                    <th style={{ padding: '12px 16px', color: '#fff', fontWeight: 600, fontSize: 14, textAlign: 'left', border: '1px solid rgba(255,255,255,0.1)' }}>TÊN, MÃ, LOẠI LINH KIỆN</th>
                    <th style={{ padding: '12px 8px', color: '#fff', fontWeight: 600, fontSize: 14, border: '1px solid rgba(255,255,255,0.1)' }}>CHỨC NĂNG</th>
                    <th style={{ padding: '12px 8px', color: '#fff', fontWeight: 600, fontSize: 14, border: '1px solid rgba(255,255,255,0.1)' }}>SỐ LƯỢNG</th>
                    <th style={{ padding: '12px 16px', color: '#fff', fontWeight: 600, fontSize: 14, textAlign: 'right', border: '1px solid rgba(255,255,255,0.1)' }}>ĐƠN GIÁ</th>
                    <th style={{ padding: '12px 16px', color: '#fff', fontWeight: 600, fontSize: 14, textAlign: 'right', border: '1px solid rgba(255,255,255,0.1)' }}>THÀNH TIỀN</th>
                    <th style={{ padding: '12px 8px', color: '#fff', fontWeight: 600, fontSize: 14, border: '1px solid rgba(255,255,255,0.1)' }}>BẢO HÀNH</th>
                    <th style={{ padding: '12px 8px', color: '#fff', fontWeight: 600, fontSize: 14, border: '1px solid rgba(255,255,255,0.1)' }}>TÌNH TRẠNG</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(config).map(([k,v], idx) => {
                    const localItem = catalogs[k]?.[v]
                    const invItem = inventory?.[k]?.[v]
                    const item = { ...(localItem || {}), ...(invItem || {}) }
                    const price = item?.price || 0
                    const quantity = item?.quantity || 1
                    const warranty = item?.warranty || 'N/A'
                    const condition = item?.condition === '2nd' ? '2ND' : 'NEW'
                    const brand = item?.brand || ''

                    return (
                      <tr key={k} style={{ background: idx % 2 === 0 ? '#1e293b' : '#0f172a', borderBottom: '1px solid rgba(79,172,254,0.1)' }}>
                        <td style={{ padding: '12px 8px', textAlign: 'center', color: '#f8fafc', fontSize: 16, fontWeight: 600, border: '1px solid rgba(79,172,254,0.1)' }}>{idx + 1}</td>
                        <td style={{ padding: '8px', textAlign: 'center', border: '1px solid rgba(79,172,254,0.1)' }}>
                          <div style={{ width: 48, height: 48, background: '#334155', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', overflow: 'hidden' }}>
                            {(() => {
                              const hasImgLikePath = (v) => /\.(png|jpg|jpeg|webp|gif)$/i.test(v || '')
                              const raw = (item?.image || '').trim()
                              const src = raw && hasImgLikePath(raw) ? (raw.startsWith('/') ? raw : `/${raw}`) : null
                              const fallbackByCat = {
                                cpu: '/images/components/cpu.jpg',
                                mainboard: '/images/components/mainboard.jpg',
                                vga: '/images/components/vga.jpg',
                                ram: '/images/components/ram.jpg',
                                ssd: '/images/components/ssd.jpg',
                                psu: '/images/components/psu.jpg',
                                case: '/images/components/case.jpg',
                                cpuCooler: '/images/components/cooler.jpg',
                                hdd: '/images/components/ssd.jpg',
                                monitor: '/images/monitor/750ti.jpg'
                              }
                              if (src || fallbackByCat[k]) {
                                return (
                                  <img
                                    src={src || fallbackByCat[k]}
                                    alt={item?.name || k}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                                  />
                                )
                              }
                              return (
                                <span>
                                  {k === 'cpu' && '🔷'}
                                  {k === 'mainboard' && '🔷'}
                                  {k === 'vga' && '🔷'}
                                  {k === 'ram' && '🔷'}
                                  {k === 'ssd' && '💾'}
                                  {k === 'psu' && '⚡'}
                                  {k === 'case' && '🏠'}
                                  {k === 'cpuCooler' && '🌀'}
                                  {k === 'hdd' && '💾'}
                                  {k === 'monitor' && '🖥️'}
                                </span>
                              )
                            })()}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', border: '1px solid rgba(79,172,254,0.1)' }}>
                          <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{item?.name || v}</div>
                          <div style={{ color: '#94a3b8', fontSize: 13 }}>Thương hiệu: {brand}</div>
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center', color: '#ef4444', fontWeight: 700, border: '1px solid rgba(79,172,254,0.1)' }}>Chiếc</td>
                        <td style={{ padding: '12px 8px', textAlign: 'center', color: '#f8fafc', fontWeight: 600, border: '1px solid rgba(79,172,254,0.1)' }}>{quantity}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: '#ef4444', fontWeight: 600, border: '1px solid rgba(79,172,254,0.1)' }}>{formatPrice(price)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: '#10b981', fontWeight: 700, border: '1px solid rgba(79,172,254,0.1)' }}>{formatPrice(price * quantity)}</td>
                        <td style={{ padding: '12px 8px', textAlign: 'center', color: '#22c55e', fontWeight: 600, border: '1px solid rgba(79,172,254,0.1)' }}>{warranty}</td>
                        <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 700, border: '1px solid rgba(79,172,254,0.1)' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: 6,
                            background: condition === 'NEW' ? '#10b981' : '#f59e0b',
                            color: '#fff',
                            fontSize: 12
                          }}>{condition}</span>
                        </td>
                      </tr>
                    )
                  })}
                  <tr style={{ background: '#16a34a' }}>
                    <td colSpan="6" style={{ padding: '16px', textAlign: 'center', color: '#fff', fontWeight: 700, fontSize: 18, border: '1px solid rgba(255,255,255,0.2)' }}>TỔNG CỘNG</td>
                    <td style={{ padding: '16px', textAlign: 'right', color: '#fff', fontWeight: 700, fontSize: 20, border: '1px solid rgba(255,255,255,0.2)' }}>
                      {formatPrice(Object.entries(config).reduce((sum, [k,v]) => {
                        const item = inventory?.[k]?.[v] || catalogs[k]?.[v]
                        return sum + ((item?.price || 0) * (item?.quantity || 1))
                      }, 0))} VNĐ
                    </td>
                    <td colSpan="2" style={{ border: '1px solid rgba(255,255,255,0.2)' }}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button onClick={() => setStep(3)} style={{ padding: '12px 16px', borderRadius: 12, border: 0, background: '#334155', color: '#fff', cursor: 'pointer' }}>← Quay lại</button>
            <button onClick={() => Swal.fire({ title: 'Đã lưu', text: 'Cấu hình đã được lưu tạm', icon: 'success', timer: 1200, showConfirmButton: false })} style={{ padding: '12px 16px', borderRadius: 12, border: 0, background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', cursor: 'pointer' }}>Lưu cấu hình</button>
            <button onClick={async ()=>{
              const el = document.getElementById('final-config')
              if (!el) return
              const canvas = await html2canvas(el, { backgroundColor: '#0f172a', scale: 2 })
              const link = document.createElement('a')
              link.download = `pc-config-${Date.now()}.png`
              link.href = canvas.toDataURL('image/png')
              link.click()
            }} style={{ padding: '12px 16px', borderRadius: 12, border: 0, background: 'linear-gradient(135deg,#4facfe,#00f2fe)', color: '#fff', cursor: 'pointer' }}>Xuất ảnh</button>
          </div>
        </div>
      )}
      {/* Component selectors when config is available */}
      {step === 4 && config && (
        <div style={{ marginTop: 24, background: 'rgba(15,23,42,0.9)', border: '2px solid rgba(79,172,254,0.3)', borderRadius: 16, padding: 24 }}>
          <h3 style={{ marginBottom: 20, textAlign: 'center', fontSize: 20, fontWeight: 700, background: 'linear-gradient(135deg,#4facfe,#00f2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>✏️ Tùy Chỉnh Linh Kiện</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
            {/* CPU select */}
            <div style={{ background: 'rgba(30,41,59,0.6)', borderRadius: 12, padding: 16, border: '1px solid rgba(79,172,254,0.2)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#4facfe', fontWeight: 600, fontSize: 14 }}>
                <span>🔷</span> CPU - Bộ Xử Lý
              </label>
              <select value={config.cpu} onChange={(e)=>{
                const cpu = e.target.value
                const mbs = getMainboardsForCpu(cpu)
                const newMb = mbs[0]?.id || config.mainboard
                const rams = getRamsForMainboard(newMb)
                const newRam = rams[0]?.id || config.ram
                setConfig(prev => ({ ...prev, cpu, mainboard: newMb, ram: newRam }))
              }} style={{ width: '100%', padding: 12, borderRadius: 8, background: '#1e293b', color: '#fff', border: '2px solid #475569', fontSize: 14, cursor: 'pointer' }}>
                {Object.values(inventory?.cpu || catalogs.cpu).map(item => (
                  <option key={item.id} value={item.id}>{item.name} - {formatPrice(item.price)}</option>
                ))}
              </select>
              <div style={{ marginTop: 8, fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>✓</span> Sẵn sàng chọn
              </div>
            </div>

            {/* Mainboard select */}
            <div style={{ background: 'rgba(30,41,59,0.6)', borderRadius: 12, padding: 16, border: '1px solid rgba(79,172,254,0.2)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#4facfe', fontWeight: 600, fontSize: 14 }}>
                <span>🔌</span> Mainboard - Bo Mạch Chủ
              </label>
              <select value={config.mainboard} onChange={(e)=>{
                const mainboard = e.target.value
                const rams = getRamsForMainboard(mainboard)
                const newRam = rams[0]?.id || config.ram
                setConfig(prev => ({ ...prev, mainboard, ram: newRam }))
              }} style={{ width: '100%', padding: 12, borderRadius: 8, background: '#1e293b', color: '#fff', border: '2px solid #475569', fontSize: 14, cursor: 'pointer' }}>
                {getMainboardsForCpu(config.cpu).map(item => (
                  <option key={item.id} value={item.id}>{item.name} - {formatPrice(item.price || catalogs.mainboard?.[item.id]?.price || 0)}</option>
                ))}
              </select>
              <div style={{ marginTop: 8, fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>✓</span> Sẵn sàng chọn
              </div>
            </div>

            {/* VGA select */}
            <div style={{ background: 'rgba(30,41,59,0.6)', borderRadius: 12, padding: 16, border: '1px solid rgba(79,172,254,0.2)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#4facfe', fontWeight: 600, fontSize: 14 }}>
                <span>🎮</span> VGA - Card Đồ Họa
              </label>
              <select value={config.vga} onChange={(e)=> setConfig(prev => ({ ...prev, vga: e.target.value }))} style={{ width: '100%', padding: 12, borderRadius: 8, background: '#1e293b', color: '#fff', border: '2px solid #475569', fontSize: 14, cursor: 'pointer' }}>
                {Object.values(inventory?.vga || catalogs.vga).map(item => (
                  <option key={item.id} value={item.id}>{item.name} - {formatPrice(item.price)}</option>
                ))}
              </select>
              <div style={{ marginTop: 8, fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>✓</span> Sẵn sàng chọn
              </div>
            </div>

            {/* RAM select */}
            <div style={{ background: 'rgba(30,41,59,0.6)', borderRadius: 12, padding: 16, border: '1px solid rgba(79,172,254,0.2)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#4facfe', fontWeight: 600, fontSize: 14 }}>
                <span>💾</span> RAM - Bộ Nhớ
              </label>
              <select value={config.ram} onChange={(e)=> setConfig(prev => ({ ...prev, ram: e.target.value }))} style={{ width: '100%', padding: 12, borderRadius: 8, background: '#1e293b', color: '#fff', border: '2px solid #475569', fontSize: 14, cursor: 'pointer' }}>
                {getRamsForMainboard(config.mainboard).map(item => (
                  <option key={item.id} value={item.id}>{item.name} - {formatPrice(item.price || catalogs.ram?.[item.id]?.price || 0)}</option>
                ))}
              </select>
              <div style={{ marginTop: 8, fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>✓</span> Sẵn sàng chọn
              </div>
            </div>

            {/* SSD select */}
            <div style={{ background: 'rgba(30,41,59,0.6)', borderRadius: 12, padding: 16, border: '1px solid rgba(79,172,254,0.2)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#4facfe', fontWeight: 600, fontSize: 14 }}>
                <span>💾</span> SSD - Ổ Cứng
              </label>
              <select value={config.ssd} onChange={(e)=> setConfig(prev => ({ ...prev, ssd: e.target.value }))} style={{ width: '100%', padding: 12, borderRadius: 8, background: '#1e293b', color: '#fff', border: '2px solid #475569', fontSize: 14, cursor: 'pointer' }}>
                {Object.values(inventory?.ssd || catalogs.ssd).map(item => (
                  <option key={item.id} value={item.id}>{item.name} - {formatPrice(item.price)}</option>
                ))}
              </select>
              <div style={{ marginTop: 8, fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>✓</span> Sẵn sàng chọn
              </div>
            </div>

            {/* HDD select */}
            <div style={{ background: 'rgba(30,41,59,0.6)', borderRadius: 12, padding: 16, border: '1px solid rgba(79,172,254,0.2)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#4facfe', fontWeight: 600, fontSize: 14 }}>
                <span>💿</span> HDD - Ổ Cứng Cơ
              </label>
              <select value={config.hdd || ''} onChange={(e)=> setConfig(prev => ({ ...prev, hdd: e.target.value || undefined }))} style={{ width: '100%', padding: 12, borderRadius: 8, background: '#1e293b', color: '#fff', border: '2px solid #475569', fontSize: 14, cursor: 'pointer' }}>
                <option value="">-- Chọn HDD --</option>
                {Object.values(inventory?.hdd || catalogs.hdd || {}).map(item => (
                  <option key={item.id} value={item.id}>{item.name} - {formatPrice(item.price)}</option>
                ))}
              </select>
              <div style={{ marginTop: 8, fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>✓</span> Sẵn sàng chọn
              </div>
            </div>

            {/* Monitor select */}
            <div style={{ background: 'rgba(30,41,59,0.6)', borderRadius: 12, padding: 16, border: '1px solid rgba(79,172,254,0.2)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#4facfe', fontWeight: 600, fontSize: 14 }}>
                <span>🖥️</span> Monitor - Màn Hình
              </label>
              <select value={config.monitor || ''} onChange={(e)=> setConfig(prev => ({ ...prev, monitor: e.target.value || undefined }))} style={{ width: '100%', padding: 12, borderRadius: 8, background: '#1e293b', color: '#fff', border: '2px solid #475569', fontSize: 14, cursor: 'pointer' }}>
                <option value="">-- Chọn MONITOR --</option>
                {Object.values(inventory?.monitor || catalogs.monitor || {}).map(item => (
                  <option key={item.id} value={item.id}>{item.name} - {formatPrice(item.price)}</option>
                ))}
              </select>
              <div style={{ marginTop: 8, fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>✓</span> Sẵn sàng chọn
              </div>
            </div>

            {/* PSU select */}
            <div style={{ background: 'rgba(30,41,59,0.6)', borderRadius: 12, padding: 16, border: '1px solid rgba(79,172,254,0.2)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#4facfe', fontWeight: 600, fontSize: 14 }}>
                <span>⚡</span> PSU - Nguồn
              </label>
              <select value={config.psu} onChange={(e)=> setConfig(prev => ({ ...prev, psu: e.target.value }))} style={{ width: '100%', padding: 12, borderRadius: 8, background: '#1e293b', color: '#fff', border: '2px solid #475569', fontSize: 14, cursor: 'pointer' }}>
                {Object.values(inventory?.psu || catalogs.psu).map(item => (
                  <option key={item.id} value={item.id}>{item.name} - {formatPrice(item.price)}</option>
                ))}
              </select>
              <div style={{ marginTop: 8, fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>✓</span> Sẵn sàng chọn
              </div>
            </div>

            {/* Case select */}
            <div style={{ background: 'rgba(30,41,59,0.6)', borderRadius: 12, padding: 16, border: '1px solid rgba(79,172,254,0.2)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#4facfe', fontWeight: 600, fontSize: 14 }}>
                <span>🏠</span> Case - Vỏ Máy
              </label>
              <select value={config.case} onChange={(e)=> setConfig(prev => ({ ...prev, case: e.target.value }))} style={{ width: '100%', padding: 12, borderRadius: 8, background: '#1e293b', color: '#fff', border: '2px solid #475569', fontSize: 14, cursor: 'pointer' }}>
                {Object.values(inventory?.case || catalogs.case).map(item => (
                  <option key={item.id} value={item.id}>{item.name} - {formatPrice(item.price)}</option>
                ))}
              </select>
              <div style={{ marginTop: 8, fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>✓</span> Sẵn sàng chọn
              </div>
            </div>

            {/* CPU Cooler select */}
            <div style={{ background: 'rgba(30,41,59,0.6)', borderRadius: 12, padding: 16, border: '1px solid rgba(79,172,254,0.2)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#4facfe', fontWeight: 600, fontSize: 14 }}>
                <span>🌀</span> CPU Cooler - Tản Nhiệt
              </label>
              <select value={config.cpuCooler} onChange={(e)=> setConfig(prev => ({ ...prev, cpuCooler: e.target.value }))} style={{ width: '100%', padding: 12, borderRadius: 8, background: '#1e293b', color: '#fff', border: '2px solid #475569', fontSize: 14, cursor: 'pointer' }}>
                {Object.values(inventory?.cpuCooler || catalogs.cpuCooler).map(item => (
                  <option key={item.id} value={item.id}>{item.name} - {formatPrice(item.price)}</option>
                ))}
              </select>
              <div style={{ marginTop: 8, fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>✓</span> Sẵn sàng chọn
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer with contact info */}
      {step === 4 && (
        <div style={{ marginTop: 24, background: 'linear-gradient(135deg,#0ea5e9,#06b6d4)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
            📞 Liên Hệ Trường Phát Computer Hòa Bình
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 16, border: '2px solid #fff' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0ea5e9', marginBottom: 8 }}>📱 Hotline</div>
              <a href="tel:0836768597" style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', textDecoration: 'none' }}>0836.768.597</a>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 16, border: '2px solid #fff' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0ea5e9', marginBottom: 8 }}>💬 Zalo</div>
              <a href="https://zalo.me/0836768597" target="_blank" rel="noopener noreferrer" style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', textDecoration: 'none' }}>0836.768.597</a>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 16, border: '2px solid #fff' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0ea5e9', marginBottom: 8 }}>👥 Facebook</div>
              <a href="https://www.facebook.com/tpcom.hb/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', textDecoration: 'none' }}>Trường Phát Computer Hòa Bình</a>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 16, border: '2px solid #fff' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0ea5e9', marginBottom: 8 }}>💬 Messenger</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Chat trực tiếp</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontWeight: 600, fontSize: 14 }}>
              <span>💳</span> AMD
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontWeight: 600, fontSize: 14 }}>
              <span>💳</span> JCB
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontWeight: 600, fontSize: 14 }}>
              <span>💵</span> ISM VND - Cam kết chất lượng
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


