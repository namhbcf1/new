// Minimal curated dataset to demonstrate compatibility + totals

export const cpuData = {
  '12100f': { id: '12100f', name: 'Intel Core i3-12100F', socket: 'LGA1700', ddr: 'DDR4', price: 2200000 },
  '13400f': { id: '13400f', name: 'Intel Core i5-13400F', socket: 'LGA1700', ddr: 'DDR4', price: 4300000 },
  '14600kf': { id: '14600kf', name: 'Intel Core i5-14600KF', socket: 'LGA1700', ddr: 'DDR5', price: 7800000 },
  '5600': { id: '5600', name: 'AMD Ryzen 5 5600', socket: 'AM4', ddr: 'DDR4', price: 2800000 },
  '5700x': { id: '5700x', name: 'AMD Ryzen 7 5700X', socket: 'AM4', ddr: 'DDR4', price: 4300000 },
  '7600x': { id: '7600x', name: 'AMD Ryzen 5 7600X', socket: 'AM5', ddr: 'DDR5', price: 5900000 },
  '7500f': { id: '7500f', name: 'AMD Ryzen 5 7500F', socket: 'AM5', ddr: 'DDR5', price: 3700000 },
  '7500F': { id: '7500F', name: 'AMD Ryzen 5 7500F', socket: 'AM5', ddr: 'DDR5', price: 3700000 }
}

export const mainboardData = {
  'HNZ-H610': { id: 'HNZ-H610', name: 'H610 mATX (LGA1700, DDR4)', socket: 'LGA1700', ddr: 'DDR4', price: 1500000 },
  'HNZ-B760': { id: 'HNZ-B760', name: 'B760 mATX (LGA1700, DDR4)', socket: 'LGA1700', ddr: 'DDR4', price: 2600000 },
  'B760M-E': { id: 'B760M-E', name: 'B760M-E (LGA1700, DDR5)', socket: 'LGA1700', ddr: 'DDR5', price: 3500000 },
  'B450M-A': { id: 'B450M-A', name: 'B450M-A (AM4, DDR4)', socket: 'AM4', ddr: 'DDR4', price: 1600000 },
  'MSI-B550M': { id: 'MSI-B550M', name: 'MSI B550M (AM4, DDR4)', socket: 'AM4', ddr: 'DDR4', price: 2500000 },
  'B650M-E': { id: 'B650M-E', name: 'B650M-E (AM5, DDR5)', socket: 'AM5', ddr: 'DDR5', price: 3900000 }
}

export const vgaData = {
  '1660s': { id: '1660s', name: 'GeForce GTX 1660 Super', tier: 2, price: 3500000 },
  '3070': { id: '3070', name: 'GeForce RTX 3070', tier: 4, price: 7200000 },
  '4070': { id: '4070', name: 'GeForce RTX 4070', tier: 5, price: 11500000 },
  '750ti': { id: '750ti', name: 'GeForce GTX 750 Ti', tier: 1, price: 1200000 }
}

export const ramData = {
  'cosair-16': { id: 'cosair-16', name: 'Corsair 16GB (2x8) DDR4-3200', ddr: 'DDR4', sizeGb: 16, price: 900000 },
  'cosair-32': { id: 'cosair-32', name: 'Corsair 32GB (2x16) DDR5-5600', ddr: 'DDR5', sizeGb: 32, price: 2400000 },
  'D38G': { id: 'D38G', name: 'DDR4 8GB-2666', ddr: 'DDR4', sizeGb: 8, price: 400000 }
}

export const ssdData = {
  'sstc-256': { id: 'sstc-256', name: 'SSTC 256GB SATA', type: 'SATA', price: 450000 },
  'crucial-500': { id: 'crucial-500', name: 'Crucial P3 500GB NVMe', type: 'NVMe', price: 950000 },
  'crucial-1tb': { id: 'crucial-1tb', name: 'Crucial P3 1TB NVMe', type: 'NVMe', price: 1550000 },
  'sata-sstc-256': { id: 'sata-sstc-256', name: 'SSTC 256GB SATA', type: 'SATA', price: 450000 }
}

export const psuData = {
  '350W': { id: '350W', name: 'PSU 350W', watt: 350, price: 350000 },
  'DT660': { id: 'DT660', name: 'PSU 650W 80+ Bronze', watt: 650, price: 850000 },
  'VSP750': { id: 'VSP750', name: 'PSU 750W 80+ Bronze', watt: 750, price: 1200000 },
  'COSAIR850': { id: 'COSAIR850', name: 'Corsair 850W 80+ Gold', watt: 850, price: 2400000 }
}

export const caseData = {
  'GA3': { id: 'GA3', name: 'Case GA3', price: 450000 },
  'GA': { id: 'GA', name: 'Case GA', price: 600000 }
}

export const cpuCoolerData = {
  'STOCK': { id: 'STOCK', name: 'Stock Cooler', price: 0 },
  '2ongdong': { id: '2ongdong', name: 'Air Cooler 2 Ống Đồng', price: 300000 },
  'CR1000': { id: 'CR1000', name: 'ID-COOLING CR1000', price: 350000 },
  'TMR120SE': { id: 'TMR120SE', name: '240mm AIO', price: 1200000 }
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



