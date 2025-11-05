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
            placeholder="Mật khẩu: namhbcf12"
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
  const [formData, setFormData] = useState({
    cpu_type: config.cpu_type || 'intel',
    game: config.game || '',
    budget_key: config.budget_key || '',
    payload: typeof config.payload === 'string' ? JSON.parse(config.payload) : config.payload
  })

  const formatPrice = fmt
  const getOptions = (cat) => {
    const invList = Object.values(inventory?.[cat] || {})
    const baseList = Object.values(catalogs?.[cat] || {})
    // merge unique by id
    const seen = new Set()
    const out = []
    ;[...invList, ...baseList].forEach(it => {
      if (!it?.id || seen.has(it.id)) return
      seen.add(it.id)
      out.push(it)
    })
    return out
  }

  const updatePayload = (key, value) => {
    setFormData(prev => ({
      ...prev,
      payload: { ...prev.payload, [key]: value }
    }))
  }

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
                    {getOptions(key).map(it => (
                      <option key={it.id} value={it.id}>
                        {it.name} {it.price ? `- ${formatPrice(it.price)}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
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
