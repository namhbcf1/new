import { useMemo, useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import html2canvas from 'html2canvas'
import { getCatalogs, formatPrice as fmt } from '../data/components'
import { generateSmartConfig, getCompatibleMainboards, getCompatibleRAMs, totalPrice } from '../lib/configGen'
import {
  Monitor, Cpu, HardDrive, LayoutTemplate, Disc, Cable, Box, Fan,
  Search, Calculator, RefreshCw, Printer, Camera, Check, ChevronRight, ArrowLeft
} from 'lucide-react'

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
  const catalogs = useMemo(() => getCatalogs(), [config])

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
    // Logic kept 100% same as original
    const budgetKey = `${budget}M`
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

  // --- Helpers for compatibility logic (Copied from original) ---
  function inferSocketFromName(name = '') {
    if (/\bAM5\b/i.test(name)) return 'AM5'
    if (/\bAM4\b/i.test(name)) return 'AM4'
    const lga = name.match(/LGA\s*(\d{3,4})/i)
    if (lga) return `LGA${lga[1]}`
    return null
  }
  function inferDDRFromName(name = '') {
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
  function inferBoardSocketByChipset(name = '') {
    const n = name.toUpperCase()
    const has = (re) => re.test(n)
    if (has(/\b(H610(M)?|B660(M)?|B760(M)?|H770|Z690|Z790)\b/)) return 'LGA1700'
    if (has(/\b(H410(M)?|B460(M)?|Z490|H510(M)?|B560(M)?|Z590)\b/)) return 'LGA1200'
    if (has(/\b(H310(M)?|B360(M)?|B365(M)?|Z370|Z390)\b/)) return 'LGA1151'
    if (has(/\b(H110(M)?|B150(M)?|B250(M)?|Z270)\b/)) return 'LGA1151'
    if (has(/\b(H81(M)?|B85(M)?|Z87|Z97)\b/)) return 'LGA1150'
    if (has(/\bH61(?!0)\w*\b/) || has(/\bB75(M)?\b/) || has(/\bZ77\b/)) return 'LGA1155'
    if (has(/\b(B650(M)?|X670(E)?|A620(M)?)\b/)) return 'AM5'
    if (has(/\b(B550(M)?|X570|A520(M)?|B450(M)?|X470|A320(M)?)\b/)) return 'AM4'
    return null
  }
  function inferCpuSocketFromName(name = '') {
    const up = name.toUpperCase()
    const xeonE3 = up.match(/XEON\s*E3[-\s]?(\d{4}).*?V\s*([1-6])/)
    if (xeonE3) {
      const gen = parseInt(xeonE3[2], 10)
      if (gen === 1 || gen === 2) return 'LGA1155'
      if (gen === 3 || gen === 4) return 'LGA1150'
      if (gen === 5 || gen === 6) return 'LGA1151'
    }
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
    if (/\b1(2|3|4)\d{3}\w*/i.test(name)) return 'LGA1700'
    if (/\b(10|11)\d{3}\w*/i.test(name)) return 'LGA1200'
    if (/\b(6|7|8|9)\d{3}\w*/i.test(name)) return 'LGA1151'
    const s = inferSocketFromName(name)
    if (s) return s
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
      let ddr = inv?.ddr || inv?.ram_support || local?.ddr
      if (!ddr) {
        if (/XEON\s*E3[^V]*V\s*[1-2]/i.test(inv.name)) ddr = 'DDR3'
        if (/XEON\s*E3[^V]*V\s*[3-4]/i.test(inv.name)) ddr = 'DDR3'
        if (/XEON\s*E3[^V]*V\s*[5-6]/i.test(inv.name)) ddr = 'DDR4'
        if (/\b1(2|3|4)\d{3}/.test(inv.name)) ddr = 'DDR4'
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
        let sock = normalizeSocket(item.socket) || normalizeSocket((item.sockets && item.sockets[0])) || normalizeSocket(item.name) || inferBoardSocketByChipset(item.name)
        const ddr = normalizeDDR(item.memoryType || item.ddr) || inferDDRFromName(item.name)
        if (meta.socket) {
          const cpuSock = normalizeSocket(meta.socket) || meta.socket
          if (!sock) return
          if (sock !== cpuSock) return
        }
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
    <div className="animate-fade-in">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-slate-900/90 backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="text-white text-lg font-semibold animate-pulse">Đang tải dữ liệu...</div>
        </div>
      )}

      {/* Steps Indicator */}
      <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-xl p-4 mb-8 shadow-xl">
        <div className="flex justify-between max-w-4xl mx-auto relative px-4">
          {/* Progress Line */}
          <div className="absolute top-5 left-4 right-4 h-0.5 bg-slate-800 -z-10 mx-8"></div>

          {[
            { id: 1, label: 'Ngân Sách' },
            { id: 2, label: 'CPU' },
            { id: 3, label: 'Game' },
            { id: 4, label: 'Hoàn Thành' }
          ].map((s, idx) => {
            const isActive = step >= s.id;
            const canNavigate = (s.id === 1) || (s.id === 2 && canStep2) || (s.id === 3 && canStep3) || (s.id === 4 && canStep4);

            return (
              <div
                key={s.id}
                onClick={() => canNavigate && goTo(s.id)}
                className={`flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 ${!canNavigate ? 'opacity-40 pointer-events-none' : 'opacity-100 hover:scale-105'}`}
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg transition-all duration-500
                  ${isActive
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'}
                `}>
                  {s.id}
                </div>
                <span className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Step 1: Budget */}
      {step === 1 && (
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm max-w-3xl mx-auto animate-slide-up">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              💰 Chọn Ngân Sách
            </h2>
            <p className="text-slate-400">Dự kiến chi phí đầu tư cho bộ PC của bạn</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-8">
            {[8, 10, 12, 15, 20, 25, 30].map(price => (
              <button
                key={price}
                onClick={() => setBudget(price)}
                className={`
                  py-4 rounded-xl font-bold text-lg transition-all duration-300 transform
                  ${budget === price
                    ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30 scale-105 ring-2 ring-blue-400/50'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'}
                `}
              >
                {price}M
              </button>
            ))}
          </div>

          <div className="mb-8 bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
            <p className="text-slate-400 text-sm mb-4">Hoặc kéo thanh trượt để chọn số tiền:</p>
            <input
              type="range"
              min={3}
              max={30}
              step={1}
              value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-colors"
            />
            <div className="mt-6 text-center">
              <span className="text-5xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
                {budget} <span className="text-2xl font-bold text-slate-500">triệu VNĐ</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Tiếp theo <ChevronRight />
          </button>
        </div>
      )}

      {/* Step 2: CPU Type */}
      {step === 2 && (
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm max-w-4xl mx-auto animate-slide-up">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              ⚡ Chọn Loại CPU
            </h2>
            <p className="text-slate-400">Bạn thuộc team Đội Xanh (Intel) hay Đội Đỏ (AMD)?</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {[
              { type: 'intel', name: 'INTEL CORE', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-1.07 3.97-2.1 5.39z', color: 'from-blue-600 to-blue-800', border: 'border-blue-500', shadow: 'shadow-blue-500/20', desc: 'Hiệu năng gaming đỉnh cao, ổn định tuyệt đối' },
              { type: 'amd', name: 'AMD RYZEN', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-1.07 3.97-2.1 5.39z', color: 'from-red-600 to-orange-600', border: 'border-red-500', shadow: 'shadow-red-500/20', desc: 'Đa nhiệm mượt mà, P/P tốt nhất phân khúc' }
            ].map((item) => (
              <div
                key={item.type}
                onClick={() => { setCpuType(item.type); setTimeout(() => setStep(3), 200) }}
                className={`
                  relative overflow-hidden group p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300
                  ${cpuType === item.type
                    ? `bg-gradient-to-br ${item.color} border-transparent scale-105 shadow-xl`
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800'}
                `}
              >
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className={`text-6xl mb-4 transition-transform duration-300 group-hover:scale-110 ${cpuType === item.type ? 'text-white' : item.type === 'intel' ? 'text-blue-500' : 'text-red-500'}`}>
                    {item.type === 'intel' ? '🔵' : '🔴'}
                  </div>
                  <h3 className={`text-2xl font-black uppercase mb-3 ${cpuType === item.type ? 'text-white' : 'text-slate-200'}`}>
                    {item.name}
                  </h3>
                  <p className={`text-sm font-medium ${cpuType === item.type ? 'text-white/90' : 'text-slate-400'}`}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-10">
            <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors flex items-center gap-2">
              <ArrowLeft size={18} /> Quay lại
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Game Selection */}
      {step === 3 && (
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm max-w-5xl mx-auto animate-slide-up">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              🎮 Chọn Game Yêu Thích
            </h2>
            <p className="text-slate-400">Chọn tựa game bạn muốn chiến "mượt" nhất</p>
          </div>

          <div className="relative max-w-xl mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm game (Valorant, PUBG, GTA V...)"
              value={gameSearch}
              onChange={(e) => setGameSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-800 border-2 border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredGames.map(g => (
              <div
                key={g.id}
                onClick={() => { setGame(g.id); setTimeout(() => { computeConfig(g.id); setStep(4) }, 150) }}
                className={`
                  group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300
                  ${game === g.id
                    ? 'ring-4 ring-blue-500 scale-95 shadow-lg shadow-blue-500/40'
                    : 'hover:scale-105 hover:shadow-xl hover:ring-2 hover:ring-blue-400/50'}
                `}
              >
                <div className="aspect-[3/4] overflow-hidden bg-slate-800">
                  <img src={g.image} alt={g.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h4 className="text-white font-bold text-sm text-center drop-shadow-md">{g.name}</h4>
                  </div>
                </div>
                {game === g.id && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full shadow-lg">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <button onClick={() => setStep(2)} className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors flex items-center gap-2">
              <ArrowLeft size={18} /> Quay lại
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Configuration Result */}
      {step === 4 && (
        <div className="animate-fade-in space-y-8">
          {!config ? (
            <div className="text-center p-12 text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
              <p>Chưa có cấu hình được tạo. Vui lòng thử lại.</p>
              <button onClick={() => setStep(1)} className="mt-4 text-blue-400 hover:underline">Quay về trang chủ</button>
            </div>
          ) : (
            <>
              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 backdrop-blur p-4 rounded-xl border border-slate-700/50 shadow-lg sticky top-[70px] z-40">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10 text-green-500">
                    <Calculator size={18} />
                  </span>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tổng giá trị</p>
                    <p className="text-xl font-black text-green-400">
                      {formatPrice(Object.entries(config).filter(([k, v]) => v !== null && v !== undefined).reduce((sum, [k, v]) => {
                        const item = inventory?.[k]?.[v] || catalogs[k]?.[v]
                        const customData = customPrices[k] || {}
                        const price = customData.price !== undefined ? customData.price : (item?.price || 0)
                        const quantity = customData.quantity !== undefined ? customData.quantity : (item?.quantity || 1)
                        return sum + (price * quantity)
                      }, 0))} VNĐ
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setStep(1); setBudget(15); setCpuType(null); setGame(null); setGameSearch(''); setConfig(null); setCustomPrices({});
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-semibold text-sm transition-colors"
                  >
                    <RefreshCw size={16} /> <span className="hidden sm:inline">Làm mới</span>
                  </button>
                  <button
                    onClick={async () => {
                      const el = document.getElementById('printable-area')
                      // (Logic remains same as original script, strict copy)
                      if (!el) return
                      const clone = el.cloneNode(true)
                      clone.style.position = 'absolute'; clone.style.left = '-9999px'; document.body.appendChild(clone)
                      const inputs = clone.querySelectorAll('input'); inputs.forEach(input => { const span = document.createElement('span'); span.textContent = input.value; span.style.cssText = input.style.cssText; span.style.border = 'none'; span.style.background = 'transparent'; span.style.display = 'inline-block'; input.parentNode.replaceChild(span, input) })
                      const selects = clone.querySelectorAll('select'); selects.forEach(select => { const span = document.createElement('span'); span.textContent = select.options[select.selectedIndex]?.text || select.value; span.style.cssText = select.style.cssText; span.style.border = 'none'; span.style.background = 'transparent'; select.parentNode.replaceChild(span, select) })
                      const cloneBanner = clone.querySelector('.print-header'); if (cloneBanner) cloneBanner.style.setProperty('display', 'block', 'important')
                      await new Promise(resolve => setTimeout(resolve, 100))
                      const canvas = await html2canvas(clone, { backgroundColor: '#fff', scale: 2, logging: false })
                      document.body.removeChild(clone)
                      const link = document.createElement('a'); link.download = `pc-config-${Date.now()}.png`; link.href = canvas.toDataURL('image/png'); link.click()
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-blue-500/20"
                  >
                    <Camera size={16} /> <span className="hidden sm:inline">Chụp Ảnh</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    <Printer size={16} /> <span className="hidden sm:inline">In Báo Giá</span>
                  </button>
                </div>
              </div>

              {/* Configuration Table Area */}
              <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
                <div id="printable-area" className="bg-white text-slate-900">
                  {/* Print Header */}
                  <div className="print-header hidden bg-red-600 text-white p-4 text-center">
                    <h2 className="text-lg font-bold uppercase mb-1">TRƯỜNG PHÁT COMPUTER XIN GỬI BẢNG CHI TIẾT CẤU HÌNH MÁY TÍNH</h2>
                    <p className="text-xs opacity-90">
                      {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-700 to-blue-800 text-white">
                          <th className="p-3 border border-blue-600 w-12">STT</th>
                          <th className="p-3 border border-blue-600 w-20">Ảnh</th>
                          <th className="p-3 border border-blue-600 text-left">Tên Linh Kiện</th>
                          <th className="p-3 border border-blue-600 w-16">ĐVT</th>
                          <th className="p-3 border border-blue-600 w-20">SL</th>
                          <th className="p-3 border border-blue-600 w-32 text-right">Đơn Giá</th>
                          <th className="p-3 border border-blue-600 w-36 text-right">Thành Tiền</th>
                          <th className="p-3 border border-blue-600 w-24">Bảo Hành</th>
                          <th className="p-3 border border-blue-600 w-24">Tình Trạng</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(config).filter(([k, v]) => v !== null && v !== undefined).map(([k, v], idx) => {
                          const localItem = catalogs[k]?.[v]
                          const invItem = inventory?.[k]?.[v]
                          const item = { ...(localItem || {}), ...(invItem || {}) }

                          const customData = customPrices[k] || {}
                          const price = customData.price !== undefined ? customData.price : (item?.price || 0)
                          const quantity = customData.quantity !== undefined ? customData.quantity : (item?.quantity || 1)
                          const warranty = customData.warranty || item?.warranty || '36T'
                          const condition = customData.condition || (item?.condition === '2ND' || item?.condition === '2nd' ? '2ND' : 'NEW')

                          const image = item?.image || '/images/placeholder.jpg'

                          const updateCustomValue = (field, value) => {
                            setCustomPrices(prev => ({
                              ...prev,
                              [k]: { ...prev[k], [field]: value }
                            }))
                          }

                          return (
                            <tr key={k} className={`${idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                              <td className="p-2 border border-slate-300 text-center font-bold text-slate-500">{idx + 1}</td>
                              <td className="p-2 border border-slate-300">
                                <div className="w-12 h-12 rounded bg-slate-200 overflow-hidden mx-auto">
                                  <img src={image} alt="" className="w-full h-full object-cover" />
                                </div>
                              </td>
                              <td className="p-2 border border-slate-300 font-medium text-slate-800">
                                {item?.name || v}
                                <div className="flex gap-1 mt-1">
                                  {item?.brand && <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold">{item.brand}</span>}
                                  {(item?.socket || item?.sockets?.[0]) && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-bold">{item?.socket || item?.sockets?.[0]}</span>}
                                </div>
                              </td>
                              <td className="p-2 border border-slate-300 text-center text-slate-500 font-semibold">Cái</td>
                              <td className="p-2 border border-slate-300 text-center">
                                <input
                                  type="number" min="1" value={quantity}
                                  onChange={(e) => updateCustomValue('quantity', parseInt(e.target.value) || 1)}
                                  className="w-12 text-center border-2 border-blue-200 rounded text-blue-600 font-bold focus:border-blue-500 focus:outline-none bg-white p-1"
                                />
                              </td>
                              <td className="p-2 border border-slate-300 text-right">
                                <input
                                  type="number" min="0" step="10000" value={price}
                                  onChange={(e) => updateCustomValue('price', parseInt(e.target.value) || 0)}
                                  className="w-24 text-right border-2 border-blue-200 rounded text-slate-700 font-medium focus:border-blue-500 focus:outline-none bg-white p-1 text-xs"
                                />
                              </td>
                              <td className="p-2 border border-slate-300 text-right font-bold text-emerald-600">
                                {formatPrice(price * quantity)}
                              </td>
                              <td className="p-2 border border-slate-300 text-center">
                                <input
                                  type="text" value={warranty}
                                  onChange={(e) => updateCustomValue('warranty', e.target.value)}
                                  className="w-16 text-center border border-slate-200 rounded text-slate-600 text-xs focus:border-blue-500 focus:outline-none bg-white p-1"
                                />
                              </td>
                              <td className="p-2 border border-slate-300 text-center">
                                <select
                                  value={condition}
                                  onChange={(e) => updateCustomValue('condition', e.target.value)}
                                  className={`text-xs font-bold px-1 py-0.5 rounded border-0 cursor-pointer ${condition === 'NEW' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                                >
                                  <option value="NEW">NEW</option>
                                  <option value="2ND">2ND</option>
                                </select>
                              </td>
                            </tr>
                          )
                        })}
                        <tr className="bg-emerald-600 text-white">
                          <td colSpan="6" className="p-4 text-center font-black text-lg border-t border-emerald-700 uppercase tracking-widest">
                            Tổng Cộng
                          </td>
                          <td className="p-4 text-right font-black text-xl border-t border-emerald-700 bg-emerald-700">
                            {formatPrice(Object.entries(config).filter(([k, v]) => v !== null && v !== undefined).reduce((sum, [k, v]) => {
                              const item = inventory?.[k]?.[v] || catalogs[k]?.[v]
                              const customData = customPrices[k] || {}
                              const price = customData.price !== undefined ? customData.price : (item?.price || 0)
                              const quantity = customData.quantity !== undefined ? customData.quantity : (item?.quantity || 1)
                              return sum + (price * quantity)
                            }, 0))} VNĐ
                          </td>
                          <td colSpan="2" className="bg-emerald-600"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Edit Components Panel */}
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                <h3 className="flex items-center gap-2 text-xl font-bold text-blue-400 mb-6 pb-4 border-b border-slate-800">
                  <Settings size={28} /> Tùy Chỉnh Linh Kiện Nâng Cao
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { id: 'cpu', label: 'CPU - Bộ Vi Xử Lý', icon: Cpu, options: Object.values(inventory?.cpu || catalogs.cpu || {}) },
                    {
                      id: 'mainboard', label: 'Mainboard - Bo Mạch', icon: LayoutTemplate, options: getMainboardsForCpu(config.cpu), onChange: (e) => {
                        const mainboard = e.target.value
                        const rams = getRamsForMainboard(mainboard)
                        const newRam = rams[0]?.id || config.ram
                        setConfig(prev => ({ ...prev, mainboard, ram: newRam }))
                      }
                    },
                    { id: 'vga', label: 'VGA - Card Đồ Họa', icon: Monitor, options: Object.values(inventory?.vga || catalogs.vga || {}) },
                    { id: 'ram', label: 'RAM - Bộ Nhớ Trong', icon: Box, options: getRamsForMainboard(config.mainboard) },
                    { id: 'ssd', label: 'SSD - Lưu Trữ Nhanh', icon: HardDrive, options: Object.values(inventory?.ssd || catalogs.ssd || {}) },
                    { id: 'hdd', label: 'HDD - Lưu Trữ Phụ', icon: Disc, options: Object.values(inventory?.hdd || catalogs.hdd || {}), optional: true },
                    { id: 'psu', label: 'PSU - Nguồn Máy Tính', icon: Cable, options: Object.values(inventory?.psu || catalogs.psu || {}) },
                    { id: 'case', label: 'CASE - Vỏ Máy Tính', icon: LayoutTemplate, options: Object.values(inventory?.case || catalogs.case || {}) },
                    { id: 'cpuCooler', label: 'COOLING - Tản Nhiệt', icon: Fan, options: Object.values(inventory?.cpuCooler || catalogs.cpuCooler || {}) },
                    { id: 'monitor', label: 'MONITOR - Màn Hình', icon: Monitor, options: Object.values(inventory?.monitor || catalogs.monitor || {}), optional: true },
                  ].map((comp) => (
                    <div key={comp.id} className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 hover:border-blue-500/50 transition-colors">
                      <label className="flex items-center gap-2 text-blue-400 font-semibold mb-3 text-sm">
                        <comp.icon size={16} /> {comp.label}
                      </label>
                      <div className="relative">
                        <select
                          value={config[comp.id] || ''}
                          onChange={comp.onChange || ((e) => setConfig(prev => ({ ...prev, [comp.id]: e.target.value || undefined })))}
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2.5 px-3 text-slate-200 text-sm focus:outline-none focus:border-blue-500 appearance-none cursor-pointer hover:bg-slate-800 transition-colors"
                        >
                          {comp.optional && <option value="">- Không chọn -</option>}
                          {comp.options.filter(i => i && i.id).map(i => (
                            <option key={i.id} value={i.id}>{i.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                          <ChevronRight className="rotate-90 w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Info */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center shadow-lg">
                <h3 className="text-xl font-bold text-white mb-6">Liên Hệ Trường Phát Computer Hòa Bình</h3>
                <div className="flex flex-wrap justify-center gap-6">
                  <a href="tel:0836768597" className="flex items-center gap-3 px-6 py-3 bg-white/10 rounded-xl backdrop-blur hover:bg-white/20 transition text-white font-semibold">
                    <span className="text-xl">📞</span> 083.6768.597
                  </a>
                  <a href="https://zalo.me/0836768597" target="_blank" className="flex items-center gap-3 px-6 py-3 bg-white/10 rounded-xl backdrop-blur hover:bg-white/20 transition text-white font-semibold">
                    <span className="text-xl font-bold text-blue-300">Z</span> Zalo Chat
                  </a>
                  <a href="https://www.facebook.com/tpcom.hb" target="_blank" className="flex items-center gap-3 px-6 py-3 bg-white/10 rounded-xl backdrop-blur hover:bg-white/20 transition text-white font-semibold">
                    <span className="text-xl">👥</span> Facebook
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Global Print Styles (Tailwind) */}
      <style>{`
        @media print {
            @page { margin: 5mm; size: A4; }
            body * { visibility: hidden; }
            #printable-area, #printable-area * { visibility: visible; }
            #printable-area { position: absolute; left: 0; top: 0; width: 100%; color: black !important; background: white !important; }
            .print-header { display: block !important; }
            table { width: 100%; font-size: 10pt; }
            th, td { padding: 4px !important; border-color: #000 !important; }
            input, select { border: none !important; appearance: none !important; background: transparent !important; color: black !important; }
        }
      `}</style>
    </div>
  )
}

function Settings({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  )
}
