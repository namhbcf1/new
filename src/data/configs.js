// Minimal per-game configs mapped by CPU family and budget keys
// Keys: game -> cpuType -> budget (e.g., '8M','15M','20M','30M') -> component ids

export const intelConfigs = {
  valorant: {
    '8M':  { cpu: '12100f', mainboard: 'HNZ-H610', vga: '1050ti-4gb', ram: 'cosair-16', ssd: 'sstc-256', psu: 'DT660', case: 'GA3', cpuCooler: '2ongdong' },
    '15M': { cpu: '13400f', mainboard: 'HNZ-B760', vga: '1660s',      ram: 'cosair-16', ssd: 'crucial-500', psu: 'VSP750', case: 'GA',  cpuCooler: 'CR1000' },
    '20M': { cpu: '13400f', mainboard: 'B760M-E',  vga: '3070',       ram: 'cosair-16', ssd: 'crucial-1tb', psu: 'VSP750', case: 'GA',  cpuCooler: 'CR1000' },
    '30M': { cpu: '14600kf',mainboard: 'B760M-E',  vga: '4070',       ram: 'cosair-32', ssd: 'crucial-1tb', psu: 'COSAIR850', case: 'GA', cpuCooler: 'TMR120SE' },
  },
  pubg: {
    '8M':  { cpu: '12100f', mainboard: 'HNZ-H610', vga: '1050ti-4gb', ram: 'cosair-16', ssd: 'sstc-256', psu: 'DT660', case: 'GA3', cpuCooler: '2ongdong' },
    '15M': { cpu: '13400f', mainboard: 'HNZ-B760', vga: '1660s',      ram: 'cosair-16', ssd: 'crucial-500', psu: 'VSP750', case: 'GA',  cpuCooler: 'CR1000' },
    '20M': { cpu: '13400f', mainboard: 'B760M-E',  vga: '3070',       ram: 'cosair-16', ssd: 'crucial-1tb', psu: 'VSP750', case: 'GA',  cpuCooler: 'CR1000' },
    '30M': { cpu: '14600kf',mainboard: 'B760M-E',  vga: '4070',       ram: 'cosair-32', ssd: 'crucial-1tb', psu: 'COSAIR850', case: 'GA', cpuCooler: 'TMR120SE' },
  },
  'gta-v': {
    '8M':  { cpu: '12100f', mainboard: 'HNZ-H610', vga: '1050ti-4gb', ram: 'cosair-16', ssd: 'sstc-256', psu: 'DT660', case: 'GA3', cpuCooler: '2ongdong' },
    '15M': { cpu: '13400f', mainboard: 'HNZ-B760', vga: '1660s',      ram: 'cosair-16', ssd: 'crucial-500', psu: 'VSP750', case: 'GA',  cpuCooler: 'CR1000' },
    '20M': { cpu: '13400f', mainboard: 'B760M-E',  vga: '3070',       ram: 'cosair-16', ssd: 'crucial-1tb', psu: 'VSP750', case: 'GA',  cpuCooler: 'CR1000' },
    '30M': { cpu: '14600kf',mainboard: 'B760M-E',  vga: '4070',       ram: 'cosair-32', ssd: 'crucial-1tb', psu: 'COSAIR850', case: 'GA', cpuCooler: 'TMR120SE' },
  }
}

export const amdConfigs = {
  valorant: {
    '8M':  { cpu: '5600',  mainboard: 'B450M-A',  vga: '1050ti-4gb', ram: 'cosair-16', ssd: 'sstc-256', psu: 'DT660', case: 'GA3', cpuCooler: '2ongdong' },
    '15M': { cpu: '5700x', mainboard: 'MSI-B550M',vga: '1660s',       ram: 'cosair-16', ssd: 'crucial-500', psu: 'VSP750', case: 'GA',  cpuCooler: 'CR1000' },
    '20M': { cpu: '5700x', mainboard: 'MSI-B550M',vga: '3070',        ram: 'cosair-16', ssd: 'crucial-1tb', psu: 'VSP750', case: 'GA',  cpuCooler: 'CR1000' },
    '30M': { cpu: '7600x', mainboard: 'B650M-E',  vga: '4070',        ram: 'cosair-32', ssd: 'crucial-1tb', psu: 'COSAIR850', case: 'GA', cpuCooler: 'TMR120SE' },
  },
  pubg: {
    '8M':  { cpu: '5600',  mainboard: 'B450M-A',  vga: '1050ti-4gb', ram: 'cosair-16', ssd: 'sstc-256', psu: 'DT660', case: 'GA3', cpuCooler: '2ongdong' },
    '15M': { cpu: '5700x', mainboard: 'MSI-B550M',vga: '1660s',       ram: 'cosair-16', ssd: 'crucial-500', psu: 'VSP750', case: 'GA',  cpuCooler: 'CR1000' },
    '20M': { cpu: '5700x', mainboard: 'MSI-B550M',vga: '3070',        ram: 'cosair-16', ssd: 'crucial-1tb', psu: 'VSP750', case: 'GA',  cpuCooler: 'CR1000' },
    '30M': { cpu: '7600x', mainboard: 'B650M-E',  vga: '4070',        ram: 'cosair-32', ssd: 'crucial-1tb', psu: 'COSAIR850', case: 'GA', cpuCooler: 'TMR120SE' },
  },
  'gta-v': {
    '8M':  { cpu: '5600',  mainboard: 'B450M-A',  vga: '1050ti-4gb', ram: 'cosair-16', ssd: 'sstc-256', psu: 'DT660', case: 'GA3', cpuCooler: '2ongdong' },
    '15M': { cpu: '5700x', mainboard: 'MSI-B550M',vga: '1660s',       ram: 'cosair-16', ssd: 'crucial-500', psu: 'VSP750', case: 'GA',  cpuCooler: 'CR1000' },
    '20M': { cpu: '5700x', mainboard: 'MSI-B550M',vga: '3070',        ram: 'cosair-16', ssd: 'crucial-1tb', psu: 'VSP750', case: 'GA',  cpuCooler: 'CR1000' },
    '30M': { cpu: '7600x', mainboard: 'B650M-E',  vga: '4070',        ram: 'cosair-32', ssd: 'crucial-1tb', psu: 'COSAIR850', case: 'GA', cpuCooler: 'TMR120SE' },
  }
}


