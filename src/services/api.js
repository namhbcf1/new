const API_BASE = import.meta.env.VITE_API_BASE || ''

export async function fetchInventory() {
  if (!API_BASE) return null
  const r = await fetch(API_BASE + '/inventory')
  if (!r.ok) throw new Error('fetchInventory failed')
  return await r.json()
}

export async function upsertInventoryItem(password, payload) {
  const r = await fetch(API_BASE + `/inventory?password=${encodeURIComponent(password)}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload)
  })
  if (!r.ok) throw new Error('upsertInventoryItem failed')
  return await r.json()
}

export async function deleteInventoryItem(password, cat, id) {
  const r = await fetch(API_BASE + `/inventory/${encodeURIComponent(cat)}/${encodeURIComponent(id)}?password=${encodeURIComponent(password)}`, { method: 'DELETE' })
  if (!r.ok) throw new Error('deleteInventoryItem failed')
  return await r.json()
}

// Configs API
export async function fetchAllConfigs() {
  if (!API_BASE) return { configs: [] }
  const r = await fetch(API_BASE + '/configs')
  if (!r.ok) throw new Error('fetchAllConfigs failed')
  return await r.json()
}

export async function upsertConfig(password, payload) {
  const r = await fetch(API_BASE + `/configs?password=${encodeURIComponent(password)}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload)
  })
  if (!r.ok) throw new Error('upsertConfig failed')
  return await r.json()
}

export async function deleteConfig(password, cpuType, game, budgetKey) {
  const r = await fetch(API_BASE + `/configs/${encodeURIComponent(cpuType)}/${encodeURIComponent(game)}/${encodeURIComponent(budgetKey)}?password=${encodeURIComponent(password)}`, { method: 'DELETE' })
  if (!r.ok) throw new Error('deleteConfig failed')
  return await r.json()
}


