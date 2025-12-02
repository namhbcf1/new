import { useMemo, useState, useEffect } from 'react'
import Swal from 'sweetalert2'

const API_URL = 'https://tp-pc-builder-api.bangachieu2.workers.dev'
const DEFAULT_PASSWORD = 'namhbcf12'

const sections = [
  ['cpu','💻 CPU'],
  ['mainboard','🔌 Mainboard'],
  ['vga','🎮 VGA'],
  ['ram','🧠 RAM'],
  ['ssd','💾 SSD'],
  ['psu','⚡ PSU'],
  ['case','🏠 Case'],
  ['cpuCooler','🌪️ Tản Nhiệt'],
  ['hdd','💾 HDD'],
  ['monitor','🖥️ Monitor'],
]

export default function Components() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [inventory, setInventory] = useState(null)
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [type, setType] = useState('all')

  // Check password on mount
  useEffect(() => {
    const savedPwd = sessionStorage.getItem('tp_admin_pwd')
    if (savedPwd) {
      setPassword(savedPwd)
      verifyAndLoad(savedPwd)
    }
  }, [])

  async function verifyAndLoad(pwd) {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/inventory`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setInventory(data)
      setAuthenticated(true)
      sessionStorage.setItem('tp_admin_pwd', pwd)
    } catch (err) {
      console.error(err)
      Swal.fire({ title: 'Lỗi', text: 'Không thể kết nối đến D1', icon: 'error' })
    } finally {
      setLoading(false)
    }
  }

  function handleLogin(e) {
    e.preventDefault()
    if (password === DEFAULT_PASSWORD) {
      verifyAndLoad(password)
    } else {
      Swal.fire({ title: 'Sai mật khẩu', text: 'Vui lòng thử lại', icon: 'error' })
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('tp_admin_pwd')
    setAuthenticated(false)
    setPassword('')
    setInventory(null)
  }

  async function handleUpdate(cat, id, payload) {
    try {
      const response = await fetch(`${API_URL}/inventory`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ cat, id, ...payload })
      })
      if (!response.ok) throw new Error('Update failed')

      // Reload inventory
      const inv = await fetch(`${API_URL}/inventory`).then(r => r.json())
      setInventory(inv)
      Swal.fire({ title: 'Thành công', text: 'Đã cập nhật', icon: 'success', timer: 1000, showConfirmButton: false })
    } catch (err) {
      console.error(err)
      Swal.fire({ title: 'Lỗi', text: 'Không thể cập nhật', icon: 'error' })
    }
  }

  async function handleDelete(cat, id) {
    const confirm = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: 'Hành động này không thể hoàn tác',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    })

    if (!confirm.isConfirmed) return

    try {
      const response = await fetch(`${API_URL}/inventory/${cat}/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Delete failed')

      // Reload inventory
      const inv = await fetch(`${API_URL}/inventory`).then(r => r.json())
      setInventory(inv)
      Swal.fire({ title: 'Đã xóa', icon: 'success', timer: 1000, showConfirmButton: false })
    } catch (err) {
      console.error(err)
      Swal.fire({ title: 'Lỗi', text: 'Không thể xóa', icon: 'error' })
    }
  }

  const filtered = useMemo(() => {
    if (!inventory) return {}
    const res = {}
    sections.forEach(([key]) => {
      if (type !== 'all' && type !== key) return
      const items = inventory[key] || {}
      const list = Object.values(items).filter(i =>
        i.name?.toLowerCase().includes(q.toLowerCase())
      )
      if (list.length) res[key] = list
    })
    return res
  }, [inventory, q, type])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ'
  }

  if (!authenticated) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh'
      }}>
        <div style={{
          background: 'rgba(30,41,59,0.9)',
          border: '2px solid rgba(79,172,254,0.3)',
          borderRadius: 16,
          padding: 48,
          maxWidth: 400,
          width: '100%',
          textAlign: 'center'
        }}>
          <h2 style={{
            marginBottom: 16,
            fontSize: 28,
            background: 'linear-gradient(135deg,#4facfe,#00f2fe)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🔒 Quản Lý Kho Linh Kiện
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: 24 }}>
            Nhập mật khẩu để truy cập và chỉnh sửa dữ liệu D1
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              style={{
                width: '100%',
                padding: 16,
                borderRadius: 8,
                border: '2px solid #475569',
                background: '#1e293b',
                color: '#fff',
                fontSize: 16,
                marginBottom: 16
              }}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !password}
              style={{
                width: '100%',
                padding: 16,
                borderRadius: 8,
                border: 0,
                background: loading ? '#475569' : 'linear-gradient(135deg,#4facfe,#00f2fe)',
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Đang kết nối...' : '🔓 Đăng Nhập'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'transparent',
      padding: 0,
      maxWidth: 1100,
      margin: '0 auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        background: 'rgba(30,41,59,0.8)',
        borderRadius: 16,
        padding: '20px 24px'
      }}>
        <h2 style={{
          marginBottom: 0,
          background: 'linear-gradient(135deg,#4facfe,#00f2fe)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: 28
        }}>
          🔧 Quản Lý Kho Linh Kiện (D1)
        </h2>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: 0,
            background: '#ef4444',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          🚪 Đăng Xuất
        </button>
      </div>

      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 20,
        flexWrap: 'wrap',
        alignItems: 'center',
        background: 'rgba(30,41,59,0.6)',
        borderRadius: 12,
        padding: 16
      }}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="🔍 Tìm kiếm sản phẩm..."
          style={{
            flex: 1,
            minWidth: 200,
            padding: 12,
            borderRadius: 8,
            border: '2px solid #475569',
            background: '#1e293b',
            color: '#fff',
            fontSize: 14
          }}
        />
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 8,
            border: '2px solid #475569',
            background: '#1e293b',
            color: '#fff',
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          <option value="all">📦 Tất cả danh mục</option>
          {sections.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {Object.keys(filtered).length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 40,
          color: '#94a3b8',
          fontSize: 16
        }}>
          Không tìm thấy sản phẩm nào
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 16,
          alignItems: 'start'
        }}>
          {Object.entries(filtered).map(([key, items]) => (
            <CategorySection
              key={key}
              catKey={key}
              label={sections.find(s => s[0] === key)?.[1]}
              items={items}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              formatPrice={formatPrice}
              password={password}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CategorySection({ catKey, label, items, onUpdate, onDelete, formatPrice, password }) {
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.95) 100%)',
      borderRadius: 16,
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '16px 20px',
        background: 'transparent',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          color: '#4facfe',
          fontWeight: 700,
          fontSize: 18,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          {label}
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 0,
            background: showAdd ? '#ef4444' : 'linear-gradient(135deg,#22c55e,#16a34a)',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 13,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
        >
          {showAdd ? '✖ Hủy' : '➕ Thêm mới'}
        </button>
      </div>
      <div style={{ padding: 16, display: 'grid', gap: 12 }}>
        {showAdd && (
          <AddItemForm
            catKey={catKey}
            onAdd={async (cat, newItem) => {
              await onUpdate(cat, newItem.id, newItem)
              setShowAdd(false)
            }}
          />
        )}
        {items.map(item => (
          <ItemRow
            key={item.id}
            item={item}
            catKey={catKey}
            onUpdate={onUpdate}
            onDelete={onDelete}
            formatPrice={formatPrice}
          />
        ))}
      </div>
    </div>
  )
}

