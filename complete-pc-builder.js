// Complete PC Builder JavaScript
// Global variables
let currentStep = 1;
let selectedBudget = 15;
let selectedCPU = null;
let selectedGame = null;
let currentConfig = {};

// Game data with images
const games = [
    { id: 'valorant', name: 'Valorant', image: 'images/valorant.jpg' },
    { id: 'csgo', name: 'CS:GO', image: 'images/csgo.jpg' },
    { id: 'pubg', name: 'PUBG', image: 'images/pubg.jpg' },
    { id: 'lol', name: 'League of Legends', image: 'images/lol.jpg' },
    { id: 'gta-v', name: 'GTA V', image: 'images/gta-v.jpg' },
    { id: 'elden-ring', name: 'Elden Ring', image: 'images/elden-ring.jpg' },
    { id: 'naraka', name: 'Naraka Bladepoint', image: 'images/naraka.jpg' },
    { id: 'genshin', name: 'Genshin Impact', image: 'images/genshin.jpg' },
    { id: 'fo4', name: 'Fallout 4', image: 'images/fo4.jpg' },
    { id: 'black-myth-wukong', name: 'Black Myth: Wukong', image: 'images/black-myth-wukong.jpg' },
    { id: 'audition', name: 'Audition', image: 'images/audition.jpg' },
    { id: 'battle-teams-2', name: 'Battle Teams 2', image: 'images/battle-teams-2.jpg' },
    { id: 'crossfire', name: 'CrossFire', image: 'images/crossfire.jpg' },
    { id: 'delta-force', name: 'Delta Force', image: 'images/delta-force.jpg' },
    { id: 'mu-origin', name: 'MU Origin', image: 'images/mu-origin.jpg' }
];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateBudgetDisplay();
    loadGames();
    console.log('🚀 Trường Phát Computer PC Builder initialized');
    
    // Setup budget slider
    const budgetSlider = document.getElementById('budget-slider');
    if (budgetSlider) {
        budgetSlider.addEventListener('input', function(e) {
            selectedBudget = parseInt(e.target.value);
            updateBudgetDisplay();
        });
    }
});

function updateBudgetDisplay() {
    const display = document.getElementById('budget-display');
    if (display) {
        display.textContent = selectedBudget + ' triệu VNĐ';
    }
}

