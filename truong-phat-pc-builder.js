/**
 * Trường Phát Computer - Complete PC Builder System
 * Author: Trường Phát Computer
 * Contact: 0836.768.597
 * Website: https://facebook.com/tpcom.hb
 */

class TruongPhatPCBuilder {
    constructor() {
        this.currentStep = 1;
        this.selectedBudget = 15;
        this.selectedCPU = null;
        this.selectedGame = null;
        this.currentConfig = {};
        this.allGames = [
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
        
        this.componentNames = {
            cpu: 'CPU',
            mainboard: 'Mainboard', 
            vga: 'Card Đồ Họa',
            ram: 'RAM',
            ssd: 'SSD',
            psu: 'Nguồn',
            case: 'Case',
            cpuCooler: 'Tản Nhiệt CPU',
            hdd: 'Ổ Cứng HDD',
            monitor: 'Màn Hình'
        };
        
        this.init();
    }
    
    init() {
        console.log('🚀 Trường Phát Computer PC Builder initialized');
        this.setupEventListeners();
        this.loadGames();
        this.updateBudgetDisplay();
        this.checkDataLoaded();
    }
    
    checkDataLoaded() {
        const requiredData = ['cpuData', 'mainboardData', 'vgaData', 'ramData', 'ssdData', 'psuData', 'caseData', 'cpuCoolerData'];
        const missingData = requiredData.filter(data => !window[data]);
        
        if (missingData.length > 0) {
            console.warn('⚠️ Missing data:', missingData);
        } else {
            console.log('✅ All component data loaded successfully');
        }
        
        // Check config data
        const intelGames = window.intelConfigs ? Object.keys(window.intelConfigs).length : 0;
        const amdGames = window.amdConfigs ? Object.keys(window.amdConfigs).length : 0;
        console.log(`✅ Loaded ${intelGames} Intel configs and ${amdGames} AMD configs`);
    }
    
    setupEventListeners() {
        // Budget slider
        const budgetSlider = document.getElementById('budget-slider');
        if (budgetSlider) {
            budgetSlider.addEventListener('input', (e) => {
                this.selectedBudget = parseInt(e.target.value);
                this.updateBudgetDisplay();
            });
        }
    }
    
    updateBudgetDisplay() {
        const display = document.getElementById('budget-display');
        if (display) {
            display.textContent = this.selectedBudget + ' triệu VNĐ';
        }
    }
    
    loadGames() {
        const gameGrid = document.getElementById('game-grid');
        if (!gameGrid) return;
        
        gameGrid.innerHTML = this.allGames.map(game => `
            <div class="game-option" data-game="${game.id}" onclick="pcBuilder.selectGame('${game.id}')">
                <img src="${game.image}" alt="${game.name}" class="game-image" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.marginTop='2rem';">
                <div class="game-name">${game.name}</div>
            </div>
        `).join('');
    }
    
    selectCPU(cpu) {
        this.selectedCPU = cpu;
        
        // Update UI
        document.querySelectorAll('.cpu-option').forEach(option => {
            option.classList.remove('selected');
        });
        const selectedOption = document.querySelector(`[data-cpu="${cpu}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }
        
        console.log(`✅ CPU selected: ${cpu.toUpperCase()}`);
    }
    
    selectGame(gameId) {
        this.selectedGame = gameId;
        
        // Update UI
        document.querySelectorAll('.game-option').forEach(option => {
            option.classList.remove('selected');
        });
        const selectedOption = document.querySelector(`[data-game="${gameId}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }
        
        const gameName = this.allGames.find(g => g.id === gameId)?.name || gameId;
        console.log(`✅ Game selected: ${gameName}`);
    }
    
    nextStep() {
        // Validation
        if (this.currentStep === 2 && !this.selectedCPU) {
            this.showAlert('Vui lòng chọn loại CPU!', 'warning');
            return;
        }
        
        if (this.currentStep === 3 && !this.selectedGame) {
            this.showAlert('Vui lòng chọn game yêu thích!', 'warning');
            return;
        }
        
        // Generate configuration when moving to step 4
        if (this.currentStep === 3) {
            this.generateConfiguration();
            this.loadComponentSelectors();
        }
        
        this.currentStep++;
        this.showStep(this.currentStep);
    }
    
    showStep(step) {
        // Hide all steps
        for (let i = 1; i <= 5; i++) {
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
        
        // Display final configuration on step 5
        if (step === 5) {
            this.displayFinalConfiguration();
        }
    }
    
    generateConfiguration() {
        const budgetKey = this.selectedBudget + 'M';
        console.log(`🔍 Looking for config: ${this.selectedCPU} - ${this.selectedGame} - ${budgetKey}`);
        
        // Get configuration from loaded data
        let configData = null;
        
        if (this.selectedCPU === 'intel' && window.intelConfigs && window.intelConfigs[this.selectedGame]) {
            configData = window.intelConfigs[this.selectedGame][budgetKey];
        } else if (this.selectedCPU === 'amd' && window.amdConfigs && window.amdConfigs[this.selectedGame]) {
            configData = window.amdConfigs[this.selectedGame][budgetKey];
        }
        
        if (configData) {
            this.currentConfig = { ...configData };
            console.log('✅ Configuration loaded from data:', this.currentConfig);
        } else {
            // Try to find closest budget
            const availableBudgets = this.getAvailableBudgets();
            const closestBudget = this.findClosestBudget(this.selectedBudget, availableBudgets);
            
            if (closestBudget) {
                const closestKey = closestBudget + 'M';
                if (this.selectedCPU === 'intel' && window.intelConfigs && window.intelConfigs[this.selectedGame]) {
                    configData = window.intelConfigs[this.selectedGame][closestKey];
                } else if (this.selectedCPU === 'amd' && window.amdConfigs && window.amdConfigs[this.selectedGame]) {
                    configData = window.amdConfigs[this.selectedGame][closestKey];
                }
                
                if (configData) {
                    this.currentConfig = { ...configData };
                    console.log(`✅ Using closest budget config (${closestBudget}M):`, this.currentConfig);
                } else {
                    this.currentConfig = this.generateFallbackConfig();
                    console.warn('⚠️ Using fallback configuration');
                }
            } else {
                this.currentConfig = this.generateFallbackConfig();
                console.warn('⚠️ Using fallback configuration');
            }
        }
    }
    
    getAvailableBudgets() {
        const budgets = new Set();
        
        // Collect all available budgets from both Intel and AMD configs
        if (window.intelConfigs && window.intelConfigs[this.selectedGame]) {
            Object.keys(window.intelConfigs[this.selectedGame]).forEach(key => {
                const budget = parseInt(key.replace('M', ''));
                budgets.add(budget);
            });
        }
        
        if (window.amdConfigs && window.amdConfigs[this.selectedGame]) {
            Object.keys(window.amdConfigs[this.selectedGame]).forEach(key => {
                const budget = parseInt(key.replace('M', ''));
                budgets.add(budget);
            });
        }
        
        return Array.from(budgets).sort((a, b) => a - b);
    }
    
    findClosestBudget(targetBudget, availableBudgets) {
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
    
    generateFallbackConfig() {
        console.log('🔧 Generating fallback configuration...');
        
        if (this.selectedBudget <= 5) {
            return this.selectedCPU === 'intel' ? {
                cpu: "9100f",
                mainboard: "H310",
                vga: "750ti",
                ram: "D38G",
                ssd: "sata-sstc-256",
                case: "GA3",
                cpuCooler: "STOCK",
                psu: "350W"
            } : {
                cpu: "3200g",
                mainboard: "A320",
                vga: "750ti",
                ram: "D38G",
                ssd: "sata-sstc-256",
                case: "GA3",
                cpuCooler: "STOCK",
                psu: "350W"
            };
        } else if (this.selectedBudget <= 10) {
            return this.selectedCPU === 'intel' ? {
                cpu: "12100f",
                mainboard: "HNZ-H610",
                vga: "1660s",
                ram: "cosair-16",
                ssd: "sstc-256",
                case: "GA3",
                cpuCooler: "2ongdong",
                psu: "DT660"
            } : {
                cpu: "5600",
                mainboard: "B450M-A",
                vga: "1660s",
                ram: "cosair-16",
                ssd: "sstc-256",
                case: "GA3",
                cpuCooler: "2ongdong",
                psu: "DT660"
            };
        } else if (this.selectedBudget <= 20) {
            return this.selectedCPU === 'intel' ? {
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
            return this.selectedCPU === 'intel' ? {
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
    
    loadComponentSelectors() {
        const componentGrid = document.getElementById('component-grid');
        if (!componentGrid) return;
        
        const components = ['cpu', 'mainboard', 'vga', 'ram', 'ssd', 'psu', 'case', 'cpuCooler'];
        
        componentGrid.innerHTML = components.map(component => {
            const options = this.getComponentOptions(component);
            return `
                <div class="component-card">
                    <h4>${this.componentNames[component]}</h4>
                    <select class="component-select" id="${component}-select" 
                            onchange="pcBuilder.updateComponent('${component}', this.value)">
                        ${options}
                    </select>
                </div>
            `;
        }).join('');
        
        // Set current selections
        components.forEach(component => {
            const select = document.getElementById(`${component}-select`);
            if (select && this.currentConfig[component]) {
                select.value = this.currentConfig[component];
            }
        });
    }
    
    getComponentOptions(componentType) {
        const dataMap = {
            cpu: window.cpuData,
            mainboard: window.mainboardData,
            vga: window.vgaData,
            ram: window.ramData,
            ssd: window.ssdData,
            psu: window.psuData,
            case: window.caseData,
            cpuCooler: window.cpuCoolerData
        };
        
        const data = dataMap[componentType];
        if (!data) {
            console.warn(`⚠️ No data found for component type: ${componentType}`);
            return '<option>Đang tải...</option>';
        }
        
        return Object.entries(data).map(([id, component]) => 
            `<option value="${id}">${component.name}</option>`
        ).join('');
    }
    
    updateComponent(componentType, componentId) {
        this.currentConfig[componentType] = componentId;
        console.log(`🔧 Updated ${componentType}: ${componentId}`);
        
        // Auto-update price display if visible
        if (this.currentStep === 5) {
            this.displayFinalConfiguration();
        }
    }
    
    updateConfiguration() {
        this.displayFinalConfiguration();
        this.showAlert('Cấu hình đã được cập nhật thành công!', 'success');
    }
    
    displayFinalConfiguration() {
        const container = document.getElementById('final-config-table');
        if (!container) return;
        
        let totalPrice = 0;
        let html = '<table class="config-table">';
        html += '<thead><tr><th style="width: 25%">Linh Kiện</th><th style="width: 50%">Tên Sản Phẩm</th><th style="width: 25%">Giá</th></tr></thead><tbody>';
        
        // Main components
        Object.entries(this.currentConfig).forEach(([key, value]) => {
            const component = this.getComponentData(key, value);
            const price = component.price || 0;
            totalPrice += price;
            
            html += `<tr>
                <td class="component">${this.componentNames[key]}</td>
                <td>${component.name}</td>
                <td class="price">${this.formatPrice(price)}</td>
            </tr>`;
        });
        
        // Add optional components with empty defaults
        const optionalComponents = [
            { key: 'hdd', name: 'Ổ Cứng HDD', note: '(Tùy chọn)' },
            { key: 'monitor', name: 'Màn Hình', note: '(Tùy chọn)' }
        ];
        
        optionalComponents.forEach(({ key, name, note }) => {
            if (!this.currentConfig[key]) {
                html += `<tr style="opacity: 0.6;">
                    <td class="component">${name}</td>
                    <td style="font-style: italic; color: #94a3b8;">Không chọn ${note}</td>
                    <td class="price">0 VNĐ</td>
                </tr>`;
            }
        });
        
        html += `<tr class="total">
            <td class="component">TỔNG CỘNG</td>
            <td style="text-align: center; font-weight: bold; color: #22c55e;">
                🎯 ${this.selectedCPU?.toUpperCase()} | 🎮 ${this.allGames.find(g => g.id === this.selectedGame)?.name}
            </td>
            <td class="price">${this.formatPrice(totalPrice)}</td>
        </tr>`;
        
        html += '</tbody></table>';
        
        // Add contact info
        html += `
            <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(79, 172, 254, 0.1); border-radius: 1rem; text-align: center;">
                <h3 style="color: #4facfe; margin-bottom: 1rem;">📞 Liên Hệ Trường Phát Computer</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; align-items: center;">
                    <a href="tel:0836768597" style="color: #22c55e; text-decoration: none; font-weight: bold;">
                        📱 0836.768.597
                    </a>
                    <a href="https://zalo.me/0836768597" target="_blank" style="color: #0084ff; text-decoration: none; font-weight: bold;">
                        💬 Zalo
                    </a>
                    <a href="https://www.facebook.com/tpcom.hb/" target="_blank" style="color: #1877f2; text-decoration: none; font-weight: bold;">
                        📘 Facebook
                    </a>
                    <a href="https://m.me/truongphatcomputer" target="_blank" style="color: #0084ff; text-decoration: none; font-weight: bold;">
                        💬 Messenger
                    </a>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    getComponentData(type, id) {
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
        
        // Fallback with proper name formatting
        const fallbackName = id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return {
            name: fallbackName,
            price: 1000000 // Default 1M VNĐ
        };
    }
    
    formatPrice(price) {
        if (!price || price === 0) return '0 VNĐ';
        return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
    }
    
    saveConfiguration() {
        const configData = {
            budget: this.selectedBudget,
            cpuType: this.selectedCPU,
            game: this.selectedGame,
            gameName: this.allGames.find(g => g.id === this.selectedGame)?.name,
            config: this.currentConfig,
            timestamp: new Date().toISOString(),
            contact: '0836.768.597'
        };
        
        try {
            localStorage.setItem('truongphat_pc_config', JSON.stringify(configData));
            this.showAlert('✅ Cấu hình đã được lưu thành công!', 'success');
            
            // Also display final config
            this.displayFinalConfiguration();
            
            console.log('💾 Configuration saved:', configData);
        } catch (error) {
            console.error('❌ Error saving configuration:', error);
            this.showAlert('❌ Lỗi khi lưu cấu hình!', 'error');
        }
    }
    
    showAlert(message, type = 'info') {
        // Create alert element
        const alert = document.createElement('div');
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: 600;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out;
        `;
        
        // Set background color based on type
        const colors = {
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6'
        };
        alert.style.backgroundColor = colors[type] || colors.info;
        
        alert.textContent = message;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(alert);
        
        // Remove after 3 seconds
        setTimeout(() => {
            alert.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.parentNode.removeChild(alert);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize PC Builder
let pcBuilder;
document.addEventListener('DOMContentLoaded', function() {
    pcBuilder = new TruongPhatPCBuilder();
});

// Global functions for HTML onclick handlers
function nextStep() {
    if (pcBuilder) pcBuilder.nextStep();
}

function updateConfiguration() {
    if (pcBuilder) pcBuilder.updateConfiguration();
}

function saveConfiguration() {
    if (pcBuilder) pcBuilder.saveConfiguration();
}

function selectCPU(cpu) {
    if (pcBuilder) pcBuilder.selectCPU(cpu);
}

function selectGame(gameId) {
    if (pcBuilder) pcBuilder.selectGame(gameId);
} 