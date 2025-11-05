import { useState, useEffect } from 'react'
import { fetchInventory, upsertInventoryItem, deleteInventoryItem } from '../services/api'

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [inventory, setInventory] = useState({})
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [editingItem, setEditingItem] = useState(null)
  const [showAddNew, setShowAddNew] = useState(false)

  const ADMIN_PASSWORD = 'namhbcf12' // Mật khẩu admin

  const categories = [
    { key: 'cpu', name: 'CPU' },
    { key: 'mainboard', name: 'Mainboard' },
    { key: 'vga', name: 'VGA' },
    { key: 'ram', name: 'RAM' },
    { key: 'ssd', name: 'SSD' },
    { key: 'hdd', name: 'HDD' },
    { key: 'psu', name: 'PSU - Nguồn' },
    { key: 'case', name: 'Case - Vỏ Máy' },
    { key: 'cpuCooler', name: 'CPU Cooler - Tản Nhiệt' },
    { key: 'monitor', name: 'Monitor - Màn Hình' }
  ]

  async function handleLogin(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      await loadInventory()
    } else {
      alert('Mật khẩu không đúng!')
      setPassword('')
    }
  }

  async function loadInventory() {
    setLoading(true)
    try {
      const data = await fetchInventory()
      if (data && data.inventory) {
        setInventory(data.inventory)
      }
    } catch (err) {
      console.error('Failed to load inventory:', err)
      alert('Lỗi khi tải dữ liệu: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(item) {
    try {
      await upsertInventoryItem(ADMIN_PASSWORD, item)
      alert('Lưu thành công!')
      await loadInventory()
      setEditingItem(null)
      setShowAddNew(false)
    } catch (err) {
      alert('Lỗi khi lưu: ' + err.message)
    }
  }

  async function handleDelete(cat, id) {
    if (!confirm(`Xác nhận xóa sản phẩm ${id} khỏi danh mục ${cat}?`)) return
    try {
      await deleteInventoryItem(ADMIN_PASSWORD, cat, id)
      alert('Xóa thành công!')
      await loadInventory()
    } catch (err) {
      alert('Lỗi khi xóa: ' + err.message)
    }
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(30,41,59,0.95)',
          padding: '40px',
          borderRadius: '12px',
          border: '1px solid rgba(79,172,254,0.3)',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700 }}>
              Admin Panel
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>
              Quản lý sản phẩm & giá cả
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#cbd5e1'
              }}>
                Mật khẩu Admin:
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  border: '1px solid rgba(79,172,254,0.3)',
                  background: 'rgba(15,23,42,0.8)',
                  color: '#f8fafc',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px 24px',
                borderRadius: '6px',
                border: 'none',
                background: 'linear-gradient(135deg,#667eea,#764ba2)',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Đăng Nhập
            </button>
          </form>

          <div style={{
            marginTop: '20px',
            padding: '12px',
            background: 'rgba(79,172,254,0.1)',
            borderRadius: '6px',
            border: '1px solid rgba(79,172,254,0.2)',
            fontSize: '13px',
            color: '#94a3b8',
            textAlign: 'center'
          }}>
            💡 Liên hệ quản trị viên nếu quên mật khẩu
          </div>
        </div>
      </div>
    )
  }

  // Filter items
  const filteredItems = []
  Object.entries(inventory).forEach(([cat, items]) => {
    if (selectedCategory !== 'all' && cat !== selectedCategory) return
    Object.entries(items).forEach(([id, item]) => {
      filteredItems.push({ cat, id, ...item })
    })
  })

  // Loading screen
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <div style={{ fontSize: '20px' }}>Đang tải dữ liệu...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{
        background: 'rgba(30,41,59,0.95)',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '24px',
        border: '1px solid rgba(79,172,254,0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: 700 }}>
              🛠️ Admin Panel
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '15px' }}>
              Quản lý kho linh kiện - Chỉnh sửa giá & thông tin sản phẩm
            </p>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              border: '1px solid rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.1)',
              color: '#ef4444',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            🚪 Đăng Xuất
          </button>
        </div>

        {/* Filters & Actions */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#cbd5e1'
            }}>
              Danh mục:
            </label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid rgba(79,172,254,0.3)',
                background: 'rgba(15,23,42,0.8)',
                color: '#f8fafc',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="all">📦 Tất cả ({filteredItems.length})</option>
              {categories.map(cat => {
                const count = Object.keys(inventory[cat.key] || {}).length
                return (
                  <option key={cat.key} value={cat.key}>
                    {cat.name} ({count})
                  </option>
                )
              })}
            </select>
          </div>

          <div style={{ alignSelf: 'flex-end' }}>
            <button
              onClick={() => setShowAddNew(true)}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                background: 'linear-gradient(135deg,#10b981,#059669)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              ➕ Thêm Sản Phẩm
            </button>
          </div>

          <div style={{ alignSelf: 'flex-end' }}>
            <button
              onClick={loadInventory}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                border: '1px solid rgba(79,172,254,0.3)',
                background: 'rgba(79,172,254,0.1)',
                color: '#4facfe',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🔄 Tải Lại
            </button>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {filteredItems.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            background: 'rgba(30,41,59,0.8)',
            borderRadius: '12px',
            border: '1px solid rgba(79,172,254,0.2)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <div style={{ fontSize: '18px', color: '#94a3b8' }}>
              Không có sản phẩm nào
            </div>
          </div>
        ) : (
          filteredItems.map(item => (
            <ItemCard
              key={`${item.cat}-${item.id}`}
              item={item}
              onEdit={() => setEditingItem(item)}
              onDelete={() => handleDelete(item.cat, item.id)}
            />
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <ItemEditor
          item={editingItem}
          categories={categories}
          onSave={handleSave}
          onCancel={() => setEditingItem(null)}
        />
      )}

      {/* Add New Modal */}
      {showAddNew && (
        <ItemEditor
          item={{ cat: 'cpu', id: '', name: '', price: 0, quantity: 1 }}
          categories={categories}
          onSave={handleSave}
          onCancel={() => setShowAddNew(false)}
        />
      )}
    </div>
  )
}

