import { useState, useEffect } from 'react'
import { fetchAllConfigs, upsertConfig, deleteConfig, fetchInventory } from '../services/api'
import { getCatalogs, formatPrice as fmt } from '../data/components'

export default function ConfigManager() {
  const [configs, setConfigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [selectedCpuType, setSelectedCpuType] = useState('all')
  const [selectedGame, setSelectedGame] = useState('all')
  const [editingConfig, setEditingConfig] = useState(null)
  const [showAddNew, setShowAddNew] = useState(false)
  const [inventory, setInventory] = useState(null)
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
    setLoading(true)
    try {
      // Load inventory & configs when authenticated
      const inv = await fetchInventory()
      setInventory(inv?.inventory || inv)
      const data = await fetchAllConfigs()
      setConfigs(data?.configs || [])
      setAuthenticated(true)
      sessionStorage.setItem('tp_admin_pwd', pwd)
    } catch (err) {
      console.error(err)
      alert('Không thể kết nối tới API. Kiểm tra cấu hình API_BASE và mật khẩu.')
    } finally {
      setLoading(false)
    }
  }

  async function loadConfigs() {
    setLoading(true)
    try {
      const data = await fetchAllConfigs()
      if (data && data.configs) setConfigs(data.configs)
    } catch (err) {
      console.error('Failed to load configs:', err)
      alert('Lỗi khi tải configs: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(config) {
    try {
      await upsertConfig(password, config)
      alert('Lưu config thành công!')
      await loadConfigs()
      setEditingConfig(null)
      setShowAddNew(false)
    } catch (err) {
      alert('Lỗi khi lưu config: ' + err.message)
    }
  }

  async function handleDelete(cpuType, game, budgetKey) {
    if (!confirm(`Xác nhận xóa config ${cpuType}/${game}/${budgetKey}?`)) return
    try {
      await deleteConfig(password, cpuType, game, budgetKey)
      alert('Xóa config thành công!')
      await loadConfigs()
    } catch (err) {
      alert('Lỗi khi xóa config: ' + err.message)
    }
  }

  // Get unique games and cpu types
  const games = [...new Set(configs.map(c => c.game))].sort()
  const cpuTypes = [...new Set(configs.map(c => c.cpu_type))].sort()

  // Filter configs
  const filteredConfigs = configs.filter(c => {
    if (selectedCpuType !== 'all' && c.cpu_type !== selectedCpuType) return false
    if (selectedGame !== 'all' && c.game !== selectedGame) return false
    return true
  })

  // Group by game
  const groupedConfigs = filteredConfigs.reduce((acc, config) => {
    const key = `${config.cpu_type}/${config.game}`
    if (!acc[key]) acc[key] = []
    acc[key].push(config)
    return acc
  }, {})

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '24px' }}>⏳ Đang tải...</div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <div style={{ background: 'rgba(30,41,59,0.95)', padding: 32, borderRadius: 12, border: '1px solid rgba(79,172,254,0.3)', width: 360 }}>
          <h2 style={{ marginTop: 0, marginBottom: 12 }}>🔐 Đăng nhập Admin</h2>
          <p style={{ color: '#94a3b8', marginTop: 0, marginBottom: 16 }}>Nhập mật khẩu để quản lý cấu hình đề xuất.</p>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu..."
            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid rgba(79,172,254,0.3)', background: '#0b1220', color: '#fff', marginBottom: 12 }}
          />
          <button onClick={() => authenticate(password)} style={{ width: '100%', padding: 12, border: 0, borderRadius: 8, background: 'linear-gradient(135deg,#4facfe,#00f2fe)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            🔓 Đăng nhập
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        background: 'rgba(30,41,59,0.9)',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h1 style={{ margin: '0 0 20px 0', fontSize: '28px' }}>Quản lý Config Game</h1>

        {/* Password & Filters */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Mật khẩu:</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid rgba(79,172,254,0.3)',
                background: 'rgba(15,23,42,0.8)',
                color: '#f8fafc',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Loại CPU:</label>
            <select
              value={selectedCpuType}
              onChange={e => setSelectedCpuType(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid rgba(79,172,254,0.3)',
                background: 'rgba(15,23,42,0.8)',
                color: '#f8fafc',
                fontSize: '14px'
              }}
            >
              <option value="all">Tất cả</option>
              {cpuTypes.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Game:</label>
            <select
              value={selectedGame}
              onChange={e => setSelectedGame(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid rgba(79,172,254,0.3)',
                background: 'rgba(15,23,42,0.8)',
                color: '#f8fafc',
                fontSize: '14px',
                minWidth: '150px'
              }}
            >
              <option value="all">Tất cả</option>
              {games.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}>
            <button
              onClick={() => setShowAddNew(true)}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                background: 'linear-gradient(135deg,#667eea,#764ba2)',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ➕ Thêm Config Mới
            </button>
          </div>
        </div>

        <div style={{ fontSize: '14px', color: '#94a3b8' }}>
          Tổng: {filteredConfigs.length} configs
        </div>
      </div>

      {/* Config Groups */}
      {Object.entries(groupedConfigs).map(([key, configList]) => {
        const [cpuType, game] = key.split('/')
        return (
          <div
            key={key}
            style={{
              background: 'rgba(30,41,59,0.8)',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '16px'
            }}
          >
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>
              {cpuType.toUpperCase()} - {game}
            </h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {configList.map(config => (
                <ConfigCard
                  key={`${config.cpu_type}-${config.game}-${config.budget_key}`}
                  config={config}
                  onEdit={() => setEditingConfig(config)}
                  onDelete={() => handleDelete(config.cpu_type, config.game, config.budget_key)}
                />
              ))}
            </div>
          </div>
        )
      })}

      {/* Edit Modal */}
      {editingConfig && (
        <ConfigEditor
          config={editingConfig}
          inventory={inventory}
          catalogs={catalogs}
          onSave={handleSave}
          onCancel={() => setEditingConfig(null)}
        />
      )}

      {/* Add New Modal */}
      {showAddNew && (
        <ConfigEditor
          config={{
            cpu_type: 'intel',
            game: '',
            budget_key: '',
            payload: { cpu: '', mainboard: '', vga: '', ram: '', ssd: '', case: '', cpuCooler: '', psu: '' }
          }}
          inventory={inventory}
          catalogs={catalogs}
          onSave={handleSave}
          onCancel={() => setShowAddNew(false)}
        />
      )}
    </div>
  )
}

function ConfigCard({ config, onEdit, onDelete }) {
  const payload = typeof config.payload === 'string' ? JSON.parse(config.payload) : config.payload

  return (
    <div style={{
      background: 'rgba(15,23,42,0.9)',
      padding: '16px',
      borderRadius: '6px',
      border: '1px solid rgba(79,172,254,0.2)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '16px', color: '#4facfe' }}>
          {config.budget_key}
        </div>
        <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
          CPU: {payload.cpu} | MB: {payload.mainboard} | VGA: {payload.vga}<br/>
          RAM: {payload.ram} | SSD: {payload.ssd} | Case: {payload.case}<br/>
          Cooler: {payload.cpuCooler} | PSU: {payload.psu}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onEdit}
          style={{
            padding: '6px 12px',
            borderRadius: '4px',
            border: 'none',
            background: 'rgba(79,172,254,0.2)',
            color: '#4facfe',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          ✏️ Sửa
        </button>
        <button
          onClick={onDelete}
          style={{
            padding: '6px 12px',
            borderRadius: '4px',
            border: 'none',
            background: 'rgba(239,68,68,0.2)',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          🗑️ Xóa
        </button>
      </div>
    </div>
  )
}

function ConfigEditor({ config, onSave, onCancel, inventory, catalogs }) {
  const showAll = false
  const [query, setQuery] = useState('')
  const [queryDebounced, setQueryDebounced] = useState('')
  const [formData, setFormData] = useState({
    cpu_type: config.cpu_type || 'intel',
    game: config.game || '',
    budget_key: config.budget_key || '',
    payload: typeof config.payload === 'string' ? JSON.parse(config.payload) : config.payload
  })

  const formatPrice = fmt
  function normalizeSocket(v) {
    if (!v) return null
    const s = String(v).toUpperCase().replace(/\s+/g,'')
    if (s.startsWith('AM5')) return 'AM5'
    if (s.startsWith('AM4')) return 'AM4'
    const lga = s.match(/LGA\s*([0-9]{3,4})/i) || s.match(/LGA([0-9]{3,4})/i)
    return lga ? `LGA${lga[1]}` : null
  }
  function normalizeDDR(v) {
    if (!v) return null
    const s = String(v).toUpperCase()
    if (s.includes('DDR5')) return 'DDR5'
    if (s.includes('DDR4')) return 'DDR4'
    if (s.includes('DDR3')) return 'DDR3'
    return null
  }
  function inferBoardSocketByChipset(name='') {
    const n = String(name).toUpperCase()
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
  function socketFromItem(it) {
    return (
      normalizeSocket(it?.socket) ||
      (it?.name && (normalizeSocket(it.name) || inferBoardSocketByChipset(it.name))) ||
      null
    )
  }
  function ddrFromItem(it) {
    return (
      normalizeDDR(it?.memoryType || it?.ddr) ||
      (it?.name && normalizeDDR(it.name)) ||
      null
    )
  }
  const allOf = (cat) => {
    const invObj = inventory?.[cat]
    if (invObj && typeof invObj === 'object') {
      const list = Object.entries(invObj).map(([id, val]) => ({ id, ...(val || {}) }))
      if (list.length > 0) return list
    }
    return Object.values(catalogs?.[cat] || {})
  }
  useEffect(() => {
    const t = setTimeout(()=> setQueryDebounced(query.trim()), 200)
    return () => clearTimeout(t)
  }, [query])
  const findItem = (cat, id) => {
    if (!id) return null
    return (inventory?.[cat]?.[id]) || (catalogs?.[cat]?.[id]) || null
  }
  const getOptions = (cat) => {
    // Base list (prefer D1)
    let list = allOf(cat)

    // Filter CPUs by selected cpu_type
    if (!showAll && cat === 'cpu') {
      list = list.filter(it => {
        const brand = (it.brand || it.name || '').toUpperCase()
        if (formData.cpu_type === 'amd') return brand.includes('AMD') || (normalizeSocket(it.socket)?.startsWith('AM'))
        return brand.includes('INTEL') || (normalizeSocket(it.socket)?.startsWith('LGA'))
      })
    }

    // If CPU chosen → filter mainboard/ram by compatibility
    const selCpu = findItem('cpu', formData.payload.cpu)
    const cpuSock = socketFromItem(selCpu)
    const cpuDdr = ddrFromItem(selCpu)
    const selMb = findItem('mainboard', formData.payload.mainboard)
    const mbSock = socketFromItem(selMb)
    const mbDdr = ddrFromItem(selMb)

    if (!showAll && cat === 'mainboard' && (cpuSock || cpuDdr)) {
      list = list.filter(mb => {
        const ms = socketFromItem(mb)
        const md = ddrFromItem(mb)
        if (cpuSock && ms && ms !== cpuSock) return false
        if (cpuDdr && md && md !== cpuDdr) return false
        return true
      })
    }
    if (!showAll && cat === 'ram' && (mbDdr || cpuDdr)) {
      list = list.filter(r => {
        const rd = ddrFromItem(r)
        const want = mbDdr || cpuDdr
        return !want || !rd || rd === want
      })
    }

    // Text search
    if (queryDebounced) {
      const q = queryDebounced.toLowerCase()
      list = list.filter(it => (it.name || '').toLowerCase().includes(q))
    }

    // Sort by price asc if available
    list = [...list].sort((a,b)=> (a.price||0)-(b.price||0))
    return list
  }

  const updatePayload = (key, value) => {
    setFormData(prev => ({
      ...prev,
      payload: { ...prev.payload, [key]: value }
    }))
  }

  // Preview helpers
  const getItem = (cat, id) => findItem(cat, id)
  const selectedList = [
    ['cpu','CPU'], ['mainboard','Mainboard'], ['vga','VGA'], ['ram','RAM'], ['ssd','SSD'], ['case','Case'], ['cpuCooler','CPU Cooler'], ['psu','PSU']
  ].map(([k,label])=> ({ key:k, label, item:getItem(k, formData.payload[k]) }))
  const total = selectedList.reduce((sum, r)=> sum + (r.item?.price||0), 0)

  const handleSubmit = () => {
    if (!formData.game || !formData.budget_key) {
      alert('Vui lòng nhập đầy đủ Game và Budget Key')
      return
    }
    onSave(formData)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        background: 'rgba(30,41,59,0.98)',
        padding: '24px',
        borderRadius: '8px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid rgba(79,172,254,0.3)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px' }}>
          {config.game ? 'Chỉnh sửa Config' : 'Thêm Config Mới'}
        </h2>

        <div style={{ display: 'grid', gap: '16px' }}>
          {/* CPU Type */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 600 }}>
              Loại CPU:
            </label>
            <select
              value={formData.cpu_type}
              onChange={e => setFormData(prev => ({ ...prev, cpu_type: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid rgba(79,172,254,0.3)',
                background: 'rgba(15,23,42,0.8)',
                color: '#f8fafc',
                fontSize: '14px'
              }}
            >
              <option value="intel">Intel</option>
              <option value="amd">AMD</option>
            </select>
          </div>

          {/* Game */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 600 }}>
              Game:
            </label>
            <input
              type="text"
              value={formData.game}
              onChange={e => setFormData(prev => ({ ...prev, game: e.target.value }))}
              placeholder="vd: pubg, lol, csgo"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid rgba(79,172,254,0.3)',
                background: 'rgba(15,23,42,0.8)',
                color: '#f8fafc',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Budget Key */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 600 }}>
              Budget Key:
            </label>
            <input
              type="text"
              value={formData.budget_key}
              onChange={e => setFormData(prev => ({ ...prev, budget_key: e.target.value }))}
              placeholder="vd: 3M, 4M, 5M"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid rgba(79,172,254,0.3)',
                background: 'rgba(15,23,42,0.8)',
                color: '#f8fafc',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Components */}
          <div style={{
            background: 'rgba(15,23,42,0.6)',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid rgba(79,172,254,0.25)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Linh kiện:</h3>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
              <input
                placeholder="Tìm theo tên..."
                value={query}
                onChange={e=>setQuery(e.target.value)}
                style={{ flex: 1, minWidth: 160, padding: 10, borderRadius: 8, border: '1px solid rgba(79,172,254,0.25)', background: '#0b1220', color: '#fff' }}
              />
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {[
                ['cpu','CPU'], ['mainboard','MAINBOARD'], ['vga','VGA'], ['ram','RAM'], ['ssd','SSD'], ['case','CASE'], ['cpuCooler','CPUCOOLER'], ['psu','PSU']
              ].map(([key,label]) => (
                <div key={key}>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>{label}:</label>
                  <select
                    value={formData.payload[key] || ''}
                    onChange={e => updatePayload(key, e.target.value)}
                    style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid rgba(79,172,254,0.25)', background: '#0b1220', color: '#fff' }}
                  >
                    <option value="">-- Chọn {label} --</option>
                    {getOptions(key).map(it => {
                      let hint = ''
                      if (key === 'mainboard' && (formData.payload.cpu)) {
                        const ms = socketFromItem(it)
                        const md = ddrFromItem(it)
                        const cpu = findItem('cpu', formData.payload.cpu)
                        const okSock = !socketFromItem(cpu) || ms === socketFromItem(cpu)
                        const okDdr = !ddrFromItem(cpu) || !md || md === ddrFromItem(cpu)
                        hint = okSock && okDdr ? ' [OK]' : ' [!]'
                      }
                      if (key === 'ram' && (formData.payload.mainboard || formData.payload.cpu)) {
                        const want = ddrFromItem(findItem('mainboard', formData.payload.mainboard)) || ddrFromItem(findItem('cpu', formData.payload.cpu))
                        const rd = ddrFromItem(it)
                        hint = (!want || !rd || want === rd) ? ' [OK]' : ' [!]'
                      }
                      return (
                        <option key={it.id} value={it.id}>
                          {it.name}{hint}
                          {it.socket ? ` (${normalizeSocket(it.socket)}` : ''}
                          {(!it.socket && (it.memoryType||it.ddr)) ? ` (${normalizeDDR(it.memoryType||it.ddr)})` : ''}
                          {it.socket ? `${(it.memoryType||it.ddr)?`, ${normalizeDDR(it.memoryType||it.ddr)}`:''})` : ''}
                          {it.price ? ` - ${formatPrice(it.price)}` : ''}
                        </option>
                      )
                    })}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div style={{
            background: 'rgba(15,23,42,0.6)',
            padding: 16,
            borderRadius: 10,
            border: '1px solid rgba(79,172,254,0.25)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 16 }}>Preview</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {selectedList.map(r => (
                <div key={r.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
                  <div style={{ color: '#cbd5e1' }}>{r.label}</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#f8fafc' }}>{r.item?.name || '—'}</div>
                    {r.item && <div style={{ color: '#22c55e' }}>{formatPrice(r.item.price)}</div>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, borderTop: '1px dashed rgba(148,163,184,0.3)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
              <div>Tổng</div>
              <div style={{ color: '#22c55e' }}>{formatPrice(total)}</div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button onClick={()=>{
                const data = JSON.stringify({ ...formData, payload: { ...formData.payload } }, null, 2)
                const blob = new Blob([data], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url; a.download = `config-${Date.now()}.json`; a.click()
                URL.revokeObjectURL(url)
              }} style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(79,172,254,0.25)', background: 'rgba(79,172,254,0.15)', color: '#4facfe', cursor: 'pointer' }}>Export JSON</button>
              <label style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(79,172,254,0.25)', background: 'rgba(34,197,94,0.15)', color: '#22c55e', cursor: 'pointer', textAlign: 'center' }}>
                Import JSON
                <input type="file" accept="application/json" style={{ display: 'none' }} onChange={async (e)=>{
                  const file = e.target.files?.[0]
                  if (!file) return
                  try {
                    const text = await file.text()
                    const obj = JSON.parse(text)
                    setFormData(prev => ({ ...prev, cpu_type: obj.cpu_type || prev.cpu_type, game: obj.game || prev.game, budget_key: obj.budget_key || prev.budget_key, payload: { ...prev.payload, ...(obj.payload||{}) } }))
                  } catch(err) { alert('Import lỗi: ' + err.message) }
                  e.target.value = ''
                }} />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              onClick={handleSubmit}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '4px',
                border: 'none',
                background: 'linear-gradient(135deg,#667eea,#764ba2)',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              💾 Lưu
            </button>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '4px',
                border: '1px solid rgba(148,163,184,0.3)',
                background: 'rgba(15,23,42,0.6)',
                color: '#cbd5e1',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ❌ Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
