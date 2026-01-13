import { useMemo, useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { Search, Filter, Lock, Plus, LogOut, Edit, Trash2, X, Check, Package, Cpu, CircuitBoard, Monitor, Disc, HardDrive, Box, Zap, Fan, Server } from 'lucide-react'

const API_URL = 'https://tp-pc-builder-api.bangachieu2.workers.dev'
const DEFAULT_PASSWORD = 'namhbcf12'

const sections = [
  ['cpu', 'CPU - Vi xử lý', Cpu],
  ['mainboard', 'Mainboard', CircuitBoard],
  ['vga', 'VGA - Card đồ họa', Monitor],
  ['ram', 'RAM - Bộ nhớ', Box],
  ['ssd', 'SSD - Lưu trữ', HardDrive],
  ['hdd', 'HDD - Lưu trữ cơ', Disc],
  ['psu', 'PSU - Nguồn', Zap],
  ['case', 'Case - Vỏ máy', Server],
  ['cpuCooler', 'Tản nhiệt', Fan],
  ['monitor', 'Màn hình', Monitor],
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
        headers: {
          'content-type': 'application/json',
          'x-edit-password': password || DEFAULT_PASSWORD
        },
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
      const response = await fetch(`${API_URL}/inventory/${cat}/${id}`, {
        method: 'DELETE',
        headers: {
          'x-edit-password': password || DEFAULT_PASSWORD
        }
      })
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
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="bg-slate-900/90 border border-slate-700/50 rounded-2xl p-12 max-w-md w-full text-center shadow-2xl backdrop-blur-sm animate-fade-in">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-slate-700">
            <Lock className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Quản Lý Kho Linh Kiện
          </h2>
          <p className="text-slate-400 mb-8">Nhập mật khẩu quản trị viên để truy cập database</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !password}
              className={`
                w-full py-3 rounded-xl font-bold text-white transition-all
                ${loading || !password ? 'bg-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]'}
              `}
            >
              {loading ? 'Đang xác thực...' : 'Đăng Nhập Dashboard'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Package className="text-blue-500" /> Kho Linh Kiện (D1)
          </h2>
          <p className="text-slate-400 text-sm">Quản lý và cập nhật giá linh kiện thời gian thực</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 font-semibold transition-all"
        >
          <LogOut size={18} /> Đăng Xuất
        </button>
      </div>

      {/* Toolbar */}
      <div className="sticky top-[70px] z-30 bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-700/50 shadow-xl mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Tìm kiếm theo tên, mã sản phẩm..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white appearance-none cursor-pointer focus:border-blue-500 focus:outline-none transition-all"
          >
            <option value="all">Tất cả danh mục</option>
            {sections.map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {Object.keys(filtered).length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-800">
          <Package className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">Không tìm thấy linh kiện nào phù hợp.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(filtered).map(([key, items]) => (
            <CategorySection
              key={key}
              catKey={key}
              label={sections.find(s => s[0] === key)?.[1]}
              icon={sections.find(s => s[0] === key)?.[2]}
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

function CategorySection({ catKey, label, icon: Icon, items, onUpdate, onDelete, formatPrice }) {
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-sm animate-slide-up">
      <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
            {Icon ? <Icon size={20} /> : <Package size={20} />}
          </div>
          <h3 className="text-lg font-bold text-slate-200">{label}</h3>
          <span className="bg-slate-700 text-slate-300 text-xs font-bold px-2 py-1 rounded-full">{items.length}</span>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all
            ${showAdd ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}
          `}
        >
          {showAdd ? <><X size={16} /> Hủy</> : <><Plus size={16} /> Thêm Mới</>}
        </button>
      </div>

      <div className="p-4 grid gap-3">
        {showAdd && (
          <AddItemForm
            catKey={catKey}
            onAdd={async (cat, newItem) => {
              await onUpdate(cat, newItem.id, newItem)
              setShowAdd(false)
            }}
          />
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(item => (
            <ItemCard
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
    </div>
  )
}

function ItemCard({ item, catKey, onUpdate, onDelete, formatPrice }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...item })

  // Reset form when opening edit mode
  useEffect(() => {
    if (editing) setForm({ ...item })
  }, [editing, item])

  return (
    <>
      <div className="group bg-slate-950/50 border border-slate-800 rounded-xl p-4 hover:border-blue-500/50 hover:shadow-lg transition-all relative">
        <div className="flex gap-4">
          <div className="w-16 h-16 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 border border-slate-700">
            <img
              src={item.image || '/images/placeholder.jpg'}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => e.target.src = 'https://via.placeholder.com/100?text=No+Img'}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
              <h4 className="font-semibold text-slate-200 truncate pr-6">{item.name}</h4>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${item.condition === '2ND' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                {item.condition === '2ND' ? '2ND' : 'NEW'}
              </span>
            </div>
            <div className="text-xs text-slate-500 mb-2 font-mono">{item.id}</div>
            <div className="flex justify-between items-end">
              <div className="font-bold text-emerald-400">{formatPrice(item.price)}</div>
              <div className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">SL: {item.quantity || 0}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 bg-blue-500/10 text-blue-500 rounded hover:bg-blue-500 hover:text-white transition-colors"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete(catKey, item.id)}
            className="p-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-800/50 sticky top-0 backdrop-blur z-10">
              <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                <Edit size={24} /> Chỉnh sửa: {item.id}
              </h3>
              <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 grid gap-6">
              {/* Basic Info */}
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-400 mb-1 block">Tên Linh Kiện</label>
                  <input
                    value={form.name || ''}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-emerald-500 mb-1 block">Giá (VNĐ)</label>
                    <input
                      type="number"
                      value={form.price || 0}
                      onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-amber-500 mb-1 block">Số Lượng</label>
                    <input
                      type="number"
                      value={form.quantity || 0}
                      onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-400 mb-1 block">Thương Hiệu</label>
                    <input
                      value={form.brand || ''}
                      onChange={e => setForm({ ...form, brand: e.target.value })}
                      placeholder="VD: Asus, Gigabyte"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-400 mb-1 block">Bảo Hành</label>
                    <input
                      value={form.warranty || ''}
                      onChange={e => setForm({ ...form, warranty: e.target.value })}
                      placeholder="VD: 36 Tháng"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-400 mb-1 block">Link Ảnh</label>
                  <input
                    value={form.image || ''}
                    onChange={e => setForm({ ...form, image: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none font-mono text-sm"
                  />
                </div>
              </div>

              {/* Advanced Info */}
              {(catKey === 'cpu' || catKey === 'mainboard' || catKey === 'ram') && (
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                  <h4 className="font-bold text-slate-300 mb-3 border-b border-slate-700 pb-2">Thông Số Kỹ Thuật (Auto-Build)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">Socket</label>
                      <input
                        value={form.socket || form.sockets?.[0] || ''}
                        onChange={e => setForm({ ...form, socket: e.target.value })}
                        placeholder="LGA1700, AM5..."
                        className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">Loại RAM Support</label>
                      <input
                        value={form.ddr || form.memoryType || ''}
                        onChange={e => setForm({ ...form, ddr: e.target.value })}
                        placeholder="DDR4, DDR5"
                        className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 p-6 border-t border-slate-800 bg-slate-800/50 sticky bottom-0 backdrop-blur">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 py-3 rounded-xl border border-slate-600 font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={() => {
                  onUpdate(catKey, item.id, form)
                  setEditing(false)
                }}
                className="flex-1 py-3 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function AddItemForm({ catKey, onAdd }) {
  const [form, setForm] = useState({ id: '', name: '', price: 0, quantity: 1, condition: 'new' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.id || !form.name) return Swal.fire('Lỗi', 'Vui lòng nhập ID và Tên', 'warning')
    onAdd(catKey, form)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 p-4 rounded-xl border border-slate-700 animate-fade-in mb-4">
      <h4 className="font-bold text-emerald-400 mb-4 flex items-center gap-2">
        <Plus size={18} /> Thêm Sản Phẩm Mới
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <input
          placeholder="Mã sản phẩm (ID Unique)..."
          value={form.id} onChange={e => setForm({ ...form, id: e.target.value })}
          className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white text-sm"
        />
        <input
          placeholder="Tên sản phẩm..."
          value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
          className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white text-sm md:col-span-2"
        />
        <input
          type="number" placeholder="Giá..."
          value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })}
          className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white text-sm"
        />
      </div>
      <button type="submit" className="w-full py-2 bg-emerald-600 rounded text-white font-bold hover:bg-emerald-500">
        Xác Nhận Thêm
      </button>
    </form>
  )
}