function ItemCard({ item, onEdit, onDelete }) {
  const categoryNames = {
    cpu: 'CPU',
    mainboard: 'Mainboard',
    vga: 'VGA',
    ram: 'RAM',
    ssd: 'SSD',
    hdd: 'HDD',
    psu: 'PSU',
    case: 'Case',
    cpuCooler: 'CPU Cooler',
    monitor: 'Monitor'
  }

  return (
    <div style={{
      background: 'rgba(30,41,59,0.9)',
      padding: '20px',
      borderRadius: '10px',
      border: '1px solid rgba(79,172,254,0.2)',
      display: 'flex',
      gap: '20px',
      alignItems: 'center',
      transition: 'all 0.2s'
    }}>
      {/* Category Badge */}
      <div style={{
        padding: '8px 16px',
        borderRadius: '6px',
        background: 'linear-gradient(135deg,#667eea,#764ba2)',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 700,
        textTransform: 'uppercase',
        minWidth: '100px',
        textAlign: 'center'
      }}>
        {categoryNames[item.cat] || item.cat}
      </div>

      {/* Item Info */}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px', color: '#f8fafc' }}>
          {item.name}
        </div>
        <div style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <span>
            <strong style={{ color: '#cbd5e1' }}>ID:</strong> {item.id}
          </span>
          <span>
            <strong style={{ color: '#cbd5e1' }}>Giá:</strong>{' '}
            <span style={{ color: '#10b981', fontWeight: 600 }}>
              {item.price?.toLocaleString('vi-VN')} VNĐ
            </span>
          </span>
          <span>
            <strong style={{ color: '#cbd5e1' }}>Số lượng:</strong>{' '}
            <span style={{ color: '#4facfe', fontWeight: 600 }}>
              {item.quantity || 0}
            </span>
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onEdit}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: 'none',
            background: 'rgba(79,172,254,0.2)',
            color: '#4facfe',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          ✏️ Sửa
        </button>
        <button
          onClick={onDelete}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: 'none',
            background: 'rgba(239,68,68,0.2)',
            color: '#ef4444',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          🗑️ Xóa
        </button>
      </div>
    </div>
  )
}