function ItemRow({ item, catKey, onUpdate, onDelete, formatPrice }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: item.name || '',
    price: item.price || 0,
    quantity: item.quantity || 1,
    brand: item.brand || '',
    warranty: item.warranty || '',
    condition: item.condition || 'new',
    // optional compatibility fields
    socket: item.socket || item.sockets?.[0] || '',
    ddr: item.ddr || '',
    memoryType: item.memoryType || '',
    image: item.image || ''
  })

  if (editing) {
    return (
      <div
        onClick={() => setEditing(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: 'min(620px, 95vw)',
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: 20,
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(79,172,254,0.3)',
            border: '2px solid rgba(79,172,254,0.25)'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '2px solid rgba(79,172,254,0.2)',
            background: 'linear-gradient(135deg, rgba(79,172,254,0.1) 0%, rgba(0,242,254,0.05) 100%)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 20,
              fontWeight: 800,
              color: '#4facfe'
            }}>
              <span style={{ fontSize: 24 }}>✏️</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span>Sửa sản phẩm</span>
                <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: 13 }}>Mã: {item.id}</span>
              </div>
            </div>
            <button
              onClick={() => setEditing(false)}
              style={{
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: 20,
                width: 36,
                height: 36,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              ✖
            </button>
          </div>

          {/* Form Content */}
          <div style={{ padding: 24 }}>
            <div style={{ display: 'grid', gap: 18 }}>
              {/* Tên sản phẩm */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#4facfe',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 8
                }}>
                  <span>📦</span> Tên sản phẩm
                </label>
                <input
                  value={form.name}
                  onChange={e => setForm(s => ({ ...s, name: e.target.value }))}
                  placeholder="Nhập tên sản phẩm..."
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 10,
                    border: '2px solid #374151',
                    background: '#111827',
                    color: '#fff',
                    fontSize: 15,
                    outline: 'none',
                    transition: 'border 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#4facfe'}
                  onBlur={e => e.target.style.borderColor = '#374151'}
                />
              </div>

              {/* Grid 2 cột */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                {/* Giá */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#22c55e',
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 8
                  }}>
                    <span>💰</span> Giá (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(s => ({ ...s, price: Number(e.target.value) || 0 }))}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: 10,
                      border: '2px solid #374151',
                      background: '#111827',
                      color: '#22c55e',
                      fontSize: 15,
                      fontWeight: 700,
                      textAlign: 'right',
                      outline: 'none'
                    }}
                    onFocus={e => e.target.style.borderColor = '#22c55e'}
                    onBlur={e => e.target.style.borderColor = '#374151'}
                  />
                </div>

                {/* Số lượng */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#f59e0b',
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 8
                  }}>
                    <span>📊</span> Số lượng
                  </label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={e => setForm(s => ({ ...s, quantity: Number(e.target.value) || 1 }))}
                    placeholder="1"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: 10,
                      border: '2px solid #374151',
                      background: '#111827',
                      color: '#f59e0b',
                      fontSize: 15,
                      fontWeight: 700,
                      textAlign: 'right',
                      outline: 'none'
                    }}
                    onFocus={e => e.target.style.borderColor = '#f59e0b'}
                    onBlur={e => e.target.style.borderColor = '#374151'}
                  />
                </div>

                {/* Thương hiệu */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#a78bfa',
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 8
                  }}>
                    <span>🏷️</span> Thương hiệu
                  </label>
                  <input
                    value={form.brand}
                    onChange={e => setForm(s => ({ ...s, brand: e.target.value }))}
                    placeholder="VD: Intel, AMD..."
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: 10,
                      border: '2px solid #374151',
                      background: '#111827',
                      color: '#fff',
                      fontSize: 15,
                      outline: 'none'
                    }}
                    onFocus={e => e.target.style.borderColor = '#a78bfa'}
                    onBlur={e => e.target.style.borderColor = '#374151'}
                  />
                </div>

                {/* Bảo hành */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#3b82f6',
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 8
                  }}>
                    <span>🛡️</span> Bảo hành
                  </label>
                  <input
                    value={form.warranty}
                    onChange={e => setForm(s => ({ ...s, warranty: e.target.value }))}
                    placeholder="VD: 36 tháng"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: 10,
                      border: '2px solid #374151',
                      background: '#111827',
                      color: '#fff',
                      fontSize: 15,
                      outline: 'none'
                    }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#374151'}
                  />
                </div>
              </div>

              {/* Compatibility fields */}
              {(catKey === 'cpu' || catKey === 'mainboard' || catKey === 'ram') && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4facfe', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                      <span>🔌</span> Socket / DDR
                    </label>
                    {catKey === 'cpu' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <input
                          value={form.socket}
                          onChange={e => setForm(s => ({ ...s, socket: e.target.value }))}
                          placeholder="AM4 / AM5 / LGA1700 ..."
                          style={{ width: '100%', padding: '14px 16px', borderRadius: 10, border: '2px solid #374151', background: '#111827', color: '#fff', fontSize: 14 }}
                        />
                        <input
                          value={form.ddr}
                          onChange={e => setForm(s => ({ ...s, ddr: e.target.value }))}
                          placeholder="DDR4 / DDR5"
                          style={{ width: '100%', padding: '14px 16px', borderRadius: 10, border: '2px solid #374151', background: '#111827', color: '#fff', fontSize: 14 }}
                        />
                      </div>
                    )}
                    {catKey === 'mainboard' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <input
                          value={form.socket}
                          onChange={e => setForm(s => ({ ...s, socket: e.target.value }))}
                          placeholder="LGA1700 / AM4 ..."
                          style={{ width: '100%', padding: '14px 16px', borderRadius: 10, border: '2px solid #374151', background: '#111827', color: '#fff', fontSize: 14 }}
                        />
                        <input
                          value={form.memoryType}
                          onChange={e => setForm(s => ({ ...s, memoryType: e.target.value }))}
                          placeholder="DDR4 / DDR5"
                          style={{ width: '100%', padding: '14px 16px', borderRadius: 10, border: '2px solid #374151', background: '#111827', color: '#fff', fontSize: 14 }}
                        />
                      </div>
                    )}
                    {catKey === 'ram' && (
                      <input
                        value={form.ddr}
                        onChange={e => setForm(s => ({ ...s, ddr: e.target.value }))}
                        placeholder="DDR4 / DDR5"
                        style={{ width: '100%', padding: '14px 16px', borderRadius: 10, border: '2px solid #374151', background: '#111827', color: '#fff', fontSize: 14 }}
                      />
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                      <span>🖼️</span> Ảnh (images/...)
                    </label>
                    <input
                      value={form.image}
                      onChange={e => setForm(s => ({ ...s, image: e.target.value }))}
                      placeholder="images/xigmatek-nyx-air-3f.jpg"
                      style={{ width: '100%', padding: '14px 16px', borderRadius: 10, border: '2px solid #374151', background: '#111827', color: '#fff', fontSize: 14 }}
                    />
                  </div>
                </div>
              )}

              {/* Tình trạng */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#10b981',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 8
                }}>
                  <span>✨</span> Tình trạng
                </label>
                <select
                  value={form.condition}
                  onChange={e => setForm(s => ({ ...s, condition: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 10,
                    border: '2px solid #374151',
                    background: '#111827',
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="new">✅ NEW - Hàng mới 100%</option>
                  <option value="2nd">🔄 2ND - Hàng đã qua sử dụng</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            gap: 12,
            padding: '20px 24px',
            borderTop: '2px solid rgba(79,172,254,0.1)',
            background: 'rgba(0,0,0,0.2)'
          }}>
            <button
              onClick={() => setEditing(false)}
              style={{
                flex: 1,
                padding: '14px 20px',
                borderRadius: 10,
                border: '2px solid #374151',
                background: '#1f2937',
                color: '#94a3b8',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => {
                e.target.style.background = '#374151'
                e.target.style.color = '#fff'
              }}
              onMouseOut={e => {
                e.target.style.background = '#1f2937'
                e.target.style.color = '#94a3b8'
              }}
            >
              Hủy
            </button>
            <button
              onClick={() => {
                onUpdate(catKey, item.id, form)
                setEditing(false)
              }}
              style={{
                flex: 2,
                padding: '14px 20px',
                borderRadius: 10,
                border: 0,
                background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(34,197,94,0.3)',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.target.style.transform = 'translateY(0)'}
            >
              💾 Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 16,
        padding: 16,
        borderRadius: 10,
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        position: 'relative'
      }}>
      <div style={{
        position: 'absolute',
        top: 12,
        right: 12,
        padding: '4px 10px',
        borderRadius: 6,
        background: item.condition === '2nd' ? '#f59e0b' : '#10b981',
        color: '#fff',
        fontSize: 11,
        fontWeight: 700,
        zIndex: 1
      }}>
        {item.condition === '2nd' ? '2ND' : 'NEW'}
      </div>

      {/* Image */}
      {item.image && (
        <div style={{
          width: 80,
          height: 80,
          borderRadius: 8,
          overflow: 'hidden',
          background: '#0f172a',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img
            src={item.image}
            alt={item.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.parentElement.innerHTML = '<div style="color: #64748b; font-size: 24px;">📦</div>'
            }}
          />
        </div>
      )}

      <div style={{ flex: 1, paddingRight: 60 }}>
        <div style={{
          fontWeight: 700,
          marginBottom: 8,
          color: '#f8fafc',
          fontSize: 15,
          lineHeight: 1.4
        }}>
          {item.name}
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
          {item.brand && <div>Thương hiệu: <span style={{ color: '#4facfe' }}>{item.brand}</span></div>}
          {item.warranty && <div>Bảo hành: <span style={{ color: '#22c55e' }}>{item.warranty}</span></div>}
          <div>Số lượng: <span style={{ color: '#f59e0b' }}>{item.quantity || 1}</span></div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        gap: 8
      }}>
        <div style={{
          color: '#22c55e',
          fontWeight: 700,
          fontSize: 17
        }}>
          {formatPrice(item.price || 0)}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setEditing(true)}
            style={{
              padding: '7px 14px',
              borderRadius: 7,
              border: 0,
              background: 'linear-gradient(135deg,#4facfe,#00f2fe)',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 12
            }}
          >
            ✏️ Sửa
          </button>
          <button
            onClick={() => onDelete(catKey, item.id)}
            style={{
              padding: '7px 14px',
              borderRadius: 7,
              border: 0,
              background: '#ef4444',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 12
            }}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}

