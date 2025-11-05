const API_BASE = import.meta.env.VITE_API_BASE || ''

export async function fetchInventory() {
  if (!API_BASE) return null
  const r = await fetch(API_BASE + '/inventory')
  if (!r.ok) throw new Error('fetchInventory failed')
  return await r.json()
}

export async function upsertInventoryItem(password, { cat, id, name, price, quantity }) {
  const r = await fetch(API_BASE + `/inventory?password=${encodeURIComponent(password)}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cat, id, name, price, quantity })
  })
  if (!r.ok) throw new Error('upsertInventoryItem failed')
  return await r.json()
}

export async function deleteInventoryItem(password, cat, id) {
  const r = await fetch(API_BASE + `/inventory/${encodeURIComponent(cat)}/${encodeURIComponent(id)}?password=${encodeURIComponent(password)}`, { method: 'DELETE' })
  if (!r.ok) throw new Error('deleteInventoryItem failed')
  return await r.json()
}


