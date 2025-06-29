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

// Function để cập nhật trạng thái clickable của các step
function updateStepStates() {
    const steps = document.querySelectorAll('.step');
    
    steps.forEach((stepEl, index) => {
        const stepNumber = index + 1;
        stepEl.classList.remove('disabled');
        
        // Step 1 luôn clickable
        if (stepNumber === 1) {
            return;
        }
        
        // Step 2 chỉ clickable khi đã chọn budget
        if (stepNumber === 2 && !selectedBudget) {
            stepEl.classList.add('disabled');
            return;
        }
        
        // Step 3 chỉ clickable khi đã chọn budget và CPU
        if (stepNumber === 3 && (!selectedBudget || !selectedCPU)) {
            stepEl.classList.add('disabled');
            return;
        }
        
        // Step 4 chỉ clickable khi đã hoàn thành tất cả
        if (stepNumber === 4 && (!selectedBudget || !selectedCPU || !selectedGame)) {
            stepEl.classList.add('disabled');
            return;
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateBudgetDisplay();
    loadGames();
    updateStepStates();
    console.log('🚀 Trường Phát Computer PC Builder initialized');
    
    // Setup budget slider
    const budgetSlider = document.getElementById('budget-slider');
    if (budgetSlider) {
        budgetSlider.addEventListener('input', function(e) {
            selectedBudget = parseInt(e.target.value);
            updateBudgetDisplay();
            updateStepStates(); // Cập nhật trạng thái step khi thay đổi budget
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
    
    // Update UI with animation
    document.querySelectorAll('.cpu-option').forEach(option => {
        option.classList.remove('selected');
        option.style.transform = 'scale(1)';
    });
    const selectedOption = document.querySelector(`[data-cpu="${cpu}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
        // Add selection animation
        selectedOption.style.transform = 'scale(1.05)';
        setTimeout(() => {
            selectedOption.style.transform = 'scale(1)';
        }, 200);
    }
    
    updateStepStates(); // Cập nhật trạng thái step khi chọn CPU
    console.log(`✅ CPU selected: ${cpu}`);
    
    // Success particle effect
    if (window.particlesJS) {
        // Add burst effect
        setTimeout(() => {
            showSuccessMessage(`Đã chọn ${cpu.toUpperCase()}! 🎉`);
        }, 300);
    }
}

function loadGames() {
    const gameGrid = document.getElementById('game-grid');
    if (!gameGrid) return;
    
    // Show loading skeleton first
    gameGrid.innerHTML = games.map((game, index) => `
        <div class="game-option skeleton" data-game="${game.id}" style="animation-delay: ${index * 100}ms">
            <div class="game-image skeleton"></div>
            <div class="game-name skeleton"></div>
        </div>
    `).join('');
    
    // Load actual content with animation
    setTimeout(() => {
        gameGrid.innerHTML = games.map((game, index) => `
            <div class="game-option glow" data-game="${game.id}" onclick="selectGame('${game.id}')" 
                 data-tilt data-aos="zoom-in" data-aos-delay="${index * 50}">
                <img src="${game.image}" alt="${game.name}" class="game-image" 
                     onerror="this.src='images/components/default.jpg'">
                <div class="game-name">${game.name}</div>
            </div>
        `).join('');
        
        // Re-initialize tilt effect for new elements
        VanillaTilt.init(gameGrid.querySelectorAll("[data-tilt]"), {
            max: 10,
            speed: 400,
            glare: true,
            "max-glare": 0.1,
        });
        
        // Re-initialize AOS for new elements
        AOS.refresh();
    }, 800);
}

function selectGame(gameId) {
    selectedGame = gameId;
    
    // Update UI with animation
    document.querySelectorAll('.game-option').forEach(option => {
        option.classList.remove('selected');
        option.style.transform = 'scale(1)';
    });
    const selectedOption = document.querySelector(`[data-game="${gameId}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
        // Add selection animation
        selectedOption.style.transform = 'scale(1.1)';
        setTimeout(() => {
            selectedOption.style.transform = 'scale(1)';
        }, 200);
    }
    
    updateStepStates(); // Cập nhật trạng thái step khi chọn game
    const gameName = games.find(g => g.id === gameId)?.name || gameId;
    console.log(`✅ Game selected: ${gameName}`);
    
    // Success effect
    setTimeout(() => {
        showSuccessMessage(`Đã chọn ${gameName}! 🎮`);
    }, 300);
}

function nextStep() {
    if (currentStep === 2 && !selectedCPU) {
        showErrorMessage('Vui lòng chọn loại CPU!');
        return;
    }
    
    if (currentStep === 3 && !selectedGame) {
        showErrorMessage('Vui lòng chọn game!');
        return;
    }
    
    if (currentStep === 3) {
        if (typeof safeNProgress !== 'undefined') {
            safeNProgress.start();
        }
        generateConfiguration();
        loadComponentSelectors();
        displayFinalConfiguration();
        setTimeout(() => {
            if (typeof safeNProgress !== 'undefined') {
                safeNProgress.done();
            }
            // Special completion message with confetti effect
            Swal.fire({
                title: '🎉 Hoàn Thành!',
                html: `
                    <div style="text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">🖥️✨</div>
                        <p style="font-size: 1.2rem; margin-bottom: 1rem;">Cấu hình máy tính đã được tạo thành công!</p>
                        <p style="color: #4facfe;">Bạn có thể tùy chỉnh thêm các linh kiện bên dưới</p>
                    </div>
                `,
                icon: 'success',
                background: '#1e293b',
                color: '#f8fafc',
                confirmButtonColor: '#4facfe',
                confirmButtonText: 'Tuyệt vời! 🚀',
                timer: 3000,
                timerProgressBar: true,
                showClass: {
                    popup: 'animate__animated animate__bounceIn'
                },
                hideClass: {
                    popup: 'animate__animated animate__bounceOut'
                }
            });
            
            // Add particle burst effect
            if (window.particlesJS) {
                // Temporarily increase particle count for celebration
                const originalParticleCount = 80;
                particlesJS('particles-js', {
                    particles: {
                        number: { value: 150, density: { enable: true, value_area: 800 }},
                        color: { value: ['#4facfe', '#00f2fe', '#22c55e', '#f59e0b'] },
                        shape: { type: ['circle', 'star'] },
                        opacity: { value: 0.8, random: true },
                        size: { value: 5, random: true },
                        move: {
                            enable: true,
                            speed: 6,
                            direction: 'none',
                            random: true,
                            straight: false,
                            out_mode: 'out',
                            bounce: true
                        }
                    }
                });
                
                // Reset particles after 3 seconds
                setTimeout(() => {
                    particlesJS('particles-js', {
                        particles: {
                            number: { value: originalParticleCount, density: { enable: true, value_area: 800 }},
                            color: { value: '#4facfe' },
                            shape: { type: 'circle' },
                            opacity: { value: 0.5, random: false },
                            size: { value: 3, random: true },
                            move: {
                                enable: true,
                                speed: 2,
                                direction: 'none',
                                random: false,
                                straight: false,
                                out_mode: 'out',
                                bounce: false
                            }
                        }
                    });
                }, 3000);
            }
        }, 800);
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
    
    currentStep = step;
    
    // Load games nếu đang ở step 3
    if (step === 3) {
        loadGames();
    }
    
    // Load component selectors nếu đang ở step 4
    if (step === 4) {
        loadComponentSelectors();
    }
}

// Function để navigate đến step cụ thể
function navigateToStep(targetStep) {
    console.log(`🎯 Navigate to step ${targetStep}. Current state: budget=${selectedBudget}, cpu=${selectedCPU}, game=${selectedGame}`);
    
    // Kiểm tra điều kiện để có thể chuyển step
    if (targetStep === 1) {
        // Luôn cho phép quay lại step 1
        console.log('✅ Navigating to step 1');
        showStep(1);
        return;
    }
    
    if (targetStep === 2) {
        // Cho phép đến step 2 nếu đã chọn budget
        if (selectedBudget) {
            console.log('✅ Navigating to step 2');
            showStep(2);
        } else {
            console.log('❌ Cannot navigate to step 2: no budget selected');
            showErrorMessage('⚠️ Vui lòng chọn ngân sách trước!');
        }
        return;
    }
    
    if (targetStep === 3) {
        // Cho phép đến step 3 nếu đã chọn budget và CPU
        if (selectedBudget && selectedCPU) {
            console.log('✅ Navigating to step 3');
            showStep(3);
        } else {
            console.log('❌ Cannot navigate to step 3: missing requirements');
            showErrorMessage('⚠️ Vui lòng hoàn thành bước chọn ngân sách và CPU trước!');
        }
        return;
    }
    
    if (targetStep === 4) {
        // Cho phép đến step 4 nếu đã hoàn thành các bước trước
        if (selectedBudget && selectedCPU && selectedGame) {
            console.log('✅ Navigating to step 4');
            generateConfiguration();
            showStep(4);
        } else {
            console.log('❌ Cannot navigate to step 4: missing requirements');
            showErrorMessage('⚠️ Vui lòng hoàn thành tất cả các bước trước!');
        }
        return;
    }
}

// Make function available globally for inline onclick
window.navigateToStep = navigateToStep;

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
    
    // Không tự động thêm HDD và Monitor - để user tự chọn
    console.log('⚙️ Configuration ready - HDD and Monitor optional');
    
    console.log('🎯 Final config with all components:', currentConfig);
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
            case: "gaming-start-ga3fg",
            cpuCooler: "STOCK",
            psu: "350W"
        } : {
            cpu: "3200g",
            mainboard: "A320",
            vga: "750ti",
            ram: "D38G",
            ssd: "sata-sstc-256",
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
            case: "GA",
            cpuCooler: "2ongdong",
            psu: "DT660"
        } : {
            cpu: "5600",
            mainboard: "B450M-A",
            vga: "1660s",
            ram: "cosair-16",
            ssd: "sstc-256",
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
            case: "GA",
            cpuCooler: "CR1000",
            psu: "VSP750"
        } : {
            cpu: "5700x",
            mainboard: "MSI-B550M",
            vga: "3070",
            ram: "cosair-16",
            ssd: "crucial-500",
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
            case: "GA",
            cpuCooler: "TMR120SE",
            psu: "COSAIR850"
        } : {
            cpu: "7600x",
            mainboard: "B650M-E",
            vga: "4070",
            ram: "cosair-32",
            ssd: "crucial-1tb",
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
    
    // Show loading skeleton first
    componentGrid.innerHTML = components.map((component, index) => `
        <div class="component-card skeleton" style="animation-delay: ${index * 50}ms">
            <div class="skeleton" style="height: 1.5rem; margin-bottom: 1rem; border-radius: 0.5rem;"></div>
            <div class="skeleton" style="height: 2.5rem; border-radius: 0.5rem;"></div>
        </div>
    `).join('');
    
    // Load actual content with animation
    setTimeout(() => {
        componentGrid.innerHTML = components.map((component, index) => {
            const options = getComponentOptions(component);
            const isEnabled = isComponentEnabled(component);
            const statusText = getComponentStatus(component);
            
            return `
                <div class="component-card glow ${!isEnabled ? 'disabled' : ''}" 
                     data-tilt data-aos="fade-up" data-aos-delay="${index * 100}"
                     style="position: relative;">
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
        
        // Re-initialize tilt effect for new elements
        VanillaTilt.init(componentGrid.querySelectorAll("[data-tilt]"), {
            max: 5,
            speed: 400,
            glare: true,
            "max-glare": 0.1,
        });
        
        // Re-initialize AOS for new elements
        AOS.refresh();
    }, 600);
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
    
    // Auto-update display với delay để đảm bảo DOM update
    setTimeout(() => {
        displayFinalConfiguration();
    }, 50);
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
                    <th style="padding: 0.65rem; text-align: center; font-weight: bold; font-size: 0.65rem;">STT</th>
                    <th style="padding: 0.65rem; text-align: center; font-weight: bold; font-size: 0.65rem;">HÌNH ẢNH</th>
                    <th style="padding: 0.65rem; text-align: center; font-weight: bold; font-size: 0.65rem;">TÊN, MÃ, LOẠI LINH KIỆN</th>
                    <th style="padding: 0.65rem; text-align: center; font-weight: bold; font-size: 0.65rem;">ĐVT</th>
                    <th style="padding: 0.65rem; text-align: center; font-weight: bold; font-size: 0.65rem;">SỐ LƯỢNG</th>
                    <th style="padding: 0.65rem; text-align: center; font-weight: bold; font-size: 0.65rem;">ĐƠN GIÁ</th>
                    <th style="padding: 0.65rem; text-align: center; font-weight: bold; font-size: 0.65rem;">THÀNH TIỀN</th>
                    <th style="padding: 0.65rem; text-align: center; font-weight: bold; font-size: 0.65rem;">BẢO HÀNH</th>
                    <th style="padding: 0.65rem; text-align: center; font-weight: bold; font-size: 0.65rem;">GHI CHÚ</th>
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
                    <td style="padding: 1rem; text-align: center; color: #84cc16; font-weight: bold;">${cpu.warranty || '36 tháng'}</td>
                    <td style="padding: 1rem; text-align: center; color: #10b981; font-weight: bold;">${cpu.condition || 'NEW'}</td>
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
                    <td style="padding: 1rem; text-align: center; color: #84cc16; font-weight: bold;">${mainboard.warranty || '36 tháng'}</td>
                    <td style="padding: 1rem; text-align: center; color: #10b981; font-weight: bold;">${mainboard.condition || 'NEW'}</td>
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
                    <td style="padding: 1rem; text-align: center; color: #84cc16; font-weight: bold;">${ram.warranty || '36 tháng'}</td>
                    <td style="padding: 1rem; text-align: center; color: #10b981; font-weight: bold;">${ram.condition || 'NEW'}</td>
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
                    <td style="padding: 1rem; text-align: center; color: #84cc16; font-weight: bold;">${ssd.warranty || '36 tháng'}</td>
                    <td style="padding: 1rem; text-align: center; color: #10b981; font-weight: bold;">${ssd.condition || 'NEW'}</td>
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
                    <td style="padding: 1rem; text-align: center; color: #84cc16; font-weight: bold;">${vga.warranty || '36 tháng'}</td>
                    <td style="padding: 1rem; text-align: center; color: #10b981; font-weight: bold;">${vga.condition || 'NEW'}</td>
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
                    <td style="padding: 1rem; text-align: center; color: #84cc16; font-weight: bold;">${caseItem.warranty || '12 tháng'}</td>
                    <td style="padding: 1rem; text-align: center; color: #10b981; font-weight: bold;">${caseItem.condition || 'NEW'}</td>
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
                    <td style="padding: 1rem; text-align: center; color: #84cc16; font-weight: bold;">${cooler.warranty || '12 tháng'}</td>
                    <td style="padding: 1rem; text-align: center; color: #10b981; font-weight: bold;">${cooler.condition || 'NEW'}</td>
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
                    <td style="padding: 1rem; text-align: center; color: #84cc16; font-weight: bold;">${psu.warranty || '36 tháng'}</td>
                    <td style="padding: 1rem; text-align: center; color: #10b981; font-weight: bold;">${psu.condition || 'NEW'}</td>
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
                    <td style="padding: 1rem; text-align: center; color: #84cc16; font-weight: bold;">${hdd.warranty || '36 tháng'}</td>
                    <td style="padding: 1rem; text-align: center; color: #10b981; font-weight: bold;">${hdd.condition || 'NEW'}</td>
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
                    <td style="padding: 1rem; text-align: center; color: #84cc16; font-weight: bold;">${monitor.warranty || '36 tháng'}</td>
                    <td style="padding: 1rem; text-align: center; color: #10b981; font-weight: bold;">${monitor.condition || 'NEW'}</td>
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
                <td colspan="2" style="padding: 1.5rem; text-align: center; font-size: 0.9rem; color: #fbbf24; font-weight: bold;"></td>
        </tr>
        </tbody>
    </table>`;

    document.getElementById('final-config-table').innerHTML = tableHTML;
    
    // Đảm bảo hiển thị đầy đủ HDD và Monitor ngay sau khi tạo bảng
    setTimeout(() => {
        const table = document.querySelector('#final-config-table table tbody');
        if (table && currentConfig) {
            let hasHDD = false;
            let hasMonitor = false;
            
            // Kiểm tra xem đã có HDD và Monitor chưa
            const rows = table.querySelectorAll('tr:not(#total-row):not(.total-row-display)');
            rows.forEach(row => {
                const text = row.textContent;
                if (text.includes('HDD')) hasHDD = true;
                if (text.includes('Monitor')) hasMonitor = true;
            });
            
            let stt = rows.length + 1;
            
            // Nếu thiếu HDD, thêm vào
            if (!hasHDD && currentConfig.hdd) {
                const hdd = getComponentData('hdd', currentConfig.hdd);
                if (hdd) {
                    const hddRow = document.createElement('tr');
                    hddRow.style.borderBottom = '1px solid #e5e7eb';
                    hddRow.innerHTML = `
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
                        <td style="padding: 1rem; text-align: center; color: #84cc16; font-weight: bold;">${hdd.warranty || '36 tháng'}</td>
                        <td style="padding: 1rem; text-align: center; color: #10b981; font-weight: bold;">${hdd.condition || 'NEW'}</td>
                    `;
                    
                    // Thêm trước dòng tổng cộng
                    const totalRow = table.querySelector('#total-row, .total-row-display');
                    if (totalRow) {
                        table.insertBefore(hddRow, totalRow);
                    } else {
                        table.appendChild(hddRow);
                    }
                }
            }
            
            // Nếu thiếu Monitor, thêm vào
            if (!hasMonitor && currentConfig.monitor) {
                const monitor = getComponentData('monitor', currentConfig.monitor);
                if (monitor) {
                    const monitorRow = document.createElement('tr');
                    monitorRow.style.borderBottom = '1px solid #e5e7eb';
                    monitorRow.innerHTML = `
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
                        <td style="padding: 1rem; text-align: center; color: #84cc16; font-weight: bold;">${monitor.warranty || '36 tháng'}</td>
                        <td style="padding: 1rem; text-align: center; color: #10b981; font-weight: bold;">${monitor.condition || 'NEW'}</td>
                    `;
                    
                    // Thêm trước dòng tổng cộng
                    const totalRow = table.querySelector('#total-row, .total-row-display');
                    if (totalRow) {
                        table.insertBefore(monitorRow, totalRow);
                    } else {
                        table.appendChild(monitorRow);
                    }
                }
            }
            
            // Cập nhật lại tổng cộng
            const updatedTotal = getTotalPrice();
            const totalRows = table.querySelectorAll('#total-row, .total-row-display');
            totalRows.forEach(row => {
                const totalCell = row.querySelector('td:nth-child(7)');
                if (totalCell) {
                    totalCell.innerHTML = `
                        <div style="text-align: center; line-height: 1.2; padding: 0.3rem; background: linear-gradient(135deg, #fbbf24, #f59e0b); border-radius: 0.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <span style="font-size: 1.8rem; font-weight: 900; color: #92400e; text-shadow: 0 1px 2px rgba(255,255,255,0.8);">${new Intl.NumberFormat('vi-VN').format(updatedTotal)}</span><span style="font-size: 1.3rem; font-weight: 700; color: #78350f; margin-left: 0.2rem; text-shadow: 0 1px 2px rgba(255,255,255,0.8);">VNĐ</span>
                        </div>
                    `;
                }
            });
        }
    }, 200);
    
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
                    showErrorMessage('❌ Không tìm thấy cấu hình để lưu!');
        return;
    }

    // Ẩn buttons và header khi save ảnh
    const headerWithButtons = element.querySelector('div[style*="background: linear-gradient(135deg, #dc2626, #b91c1c)"]');
    
    // Tìm và ẩn tất cả các button trong element
    const allButtons = element.querySelectorAll('button');
    const buttonContainers = element.querySelectorAll('div[style*="display: flex; justify-content: center; gap: 1rem"]');
    
    // Ẩn từng button riêng lẻ
    allButtons.forEach(btn => {
        btn.style.display = 'none';
        btn.style.visibility = 'hidden';
        btn.style.opacity = '0';
    });
    
    // Ẩn container chứa buttons
    buttonContainers.forEach(container => {
        container.style.display = 'none';
        container.style.visibility = 'hidden';
    });
    
    // Ẩn cả header có chứa buttons
    if (headerWithButtons) {
        headerWithButtons.style.display = 'none';
    }
    
    // Đảm bảo có đầy đủ tất cả components trong ảnh lưu - refresh toàn bộ
    // Xóa tất cả và tạo lại để đảm bảo đầy đủ
    const tableContainer = element.querySelector('table');
    if (tableContainer && currentConfig) {
        // Force refresh lại toàn bộ bảng với tất cả components
        displayFinalConfiguration();
        
        // Đợi DOM update xong
        setTimeout(() => {
            const updatedTable = element.querySelector('table tbody');
            if (updatedTable) {
                // Đảm bảo có tất cả 10+ components
                let componentCount = 0;
                const rows = updatedTable.querySelectorAll('tr:not(#total-row):not(.total-row-display)');
                componentCount = rows.length;
                
                console.log(`📊 Component count in save image: ${componentCount}`);
                
                // Nếu vẫn thiếu components, thêm thủ công
                if (componentCount < 9) { // Ít nhất 9 components chính
                    const components = ['cpu', 'mainboard', 'ram', 'ssd', 'vga', 'case', 'cpuCooler', 'psu', 'hdd', 'monitor'];
                    let stt = componentCount + 1;
                    
                    components.forEach(compType => {
                        if (currentConfig[compType]) {
                            // Kiểm tra xem component này đã có trong bảng chưa
                            let exists = false;
                            rows.forEach(row => {
                                const text = row.textContent.toLowerCase();
                                if ((compType === 'cpu' && text.includes('cpu')) ||
                                    (compType === 'mainboard' && text.includes('mainboard')) ||
                                    (compType === 'ram' && text.includes('ram')) ||
                                    (compType === 'ssd' && text.includes('ssd')) ||
                                    (compType === 'vga' && text.includes('vga')) ||
                                    (compType === 'case' && text.includes('case')) ||
                                    (compType === 'cpuCooler' && (text.includes('tản nhiệt') || text.includes('cooler'))) ||
                                    (compType === 'psu' && text.includes('nguồn')) ||
                                    (compType === 'hdd' && text.includes('hdd')) ||
                                    (compType === 'monitor' && text.includes('monitor'))) {
                                    exists = true;
                                }
                            });
                            
                            if (!exists) {
                                const compData = getComponentData(compType, currentConfig[compType]);
                                if (compData) {
                                    const newRow = document.createElement('tr');
                                    newRow.style.borderBottom = '1px solid #e5e7eb';
                                    
                                    const displayName = compType === 'cpuCooler' ? 'Tản Nhiệt CPU' : 
                                                      compType === 'psu' ? 'Nguồn' :
                                                      compType === 'mainboard' ? 'Mainboard' :
                                                      compType.toUpperCase();
                                    
                                    newRow.innerHTML = `
                                        <td style="padding: 1rem; text-align: center; font-weight: bold; color: #dc2626;">${stt++}</td>
                                        <td style="padding: 1rem; text-align: center;"><img src="${compData.image}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 0.5rem; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/></td>
                                        <td style="padding: 1rem; text-align: left; font-weight: 500;">
                                                                     <div style="font-weight: bold; color: #ffffff; margin-bottom: 0.25rem; font-size: 1.1rem;">${displayName}</div>
                         <div style="color: #ffffff; font-size: 1rem; font-weight: 600;">${compData.name}</div>
                         <div style="font-size: 0.9rem; color: #e5e7eb; font-weight: 500;">Thương hiệu: ${compData.brand}</div>
                                        </td>
                                        <td style="padding: 1rem; text-align: center; color: #ef4444; font-weight: bold;">Chiếc</td>
                                        <td style="padding: 1rem; text-align: center; font-weight: bold; color: #059669;">1</td>
                                        <td style="padding: 1rem; text-align: center; font-weight: bold; color: #dc2626;">${formatPrice(compData.price)}</td>
                                        <td style="padding: 1rem; text-align: center; font-weight: bold; color: #059669;">${formatPrice(compData.price)}</td>
                                        <td style="padding: 1rem; text-align: center; color: #84cc16; font-weight: bold;">${compData.warranty || '36 tháng'}</td>
                                        <td style="padding: 1rem; text-align: center; color: #10b981; font-weight: bold;">${compData.condition || 'NEW'}</td>
                                    `;
                                    
                                    // Thêm trước dòng tổng cộng
                                    const totalRow = updatedTable.querySelector('#total-row, .total-row-display');
                                    if (totalRow) {
                                        updatedTable.insertBefore(newRow, totalRow);
                                    } else {
                                        updatedTable.appendChild(newRow);
                                    }
                                }
                            }
                        }
                    });
                                 }
             }
         }, 300);
    }
    
    // Cập nhật lại tổng cộng sau khi thêm HDD/Monitor
    const updatedTotal = getTotalPrice();
    const totalRows = element.querySelectorAll('tr[style*="background: linear-gradient(135deg, #059669, #10b981)"], .total-row-display');
    totalRows.forEach(row => {
        row.classList.add('total-row-display');
        row.style.cssText = 'background: linear-gradient(135deg, #059669, #10b981) !important; color: white !important; font-weight: bold; border: 3px solid #047857 !important;';
        
        // Cập nhật giá tổng cộng
        const totalCell = row.querySelector('td:nth-child(7)');
        if (totalCell) {
            totalCell.innerHTML = `
                <div style="text-align: center; line-height: 1.2; padding: 0.3rem; background: linear-gradient(135deg, #fbbf24, #f59e0b); border-radius: 0.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <span style="font-size: 1.8rem; font-weight: 900; color: #92400e; text-shadow: 0 1px 2px rgba(255,255,255,0.8);">${new Intl.NumberFormat('vi-VN').format(updatedTotal)}</span><span style="font-size: 1.3rem; font-weight: 700; color: #78350f; margin-left: 0.2rem; text-shadow: 0 1px 2px rgba(255,255,255,0.8);">VNĐ</span>
                </div>
            `;
        }
    });
    
    // Thêm contact info ngay dưới bảng tổng cộng
    const tableElement = element.querySelector('table');
    if (tableElement) {
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
        tableElement.parentNode.insertBefore(contactInfo, tableElement.nextSibling);
    }

    // Đợi lâu hơn để DOM update hoàn toàn
    setTimeout(() => {
        // Scroll lên đầu để capture toàn bộ
        element.scrollTop = 0;
        
        // Tính toán kích thước thực tế của element
        const rect = element.getBoundingClientRect();
        const actualHeight = element.scrollHeight;
        const actualWidth = element.scrollWidth;
        
        // Tạo ảnh với kích thước phù hợp để capture toàn bộ nội dung
        html2canvas(element, {
            scale: 1.2, // Giảm scale để capture được nhiều nội dung hơn
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: Math.max(actualWidth, 1200), // Đảm bảo đủ rộng
            height: Math.max(actualHeight, 800), // Đảm bảo đủ cao
            scrollX: 0,
            scrollY: 0,
            timeout: 15000
        }).then(canvas => {
            // Tạo link download
            const link = document.createElement('a');
            link.download = `Cau-Hinh-PC-TruongPhat-${new Date().toISOString().slice(0,10)}.png`;
            link.href = canvas.toDataURL('image/png', 0.9);
            link.click();

            // Restore original buttons và header
            allButtons.forEach(btn => {
                btn.style.display = '';
                btn.style.visibility = '';
                btn.style.opacity = '';
            });
            
            // Restore container chứa buttons
            buttonContainers.forEach(container => {
                container.style.display = '';
                container.style.visibility = '';
            });
            
            if (headerWithButtons) {
                headerWithButtons.style.display = '';
            }
            
            // Xóa contact info tạm thời
            const tempContact = element.querySelector('.temp-contact-info');
            if (tempContact) {
                tempContact.remove();
            }
        }).catch(error => {
            console.error('Lỗi tạo ảnh:', error);
            showErrorMessage('❌ Có lỗi khi tạo ảnh! Vui lòng thử lại.');
            
            // Restore original buttons và header on error
            allButtons.forEach(btn => {
                btn.style.display = '';
                btn.style.visibility = '';
                btn.style.opacity = '';
            });
            
            // Restore container chứa buttons on error
            buttonContainers.forEach(container => {
                container.style.display = '';
                container.style.visibility = '';
            });
            
            if (headerWithButtons) {
                headerWithButtons.style.display = '';
            }
            
            // Xóa contact info tạm thời
            const tempContact = element.querySelector('.temp-contact-info');
            if (tempContact) {
                tempContact.remove();
            }
        });
    }, 500); // Tăng thời gian đợi để đảm bảo tất cả components được thêm
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
            border: none !important;
        }
        
        /* Cột thành tiền nổi bật trong main page */
        .total-row-display td:nth-child(7) {
            background: linear-gradient(135deg, #fbbf24, #f59e0b) !important;
            border: none !important;
            padding: 0.8rem !important;
        }
        
        .total-row-display td {
            color: white !important;
            font-size: 1.5rem;
            font-weight: 900;
            padding: 1.2rem !important;
            vertical-align: middle;
            text-align: center;
            border: none !important;
        }
        
        /* Làm nổi bật "TỔNG CỘNG" trong main page */
        .total-row-display td:nth-child(1),
        .total-row-display td:nth-child(2),
        .total-row-display td:nth-child(3) {
            font-size: 1.8rem !important;
        }
        
        /* Làm nổi bật "HOÀN THIỆN" trong main page */
        .total-row-display td:nth-child(8),
        .total-row-display td:nth-child(9) {
            font-size: 1.6rem !important;
        }
    </style>
`;

// CSS cho in cấu hình - đẹp và chuyên nghiệp, vừa 1 trang A4
const printStyles = `
    <style>
        @page {
            size: A4 portrait;
            margin: 10mm;
        }
        
        body { 
            margin: 0; 
            padding: 0; 
            font-family: 'Times New Roman', Times, serif;
            font-size: 7px;
            line-height: 0.9;
            color: #000;
            background: white;
        }
        
        .header {
            text-align: center;
            margin-bottom: 1px;
            border-bottom: 1px solid #2563eb;
            padding-bottom: 0px;
            position: relative;
        }
        
        .date-info {
            position: absolute;
            right: 0;
            bottom: 1px;
            font-size: 10px;
            color: #000;
            font-style: italic;
        }
        
        .company-name {
            font-size: 16px;
            font-weight: bold;
            margin: 0;
            color: #000;
        }
        
        .company-address {
            font-size: 12px;
            margin: 0px 0;
            color: #000;
        }
        
        .document-title {
            font-size: 14px;
            font-weight: bold;
            margin: 1px 0 1px 0;
            color: #000;
            text-transform: uppercase;
        }
        
        .date-info {
            font-size: 15px;
            margin: 0px 0;
            color: #000;
        }
        
        .customer-info {
            margin: 1px 0;
            font-size: 12px;
            line-height: 1.0;
            color: #000;
        }
        
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 0px;
            font-size: 7px;
            table-layout: fixed;
        }
        
        th, td { 
            border: 1px solid #000; 
            padding: 0px 1px; 
            text-align: center;
            vertical-align: middle;
            color: #000;
            height: 10px;
        }
        
        /* Xóa border đen cho các ô trong hàng tổng cộng */
        .total-row th,
        .total-row td,
        .total-row-display th,
        .total-row-display td {
            border: none !important;
        }
        
        th { 
            background: #e5e7eb !important;
            color: #000 !important;
            font-weight: bold; 
            font-size: 5px;
            text-transform: uppercase;
            height: 10px;
            padding: 0px 1px;
        }
        
        /* Cột STT */
        th:nth-child(1), td:nth-child(1) { width: 5%; }
        /* Cột Hình ảnh */
        th:nth-child(2), td:nth-child(2) { width: 8%; }
        /* Cột Tên linh kiện */
        th:nth-child(3), td:nth-child(3) { width: 30%; }
        /* Cột ĐVT */
        th:nth-child(4), td:nth-child(4) { width: 8%; }
        /* Cột Số lượng */
        th:nth-child(5), td:nth-child(5) { width: 8%; }
        /* Cột Đơn giá */
        th:nth-child(6), td:nth-child(6) { width: 12%; }
        /* Cột Thành tiền */
        th:nth-child(7), td:nth-child(7) { width: 12%; }
        /* Cột Bảo hành */
        th:nth-child(8), td:nth-child(8) { width: 7%; }
        /* Cột Ghi chú */
        th:nth-child(9), td:nth-child(9) { width: 10%; }
        
        td:nth-child(3) { 
            text-align: left; 
            font-size: 5px;
            padding: 1px 2px;
            color: #000;
            line-height: 0.9;
            height: 10px;
        }
        
        /* Cân bằng 3 dòng text trong component names */
        td:nth-child(3) div {
            font-size: 13px !important;
            font-weight: bold !important;
            color: #000 !important;
            margin: 0 !important;
            padding: 0 !important;
            line-height: 0.8 !important;
        }
        
        img { 
            max-width: 25px; 
            max-height: 25px; 
            object-fit: cover;
            border-radius: 1px;
        }
        
        /* Tổng cộng nổi bật và cân đối hoàn hảo */
        .total-row {
            background: linear-gradient(135deg, #dcfce7, #bbf7d0) !important;
            color: #000 !important;
            font-weight: 900;
            border: none !important;
            text-align: center;
        }
        
        .total-row td {
            font-size: 8px !important;
            font-weight: 900 !important;
            padding: 3px 2px !important;
            color: #000 !important;
            height: 16px !important;
            text-transform: uppercase;
            text-align: center !important;
            vertical-align: middle !important;
            line-height: 1.0;
            border: none !important;
        }
        
        /* Làm nổi bật cột "TỔNG CỘNG" */
        .total-row td:nth-child(1),
        .total-row td:nth-child(2),
        .total-row td:nth-child(3) {
            font-size: 18px !important;
            font-weight: 900 !important;
            letter-spacing: 0.5px;
        }
        
        /* Làm nổi bật cột "THÀNH TIỀN" - giá tiền */
        .total-row td:nth-child(7) {
            font-size: 14px !important;
            font-weight: 900 !important;
            color: #92400e !important;
            background: linear-gradient(135deg, #fbbf24, #f59e0b) !important;
            border: none !important;
            text-shadow: 0 1px 2px rgba(255,255,255,0.8);
            padding: 8px 6px !important;
            border-radius: 3px;
        }
        
        /* Đảm bảo text trong print in đẹp */
        .total-row td:nth-child(7) div {
            border-radius: 3px !important;
            background: linear-gradient(135deg, #fbbf24, #f59e0b) !important;
            border: none !important;
        }
        
        /* Loại bỏ hoàn toàn mọi border đen trong tổng cộng */
        .total-row *,
        .total-row-display * {
            border: none !important;
        }
        
        /* Các cột khác trong tổng cộng */
        .total-row td:nth-child(4),
        .total-row td:nth-child(5),
        .total-row td:nth-child(6) {
            font-size: 9px !important;
            opacity: 0.8;
        }
        
        /* Cột BẢO HÀNH và GHI CHÚ nổi bật hơn */
        .total-row td:nth-child(8),
        .total-row td:nth-child(9) {
            font-size: 12px !important;
            font-weight: 900 !important;
            opacity: 1;
        }
        
        .warranty-note {
            page-break-before: always;
            margin-top: 20px;
            font-size: 14px;
            color: #000;
            line-height: 1.1;
        }
        
        .bank-info {
            font-size: 14px;
            font-weight: bold;
            color: #000;
            margin-bottom: 1px;
        }
        
        .footer-info {
            margin-top: 30px;
            padding-top: 20px;
            font-size: 14px;
            text-align: center;
            color: #000;
            height: 200px;
        }
        
        /* Đảm bảo warranty-note và footer luôn ở trang mới */
        @media print {
            .warranty-note {
                break-before: page;
                page-break-before: always;
            }
            .footer-info {
                break-before: avoid;
                page-break-before: avoid;
            }
        }
        
        /* Component name styles - tất cả 3 dòng đều to và bold như nhau */
        .component-name {
            color: #000 !important;
            font-weight: bold !important;
            font-size: 5px !important;
        }
        
        .component-brand {
            color: #000 !important;
            font-size: 5px !important;
            font-weight: bold !important;
        }
        
        @media print { 
            body { 
                margin: 0; 
                color: #000 !important;
                background: white !important;
            }
            * { 
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                color: #000 !important;
            }
            table * {
                color: #000 !important;
            }
            .total-row * {
                color: #000 !important;
            }
            
            /* Tắt mặc định headers and footers */
            @page {
                margin: 10mm;
                /* Loại bỏ header và footer mặc định của trình duyệt */
                size: A4 portrait;
            }
            
            /* Tắt background graphics và đảm bảo in sạch */
            html {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            /* Loại bỏ mọi background image khi in */
            * {
                background-image: none !important;
                box-shadow: none !important;
                text-shadow: none !important;
            }
        }
    </style>
`;

// Function in cấu hình - Phiếu xuất bán hàng A4 đầy đủ thông tin
function printConfiguration() {
    const configContent = document.getElementById('final-config-table');
    if (!configContent) {
        showErrorMessage('❌ Không tìm thấy nội dung cấu hình!');
        return;
    }
    
    // Tạo bản sao và xóa các phần không cần thiết cho in
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = configContent.innerHTML;
    
    // Xóa header "TRƯỜNG PHÁT COMPUTER XIN GỬI..." và header đỏ có ngày tháng
    const headerElements = tempDiv.querySelectorAll('h1, .header-title, [style*="TRƯỜNG PHÁT COMPUTER XIN GỬI"], [style*="background: linear-gradient(135deg, #dc2626, #b91c1c)"]');
    headerElements.forEach(el => el.remove());
    
    // Xóa các nút "Lưu Ảnh HD", "In Cấu Hình"
    const buttons = tempDiv.querySelectorAll('button, .action-buttons, [onclick*="save"], [onclick*="print"]');
    buttons.forEach(el => el.remove());
    
    // Xóa phần liên hệ, footer và các phần không cần thiết trong bản in
    const contactSections = tempDiv.querySelectorAll('.contact-section, .contact-grid, .footer, [style*="Liên Hệ"], [style*="AMD Build"], [style*="PUBG"], .temp-contact-info, .contact-section-bottom, [style*="margin-top: 1rem; display: flex; justify-content: center"]');
    contactSections.forEach(el => el.remove());
    
    // Chuyển tất cả chữ màu trắng thành màu đen
    const whiteTextElements = tempDiv.querySelectorAll('*');
    whiteTextElements.forEach(el => {
        const style = el.getAttribute('style') || '';
        if (style.includes('color: #ffffff') || style.includes('color: white') || style.includes('color: #f8fafc') || style.includes('color: #e5e7eb')) {
            el.setAttribute('style', style.replace(/color:\s*(#ffffff|white|#f8fafc|#e5e7eb)/g, 'color: #000'));
        }
        
        // Đặc biệt cho các component names
        if (el.textContent && (el.textContent.includes('CPU') || el.textContent.includes('Mainboard') || el.textContent.includes('RAM') || el.textContent.includes('SSD') || el.textContent.includes('VGA') || el.textContent.includes('HDD') || el.textContent.includes('Monitor') || el.textContent.includes('Case') || el.textContent.includes('Tản Nhiệt') || el.textContent.includes('Nguồn'))) {
            el.className += ' component-name';
        }
    });
    
    // Đảm bảo tổng cộng có class đúng
    const totalRows = tempDiv.querySelectorAll('tr[style*="background: linear-gradient(135deg, #059669, #10b981)"], .total-row-display');
    totalRows.forEach(row => {
        row.className = 'total-row';
        
        // Cập nhật tổng cộng với tất cả components
        const updatedTotal = getTotalPrice();
        const totalCell = row.querySelector('td:nth-child(7)');
        if (totalCell) {
            totalCell.innerHTML = `
                <div style="text-align: center; line-height: 1.1; padding: 2px; background: linear-gradient(135deg, #fbbf24, #f59e0b); border-radius: 3px;">
                    <span style="font-size: 16px; font-weight: 900; color: #92400e;">${new Intl.NumberFormat('vi-VN').format(updatedTotal)}</span><span style="font-size: 11px; font-weight: 700; color: #78350f; margin-left: 2px;">VNĐ</span>
                </div>
            `;
        }
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
                <div class="company-address">Số 399 Trần Hưng Đạo - Phương Lâm - TP Hòa Bình</div>
                <div class="company-address">SĐT: 083 676 8597</div>
                <div class="document-title">PHIẾU XUẤT BÁN HÀNG KIÊM BẢO HÀNH</div>
                <div class="date-info">Ngày ${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}</div>
            </div>
            
            <div class="customer-info">
                <strong>Tên khách hàng:</strong> _____________________ <strong>SĐT:</strong> _____________<br>
                <strong>Địa chỉ:</strong> ________________________________________________<br>
                <strong>Lý do xuất kho:</strong> Bán hàng
            </div>
            
            ${tempDiv.innerHTML}
            
            <div class="warranty-note">
                <div class="bank-info">
                    STK: 8990124112002 - NGUYÊN THÀNH NAM - MB Bank
                </div>
                
                <div style="border: 2px solid #000; padding: 8px; margin: 5px 0; background: #f8f9fa;">
                    <div style="font-weight: bold; text-align: center; margin-bottom: 5px; font-size: 12px; color: #d97706;">⏰ THỜI GIAN LÀM VIỆC & QUY ĐỊNH BẢO HÀNH</div>
                    
                    <div style="margin-bottom: 4px;">
                        <strong>📅 Giờ làm việc:</strong> Sáng 8:00-12:00, Chiều 14:00-18:00 (Chủ nhật nghỉ)
                    </div>
                    
                    <div style="font-weight: bold; margin: 4px 0; color: #dc2626;">🔧 QUY ĐỊNH BẢO HÀNH:</div>
                    
                    <div style="margin-left: 10px; line-height: 1.3;">
                        <div style="margin-bottom: 2px;">
                            <strong>1.</strong> ❌ Hết thời gian BH, mất phiếu BH, biến dạng, trầy xước, không có tem BH hợp lệ
                        </div>
                        <div style="margin-bottom: 2px;">
                            <strong>2.</strong> ⚡ Nguồn điện không ổn định, tự ý thay linh kiện, update BIOS, thay đổi kỹ thuật
                        </div>
                        <div style="margin-bottom: 2px;">
                            <strong>3.</strong> 🌡️ Môi trường không tốt: ẩm, oxy hóa, thấm nước, gỉ sét, bụi bẩn, vỡ gãy
                        </div>
                    </div>
                </div>							

            </div>
            
            <div class="footer-info" style="margin-top: 30px; padding-top: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: end; height: 150px;">
                    <div style="text-align: center; width: 45%;">
                        <strong style="font-size: 16px;">BÊN MUA</strong><br>
                        <em style="font-size: 12px;">(Ký, họ tên)</em>
                        <div style="border-bottom: 1px solid #000; margin: 80px 20px 10px 20px;"></div>
                    </div>
                    <div style="text-align: center; width: 45%;">
                        <strong style="font-size: 16px;">BÊN BÁN</strong><br>
                        <em style="font-size: 12px;">(Ký, họ tên)</em>
                        <div style="border-bottom: 1px solid #000; margin: 80px 20px 10px 20px;"></div>
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