function AddItemForm({ catKey, onAdd }) {
  const [form, setForm] = useState({
    id: '',
    name: '',
    price: 0,
    quantity: 1,
    brand: '',
    warranty: '',
    condition: 'new',
    socket: '',
    ddr: '',
    memoryType: '',
    image: ''
  })

  return (
    <div style={{
      display: 'grid',
      gap: 8,
      padding: 12,
      borderRadius: 8,
      background: '#1e293b'
    }}>
      <div style={{ color: '#22c55e', fontWeight: 700, marginBottom: 4 }}>➕ Thêm Sản Phẩm Mới</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
        <input
          value={form.id}
          onChange={e => setForm(s => ({ ...s, id: e.target.value }))}
          placeholder="Mã sản phẩm *"
          style={{
            padding: 10,
            borderRadius: 6,
            border: '1px solid #475569',
            background: '#0b1220',
            color: '#fff'
          }}
        />
        <input
          value={form.name}
          onChange={e => setForm(s => ({ ...s, name: e.target.value }))}
          placeholder="Tên sản phẩm *"
          style={{
            padding: 10,
            borderRadius: 6,
            border: '1px solid #475569',
            background: '#0b1220',
            color: '#fff'
          }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <input
          type="number"
          value={form.price}
          onChange={e => setForm(s => ({ ...s, price: Number(e.target.value) || 0 }))}
          placeholder="Giá (VNĐ)"
          style={{
            padding: 10,
            borderRadius: 6,
            border: '1px solid #475569',
            background: '#0b1220',
            color: '#fff'
          }}
        />
        <input
          type="number"
          value={form.quantity}
          onChange={e => setForm(s => ({ ...s, quantity: Number(e.target.value) || 1 }))}
          placeholder="Số lượng"
          style={{
            padding: 10,
            borderRadius: 6,
            border: '1px solid #475569',
            background: '#0b1220',
            color: '#fff'
          }}
        />
        <select
          value={form.condition}
          onChange={e => setForm(s => ({ ...s, condition: e.target.value }))}
          style={{
            padding: 10,
            borderRadius: 6,
            border: '1px solid #475569',
            background: '#0b1220',
            color: '#fff'
          }}
        >
          <option value="new">NEW</option>
          <option value="2nd">2ND</option>
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <input
          value={form.brand}
          onChange={e => setForm(s => ({ ...s, brand: e.target.value }))}
          placeholder="Thương hiệu"
          style={{
            padding: 10,
            borderRadius: 6,
            border: '1px solid #475569',
            background: '#0b1220',
            color: '#fff'
          }}
        />
        <input
          value={form.warranty}
          onChange={e => setForm(s => ({ ...s, warranty: e.target.value }))}
          placeholder="Bảo hành"
          style={{
            padding: 10,
            borderRadius: 6,
            border: '1px solid #475569',
            background: '#0b1220',
            color: '#fff'
          }}
        />
      </div>

      {/* Compatibility + image fields based on category */}
      {(catKey === 'cpu' || catKey === 'mainboard' || catKey === 'ram') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {catKey === 'cpu' && (
            <>
              <input
                value={form.socket}
                onChange={e => setForm(s => ({ ...s, socket: e.target.value }))}
                placeholder="Socket (AM4/AM5/LGA1700)"
                style={{ padding: 10, borderRadius: 6, border: '1px solid #475569', background: '#0b1220', color: '#fff' }}
              />
              <input
                value={form.ddr}
                onChange={e => setForm(s => ({ ...s, ddr: e.target.value }))}
                placeholder="DDR (DDR4/DDR5)"
                style={{ padding: 10, borderRadius: 6, border: '1px solid #475569', background: '#0b1220', color: '#fff' }}
              />
            </>
          )}
          {catKey === 'mainboard' && (
            <>
              <input
                value={form.socket}
                onChange={e => setForm(s => ({ ...s, socket: e.target.value }))}
                placeholder="Socket (LGA1700/AM4/...)"
                style={{ padding: 10, borderRadius: 6, border: '1px solid #475569', background: '#0b1220', color: '#fff' }}
              />
              <input
                value={form.memoryType}
                onChange={e => setForm(s => ({ ...s, memoryType: e.target.value }))}
                placeholder="Memory Type (DDR4/DDR5)"
                style={{ padding: 10, borderRadius: 6, border: '1px solid #475569', background: '#0b1220', color: '#fff' }}
              />
            </>
          )}
          {catKey === 'ram' && (
            <>
              <input
                value={form.ddr}
                onChange={e => setForm(s => ({ ...s, ddr: e.target.value }))}
                placeholder="DDR (DDR4/DDR5)"
                style={{ padding: 10, borderRadius: 6, border: '1px solid #475569', background: '#0b1220', color: '#fff' }}
              />
              <div></div>
            </>
          )}
        </div>
      )}
      <input
        value={form.image}
        onChange={e => setForm(s => ({ ...s, image: e.target.value }))}
        placeholder="Ảnh (images/...)"
        style={{ padding: 10, borderRadius: 6, border: '1px solid #475569', background: '#0b1220', color: '#fff' }}
      />
      <button
        disabled={!form.id || !form.name}
        onClick={() => {
          const payload = { ...form }
          // strip empty optional fields
          ;['socket','ddr','memoryType','brand','warranty','image'].forEach(k => { if (!payload[k]) delete payload[k] })
          onAdd(catKey, payload)
          setForm({ id: '', name: '', price: 0, quantity: 1, brand: '', warranty: '', condition: 'new', socket: '', ddr: '', memoryType: '', image: '' })
        }}
        style={{
          padding: 12,
          borderRadius: 6,
          border: 0,
          background: form.id && form.name ? 'linear-gradient(135deg,#22c55e,#16a34a)' : '#475569',
          color: '#fff',
          fontWeight: 700,
          cursor: form.id && form.name ? 'pointer' : 'not-allowed'
        }}
      >
        ➕ Thêm Sản Phẩm
      </button>
    </div>
  )
}