function ItemEditor({ item, categories, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    cat: item.cat || 'cpu',
    id: item.id || '',
    name: item.name || '',
    price: item.price || 0,
    quantity: item.quantity || 1
  })

  const handleSubmit = () => {
    if (!formData.id || !formData.name) {
      alert('Vui lòng nhập đầy đủ ID và Tên sản phẩm')
      return
    }
    if (formData.price < 0) {
      alert('Giá không được âm')
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
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(30,41,59,0.98)',
        padding: '32px',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '100%',
        border: '1px solid rgba(79,172,254,0.3)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}>
        <h2 style={{ margin: '0 0 24px 0', fontSize: '26px', fontWeight: 700 }}>
          {item.id ? '✏️ Chỉnh Sửa Sản Phẩm' : '➕ Thêm Sản Phẩm Mới'}
        </h2>

        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Category */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#cbd5e1'
            }}>
              Danh mục:
            </label>
            <select
              value={formData.cat}
              onChange={e => setFormData(prev => ({ ...prev, cat: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '6px',
                border: '1px solid rgba(79,172,254,0.3)',
                background: 'rgba(15,23,42,0.8)',
                color: '#f8fafc',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              {categories.map(cat => (
                <option key={cat.key} value={cat.key}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* ID */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#cbd5e1'
            }}>
              ID sản phẩm:
            </label>
            <input
              type="text"
              value={formData.id}
              onChange={e => setFormData(prev => ({ ...prev, id: e.target.value }))}
              placeholder="vd: 12100f, B660M"
              disabled={!!item.id}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '6px',
                border: '1px solid rgba(79,172,254,0.3)',
                background: item.id ? 'rgba(15,23,42,0.4)' : 'rgba(15,23,42,0.8)',
                color: '#f8fafc',
                fontSize: '14px',
                cursor: item.id ? 'not-allowed' : 'text'
              }}
            />
            {item.id && (
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                💡 ID không thể thay đổi
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#cbd5e1'
            }}>
              Tên sản phẩm:
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nhập tên đầy đủ..."
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '6px',
                border: '1px solid rgba(79,172,254,0.3)',
                background: 'rgba(15,23,42,0.8)',
                color: '#f8fafc',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Price */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#cbd5e1'
            }}>
              Giá bán (VNĐ):
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={e => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
              min="0"
              step="1000"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '6px',
                border: '1px solid rgba(79,172,254,0.3)',
                background: 'rgba(15,23,42,0.8)',
                color: '#f8fafc',
                fontSize: '14px'
              }}
            />
            <div style={{ fontSize: '13px', color: '#10b981', marginTop: '6px', fontWeight: 600 }}>
              = {formData.price.toLocaleString('vi-VN')} VNĐ
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#cbd5e1'
            }}>
              Số lượng tồn kho:
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={e => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
              min="0"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '6px',
                border: '1px solid rgba(79,172,254,0.3)',
                background: 'rgba(15,23,42,0.8)',
                color: '#f8fafc',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              onClick={handleSubmit}
              style={{
                flex: 1,
                padding: '14px 24px',
                borderRadius: '6px',
                border: 'none',
                background: 'linear-gradient(135deg,#10b981,#059669)',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              💾 Lưu
            </button>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '14px 24px',
                borderRadius: '6px',
                border: '1px solid rgba(148,163,184,0.3)',
                background: 'rgba(15,23,42,0.6)',
                color: '#cbd5e1',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer'
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
