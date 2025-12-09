import { useState, useEffect } from 'react'
import { fetchAllConfigs, upsertConfig, deleteConfig, fetchInventory } from '../services/api'
import { getCatalogs, formatPrice as fmt } from '../data/components'
import intelConfigs from '../data/configs/intel/index.js'
import amdConfigs from '../data/configs/amd/index.js'

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
  const [expandedGames, setExpandedGames] = useState({}) // Track expanded games: { "intel/csgo": true, "amd/pubg": false }
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
    // Validate password is not empty
    if (!pwd || pwd.trim() === '') {
      alert('Vui lòng nhập mật khẩu!')
      setLoading(false)
      return
    }

    // Verify password by attempting a write operation
    // The API will reject if password is wrong
    setLoading(true)
    try {
      // Try to fetch configs with password header to verify
      // Since GET /configs doesn't require password, we need another way
      // We'll use a dummy upsert that will fail if password is wrong
      const testPayload = {
        cpuType: '__test__',
        game: '__test__',
        budgetKey: '__test__',
        payload: { test: true }
      }

      // This will fail with 401 if password is wrong
      await upsertConfig(pwd, testPayload)

      // If successful, delete the test config
      await deleteConfig(pwd, '__test__', '__test__', '__test__')

      // Now load the actual data
      const inv = await fetchInventory()
      setInventory(inv?.inventory || inv)
      const data = await fetchAllConfigs()
      // API returns: { intel: { game1: { budget1: {...}, budget2: {...} } }, amd: {...} }
      // Convert to array format: [{ cpu_type, game, budget_key, payload }, ...]
      const configsArray = []
      if (data) {
        for (const [cpuType, games] of Object.entries(data)) {
          if (games && typeof games === 'object') {
            for (const [game, budgets] of Object.entries(games)) {
              if (budgets && typeof budgets === 'object') {
                for (const [budgetKey, payload] of Object.entries(budgets)) {
                  configsArray.push({
                    cpu_type: cpuType,
                    game: game,
                    budget_key: budgetKey,
                    payload: payload
                  })
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
      // Check if it's an authentication error
      if (err.message && err.message.includes('401')) {
        alert('Mật khẩu không đúng!')
      } else if (err.message && err.message.includes('unauthorized')) {
        alert('Mật khẩu không đúng!')
      } else {
        alert('Không thể kết nối tới API hoặc mật khẩu sai.')
      }
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
      console.log('API response:', data)
      // API returns: { intel: { game1: { budget1: {...}, budget2: {...} } }, amd: {...} }
      // Convert to array format: [{ cpu_type, game, budget_key, payload }, ...]
      const configsArray = []
      if (data) {
        for (const [cpuType, games] of Object.entries(data)) {
          if (games && typeof games === 'object') {
            for (const [game, budgets] of Object.entries(games)) {
              if (budgets && typeof budgets === 'object') {
                for (const [budgetKey, payload] of Object.entries(budgets)) {
                  configsArray.push({
                    cpu_type: cpuType,
                    game: game,
                    budget_key: budgetKey,
                    payload: payload
                  })
                }
              }
            }
          }
        }
      }
      console.log('Converted configs array:', configsArray.length, 'configs')
      setConfigs(configsArray)
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

  async function handleImportAll() {
    if (!password) {
      alert('Vui lòng nhập mật khẩu trước khi import!')
      return
    }

    if (!confirm('Bạn có chắc muốn import TẤT CẢ configs từ local files lên D1 database?\n\nĐiều này sẽ ghi đè các configs hiện có nếu trùng key.')) {
      return
    }

    setImportingAll(true)
    
    // Collect all configs
    const allConfigs = []
    
    // Process Intel configs
    for (const [game, gameConfigs] of Object.entries(intelConfigs || {})) {
      if (gameConfigs && typeof gameConfigs === 'object') {
        for (const [budget, config] of Object.entries(gameConfigs)) {
          if (config && typeof config === 'object') {
            allConfigs.push({
              cpu_type: 'intel',
              game,
              budget_key: budget,
              payload: config
            })
          }
        }
      }
    }
    
    // Process AMD configs
    for (const [game, gameConfigs] of Object.entries(amdConfigs || {})) {
      if (gameConfigs && typeof gameConfigs === 'object') {
        for (const [budget, config] of Object.entries(gameConfigs)) {
          if (config && typeof config === 'object') {
            allConfigs.push({
              cpu_type: 'amd',
              game,
              budget_key: budget,
              payload: config
            })
          }
        }
      }
    }

    setImportProgress({ current: 0, total: allConfigs.length, game: '', cpuType: '' })

    let success = 0
    let failed = 0
    const errors = []

    for (let i = 0; i < allConfigs.length; i++) {
      const config = allConfigs[i]
      setImportProgress({
        current: i + 1,
        total: allConfigs.length,
        game: config.game,
        cpuType: config.cpu_type
      })

      try {
        await upsertConfig(password, config)
        success++
      } catch (err) {
        failed++
        errors.push(`${config.cpu_type}/${config.game}/${config.budget_key}: ${err.message}`)
        console.error(`Failed to import ${config.cpu_type}/${config.game}/${config.budget_key}:`, err)
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    setImportingAll(false)
    setImportProgress({ current: 0, total: 0, game: '', cpuType: '' })

    const message = `Import hoàn tất!\n\n✅ Thành công: ${success}\n❌ Thất bại: ${failed}${errors.length > 0 ? '\n\nLỗi:\n' + errors.slice(0, 10).join('\n') + (errors.length > 10 ? `\n... và ${errors.length - 10} lỗi khác` : '') : ''}`
    alert(message)
    
    if (success > 0) {
      await loadConfigs()
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

  // Group by game and sort configs by budget
  const groupedConfigs = filteredConfigs.reduce((acc, config) => {
    const key = `${config.cpu_type}/${config.game}`
    if (!acc[key]) acc[key] = []
    acc[key].push(config)
    return acc
  }, {})

  // Sort configs within each group by budget (extract number from budget_key like "5M" -> 5)
  Object.keys(groupedConfigs).forEach(key => {
    groupedConfigs[key].sort((a, b) => {
      const aNum = parseInt(a.budget_key.replace('M', '')) || 0
      const bNum = parseInt(b.budget_key.replace('M', '')) || 0
      return aNum - bNum
    })
  })

  // Sort groups: Intel first, then AMD, then by game name
  const sortedGroups = Object.entries(groupedConfigs).sort(([keyA], [keyB]) => {
    const [cpuA, gameA] = keyA.split('/')
    const [cpuB, gameB] = keyB.split('/')
    if (cpuA !== cpuB) {
      return cpuA === 'intel' ? -1 : 1
    }
    return gameA.localeCompare(gameB)
  })

  // Toggle game expansion
  const toggleGame = (key) => {
    setExpandedGames(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Expand all / Collapse all
  const expandAll = () => {
    const allExpanded = {}
    sortedGroups.forEach(([key]) => {
      allExpanded[key] = true
    })
    setExpandedGames(allExpanded)
  }

  const collapseAll = () => {
    setExpandedGames({})
  }

  // Debug logging
  useEffect(() => {
    console.log('Configs state:', configs.length, 'total configs')
    console.log('Filtered configs:', filteredConfigs.length)
    console.log('Grouped configs:', Object.keys(groupedConfigs).length, 'groups')
  }, [configs, filteredConfigs, groupedConfigs])

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

          <div style={{ marginLeft: 'auto', alignSelf: 'flex-end', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleImportAll}
              disabled={importingAll}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                background: importingAll
                  ? 'rgba(34,197,94,0.3)'
                  : 'linear-gradient(135deg,#22c55e,#16a34a)',
                color: '#fff',
                fontWeight: 600,
                cursor: importingAll ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {importingAll ? '⏳ Đang import tất cả...' : '🚀 Import Tất Cả Configs'}
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              disabled={importingAll}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                background: importingAll
                  ? 'rgba(79,172,254,0.3)'
                  : 'linear-gradient(135deg,#4facfe,#00f2fe)',
                color: '#fff',
                fontWeight: 600,
                cursor: importingAll ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              📦 Import Từng Game
            </button>
            <button
              onClick={() => setShowAddNew(true)}
              disabled={importingAll}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                background: importingAll
                  ? 'rgba(102,126,234,0.3)'
                  : 'linear-gradient(135deg,#667eea,#764ba2)',
                color: '#fff',
                fontWeight: 600,
                cursor: importingAll ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              ➕ Thêm Config Mới
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '14px', color: '#94a3b8' }}>
            Tổng: {filteredConfigs.length} configs
          </div>
          {importingAll && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 16px',
              background: 'rgba(79,172,254,0.1)',
              borderRadius: '6px',
              border: '1px solid rgba(79,172,254,0.3)'
            }}>
              <div style={{ fontSize: '12px', color: '#4facfe' }}>
                ⏳ Đang import: {importProgress.current}/{importProgress.total}
                {importProgress.game && ` - ${importProgress.cpuType}/${importProgress.game}`}
              </div>
              <div style={{
                width: '200px',
                height: '6px',
                background: 'rgba(15,23,42,0.8)',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(importProgress.current / importProgress.total) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #4facfe, #00f2fe)',
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {sortedGroups.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', justifyContent: 'flex-end' }}>
          <button
            onClick={expandAll}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(79,172,254,0.3)',
              background: 'rgba(79,172,254,0.1)',
              color: '#4facfe',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            📂 Mở tất cả
          </button>
          <button
            onClick={collapseAll}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(148,163,184,0.3)',
              background: 'rgba(15,23,42,0.6)',
              color: '#94a3b8',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            📁 Đóng tất cả
          </button>
        </div>
      )}

      {/* Config Groups - Collapsible */}
      {sortedGroups.map(([key, configList]) => {
        const [cpuType, game] = key.split('/')
        const isExpanded = expandedGames[key] || false
        const gameDisplayName = game.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        
        return (
          <div
            key={key}
            style={{
              background: 'rgba(30,41,59,0.8)',
              borderRadius: '8px',
              marginBottom: '12px',
              border: '1px solid rgba(79,172,254,0.2)',
              overflow: 'hidden',
              transition: 'all 0.3s'
            }}
          >
            {/* Game Header - Clickable */}
            <div
              onClick={() => toggleGame(key)}
              style={{
                padding: '16px 20px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: isExpanded 
                  ? 'linear-gradient(135deg, rgba(79,172,254,0.2), rgba(0,242,254,0.1))'
                  : 'rgba(15,23,42,0.6)',
                borderBottom: isExpanded ? '1px solid rgba(79,172,254,0.3)' : 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isExpanded) {
                  e.currentTarget.style.background = 'rgba(79,172,254,0.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isExpanded) {
                  e.currentTarget.style.background = 'rgba(15,23,42,0.6)'
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  fontSize: '18px',
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  color: '#4facfe'
                }}>
                  ▶
                </div>
                <div>
                  <h2 style={{ 
                    margin: 0, 
                    fontSize: '18px', 
                    fontWeight: 700,
                    color: isExpanded ? '#4facfe' : '#f8fafc'
                  }}>
                    {cpuType.toUpperCase()} - {gameDisplayName}
                  </h2>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#94a3b8',
                    marginTop: '4px'
                  }}>
                    {configList.length} mức giá • {configList.map(c => c.budget_key).join(', ')}
                  </div>
                </div>
              </div>
              <div style={{
                padding: '4px 12px',
                borderRadius: '12px',
                background: cpuType === 'intel' ? 'rgba(0,113,197,0.2)' : 'rgba(237,28,36,0.2)',
                color: cpuType === 'intel' ? '#4facfe' : '#ef4444',
                fontSize: '11px',
                fontWeight: 700
              }}>
                {cpuType.toUpperCase()}
              </div>
            </div>

            {/* Configs List - Collapsible */}
            {isExpanded && (
              <div style={{
                padding: '16px 20px',
                display: 'grid',
                gap: '10px',
                maxHeight: '600px',
                overflowY: 'auto'
              }}>
                {configList.map(config => (
                  <ConfigCard
                    key={`${config.cpu_type}-${config.game}-${config.budget_key}`}
                    config={config}
                    onEdit={() => setEditingConfig(config)}
                    onDelete={() => handleDelete(config.cpu_type, config.game, config.budget_key)}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Empty State */}
      {sortedGroups.length === 0 && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#94a3b8'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
            Chưa có config nào
          </div>
          <div style={{ fontSize: '14px' }}>
            Nhấn "🚀 Import Tất Cả Configs" để import configs từ local files
          </div>
        </div>
      )}

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

function ConfigCard({ config, onEdit, onDelete }) {
  const payload = typeof config.payload === 'string' ? JSON.parse(config.payload) : config.payload

  return (
    <div style={{
      background: 'rgba(15,23,42,0.9)',
      padding: '12px 16px',
      borderRadius: '6px',
      border: '1px solid rgba(79,172,254,0.2)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = 'rgba(79,172,254,0.5)'
      e.currentTarget.style.background = 'rgba(15,23,42,1)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'rgba(79,172,254,0.2)'
      e.currentTarget.style.background = 'rgba(15,23,42,0.9)'
    }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ 
            fontWeight: 700, 
            fontSize: '15px', 
            color: '#4facfe',
            minWidth: '45px',
            padding: '2px 8px',
            background: 'rgba(79,172,254,0.1)',
            borderRadius: '4px'
          }}>
            {config.budget_key}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#cbd5e1',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            alignItems: 'center'
          }}>
            <span><strong>CPU:</strong> {payload.cpu || 'N/A'}</span>
            <span style={{ color: '#64748b' }}>•</span>
            <span><strong>MB:</strong> {payload.mainboard || 'N/A'}</span>
            <span style={{ color: '#64748b' }}>•</span>
            <span><strong>VGA:</strong> {payload.vga || 'N/A'}</span>
            <span style={{ color: '#64748b' }}>•</span>
            <span><strong>RAM:</strong> {payload.ram || 'N/A'}</span>
            <span style={{ color: '#64748b' }}>•</span>
            <span><strong>SSD:</strong> {payload.ssd || 'N/A'}</span>
            {(payload.case || payload.cpuCooler || payload.psu) && (
              <>
                <span style={{ color: '#64748b' }}>•</span>
                <span><strong>Case:</strong> {payload.case || 'N/A'}</span>
                {(payload.cpuCooler || payload.psu) && (
                  <>
                    <span style={{ color: '#64748b' }}>•</span>
                    <span><strong>Cooler:</strong> {payload.cpuCooler || 'N/A'}</span>
                    {payload.psu && (
                      <>
                        <span style={{ color: '#64748b' }}>•</span>
                        <span><strong>PSU:</strong> {payload.psu}</span>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '6px', marginLeft: '12px', flexShrink: 0 }}>
        <button
          onClick={onEdit}
          style={{
            padding: '6px 12px',
            borderRadius: '4px',
            border: 'none',
            background: 'rgba(79,172,254,0.2)',
            color: '#4facfe',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(79,172,254,0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(79,172,254,0.2)'
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
            fontSize: '12px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.2)'
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
    // Đảm bảo payload bao gồm cả giá đã chỉnh
    const payloadToSave = { ...formData.payload }
    onSave({ ...formData, payload: payloadToSave })
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
            <select
              value={formData.game}
              onChange={e => setFormData(prev => ({ ...prev, game: e.target.value }))}
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
              <option value="">-- Chọn Game --</option>
              {['valorant','csgo','pubg','lol','gta_v','elden_ring','naraka','genshin','fo4','black_myth_wukong','audition','battle_teams_2','crossfire','delta_force','mu_origin'].map(g => (
                <option key={g} value={g}>{g.replace(/_/g,' ')}</option>
              ))}
            </select>
          </div>

          {/* Budget Key với slider đẹp */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 600 }}>
              Budget Key (Triệu VNĐ):
            </label>
            <div style={{
              background: 'rgba(15,23,42,0.6)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid rgba(79,172,254,0.25)'
            }}>
              {/* Slider */}
              <input
                type="range"
                min="3"
                max="30"
                step="0.5"
                value={formData.budget_key ? (() => {
                  const numValue = parseFloat(formData.budget_key.replace('M', ''))
                  return isNaN(numValue) ? 10 : numValue
                })() : 10}
                onChange={e => {
                  const value = parseFloat(e.target.value)
                  // Format: nếu là số nguyên thì không có .0, nếu là số thập phân thì giữ 1 chữ số
                  const formattedValue = value % 1 === 0 ? value : parseFloat(value.toFixed(1))
                  setFormData(prev => ({ ...prev, budget_key: `${formattedValue}M` }))
                }}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: 'linear-gradient(90deg, rgba(79,172,254,0.3) 0%, rgba(79,172,254,0.8) 100%)',
                  outline: 'none',
                  cursor: 'pointer',
                  marginBottom: '12px'
                }}
              />
              {/* Hiển thị giá trị hiện tại */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#4facfe',
                  textAlign: 'center',
                  flex: 1
                }}>
                  {formData.budget_key || '10M'}
                </div>
              </div>
              {/* Hiển thị giá trị số */}
              <div style={{
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '12px',
                marginBottom: '8px'
              }}>
                {formData.budget_key ? (() => {
                  const numValue = parseFloat(formData.budget_key.replace('M', ''))
                  return `${numValue.toFixed(numValue % 1 === 0 ? 0 : 1)} triệu VNĐ`
                })() : '10 triệu VNĐ'}
              </div>
              {/* Quick select buttons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
                gap: '8px',
                marginTop: '12px'
              }}>
                {[3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 18, 20, 25, 30].map(n => {
                  const currentValue = formData.budget_key ? parseFloat(formData.budget_key.replace('M', '')) : null
                  const isSelected = currentValue === n
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, budget_key: `${n}M` }))}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: isSelected ? '2px solid #4facfe' : '1px solid rgba(79,172,254,0.3)',
                        background: isSelected 
                          ? 'linear-gradient(135deg, rgba(79,172,254,0.3), rgba(79,172,254,0.5))'
                          : 'rgba(15,23,42,0.8)',
                        color: isSelected ? '#4facfe' : '#cbd5e1',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        fontSize: '13px',
                        transition: 'all 0.2s'
                      }}
                    >
                      {n}M
                    </button>
                  )
                })}
              </div>
              {/* Input trực tiếp */}
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  min="3"
                  max="30"
                  step="0.5"
                  value={formData.budget_key ? (() => {
                    const numValue = parseFloat(formData.budget_key.replace('M', ''))
                    return numValue || ''
                  })() : ''}
                  onChange={e => {
                    const value = parseFloat(e.target.value)
                    if (!isNaN(value) && value >= 3 && value <= 30) {
                      // Format: nếu là số nguyên thì không có .0, nếu là số thập phân thì giữ 1 chữ số
                      const formattedValue = value % 1 === 0 ? value : parseFloat(value.toFixed(1))
                      setFormData(prev => ({ ...prev, budget_key: `${formattedValue}M` }))
                    } else if (e.target.value === '') {
                      setFormData(prev => ({ ...prev, budget_key: '' }))
                    }
                  }}
                  placeholder="Nhập giá (3-30)"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(79,172,254,0.3)',
                    background: 'rgba(15,23,42,0.8)',
                    color: '#f8fafc',
                    fontSize: '14px'
                  }}
                />
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>triệu</span>
              </div>
            </div>
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

          {/* Điều chỉnh giá linh kiện */}
          <div style={{
            background: 'rgba(15,23,42,0.6)',
            padding: 16,
            borderRadius: 10,
            border: '1px solid rgba(79,172,254,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                💰 Điều chỉnh giá linh kiện
              </h3>
              {selectedList.some(r => {
                const currentPrice = r.item?.price || 0
                const customPrice = formData.payload[`${r.key}_price`] !== undefined 
                  ? formData.payload[`${r.key}_price`] 
                  : currentPrice
                return customPrice !== currentPrice
              }) && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => {
                      const newPayload = { ...prev.payload }
                      selectedList.forEach(r => {
                        delete newPayload[`${r.key}_price`]
                      })
                      return { ...prev, payload: newPayload }
                    })
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(239,68,68,0.3)',
                    background: 'rgba(239,68,68,0.1)',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  🔄 Reset tất cả
                </button>
              )}
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {selectedList.map(r => {
                const currentPrice = r.item?.price || 0
                const customPrice = formData.payload[`${r.key}_price`] !== undefined 
                  ? formData.payload[`${r.key}_price`] 
                  : currentPrice
                const priceDiff = customPrice - currentPrice
                const priceDiffPercent = currentPrice > 0 ? ((priceDiff / currentPrice) * 100).toFixed(1) : 0
                
                return (
                  <div key={r.key} style={{
                    background: customPrice !== currentPrice 
                      ? 'rgba(251,191,36,0.1)' 
                      : 'rgba(79,172,254,0.05)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: customPrice !== currentPrice
                      ? '1px solid rgba(251,191,36,0.3)'
                      : '1px solid rgba(79,172,254,0.15)',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div>
                        <div style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600 }}>{r.label}</div>
                        <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>
                          {r.item?.name || 'Chưa chọn'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          color: customPrice !== currentPrice ? '#fbbf24' : '#22c55e', 
                          fontSize: 14, 
                          fontWeight: 700 
                        }}>
                          {formatPrice(customPrice)}
                        </div>
                        {customPrice !== currentPrice && (
                          <>
                            <div style={{ color: '#94a3b8', fontSize: 11, textDecoration: 'line-through' }}>
                              {formatPrice(currentPrice)}
                            </div>
                            <div style={{ 
                              color: priceDiff > 0 ? '#ef4444' : '#22c55e', 
                              fontSize: 11, 
                              fontWeight: 600,
                              marginTop: 2
                            }}>
                              {priceDiff > 0 ? '+' : ''}{formatPrice(priceDiff)} ({priceDiffPercent > 0 ? '+' : ''}{priceDiffPercent}%)
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    {r.item && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          step="10000"
                          value={customPrice}
                          onChange={e => {
                            const newPrice = parseInt(e.target.value) || 0
                            setFormData(prev => ({
                              ...prev,
                              payload: { ...prev.payload, [`${r.key}_price`]: newPrice }
                            }))
                          }}
                          style={{
                            flex: 1,
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid rgba(79,172,254,0.3)',
                            background: 'rgba(15,23,42,0.8)',
                            color: '#f8fafc',
                            fontSize: '13px'
                          }}
                          placeholder="Nhập giá"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => {
                              const newPayload = { ...prev.payload }
                              delete newPayload[`${r.key}_price`]
                              return { ...prev, payload: newPayload }
                            })
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid rgba(239,68,68,0.3)',
                            background: 'rgba(239,68,68,0.1)',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600
                          }}
                          disabled={customPrice === currentPrice}
                        >
                          Reset
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
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
              {selectedList.map(r => {
                const customPrice = formData.payload[`${r.key}_price`] !== undefined 
                  ? formData.payload[`${r.key}_price`] 
                  : (r.item?.price || 0)
                return (
                  <div key={r.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
                    <div style={{ color: '#cbd5e1' }}>{r.label}</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#f8fafc' }}>{r.item?.name || '—'}</div>
                      <div style={{ color: '#22c55e' }}>{formatPrice(customPrice)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: 12, borderTop: '1px dashed rgba(148,163,184,0.3)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
              <div>Tổng</div>
              <div style={{ color: '#22c55e', fontSize: '18px' }}>
                {formatPrice(selectedList.reduce((sum, r) => {
                  const customPrice = formData.payload[`${r.key}_price`] !== undefined 
                    ? formData.payload[`${r.key}_price`] 
                    : (r.item?.price || 0)
                  return sum + customPrice
                }, 0))}
              </div>
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

function ConfigImporter({ intelConfigs, amdConfigs, password, onImport, onCancel }) {
  const [selectedCpuType, setSelectedCpuType] = useState('intel')
  const [selectedGame, setSelectedGame] = useState('')
  const [selectedBudgets, setSelectedBudgets] = useState([])
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  // Get available games from configs
  const availableGames = [
    ...new Set([
      ...Object.keys(intelConfigs || {}),
      ...Object.keys(amdConfigs || {})
    ])
  ].sort()

  // Get available budgets for selected game
  const getAvailableBudgets = () => {
    if (!selectedGame) return []
    const configs = selectedCpuType === 'intel' ? intelConfigs : amdConfigs
    const gameConfigs = configs[selectedGame] || {}
    return Object.keys(gameConfigs).sort((a, b) => {
      const numA = parseFloat(a.replace('M', ''))
      const numB = parseFloat(b.replace('M', ''))
      return numA - numB
    })
  }

  const availableBudgets = getAvailableBudgets()

  const toggleBudget = (budget) => {
    setSelectedBudgets(prev => 
      prev.includes(budget) 
        ? prev.filter(b => b !== budget)
        : [...prev, budget]
    )
  }

  const selectAllBudgets = () => {
    setSelectedBudgets(availableBudgets)
  }

  const deselectAllBudgets = () => {
    setSelectedBudgets([])
  }

  async function handleImport() {
    if (!selectedGame || selectedBudgets.length === 0) {
      alert('Vui lòng chọn game và ít nhất 1 mức giá')
      return
    }

    setImporting(true)
    setProgress({ current: 0, total: selectedBudgets.length })

    const configs = selectedCpuType === 'intel' ? intelConfigs : amdConfigs
    const gameConfigs = configs[selectedGame] || {}

    let success = 0
    let failed = 0

    for (let i = 0; i < selectedBudgets.length; i++) {
      const budget = selectedBudgets[i]
      const config = gameConfigs[budget]

      if (config) {
        try {
          await upsertConfig(password, {
            cpu_type: selectedCpuType,
            game: selectedGame,
            budget_key: budget,
            payload: config
          })
          success++
        } catch (err) {
          console.error(`Failed to import ${selectedGame}/${budget}:`, err)
          failed++
        }
      } else {
        failed++
      }

      setProgress({ current: i + 1, total: selectedBudgets.length })
      await new Promise(resolve => setTimeout(resolve, 100)) // Small delay to avoid rate limits
    }

    setImporting(false)
    alert(`Import hoàn tất!\n✅ Thành công: ${success}\n❌ Thất bại: ${failed}`)
    if (success > 0) {
      onImport()
    }
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
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid rgba(79,172,254,0.3)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px' }}>
          📦 Import Configs từ Local Files
        </h2>

        <div style={{ display: 'grid', gap: '16px' }}>
          {/* CPU Type */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 600 }}>
              Loại CPU:
            </label>
            <select
              value={selectedCpuType}
              onChange={e => {
                setSelectedCpuType(e.target.value)
                setSelectedGame('')
                setSelectedBudgets([])
              }}
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

          {/* Game Selection */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 600 }}>
              Game:
            </label>
            <select
              value={selectedGame}
              onChange={e => {
                setSelectedGame(e.target.value)
                setSelectedBudgets([])
              }}
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
              <option value="">-- Chọn Game --</option>
              {availableGames.map(game => (
                <option key={game} value={game}>
                  {game.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Budget Selection */}
          {selectedGame && availableBudgets.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600 }}>
                  Mức giá ({availableBudgets.length} mức):
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={selectAllBudgets}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      border: '1px solid rgba(79,172,254,0.3)',
                      background: 'rgba(79,172,254,0.1)',
                      color: '#4facfe',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                  >
                    Chọn tất cả
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllBudgets}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      border: '1px solid rgba(148,163,184,0.3)',
                      background: 'rgba(148,163,184,0.1)',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: '8px',
                maxHeight: '300px',
                overflowY: 'auto',
                padding: '12px',
                background: 'rgba(15,23,42,0.6)',
                borderRadius: '8px',
                border: '1px solid rgba(79,172,254,0.25)'
              }}>
                {availableBudgets.map(budget => (
                  <button
                    key={budget}
                    type="button"
                    onClick={() => toggleBudget(budget)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: selectedBudgets.includes(budget) 
                        ? '2px solid #4facfe' 
                        : '1px solid rgba(79,172,254,0.3)',
                      background: selectedBudgets.includes(budget)
                        ? 'linear-gradient(135deg, rgba(79,172,254,0.3), rgba(79,172,254,0.5))'
                        : 'rgba(15,23,42,0.8)',
                      color: selectedBudgets.includes(budget) ? '#4facfe' : '#cbd5e1',
                      fontWeight: selectedBudgets.includes(budget) ? 700 : 500,
                      cursor: 'pointer',
                      fontSize: '13px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {budget}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#94a3b8' }}>
                Đã chọn: {selectedBudgets.length}/{availableBudgets.length} mức giá
              </div>
            </div>
          )}

          {/* Progress */}
          {importing && (
            <div style={{
              padding: '16px',
              background: 'rgba(79,172,254,0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(79,172,254,0.3)'
            }}>
              <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                Đang import: {progress.current}/{progress.total}
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                background: 'rgba(15,23,42,0.8)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(progress.current / progress.total) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #4facfe, #00f2fe)',
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              onClick={handleImport}
              disabled={importing || !selectedGame || selectedBudgets.length === 0}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '4px',
                border: 'none',
                background: importing || !selectedGame || selectedBudgets.length === 0
                  ? 'rgba(79,172,254,0.3)'
                  : 'linear-gradient(135deg,#4facfe,#00f2fe)',
                color: '#fff',
                fontWeight: 600,
                cursor: importing || !selectedGame || selectedBudgets.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {importing ? '⏳ Đang import...' : '📦 Import Configs'}
            </button>
            <button
              onClick={onCancel}
              disabled={importing}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '4px',
                border: '1px solid rgba(148,163,184,0.3)',
                background: 'rgba(15,23,42,0.6)',
                color: '#cbd5e1',
                fontWeight: 600,
                cursor: importing ? 'not-allowed' : 'pointer',
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
