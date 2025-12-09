// Import and re-export all component data from hardware/ folder
import {
  cpuData,
  mainboardData,
  vgaData,
  ramData,
  ssdData,
  psuData,
  caseData,
  cpuCoolerData,
  hddData,
  monitorData
} from './hardware/index.js'

export {
  cpuData,
  mainboardData,
  vgaData,
  ramData,
  ssdData,
  psuData,
  caseData,
  cpuCoolerData,
  hddData,
  monitorData
}

const baseCatalogs = {
  cpu: cpuData,
  mainboard: mainboardData,
  vga: vgaData,
  ram: ramData,
  ssd: ssdData,
  psu: psuData,
  case: caseData,
  cpuCooler: cpuCoolerData
}

export function formatPrice(v) {
  if (!v) return '0 VNĐ'
  return new Intl.NumberFormat('vi-VN').format(v) + ' VNĐ'
}

function readOverrides() {
  try {
    const raw = localStorage.getItem('tp_catalog_overrides')
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveOverrides(next) {
  localStorage.setItem('tp_catalog_overrides', JSON.stringify(next))
}

export function getCatalogs() {
  const overrides = readOverrides()
  const merged = {}
  Object.keys(baseCatalogs).forEach(cat => {
    const base = baseCatalogs[cat] || {}
    const ov = overrides[cat] || {}
    // merge base + overrides (overrides can add/replace fields price/quantity/name)
    const out = { ...base }
    Object.entries(ov).forEach(([id, patch]) => {
      out[id] = { ...(out[id] || { id }), ...patch }
    })
    // ensure quantity default
    Object.keys(out).forEach(id => {
      if (typeof out[id].quantity !== 'number') out[id].quantity = 1
    })
    merged[cat] = out
  })
  return merged
}



