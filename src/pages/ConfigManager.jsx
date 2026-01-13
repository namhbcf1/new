import { useState, useEffect } from 'react'
import { fetchAllConfigs, upsertConfig, deleteConfig, fetchInventory } from '../services/api'
import { getCatalogs, formatPrice as fmt } from '../data/components'
import intelConfigs from '../data/configs/intel/index.js'
import amdConfigs from '../data/configs/amd/index.js'
import { Settings, Plus, Upload, Download, Search, Edit, Trash2, Folder, FolderOpen, ChevronRight, Save, X, Cpu, Gamepad2, Database, Key } from 'lucide-react'

export default function ConfigManager() {
  const [configs, setConfigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [selectedCpuType, setSelectedCpuType] = useState('all')
  const [selectedGame, setSelectedGame] = useState('all')
  const [editingConfig, setEditingConfig] = useState(null)
  const [showAddNew, setShowAddNew] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importingAll, setImportingAll] = useState(false)
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, game: '', cpuType: '' })
  const [inventory, setInventory] = useState(null)
  const [expandedGames, setExpandedGames] = useState({})
  const catalogs = getCatalogs()

  useEffect(() => {
    const saved = sessionStorage.getItem('tp_admin_pwd')
    if (saved) {
      setPassword(saved)
      authenticate(saved)
    } else {
      setLoading(false)
    }
  }, [])

  async function authenticate(pwd) {
    if (!pwd || pwd.trim() === '') {
      alert('Vui lòng nhập mật khẩu!')
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Test auth logic preserved
      consttestPayload = { cpuType: '__test__', game: '__test__', budgetKey: '__test__', payload: { test: true } }
      await upsertConfig(pwd, consttestPayload) // This will throw if pwd wrong
      await deleteConfig(pwd, '__test__', '__test__', '__test__')

      const inv = await fetchInventory()
      setInventory(inv?.inventory || inv)
      const data = await fetchAllConfigs()

      const configsArray = []
      if (data) {
        for (const [cpuType, games] of Object.entries(data)) {
          if (games && typeof games === 'object') {
            for (const [game, budgets] of Object.entries(games)) {
              if (budgets && typeof budgets === 'object') {
                for (const [budgetKey, payload] of Object.entries(budgets)) {
                  configsArray.push({ cpu_type: cpuType, game: game, budget_key: budgetKey, payload: payload })
                }
              }
            }
          }
        }
      }
      setConfigs(configsArray)
      setAuthenticated(true)
      sessionStorage.setItem('tp_admin_pwd', pwd)
    } catch (err) {
      console.error(err)
      alert(err.message && err.message.includes('401') ? 'Mật khẩu không đúng!' : 'Lỗi kết nối hoặc sai mật khẩu')
      setAuthenticated(false)
      sessionStorage.removeItem('tp_admin_pwd')
    } finally {
      setLoading(false)
    }
  }

  async function loadConfigs() {
    setLoading(true)
    try {
      const data = await fetchAllConfigs()
      const configsArray = []
      if (data) {
        for (const [cpuType, games] of Object.entries(data)) {
          if (games && typeof games === 'object') {
            for (const [game, budgets] of Object.entries(games)) {
              if (budgets && typeof budgets === 'object') {
                for (const [budgetKey, payload] of Object.entries(budgets)) {
                  configsArray.push({ cpu_type: cpuType, game: game, budget_key: budgetKey, payload: payload })
                }
              }
            }
          }
        }
      }
      setConfigs(configsArray)
    } catch (err) { alert('Lỗi tải configs: ' + err.message) }
    finally { setLoading(false) }
  }

  async function handleSave(config) {
    try {
      await upsertConfig(password, config)
      alert('Lưu config thành công!')
      await loadConfigs()
      setEditingConfig(null)
      setShowAddNew(false)
    } catch (err) { alert('Lỗi lưu: ' + err.message) }
  }

  async function handleDelete(cpuType, game, budgetKey) {
    if (!confirm(`Xác nhận xóa config ${cpuType}/${game}/${budgetKey}?`)) return
    try {
      await deleteConfig(password, cpuType, game, budgetKey)
      alert('Đã xóa!')
      await loadConfigs()
    } catch (err) { alert('Lỗi xóa: ' + err.message) }
  }

  async function handleImportAll() {
    if (!password || !confirm('Import TẤT CẢ sẽ ghi đè dữ liệu trùng. Tiếp tục?')) return
    setImportingAll(true)
    const allConfigs = []

    // Logic preserved
    const process = (src, type) => {
      for (const [g, gC] of Object.entries(src || {})) {
        if (typeof gC === 'object') {
          for (const [b, p] of Object.entries(gC)) {
            if (typeof p === 'object') allConfigs.push({ cpu_type: type, game: g, budget_key: b, payload: p })
          }
        }
      }
    }
    process(intelConfigs, 'intel')
    process(amdConfigs, 'amd')

    setImportProgress({ current: 0, total: allConfigs.length, game: '', cpuType: '' })
    let s = 0, f = 0, errs = []

    for (let i = 0; i < allConfigs.length; i++) {
      const c = allConfigs[i]
      setImportProgress({ current: i + 1, total: allConfigs.length, game: c.game, cpuType: c.cpu_type })
      try { await upsertConfig(password, c); s++ }
      catch (e) { f++; errs.push(`${c.cpu_type}/${c.game}/${c.budget_key}: ${e.message}`) }
      await new Promise(r => setTimeout(r, 50))
    }
    setImportingAll(false)
    alert(`Import xong!\nThành công: ${s}\nLỗi: ${f}`)
    if (s > 0) await loadConfigs()
  }

  const games = [...new Set(configs.map(c => c.game))].sort()
  const cpuTypes = [...new Set(configs.map(c => c.cpu_type))].sort()
  const filteredConfigs = configs.filter(c => {
    if (selectedCpuType !== 'all' && c.cpu_type !== selectedCpuType) return false
    if (selectedGame !== 'all' && c.game !== selectedGame) return false
    return true
  })

  // Grouping logic preserved
  const groupedConfigs = filteredConfigs.reduce((acc, config) => {
    const key = `${config.cpu_type}/${config.game}`
    if (!acc[key]) acc[key] = []
    acc[key].push(config)
    return acc
  }, {})

  Object.keys(groupedConfigs).forEach(key => {
    groupedConfigs[key].sort((a, b) => {
      const aNum = parseInt(a.budget_key.replace('M', '')) || 0
      const bNum = parseInt(b.budget_key.replace('M', '')) || 0
      return aNum - bNum
    })
  })

  const sortedGroups = Object.entries(groupedConfigs).sort(([keyA], [keyB]) => {
    const [cpuA, gameA] = keyA.split('/')
    const [cpuB, gameB] = keyB.split('/')
    if (cpuA !== cpuB) return cpuA === 'intel' ? -1 : 1
    return gameA.localeCompare(gameB)
  })

  const toggleGame = (key) => setExpandedGames(p => ({ ...p, [key]: !p[key] }))
  const expandAll = () => { const a = {}; sortedGroups.forEach(([k]) => a[k] = true); setExpandedGames(a) }
  const collapseAll = () => setExpandedGames({})

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-blue-400">
      <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
      <p className="animate-pulse font-semibold">Đang xử lý dữ liệu...</p>
    </div>
  )

  if (!authenticated) return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-10 max-w-sm w-full text-center shadow-2xl animate-fade-in">
        <div className="w-16 h-16 bg-slate-800 rounded-2xl rotate-3 mx-auto mb-6 flex items-center justify-center border border-slate-700">
          <Settings className="w-8 h-8 text-blue-500 animate-[spin_10s_linear_infinite]" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Quản Lý Configs</h2>
        <p className="text-slate-500 mb-6 text-sm">Khu vực dành cho admin cấu hình PC</p>

        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Nhập mật khẩu..."
          className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
          autoFocus
        />
        <button
          onClick={() => authenticate(password)}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
        >
          Đăng Nhập
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 mb-8 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Database className="text-blue-500" /> Quản Lý Config Template
            </h1>
            <p className="text-slate-400 text-sm mt-1">Quản lý các cấu hình máy tính mẫu cho từng Game & Ngân sách</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={handleImportAll} disabled={importingAll} className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${importingAll ? 'bg-slate-700 cursor-not-allowed' : 'bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600/30'}`}>
              {importingAll ? <span className="animate-spin">⏳</span> : <Upload size={16} />} Import All
            </button>
            <button onClick={() => setShowImportModal(true)} disabled={importingAll} className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 font-bold text-sm flex items-center gap-2 transition-all">
              <Upload size={16} /> Import Game
            </button>
            <button onClick={() => setShowAddNew(true)} disabled={importingAll} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all">
              <Plus size={16} /> Thêm Mới
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} disabled
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-400 text-sm cursor-not-allowed"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Authenticated</span>
          </div>

          <div className="relative">
            <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <select
              value={selectedCpuType} onChange={e => setSelectedCpuType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm appearance-none focus:border-blue-500 outline-none"
            >
              <option value="all">Tất cả CPU</option>
              {cpuTypes.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </select>
          </div>

          <div className="relative">
            <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <select
              value={selectedGame} onChange={e => setSelectedGame(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm appearance-none focus:border-blue-500 outline-none"
            >
              <option value="all">Tất cả Game</option>
              {games.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        {/* Progress Bar */}
        {importingAll && (
          <div className="mt-6 bg-slate-800 rounded-lg p-3 border border-slate-700">
            <div className="flex justify-between text-xs text-blue-400 font-bold mb-2">
              <span>Đang xử lý: {importProgress.current} / {importProgress.total}</span>
              <span>{importProgress.cpuType} • {importProgress.game}</span>
            </div>
            <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      {sortedGroups.length > 0 && (
        <div className="flex justify-between items-center mb-4 px-2">
          <span className="text-slate-400 text-sm">Tìm thấy <strong>{filteredConfigs.length}</strong> cấu hình</span>
          <div className="flex gap-2">
            <button onClick={expandAll} className="text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors">Open All</button>
            <button onClick={collapseAll} className="text-xs font-bold text-slate-400 hover:text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg transition-colors">Close All</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {sortedGroups.map(([key, configList]) => {
          const [cpuType, game] = key.split('/')
          const isExpanded = expandedGames[key] || false

          return (
            <div key={key} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-slate-700">
              <div
                onClick={() => toggleGame(key)}
                className={`
                            px-6 py-4 cursor-pointer flex justify-between items-center select-none transition-colors
                            ${isExpanded ? 'bg-slate-800/50' : 'hover:bg-slate-800/30'}
                        `}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-1.5 rounded-lg ${isExpanded ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'} transition-all`}>
                    {isExpanded ? <FolderOpen size={20} /> : <Folder size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-200 flex items-center gap-2">
                      <span className="uppercase text-blue-400">{cpuType}</span>
                      <span className="text-slate-600">/</span>
                      <span className="capitalize">{game.replace(/_/g, ' ')}</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">{configList.length} variants</p>
                  </div>
                </div>
                <ChevronRight className={`text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
              </div>

              {isExpanded && (
                <div className="border-t border-slate-800 bg-slate-950/30 p-2 sm:p-4 grid gap-2">
                  {configList.map(config => (
                    <div
                      key={config.budget_key}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/30 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center font-black text-blue-400 border border-slate-700">
                          {config.budget_key}
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="text-slate-300">
                            <span className="text-slate-500 font-semibold w-10 inline-block">CPU</span>
                            {typeof config.payload === 'object' ? config.payload.cpu : JSON.parse(config.payload).cpu}
                          </div>
                          <div className="text-slate-300">
                            <span className="text-slate-500 font-semibold w-10 inline-block">VGA</span>
                            {typeof config.payload === 'object' ? config.payload.vga : JSON.parse(config.payload).vga}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 self-end sm:self-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingConfig(config)} className="p-2 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-lg transition-colors">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(config.cpu_type, config.game, config.budget_key)} className="p-2 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {sortedGroups.length === 0 && !loading && (
        <div className="text-center py-20 opacity-50">
          <Database className="w-20 h-20 mx-auto mb-4 text-slate-600" />
          <p className="text-xl font-bold text-slate-500">No configs found</p>
        </div>
      )}


      {/* Editor Modal */}
      {(editingConfig || showAddNew) && (
        <ConfigEditor
          config={editingConfig || {
            cpu_type: 'intel',
            game: '',
            budget_key: '',
            payload: { cpu: '', mainboard: '', vga: '', ram: '', ssd: '', case: '', cpuCooler: '', psu: '' }
          }}
          inventory={inventory}
          catalogs={catalogs}
          onSave={handleSave}
          onCancel={() => { setEditingConfig(null); setShowAddNew(false) }}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ConfigImporter
          intelConfigs={intelConfigs}
          amdConfigs={amdConfigs}
          password={password}
          onImport={async () => {
            await loadConfigs()
            setShowImportModal(false)
          }}
          onCancel={() => setShowImportModal(false)}
        />
      )}
    </div>
  )
}

function ConfigEditor({ config, inventory, catalogs, onSave, onCancel }) {
  const isNew = !config.payload
  const [formData, setFormData] = useState({
    cpu_type: config.cpu_type,
    game: config.game,
    budget_key: config.budget_key,
    payload: { ...(typeof config.payload === 'string' ? JSON.parse(config.payload) : (config.payload || {})) }
  })

  const updatePayload = (k, v) => setFormData(p => ({ ...p, payload: { ...p.payload, [k]: v } }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 bg-slate-800/90 backdrop-blur border-b border-slate-700 p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {isNew ? <Plus className="text-emerald-500" /> : <Edit className="text-blue-500" />}
            {isNew ? 'Tạo Config Mới' : 'Chỉnh Sửa Config'}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-white"><X size={24} /></button>
        </div>

        <div className="p-6 grid gap-6">
          {/* Meta Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-blue-400 mb-2">Loại CPU</label>
              <select
                value={formData.cpu_type}
                onChange={e => setFormData({ ...formData, cpu_type: e.target.value })}
                disabled={!isNew}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none disabled:opacity-50"
              >
                <option value="intel">INTEL</option>
                <option value="amd">AMD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-blue-400 mb-2">Game Key</label>
              <input
                value={formData.game}
                onChange={e => setFormData({ ...formData, game: e.target.value })}
                disabled={!isNew}
                placeholder="csgo, valorant..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-emerald-400 mb-2">Budget Key</label>
              <input
                value={formData.budget_key}
                onChange={e => setFormData({ ...formData, budget_key: e.target.value })}
                disabled={!isNew}
                placeholder="15M, 20M..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <div className="h-px bg-slate-800 my-2"></div>

          {/* Components Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { k: 'cpu', label: 'CPU' },
              { k: 'mainboard', label: 'Mainboard' },
              { k: 'vga', label: 'VGA' },
              { k: 'ram', label: 'RAM' },
              { k: 'ssd', label: 'SSD' },
              { k: 'psu', label: 'PSU' },
              { k: 'case', label: 'Case' },
              { k: 'cpuCooler', label: 'Tản Nhiệt' },
              { k: 'monitor', label: 'Màn Hình (Optional)' },
              { k: 'hdd', label: 'HDD (Optional)' },
            ].map(({ k, label }) => (
              <div key={k} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{label}</label>
                <input
                  value={formData.payload[k] || ''}
                  onChange={e => updatePayload(k, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white font-mono focus:border-blue-500 outline-none"
                  placeholder="ID linh kiện..."
                />
                <div className="mt-2 text-xs text-slate-500 truncate">
                  Mock Name: {inventory?.[k]?.[formData.payload[k]]?.name || catalogs?.[k]?.[formData.payload[k]]?.name || '---'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 p-6 bg-slate-800/90 backdrop-blur border-t border-slate-700 flex gap-4">
          <button onClick={onCancel} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold">Hủy</button>
          <button onClick={() => onSave(formData)} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20">Lưu Config</button>
        </div>
      </div>
    </div>
  )
}

function ConfigImporter({ intelConfigs, amdConfigs, password, onImport, onCancel }) {
  const [cpu, setCpu] = useState('intel')
  const [game, setGame] = useState('')
  const [loading, setLoading] = useState(false)

  // Calculate available games whenever cpu changes
  const availableGames = (cpu === 'intel' ? intelConfigs : amdConfigs) || {}
  const gameKeys = Object.keys(availableGames)

  useEffect(() => {
    if (gameKeys.length > 0) setGame(gameKeys[0])
    else setGame('')
  }, [cpu])

  async function handleImport() {
    if (!game) return
    setLoading(true)
    try {
      const configs = availableGames[game] || {}
      let count = 0
      for (const [budget, payload] of Object.entries(configs)) {
        await upsertConfig(password, {
          cpu_type: cpu,
          game: game,
          budget_key: budget,
          payload: payload
        })
        count++
      }
      alert(`Đã import thành công ${count} cấu hình ${cpu.toUpperCase()} - ${game}`)
      onImport()
    } catch (err) {
      alert('Lỗi import: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Upload className="text-blue-500" /> Import Config
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-white"><X size={24} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">Chọn Loại CPU Switch</label>
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => setCpu('intel')}
                className={`flex-1 py-2 rounded font-bold text-sm transition-all ${cpu === 'intel' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
              >
                INTEL
              </button>
              <button
                onClick={() => setCpu('amd')}
                className={`flex-1 py-2 rounded font-bold text-sm transition-all ${cpu === 'amd' ? 'bg-red-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
              >
                AMD
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">Chọn Game Template</label>
            <select
              value={game}
              onChange={e => setGame(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
            >
              {gameKeys.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-2">
              Lấy từ file local: {cpu === 'intel' ? 'data/configs/intel' : 'data/configs/amd'}
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-700 flex gap-4">
          <button onClick={onCancel} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold">Hủy</button>
          <button
            onClick={handleImport}
            disabled={loading || !game}
            className={`
                            flex-1 py-3 rounded-xl font-bold text-white transition-all
                            ${loading || !game ? 'bg-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg hover:shadow-blue-500/25'}
                        `}
          >
            {loading ? 'Đang Import...' : 'Xác Nhận Import'}
          </button>
        </div>
      </div>
    </div>
  )
}