function selectCPU(cpu) {
    selectedCPU = cpu;
    
    // Update UI
    document.querySelectorAll('.cpu-option').forEach(option => {
        option.classList.remove('selected');
    });
    const selectedOption = document.querySelector(`[data-cpu="${cpu}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    console.log(`✅ CPU selected: ${cpu}`);
}

function loadGames() {
    const gameGrid = document.getElementById('game-grid');
    if (!gameGrid) return;
    
    gameGrid.innerHTML = games.map(game => `
        <div class="game-option" data-game="${game.id}" onclick="selectGame('${game.id}')">
            <img src="${game.image}" alt="${game.name}" class="game-image" onerror="this.style.display='none'">
            <div class="game-name">${game.name}</div>
        </div>
    `).join('');
}

function selectGame(gameId) {
    selectedGame = gameId;
    
    // Update UI
    document.querySelectorAll('.game-option').forEach(option => {
        option.classList.remove('selected');
    });
    const selectedOption = document.querySelector(`[data-game="${gameId}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    const gameName = games.find(g => g.id === gameId)?.name || gameId;
    console.log(`✅ Game selected: ${gameName}`);
}

function nextStep() {
    if (currentStep === 2 && !selectedCPU) {
        alert('Vui lòng chọn loại CPU!');
        return;
    }
    
    if (currentStep === 3 && !selectedGame) {
        alert('Vui lòng chọn game!');
        return;
    }
    
    if (currentStep === 3) {
        generateConfiguration();
        loadComponentSelectors();
        displayFinalConfiguration();
    }
    
    currentStep++;
    showStep(currentStep);
}

function showStep(step) {
    // Hide all steps
    for (let i = 1; i <= 4; i++) {
        const stepEl = document.getElementById(`step-${i}`);
        if (stepEl) {
            stepEl.classList.add('hidden');
        }
    }
    
    // Show current step
    const currentStepEl = document.getElementById(`step-${step}`);
    if (currentStepEl) {
        currentStepEl.classList.remove('hidden');
    }
    
    // Update step indicator
    document.querySelectorAll('.step').forEach((stepEl, index) => {
        if (index + 1 <= step) {
            stepEl.classList.add('active');
        } else {
            stepEl.classList.remove('active');
        }
    });
}

function generateConfiguration() {
    const budgetKey = selectedBudget + 'M';
    console.log(`🔍 Looking for config: ${selectedCPU} - ${selectedGame} - ${budgetKey}`);
    
    // Get configuration from loaded data
    let configData = null;
    
    if (selectedCPU === 'intel' && window.intelConfigs && window.intelConfigs[selectedGame]) {
        configData = window.intelConfigs[selectedGame][budgetKey];
    } else if (selectedCPU === 'amd' && window.amdConfigs && window.amdConfigs[selectedGame]) {
        configData = window.amdConfigs[selectedGame][budgetKey];
    }
    
    if (configData) {
        currentConfig = { ...configData };
        console.log('✅ Configuration loaded:', currentConfig);
    } else {
        // Try to find closest budget
        const availableBudgets = getAvailableBudgets();
        const closestBudget = findClosestBudget(selectedBudget, availableBudgets);
        
        if (closestBudget) {
            const closestKey = closestBudget + 'M';
            if (selectedCPU === 'intel' && window.intelConfigs && window.intelConfigs[selectedGame]) {
                configData = window.intelConfigs[selectedGame][closestKey];
            } else if (selectedCPU === 'amd' && window.amdConfigs && window.amdConfigs[selectedGame]) {
                configData = window.amdConfigs[selectedGame][closestKey];
            }
            
            if (configData) {
                currentConfig = { ...configData };
                console.log(`✅ Using closest budget config (${closestBudget}M):`, currentConfig);
            } else {
                currentConfig = generateFallbackConfig();
                console.warn('⚠️ Using fallback configuration');
            }
        } else {
            currentConfig = generateFallbackConfig();
            console.warn('⚠️ Using fallback configuration');
        }
    }
}

function getAvailableBudgets() {
    const budgets = new Set();
    
    // Collect all available budgets from both Intel and AMD configs
    if (window.intelConfigs && window.intelConfigs[selectedGame]) {
        Object.keys(window.intelConfigs[selectedGame]).forEach(key => {
            const budget = parseInt(key.replace('M', ''));
            budgets.add(budget);
        });
    }
    
    if (window.amdConfigs && window.amdConfigs[selectedGame]) {
        Object.keys(window.amdConfigs[selectedGame]).forEach(key => {
            const budget = parseInt(key.replace('M', ''));
            budgets.add(budget);
        });
    }
    
    return Array.from(budgets).sort((a, b) => a - b);
}

function findClosestBudget(targetBudget, availableBudgets) {
    if (availableBudgets.length === 0) return null;
    
    let closest = availableBudgets[0];
    let minDiff = Math.abs(targetBudget - closest);
    
    for (let budget of availableBudgets) {
        const diff = Math.abs(targetBudget - budget);
        if (diff < minDiff) {
            minDiff = diff;
            closest = budget;
        }
    }
    
    return closest;
}

function generateFallbackConfig() {
    console.log('🔧 Generating fallback configuration...');
    
    if (selectedBudget <= 5) {
        return selectedCPU === 'intel' ? {
            cpu: "9100f",
            mainboard: "H310",
            vga: "750ti",
            ram: "D38G",
            ssd: "sata-sstc-256",
            hdd: "wd-blue-1tb",
            monitor: "dell-s2725h",
            case: "gaming-start-ga3fg",
            cpuCooler: "STOCK",
            psu: "350W"
        } : {
            cpu: "3200g",
            mainboard: "A320",
            vga: "750ti",
            ram: "D38G",
            ssd: "sata-sstc-256",
            hdd: "wd-blue-1tb",
            monitor: "dell-s2725h",
            case: "gaming-start-ga3fg",
            cpuCooler: "STOCK",
            psu: "350W"
        };
    } else if (selectedBudget <= 10) {
        return selectedCPU === 'intel' ? {
            cpu: "12100f",
            mainboard: "HNZ-H610",
            vga: "1660s",
            ram: "cosair-16",
            ssd: "sstc-256",
            hdd: "wd-blue-1tb",
            monitor: "duan-dt-v2218s",
            case: "GA",
            cpuCooler: "2ongdong",
            psu: "DT660"
        } : {
            cpu: "5600",
            mainboard: "B450M-A",
            vga: "1660s",
            ram: "cosair-16",
            ssd: "sstc-256",
            hdd: "wd-blue-1tb",
            monitor: "duan-dt-v2218s",
            case: "GA",
            cpuCooler: "2ongdong",
            psu: "DT660"
        };
    } else if (selectedBudget <= 20) {
        return selectedCPU === 'intel' ? {
            cpu: "13400f",
            mainboard: "HNZ-B760",
            vga: "3070",
            ram: "cosair-16",
            ssd: "crucial-500",
            hdd: "wd-blue-2tb",
            monitor: "lg-ultragear-24gs50f-b",
            case: "GA",
            cpuCooler: "CR1000",
            psu: "VSP750"
        } : {
            cpu: "5700x",
            mainboard: "MSI-B550M",
            vga: "3070",
            ram: "cosair-16",
            ssd: "crucial-500",
            hdd: "wd-blue-2tb",
            monitor: "lg-ultragear-24gs50f-b",
            case: "GA",
            cpuCooler: "CR1000",
            psu: "VSP750"
        };
    } else {
        return selectedCPU === 'intel' ? {
            cpu: "14600kf",
            mainboard: "B760M-E",
            vga: "4070",
            ram: "cosair-32",
            ssd: "crucial-1tb",
            hdd: "seagate-ironwolf-pro-4tb",
            monitor: "asus-proart-pa248qv",
            case: "GA",
            cpuCooler: "TMR120SE",
            psu: "COSAIR850"
        } : {
            cpu: "7600x",
            mainboard: "B650M-E",
            vga: "4070",
            ram: "cosair-32",
            ssd: "crucial-1tb",
            hdd: "seagate-ironwolf-pro-4tb",
            monitor: "asus-proart-pa248qv",
            case: "GA",
            cpuCooler: "TMR120SE",
            psu: "COSAIR850"
        };
    }
}

function loadComponentSelectors() {
    const componentGrid = document.getElementById('component-grid');
    if (!componentGrid) return;
    
    const components = ['cpu', 'mainboard', 'vga', 'ram', 'ssd', 'hdd', 'monitor', 'psu', 'case', 'cpuCooler'];
    const componentNames = {
        cpu: '💻 CPU - Bộ Vi Xử Lý',
        mainboard: '🔌 Mainboard - Bo Mạch Chủ',
        vga: '🎮 VGA - Card Đồ Họa',
        ram: '🧠 RAM - Bộ Nhớ',
        ssd: '💾 SSD - Ổ Cứng',
        hdd: '💽 HDD - Ổ Cứng Cơ',
        monitor: '🖥️ Monitor - Màn Hình',
        psu: '⚡ PSU - Nguồn',
        case: '🏠 Case - Vỏ Máy',
        cpuCooler: '🌪️ CPU Cooler - Tản Nhiệt'
    };
    
    componentGrid.innerHTML = components.map(component => {
        const options = getComponentOptions(component);
        const isEnabled = isComponentEnabled(component);
        const statusText = getComponentStatus(component);
        
        return `
            <div class="component-card ${!isEnabled ? 'disabled' : ''}" style="position: relative;">
                <h4 style="color: ${!isEnabled ? '#94a3b8' : '#4facfe'}; margin-bottom: 1rem; font-size: 1.1rem;">${componentNames[component]}</h4>
                <select class="component-select" id="${component}-select" 
                        onchange="updateComponent('${component}', this.value)"
                        ${!isEnabled ? 'disabled' : ''}
                        style="background: ${!isEnabled ? '#f1f5f9' : '#1e293b'}; color: ${!isEnabled ? '#94a3b8' : 'white'};">
                    ${options}
                </select>
                ${statusText ? `<div class="component-status" style="margin-top: 0.5rem; font-size: 0.85rem; color: #64748b; font-style: italic;">${statusText}</div>` : ''}
                ${!isEnabled ? '<div class="component-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(148, 163, 184, 0.3); border-radius: 0.75rem; pointer-events: none;"></div>' : ''}
            </div>
        `;
    }).join('');
    
    // Set current selections
    components.forEach(component => {
        const select = document.getElementById(`${component}-select`);
        if (select && currentConfig[component]) {
            select.value = currentConfig[component];
        }
    });
}

function isComponentEnabled(componentType) {
    switch(componentType) {
        case 'cpu':
            return true; // CPU luôn được phép chọn đầu tiên
        case 'mainboard':
            return currentConfig.cpu ? true : false; // Cần chọn CPU trước
        case 'ram':
            return currentConfig.mainboard ? true : false; // Cần chọn Mainboard trước
        case 'vga':
        case 'ssd':
        case 'hdd':
        case 'monitor':
        case 'psu':
        case 'case':
        case 'cpuCooler':
            return currentConfig.cpu ? true : false; // Cần chọn CPU trước
        default:
            return true;
    }
}

function getComponentStatus(componentType) {
    switch(componentType) {
        case 'mainboard':
            return !currentConfig.cpu ? '❌ Vui lòng chọn CPU trước' : '✅ Sẵn sàng chọn';
        case 'ram':
            return !currentConfig.mainboard ? '❌ Vui lòng chọn Mainboard trước' : '✅ Sẵn sàng chọn';
        case 'vga':
        case 'ssd':
        case 'hdd':
        case 'monitor':
        case 'psu':
        case 'case':
        case 'cpuCooler':
            return !currentConfig.cpu ? '❌ Vui lòng chọn CPU trước' : '✅ Sẵn sàng chọn';
        default:
            return '';
    }
}

function getCompatibleOptions(componentType) {
    const dataMap = {
        cpu: window.cpuData,
        mainboard: window.mainboardData,
        vga: window.vgaData,
        ram: window.ramData,
        ssd: window.ssdData,
        hdd: window.hddData,
        monitor: window.monitorData,
        psu: window.psuData,
        case: window.caseData,
        cpuCooler: window.cpuCoolerData
    };
    
    const data = dataMap[componentType];
    if (!data) return {};
    
    // Filter theo compatibility
    switch(componentType) {
        case 'mainboard':
            if (!currentConfig.cpu) return {};
            const cpuData = window.cpuData[currentConfig.cpu];
            if (!cpuData || !cpuData.socket) return data;
            
            return Object.fromEntries(
                Object.entries(data).filter(([id, mainboard]) => 
                    mainboard.sockets && cpuData.socket && 
                    mainboard.sockets.includes(cpuData.socket)
                )
            );
            
        case 'ram':
            if (!currentConfig.mainboard) return {};
            const mainboardData = window.mainboardData[currentConfig.mainboard];
            if (!mainboardData || !mainboardData.memoryType) return data;
            
            return Object.fromEntries(
                Object.entries(data).filter(([id, ram]) =>
                    ram.type && mainboardData.memoryType && 
                    ram.type === mainboardData.memoryType
                )
            );
            
        case 'cpuCooler':
            if (!currentConfig.cpu) return data;
            const cpuDataForCooler = window.cpuData[currentConfig.cpu];
            if (!cpuDataForCooler || !cpuDataForCooler.socket) return data;
            
            return Object.fromEntries(
                Object.entries(data).filter(([id, cooler]) =>
                    !cooler.sockets || cooler.sockets.some(socket => 
                        socket.includes(cpuDataForCooler.socket) || 
                        cpuDataForCooler.socket.includes(socket.replace(/LGA|AM/g, ''))
                    )
                )
            );
            
        default:
            return data;
    }
}

function getComponentOptions(componentType) {
    const compatibleData = getCompatibleOptions(componentType);
    
    if (!compatibleData || Object.keys(compatibleData).length === 0) {
        if (!isComponentEnabled(componentType)) {
            return '<option value="">Vui lòng chọn linh kiện trước đó</option>';
        }
        return '<option value="">Không có linh kiện tương thích</option>';
    }
    
    const defaultOption = '<option value="">-- Chọn ' + componentType.toUpperCase() + ' --</option>';
    const options = Object.entries(compatibleData).map(([id, component]) => 
        `<option value="${id}">${component.name}${component.price ? ' - ' + formatPrice(component.price) : ''}</option>`
    ).join('');
    
    return defaultOption + options;
}

function updateComponent(componentType, componentId) {
    if (!componentId) {
        delete currentConfig[componentType];
        console.log(`🗑️ Removed ${componentType}`);
    } else {
    currentConfig[componentType] = componentId;
    console.log(`🔧 Updated ${componentType}: ${componentId}`);
    }
    
    // Reset dependent components
    resetDependentComponents(componentType);
    
    // Reload selectors để update compatibility
    loadComponentSelectors();
    
    // Auto-update display
    displayFinalConfiguration();
}

function resetDependentComponents(changedComponent) {
    const dependencies = {
        cpu: ['mainboard', 'ram'], // Khi đổi CPU chỉ reset mainboard và ram, không reset tản nhiệt
        mainboard: ['ram'] // Khi đổi mainboard thì reset ram
    };
    
    if (dependencies[changedComponent]) {
        dependencies[changedComponent].forEach(dependent => {
            if (currentConfig[dependent]) {
                delete currentConfig[dependent];
                console.log(`🔄 Reset ${dependent} due to ${changedComponent} change`);
            }
        });
    }
    
    // Kiểm tra tương thích tản nhiệt với CPU mới
    if (changedComponent === 'cpu' && currentConfig.cpuCooler) {
        const newCpuData = window.cpuData[currentConfig.cpu];
        const coolerData = window.cpuCoolerData[currentConfig.cpuCooler];
        
        if (newCpuData && coolerData && coolerData.sockets) {
            // Kiểm tra xem tản nhiệt có tương thích với CPU mới không
            const isCompatible = coolerData.sockets.some(socket => 
                socket.includes(newCpuData.socket) || 
                newCpuData.socket.includes(socket.replace(/LGA|AM/g, ''))
            );
            
            if (!isCompatible) {
                delete currentConfig.cpuCooler;
                console.log(`🔄 Reset cpuCooler due to socket incompatibility`);
            } else {
                console.log(`✅ CPU Cooler ${currentConfig.cpuCooler} is compatible with new CPU`);
            }
        }
    }
}

function formatPrice(price) {
    if (!price || price === 0) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
}

// Function tính tổng giá
function getTotalPrice() {
    let total = 0;
    
    if (currentConfig.cpu) {
        // cpuData là object, không phải array
        const cpu = window.cpuData[currentConfig.cpu] || Object.values(window.cpuData).find(item => item.name === currentConfig.cpu);
        if (cpu) total += cpu.price;
    }
    
    if (currentConfig.mainboard) {
        const mainboard = window.mainboardData[currentConfig.mainboard] || Object.values(window.mainboardData).find(item => item.name === currentConfig.mainboard);
        if (mainboard) total += mainboard.price;
    }
    
    if (currentConfig.ram) {
        const ram = window.ramData[currentConfig.ram] || Object.values(window.ramData).find(item => item.name === currentConfig.ram);
        if (ram) total += ram.price;
    }
    
    if (currentConfig.ssd) {
        const ssd = window.ssdData[currentConfig.ssd] || Object.values(window.ssdData).find(item => item.name === currentConfig.ssd);
        if (ssd) total += ssd.price;
    }
    
    if (currentConfig.vga) {
        const vga = window.vgaData[currentConfig.vga] || Object.values(window.vgaData).find(item => item.name === currentConfig.vga);
        if (vga) total += vga.price;
    }
    
    if (currentConfig.case) {
        const caseItem = window.caseData[currentConfig.case] || Object.values(window.caseData).find(item => item.name === currentConfig.case);
        if (caseItem) total += caseItem.price;
    }
    
    if (currentConfig.cpuCooler) {
        const cooler = window.cpuCoolerData[currentConfig.cpuCooler] || Object.values(window.cpuCoolerData).find(item => item.name === currentConfig.cpuCooler);
        if (cooler) total += cooler.price;
    }
    
    if (currentConfig.psu) {
        const psu = window.psuData[currentConfig.psu] || Object.values(window.psuData).find(item => item.name === currentConfig.psu);
        if (psu) total += psu.price;
    }
    
    if (currentConfig.hdd) {
        const hdd = window.hddData[currentConfig.hdd] || Object.values(window.hddData).find(item => item.name === currentConfig.hdd);
        if (hdd) total += hdd.price;
    }
    
    if (currentConfig.monitor) {
        const monitor = window.monitorData[currentConfig.monitor] || Object.values(window.monitorData).find(item => item.name === currentConfig.monitor);
        if (monitor) total += monitor.price;
    }
    
    return total;
}

function displayFinalConfiguration() {
    const total = getTotalPrice();
    const dateString = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    let tableHTML = `
        ${mainPageStyles}
        <div style="text-align: center; background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 1.5rem; border-radius: 1rem; margin-bottom: 1.5rem; box-shadow: 0 10px 25px rgba(220, 38, 38, 0.3);">
            <h1 style="margin: 0; font-size: 1.5rem; font-weight: bold;">TRƯỜNG PHÁT COMPUTER XIN GỬI BẢNG CHI TIẾT CẤU HÌNH MÁY TÍNH</h1>
            <p style="margin: 0.5rem 0 0 0; font-size: 1rem; opacity: 0.9;">${dateString}</p>
            <div style="margin-top: 1rem; display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                <button onclick="saveImageHD()" style="background: #22c55e; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: bold; cursor: pointer; font-size: 1rem;">
                    📸 Lưu Ảnh HD
                </button>
                <button onclick="printConfiguration()" style="background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: bold; cursor: pointer; font-size: 1rem;">
                    🖨️ In Cấu Hình
                </button>
        </div>
        </div>
        
        <table class="config-table" style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius: 1rem; overflow: hidden;">
            <thead>
                <tr>
                    <th style="padding: 1rem; text-align: center; font-weight: bold; font-size: 0.75rem;">STT</th>
                    <th style="padding: 1rem; text-align: center; font-weight: bold; font-size: 0.75rem;">HÌNH ẢNH</th>
                    <th style="padding: 1rem; text-align: center; font-weight: bold; font-size: 0.75rem;">TÊN, MÃ, LOẠI LINH KIỆN</th>
                    <th style="padding: 1rem; text-align: center; font-weight: bold; font-size: 0.75rem;">ĐVT</th>
                    <th style="padding: 1rem; text-align: center; font-weight: bold; font-size: 0.75rem;">SỐ LƯỢNG</th>
                    <th style="padding: 1rem; text-align: center; font-weight: bold; font-size: 0.75rem;">ĐƠN GIÁ</th>
                    <th style="padding: 1rem; text-align: center; font-weight: bold; font-size: 0.75rem;">THÀNH TIỀN</th>
                    <th style="padding: 1rem; text-align: center; font-weight: bold; font-size: 0.75rem;">BẢO HÀNH</th>
                    <th style="padding: 1rem; text-align: center; font-weight: bold; font-size: 0.75rem;">GHI CHÚ</th>
                </tr>
            </thead>
            <tbody>`;
    
    let stt = 1;

    // Thêm từng component vào bảng
    if (currentConfig.cpu) {
        const cpu = window.cpuData[currentConfig.cpu] || Object.values(window.cpuData).find(item => item.name === currentConfig.cpu);
        if (cpu) {
            tableHTML += `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #dc2626;">${stt++}</td>
                    <td style="padding: 1rem; text-align: center;"><img src="${cpu.image}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 0.5rem; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/></td>
                    <td style="padding: 1rem; text-align: left; font-weight: 500;">
                        <div style="font-weight: bold; color: #ffffff; margin-bottom: 0.25rem; font-size: 1.1rem;">CPU</div>
                        <div style="color: #ffffff; font-size: 1rem; font-weight: 600;">${cpu.name}</div>
                        <div style="font-size: 0.9rem; color: #e5e7eb; font-weight: 500;">Thương hiệu: ${cpu.brand}</div>
                    </td>
                    <td style="padding: 1rem; text-align: center; color: #ef4444; font-weight: bold;">Chiếc</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #059669;">1</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #dc2626;">${formatPrice(cpu.price)}</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #059669;">${formatPrice(cpu.price)}</td>
                    <td style="padding: 1rem; text-align: center; color: #84cc16; font-weight: bold;">36 tháng</td>
                    <td style="padding: 1rem; text-align: center; color: #10b981; font-weight: bold;">NEW</td>
                </tr>`;
        }
    }

    if (currentConfig.mainboard) {
        const mainboard = window.mainboardData[currentConfig.mainboard] || Object.values(window.mainboardData).find(item => item.name === currentConfig.mainboard);
        if (mainboard) {
            tableHTML += `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #dc2626;">${stt++}</td>
                    <td style="padding: 1rem; text-align: center;"><img src="${mainboard.image}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 0.5rem; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/></td>
                    <td style="padding: 1rem; text-align: left; font-weight: 500;">
                        <div style="font-weight: bold; color: #ffffff; margin-bottom: 0.25rem; font-size: 1.1rem;">Mainboard</div>
                        <div style="color: #ffffff; font-size: 1rem; font-weight: 600;">${mainboard.name}</div>
                        <div style="font-size: 0.9rem; color: #e5e7eb; font-weight: 500;">Thương hiệu: ${mainboard.brand}</div>
            </td>
                    <td style="padding: 1rem; text-align: center; color: #ef4444; font-weight: bold;">Chiếc</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #059669;">1</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #dc2626;">${formatPrice(mainboard.price)}</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #059669;">${formatPrice(mainboard.price)}</td>
                    <td style="padding: 1rem; text-align: center; color: #84cc16; font-weight: bold;">36 tháng</td>
                    <td style="padding: 1rem; text-align: center; color: #10b981; font-weight: bold;">NEW</td>
                </tr>`;
        }
    }

    if (currentConfig.ram) {
        const ram = window.ramData[currentConfig.ram] || Object.values(window.ramData).find(item => item.name === currentConfig.ram);
        if (ram) {
            tableHTML += `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #dc2626;">${stt++}</td>
                    <td style="padding: 1rem; text-align: center;"><img src="${ram.image}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 0.5rem; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/></td>
                    <td style="padding: 1rem; text-align: left; font-weight: 500;">
                        <div style="font-weight: bold; color: #ffffff; margin-bottom: 0.25rem; font-size: 1.1rem;">RAM</div>
                        <div style="color: #ffffff; font-size: 1rem; font-weight: 600;">${ram.name}</div>
                        <div style="font-size: 0.9rem; color: #e5e7eb; font-weight: 500;">Thương hiệu: ${ram.brand}</div>
            </td>
                    <td style="padding: 1rem; text-align: center; color: #ef4444; font-weight: bold;">Chiếc</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #059669;">1</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #dc2626;">${formatPrice(ram.price)}</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #059669;">${formatPrice(ram.price)}</td>
                    <td style="padding: 1rem; text-align: center; color: #84cc16; font-weight: bold;">36 tháng</td>
                    <td style="padding: 1rem; text-align: center; color: #10b981; font-weight: bold;">NEW</td>
        </tr>`;
        }
    }

    if (currentConfig.ssd) {
        const ssd = window.ssdData[currentConfig.ssd] || Object.values(window.ssdData).find(item => item.name === currentConfig.ssd);
        if (ssd) {
            tableHTML += `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #dc2626;">${stt++}</td>
                    <td style="padding: 1rem; text-align: center;"><img src="${ssd.image}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 0.5rem; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/></td>
                    <td style="padding: 1rem; text-align: left; font-weight: 500;">
                        <div style="font-weight: bold; color: #ffffff; margin-bottom: 0.25rem; font-size: 1.1rem;">SSD</div>
                        <div style="color: #ffffff; font-size: 1rem; font-weight: 600;">${ssd.name}</div>
                        <div style="font-size: 0.9rem; color: #e5e7eb; font-weight: 500;">Thương hiệu: ${ssd.brand}</div>
                    </td>
                    <td style="padding: 1rem; text-align: center; color: #ef4444; font-weight: bold;">Chiếc</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #059669;">1</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #dc2626;">${formatPrice(ssd.price)}</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #059669;">${formatPrice(ssd.price)}</td>
                    <td style="padding: 1rem; text-align: center; color: #84cc16; font-weight: bold;">36 tháng</td>
                    <td style="padding: 1rem; text-align: center; color: #10b981; font-weight: bold;">NEW</td>
        </tr>`;
        }
    }

    if (currentConfig.vga) {
        const vga = window.vgaData[currentConfig.vga] || Object.values(window.vgaData).find(item => item.name === currentConfig.vga);
        if (vga) {
            tableHTML += `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #dc2626;">${stt++}</td>
                    <td style="padding: 1rem; text-align: center;"><img src="${vga.image}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 0.5rem; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/></td>
                    <td style="padding: 1rem; text-align: left; font-weight: 500;">
                        <div style="font-weight: bold; color: #ffffff; margin-bottom: 0.25rem; font-size: 1.1rem;">VGA</div>
                        <div style="color: #ffffff; font-size: 1rem; font-weight: 600;">${vga.name}</div>
                        <div style="font-size: 0.9rem; color: #e5e7eb; font-weight: 500;">Thương hiệu: ${vga.brand}</div>
                    </td>
                    <td style="padding: 1rem; text-align: center; color: #ef4444; font-weight: bold;">Chiếc</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #059669;">1</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #dc2626;">${formatPrice(vga.price)}</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #059669;">${formatPrice(vga.price)}</td>
                    <td style="padding: 1rem; text-align: center; color: #84cc16; font-weight: bold;">36 tháng</td>
                    <td style="padding: 1rem; text-align: center; color: #10b981; font-weight: bold;">NEW</td>
                </tr>`;
        }
    }

    if (currentConfig.case) {
        const caseItem = window.caseData[currentConfig.case] || Object.values(window.caseData).find(item => item.name === currentConfig.case);
        if (caseItem) {
            tableHTML += `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #dc2626;">${stt++}</td>
                    <td style="padding: 1rem; text-align: center;"><img src="${caseItem.image}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 0.5rem; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/></td>
                    <td style="padding: 1rem; text-align: left; font-weight: 500;">
                        <div style="font-weight: bold; color: #ffffff; margin-bottom: 0.25rem; font-size: 1.1rem;">Case</div>
                        <div style="color: #ffffff; font-size: 1rem; font-weight: 600;">${caseItem.name}</div>
                        <div style="font-size: 0.9rem; color: #e5e7eb; font-weight: 500;">Thương hiệu: ${caseItem.brand}</div>
                    </td>
                    <td style="padding: 1rem; text-align: center; color: #ef4444; font-weight: bold;">Chiếc</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #059669;">1</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #dc2626;">${formatPrice(caseItem.price)}</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #059669;">${formatPrice(caseItem.price)}</td>
                    <td style="padding: 1rem; text-align: center; color: #84cc16; font-weight: bold;">12 tháng</td>
                    <td style="padding: 1rem; text-align: center; color: #10b981; font-weight: bold;">NEW</td>
                </tr>`;
        }
    }

    if (currentConfig.cpuCooler) {
        const cooler = window.cpuCoolerData[currentConfig.cpuCooler] || Object.values(window.cpuCoolerData).find(item => item.name === currentConfig.cpuCooler);
        if (cooler) {
            tableHTML += `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #dc2626;">${stt++}</td>
                    <td style="padding: 1rem; text-align: center;"><img src="${cooler.image}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 0.5rem; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/></td>
                    <td style="padding: 1rem; text-align: left; font-weight: 500;">
                        <div style="font-weight: bold; color: #ffffff; margin-bottom: 0.25rem; font-size: 1.1rem;">Tản Nhiệt CPU</div>
                        <div style="color: #ffffff; font-size: 1rem; font-weight: 600;">${cooler.name}</div>
                        <div style="font-size: 0.9rem; color: #e5e7eb; font-weight: 500;">Thương hiệu: ${cooler.brand}</div>
                    </td>
                    <td style="padding: 1rem; text-align: center; color: #ef4444; font-weight: bold;">Chiếc</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #059669;">1</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #dc2626;">${formatPrice(cooler.price)}</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #059669;">${formatPrice(cooler.price)}</td>
                    <td style="padding: 1rem; text-align: center; color: #84cc16; font-weight: bold;">12 tháng</td>
                    <td style="padding: 1rem; text-align: center; color: #10b981; font-weight: bold;">NEW</td>
                </tr>`;
        }
    }

    if (currentConfig.psu) {
        const psu = window.psuData[currentConfig.psu] || Object.values(window.psuData).find(item => item.name === currentConfig.psu);
        if (psu) {
            tableHTML += `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #dc2626;">${stt++}</td>
                    <td style="padding: 1rem; text-align: center;"><img src="${psu.image}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 0.5rem; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/></td>
                    <td style="padding: 1rem; text-align: left; font-weight: 500;">
                        <div style="font-weight: bold; color: #ffffff; margin-bottom: 0.25rem; font-size: 1.1rem;">Nguồn</div>
                        <div style="color: #ffffff; font-size: 1rem; font-weight: 600;">${psu.name}</div>
                        <div style="font-size: 0.9rem; color: #e5e7eb; font-weight: 500;">Thương hiệu: ${psu.brand}</div>
                    </td>
                    <td style="padding: 1rem; text-align: center; color: #ef4444; font-weight: bold;">Chiếc</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #059669;">1</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #dc2626;">${formatPrice(psu.price)}</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #059669;">${formatPrice(psu.price)}</td>
                    <td style="padding: 1rem; text-align: center; color: #84cc16; font-weight: bold;">30 tháng</td>
                    <td style="padding: 1rem; text-align: center; color: #10b981; font-weight: bold;">NEW</td>
                </tr>`;
        }
    }

    if (currentConfig.hdd) {
        const hdd = window.hddData[currentConfig.hdd] || Object.values(window.hddData).find(item => item.name === currentConfig.hdd);
        if (hdd) {
            tableHTML += `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #dc2626;">${stt++}</td>
                    <td style="padding: 1rem; text-align: center;"><img src="${hdd.image}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 0.5rem; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/></td>
                    <td style="padding: 1rem; text-align: left; font-weight: 500;">
                        <div style="font-weight: bold; color: #ffffff; margin-bottom: 0.25rem; font-size: 1.1rem;">HDD</div>
                        <div style="color: #ffffff; font-size: 1rem; font-weight: 600;">${hdd.name}</div>
                        <div style="font-size: 0.9rem; color: #e5e7eb; font-weight: 500;">Thương hiệu: ${hdd.brand}</div>
                    </td>
                    <td style="padding: 1rem; text-align: center; color: #ef4444; font-weight: bold;">Chiếc</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #059669;">1</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #dc2626;">${formatPrice(hdd.price)}</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #059669;">${formatPrice(hdd.price)}</td>
                    <td style="padding: 1rem; text-align: center; color: #84cc16; font-weight: bold;">36 tháng</td>
                    <td style="padding: 1rem; text-align: center; color: #10b981; font-weight: bold;">NEW</td>
                </tr>`;
        }
    }

    if (currentConfig.monitor) {
        const monitor = window.monitorData[currentConfig.monitor] || Object.values(window.monitorData).find(item => item.name === currentConfig.monitor);
        if (monitor) {
            tableHTML += `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #dc2626;">${stt++}</td>
                    <td style="padding: 1rem; text-align: center;"><img src="${monitor.image}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 0.5rem; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/></td>
                    <td style="padding: 1rem; text-align: left; font-weight: 500;">
                        <div style="font-weight: bold; color: #ffffff; margin-bottom: 0.25rem; font-size: 1.1rem;">Monitor</div>
                        <div style="color: #ffffff; font-size: 1rem; font-weight: 600;">${monitor.name}</div>
                        <div style="font-size: 0.9rem; color: #e5e7eb; font-weight: 500;">Thương hiệu: ${monitor.brand}</div>
                    </td>
                    <td style="padding: 1rem; text-align: center; color: #ef4444; font-weight: bold;">Chiếc</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #059669;">1</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #dc2626;">${formatPrice(monitor.price)}</td>
                    <td style="padding: 1rem; text-align: center; font-weight: bold; color: #059669;">${formatPrice(monitor.price)}</td>
                    <td style="padding: 1rem; text-align: center; color: #84cc16; font-weight: bold;">36 tháng</td>
                    <td style="padding: 1rem; text-align: center; color: #10b981; font-weight: bold;">NEW</td>
                </tr>`;
        }
    }

    // Dòng tổng cộng - QUAN TRỌNG
    tableHTML += `
            <tr id="total-row" class="total-row-display" style="background: linear-gradient(135deg, #059669, #10b981); color: white; font-weight: bold; border: 3px solid #047857;">
                <td colspan="6" style="padding: 1.5rem; text-align: center; font-size: 1.2rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 900;">TỔNG CỘNG</td>
                <td style="padding: 1.5rem; text-align: center; font-size: 1.3rem; font-weight: 900; color: #fbbf24;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        <span>${new Intl.NumberFormat('vi-VN').format(total)}</span>
                        <span style="font-size: 1.1rem;">VNĐ</span>
                    </div>
                </td>
                <td colspan="2" style="padding: 1.5rem; text-align: center; font-size: 0.9rem; color: #fbbf24; font-weight: bold;">HOÀN THIỆN</td>
        </tr>
        </tbody>
    </table>`;

    document.getElementById('final-config-table').innerHTML = tableHTML;
    
    // Thêm phần liên hệ sau component selector
    addContactSectionAfterComponents();
}

function addContactSectionAfterComponents() {
    const componentSelector = document.querySelector('.component-selector');
    if (!componentSelector) return;
    
    // Xóa contact section cũ nếu có
    const existingContact = document.querySelector('.contact-section-bottom');
    if (existingContact) {
        existingContact.remove();
    }
    
    const contactHTML = `
    <div class="contact-section-bottom" style="background: linear-gradient(135deg, #4facfe, #00f2fe); border-radius: 1rem; padding: 1rem; margin-top: 2rem; box-shadow: 0 10px 25px rgba(79, 172, 254, 0.3);">
        <div style="text-align: center; margin-bottom: 0.75rem; font-weight: bold; color: white; font-size: 1rem;">📞 Liên Hệ Trường Phát Computer Hòa Bình</div>
        <div class="contact-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem; margin-bottom: 0.75rem;">
            <div class="contact-item" style="padding: 0.5rem; border: 1px solid rgba(255,255,255,0.3); border-radius: 0.5rem; text-align: center; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
                <a href="tel:0836768597" style="text-decoration: none; color: white;">
                    <strong style="display: block; font-size: 0.8rem;">📱 Hotline</strong>
                    <span style="font-size: 0.8rem;">0836.768.597</span>
                </a>
            </div>
            <div class="contact-item" style="padding: 0.5rem; border: 1px solid rgba(255,255,255,0.3); border-radius: 0.5rem; text-align: center; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
                <a href="https://zalo.me/0836768597" target="_blank" style="text-decoration: none; color: white;">
                    <strong style="display: block; font-size: 0.8rem;">💬 Zalo</strong>
                    <span style="font-size: 0.8rem;">0836.768.597</span>
                </a>
            </div>
            <div class="contact-item" style="padding: 0.5rem; border: 1px solid rgba(255,255,255,0.3); border-radius: 0.5rem; text-align: center; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
                <a href="https://facebook.com/truongphatcomputer" target="_blank" style="text-decoration: none; color: white;">
                    <strong style="display: block; font-size: 0.8rem;">📘 Facebook</strong>
                    <span style="font-size: 0.8rem;">Trường Phát Computer Hòa Bình</span>
                </a>
        </div>
            <div class="contact-item" style="padding: 0.5rem; border: 1px solid rgba(255,255,255,0.3); border-radius: 0.5rem; text-align: center; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
                <a href="https://m.me/truongphatcomputer" target="_blank" style="text-decoration: none; color: white;">
                    <strong style="display: block; font-size: 0.8rem;">💬 Messenger</strong>
                    <span style="font-size: 0.8rem;">Chat trực tiếp</span>
                </a>
            </div>
        </div>
        <div style="text-align: center; font-size: 0.8rem; color: rgba(255,255,255,0.9); font-weight: 500;">
            🎯 ${selectedCPU?.toUpperCase()} | 🎮 ${games.find(g => g.id === selectedGame)?.name} | 💰 ${selectedBudget}M VNĐ - Cam kết chất lượng
        </div>
    </div>`;
    
    componentSelector.insertAdjacentHTML('afterend', contactHTML);
}

function getComponentData(type, id) {
    const dataMap = {
        cpu: window.cpuData,
        mainboard: window.mainboardData,
        vga: window.vgaData,
        ram: window.ramData,
        ssd: window.ssdData,
        psu: window.psuData,
        case: window.caseData,
        cpuCooler: window.cpuCoolerData,
        hdd: window.hddData,
        monitor: window.monitorData
    };
    
    const data = dataMap[type];
    if (data && data[id]) {
        return data[id];
    }
    
    // Try to find by name if direct ID lookup fails
    if (data) {
        const foundByName = Object.values(data).find(item => 
            item.name === id || 
            item.name.toLowerCase().includes(id.toLowerCase()) ||
            id.toLowerCase().includes(item.name.toLowerCase())
        );
        if (foundByName) {
            return foundByName;
        }
    }
    
    // Fallback with proper name formatting
    const fallbackName = id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const fallbackImage = type === 'cpuCooler' ? 'images/components/cooler.jpg' : `images/components/${type}.jpg`;
    
    return {
        name: fallbackName,
        price: 1000000,
        image: fallbackImage,
        brand: 'Generic',
        warranty: '12T',
        condition: 'NEW'
    };
}

// Function lưu ảnh HD - đảm bảo có đầy đủ tổng cộng và contact info
function saveImageHD() {
    const element = document.getElementById('final-config-table');
    if (!element) {
        alert('❌ Không tìm thấy cấu hình để lưu!');
        return;
    }

    // Ẩn buttons và hiển thị contact info
    const actionButtons = element.querySelectorAll('button');
    const originalButtonsHTML = [];
    
    actionButtons.forEach((btn, index) => {
        originalButtonsHTML[index] = btn.outerHTML;
        btn.style.display = 'none';
    });
    
    // Đảm bảo tổng cộng có class đúng và nổi bật
    const totalRows = element.querySelectorAll('tr[style*="background: linear-gradient(135deg, #059669, #10b981)"], .total-row-display');
    totalRows.forEach(row => {
        row.classList.add('total-row-display');
        row.style.cssText = 'background: linear-gradient(135deg, #059669, #10b981) !important; color: white !important; font-weight: bold; border: 3px solid #047857 !important;';
    });
    
    // Thêm contact info ngay dưới bảng tổng cộng
    const table = element.querySelector('table');
    if (table) {
        const contactInfo = document.createElement('div');
        contactInfo.className = 'temp-contact-info';
        
        // Lấy thông tin game và CPU để hiển thị
        const currentGame = games.find(g => g.id === selectedGame);
        const gameName = currentGame ? currentGame.name : 'Chơi Game';
        const cpuType = selectedCPU ? selectedCPU.toUpperCase() : 'AMD/Intel';
        const budget = selectedBudget ? selectedBudget : '15';
        
        contactInfo.innerHTML = `
            <div style="margin-top: 1rem; padding: 1.5rem; background: linear-gradient(135deg, #4facfe, #00f2fe); border-radius: 1rem; box-shadow: 0 10px 25px rgba(79, 172, 254, 0.3);">
                <div style="text-align: center; margin-bottom: 1rem; font-weight: bold; color: white; font-size: 1.2rem;">📞 Liên Hệ Trường Phát Computer Hòa Bình</div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
                    <div style="text-align: center; color: white; padding: 0.75rem; background: rgba(255,255,255,0.15); border-radius: 0.75rem; border: 2px solid rgba(255,255,255,0.2);">
                        <strong style="display: block; font-size: 1.1rem; margin-bottom: 0.5rem;">📱 Hotline</strong>
                        <span style="font-size: 1.05rem; font-weight: 700;">0836.768.597</span>
                    </div>
                    <div style="text-align: center; color: white; padding: 0.75rem; background: rgba(255,255,255,0.15); border-radius: 0.75rem; border: 2px solid rgba(255,255,255,0.2);">
                        <strong style="display: block; font-size: 1.1rem; margin-bottom: 0.5rem;">💬 Zalo</strong>
                        <span style="font-size: 1.05rem; font-weight: 700;">0836.768.597</span>
                    </div>
                    <div style="text-align: center; color: white; padding: 0.75rem; background: rgba(255,255,255,0.15); border-radius: 0.75rem; border: 2px solid rgba(255,255,255,0.2);">
                        <strong style="display: block; font-size: 1.1rem; margin-bottom: 0.5rem;">📘 Facebook</strong>
                        <span style="font-size: 1.05rem; font-weight: 700;">Trường Phát Computer Hòa Bình</span>
                    </div>
                    <div style="text-align: center; color: white; padding: 0.75rem; background: rgba(255,255,255,0.15); border-radius: 0.75rem; border: 2px solid rgba(255,255,255,0.2);">
                        <strong style="display: block; font-size: 1.1rem; margin-bottom: 0.5rem;">💬 Messenger</strong>
                        <span style="font-size: 1.05rem; font-weight: 700;">Chat trực tiếp</span>
                    </div>
                </div>
                <div style="text-align: center; padding: 1rem; background: rgba(255,255,255,0.2); border-radius: 0.75rem; border: 2px solid rgba(255,255,255,0.25);">
                    <div style="font-size: 1.15rem; color: white; font-weight: 700; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
                        🎯 ${cpuType} | 🎮 ${gameName} | 💰 ${budget}M VNĐ - Cam kết chất lượng
                    </div>
                </div>
            </div>
        `;
        table.parentNode.insertBefore(contactInfo, table.nextSibling);
    }

    // Đợi một chút để DOM update
    setTimeout(() => {
        // Tạo ảnh với độ phân giải FHD 1920x1080
        html2canvas(element, {
            scale: 1.5, // Tỷ lệ để đạt chất lượng FHD
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 1920,
            height: 1080,
            timeout: 10000
        }).then(canvas => {
            // Tạo link download
            const link = document.createElement('a');
            link.download = `Cau-Hinh-PC-TruongPhat-${new Date().toISOString().slice(0,10)}.png`;
            link.href = canvas.toDataURL('image/png', 0.9);
            link.click();

            // Restore original buttons
            actionButtons.forEach((btn, index) => {
                btn.style.display = '';
            });
            
            // Xóa contact info tạm thời
            const tempContact = element.querySelector('.temp-contact-info');
            if (tempContact) {
                tempContact.remove();
            }
        }).catch(error => {
            console.error('Lỗi tạo ảnh:', error);
            alert('❌ Có lỗi khi tạo ảnh! Vui lòng thử lại.');
            
            // Restore original buttons on error
            actionButtons.forEach((btn, index) => {
                btn.style.display = '';
            });
            
            // Xóa contact info tạm thời
            const tempContact = element.querySelector('.temp-contact-info');
            if (tempContact) {
                tempContact.remove();
            }
        });
    }, 200);
}

// CSS cho trang chính - header bảng màu sắc tương phản đẹp
const mainPageStyles = `
    <style>
        /* Header bảng với màu tương phản tốt */
        .config-table th {
            background: linear-gradient(135deg, #7c3aed, #a855f7) !important;
            color: #ffffff !important;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: 2px solid #5b21b6 !important;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            padding: 1rem;
            font-size: 0.75rem;
        }
        
        .config-table th:nth-child(1) { background: linear-gradient(135deg, #dc2626, #ef4444) !important; } /* STT - Đỏ */
        .config-table th:nth-child(2) { background: linear-gradient(135deg, #059669, #10b981) !important; } /* HÌNH ẢNH - Xanh lá */
        .config-table th:nth-child(3) { background: linear-gradient(135deg, #1d4ed8, #3b82f6) !important; } /* TÊN - Xanh dương */
        .config-table th:nth-child(4) { background: linear-gradient(135deg, #9333ea, #a855f7) !important; } /* ĐVT - Tím */
        .config-table th:nth-child(5) { background: linear-gradient(135deg, #ea580c, #f97316) !important; } /* SỐ LƯỢNG - Cam */
        .config-table th:nth-child(6) { background: linear-gradient(135deg, #be185d, #ec4899) !important; } /* ĐƠN GIÁ - Hồng */
        .config-table th:nth-child(7) { background: linear-gradient(135deg, #0891b2, #06b6d4) !important; } /* THÀNH TIỀN - Cyan */
        .config-table th:nth-child(8) { background: linear-gradient(135deg, #65a30d, #84cc16) !important; } /* BẢO HÀNH - Lime */
        .config-table th:nth-child(9) { background: linear-gradient(135deg, #4338ca, #6366f1) !important; } /* GHI CHÚ - Indigo */
        
        .config-table td {
            padding: 1rem;
            font-size: 1rem;
            vertical-align: middle;
        }
        
        .config-table img {
            width: 45px; 
            height: 45px; 
            object-fit: cover; 
            border-radius: 0.5rem; 
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        /* Tổng cộng nổi bật */
        .total-row-display {
            background: linear-gradient(135deg, #059669, #10b981) !important;
            color: white !important;
            font-weight: bold;
            border: 3px solid #047857 !important;
        }
        
        .total-row-display td {
            color: white !important;
            font-size: 1.2rem;
            font-weight: 900;
            padding: 1.5rem !important;
        }
    </style>
`;

// CSS cho in cấu hình - đẹp và chuyên nghiệp
const printStyles = `
    <style>
        @page {
            size: A4 portrait;
            margin: 8mm;
        }
        
        body { 
            margin: 0; 
            padding: 0; 
            font-family: 'Times New Roman', Times, serif;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
        }
        
        .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 10px;
        }
        
        .company-name {
            font-size: 18px;
            font-weight: bold;
            margin: 0;
            color: #1e40af;
        }
        
        .company-address {
            font-size: 12px;
            margin: 5px 0;
            color: #374151;
        }
        
        .document-title {
            font-size: 16px;
            font-weight: bold;
            margin: 10px 0 5px 0;
            color: #dc2626;
            text-transform: uppercase;
        }
        
        .date-info {
            font-size: 11px;
            margin: 5px 0;
            color: #6b7280;
        }
        
        .customer-info {
            margin: 15px 0;
            font-size: 12px;
            line-height: 1.6;
        }
        
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 15px;
            font-size: 11px;
        }
        
        th, td { 
            border: 1px solid #374151; 
            padding: 8px 4px; 
            text-align: center;
            vertical-align: middle;
        }
        
        th { 
            background: #f3f4f6;
            color: #222;
            font-weight: bold; 
            font-size: 10px;
            text-transform: uppercase;
        }
        
        td:nth-child(3) { 
            text-align: left; 
            font-size: 10px;
            padding-left: 6px;
        }
        
        img { 
            max-width: 35px; 
            max-height: 35px; 
            object-fit: cover;
            border-radius: 4px;
        }
        
        /* Tổng cộng nổi bật */
        .total-row {
            background: #f59e0b !important;
            color: white !important;
            font-weight: bold;
            font-size: 12px;
            border: 2px solid #d97706 !important;
        }
        
        .total-row td {
            font-size: 12px !important;
            font-weight: bold !important;
            padding: 12px 4px !important;
        }
        
        .warranty-note {
            margin-top: 15px;
            font-size: 10px;
            color: #000;
            line-height: 1.4;
        }
        
        .bank-info {
            font-size: 11px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
        }
        
        .footer-info {
            margin-top: 20px;
            font-size: 11px;
            text-align: center;
            border-top: 1px solid #374151;
            padding-top: 15px;
        }
        
        @media print { 
            body { margin: 0; }
            * { 
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
        }
    </style>
`;

// Function in cấu hình - Phiếu xuất bán hàng A4 đầy đủ thông tin
function printConfiguration() {
    const configContent = document.getElementById('final-config-table');
    if (!configContent) {
        alert('❌ Không tìm thấy nội dung cấu hình!');
        return;
    }
    
    // Tạo bản sao và xóa các phần không cần thiết cho in
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = configContent.innerHTML;
    
    // Xóa header "TRƯỜNG PHÁT COMPUTER XIN GỬI..."
    const headerElements = tempDiv.querySelectorAll('h1, .header-title, [style*="TRƯỜNG PHÁT COMPUTER XIN GỬI"]');
    headerElements.forEach(el => el.remove());
    
    // Xóa các nút "Lưu Ảnh HD", "In Cấu Hình"
    const buttons = tempDiv.querySelectorAll('button, .action-buttons, [onclick*="save"], [onclick*="print"]');
    buttons.forEach(el => el.remove());
    
    // Xóa phần liên hệ và footer trong bản in
    const contactSections = tempDiv.querySelectorAll('.contact-section, .contact-grid, .footer, [style*="Liên Hệ"], [style*="AMD Build"], [style*="PUBG"], .temp-contact-info, .contact-section-bottom');
    contactSections.forEach(el => el.remove());
    
    // Đảm bảo tổng cộng có class đúng
    const totalRows = tempDiv.querySelectorAll('tr[style*="background: linear-gradient(135deg, #059669, #10b981)"], .total-row-display');
    totalRows.forEach(row => {
        row.className = 'total-row';
    });
    
    const printWindow = window.open('', '_blank');
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Phiếu Xuất Bán Hàng - Trường Phát Computer</title>
            <meta charset="UTF-8">
            ${printStyles}
        </head>
        <body>
            <div class="header">
                <div class="company-name">TRƯỜNG PHÁT COMPUTER HÒA BÌNH</div>
                <div class="company-address">Số 399 Trần Hưng Đạo - Phường Lam - TP Hòa Bình</div>
                <div class="company-address">SĐT: 083 676 8597</div>
                <div class="document-title">PHIẾU XUẤT BÁN HÀNG KIÊM BẢO HÀNH</div>
                <div class="date-info">Hòa Bình, Ngày ${new Date().getDate()} Tháng ${new Date().getMonth() + 1} Năm ${new Date().getFullYear()}</div>
            </div>
            
            <div class="customer-info">
                <strong>Tên khách hàng:</strong> _____________________ <strong>SĐT:</strong> _____________<br>
                <strong>Địa chỉ:</strong> ________________________________________________<br>
                <strong>Lý do xuất kho:</strong> Bán hàng
            </div>
            
            ${tempDiv.innerHTML}
            
            <div class="warranty-note">
                <div class="bank-info">
                    Chú tài khoản: NGUYÊN THÀNH NAM<br>
                    STK: 8990124112002 - Ngân Hàng Quân Đội MB Bank
                </div>
                
                <em><strong>Lưu ý:</strong> Thời gian làm việc + Bảo hành sản phẩm Sáng 8:00-12:00 Chiều 14:00-18:00 (Chủ nhật nghỉ)</em><br>
                
                <strong>Quy chế khuyến mãi:</strong><br>
                • Hết thời gian BH, mất phiếu BH, sản phẩm biến dạng, rạy nước, không tem BH, tem không hợp lệ, mờ<br>
                • Sử dụng người điều khiển ổn định, không đúng quy cách, khách hàng tự ý thay linh kiện, update Bios<br>
                • Sản phẩm bảo quản không tốt, nhiệt độ cao, khí ẩm, oxy hóa, thấm nước, bụi bẩn, sét, nứt gãy
            </div>
            
            <div class="footer-info">
                <div style="display: flex; justify-content: space-between; margin-top: 15px;">
                    <div style="text-align: center;">
                        <strong>BÊN MUA</strong><br>
                        <em>(Ký, họ tên)</em>
                    </div>
                    <div style="text-align: center;">
                        <strong>Hòa Bình, Ngày ${new Date().getDate()} Tháng ${new Date().getMonth() + 1} Năm ${new Date().getFullYear()}</strong><br>
                        <strong>BÊN BÁN</strong><br>
                        <em>(Ký, họ tên)</em>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
        printWindow.print();
    }, 500);
} 