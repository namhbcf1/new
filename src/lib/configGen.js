import { getCatalogs, cpuData, mainboardData, ramData, vgaData, ssdData, psuData, caseData, cpuCoolerData } from '../data/components'
import { intelConfigs, amdConfigs } from '../data/configs'

export function getCompatibleMainboards(cpuId) {
  const cpu = cpuData[cpuId]
  if (!cpu) return []
  const cpuDDR = cpu.ddr || cpu.ram_support
  return Object.values(mainboardData).filter(mb => {
    // Match socket - support both socket (string) and sockets (array)
    const mbSocket = mb.socket || (mb.sockets && mb.sockets[0])
    if (mbSocket !== cpu.socket) return false

    // If CPU has DDR requirement, match it with mainboard's ddr or memoryType
    if (cpuDDR) {
      const mbDDR = mb.ddr || mb.memoryType
      return mbDDR === cpuDDR
    }
    return true
  })
}

export function getCompatibleRAMs(mainboardId) {
  const mb = mainboardData[mainboardId]
  if (!mb) return []
  const mbDDR = mb.ddr || mb.memoryType
  return Object.values(ramData).filter(r => {
    const ramDDR = r.ddr || r.type
    return ramDDR === mbDDR
  })
}

export function estimatePSUWatts(vgaId) {
  const vga = vgaData[vgaId]
  if (!vga) return 450
  // super simple heuristic by "tier"
  if (vga.tier >= 5) return 750
  if (vga.tier >= 4) return 650
  if (vga.tier >= 3) return 550
  return 450
}

export function pickPSU(requiredWatt) {
  const list = Object.values(psuData).sort((a,b)=>a.watt-b.watt)
  return list.find(p => p.watt >= requiredWatt) || list[list.length-1]
}

export function totalPrice(config) {
  const catalogs = getCatalogs()
  return Object.entries(config).reduce((sum,[k,v]) => {
    const cat = catalogs[k]
    const item = cat?.[v]
    const qty = typeof item?.quantity === 'number' ? item.quantity : 1
    return sum + (item?.price || 0) * qty
  }, 0)
}

// Smart generator using budget + cpuType + game (game not used yet but kept for future tuning)
export function generateSmartConfig({ budgetM, cpuType, game }) {
  // 1) Try per-game configs first with closest budget
  const map = cpuType === 'intel' ? intelConfigs : amdConfigs
  const g = map?.[game]
  if (g) {
    const budgets = Object.keys(g).map(k => parseInt(k.replace('M',''))).sort((a,b)=>a-b)
    const closest = budgets.reduce((best, b) => Math.abs(b - budgetM) < Math.abs(best - budgetM) ? b : best, budgets[0])
    const pick = g[closest + 'M']
    if (pick) return pick
  }

  // 2) Fallback: heuristic by budget tiers
  const intelPool = ['12100f','13400f','14600kf']
  const amdPool = ['5600','5700x','7600x']
  const pool = cpuType === 'intel' ? intelPool : amdPool
  let cpuId = pool[1]
  if (budgetM <= 8) cpuId = pool[0]
  else if (budgetM >= 25) cpuId = pool[2]

  const compatibleMbs = getCompatibleMainboards(cpuId)
  const mb = compatibleMbs[0]
  // If no compatible mainboard found in local data, use a placeholder
  // The Builder component will handle mainboard selection from inventory
  if (!mb || !mb.id) {
    console.warn(`No compatible mainboard in local data for CPU ${cpuId}, using placeholder`)
    // Return a minimal config that Builder.jsx can work with
    return {
      cpu: cpuId,
      mainboard: null, // Will be selected from inventory in Builder
      vga: budgetM >= 15 ? '3070' : '1660s',
      ram: null,
      ssd: budgetM >= 15 ? 'crucial-500' : 'sstc-256',
      psu: null,
      case: budgetM >= 15 ? 'GA' : 'GA3',
      cpuCooler: 'STOCK'
    }
  }

  // vga by budget tier, game could be used to bump tier
  let vgaId = '1660s'
  if (budgetM >= 15) vgaId = '3070'
  if (budgetM >= 28) vgaId = '4070'

  const ram = getCompatibleRAMs(mb.id).sort((a,b)=>a.sizeGb-b.sizeGb)
  const ramPick = (budgetM >= 20 ? ram.find(r=>r.sizeGb>=32) : ram.find(r=>r.sizeGb>=16)) || ram[0]

  const ssdId = budgetM >= 15 ? 'crucial-500' : 'sstc-256'
  const caseId = budgetM >= 15 ? 'GA' : 'GA3'
  const coolerId = (cpuId==='14600kf' || cpuId==='7600x') ? 'TMR120SE' : (budgetM>=10 ? '2ongdong' : 'STOCK')
  const requiredWatt = estimatePSUWatts(vgaId)
  const psuPick = pickPSU(requiredWatt)

  return {
    cpu: cpuId,
    mainboard: mb.id,
    vga: vgaId,
    ram: ramPick.id,
    ssd: ssdId,
    psu: psuPick.id,
    case: caseId,
    cpuCooler: coolerId
  }
}


