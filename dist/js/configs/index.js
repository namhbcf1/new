import { configs as intelValorantConfigs } from './intel/valorant.js';
import { configs as intelCsgoConfigs } from './intel/csgo.js';
import { configs as intelPubgConfigs } from './intel/pubg.js';
import { configs as intelLolConfigs } from './intel/lol.js';
import { configs as intelGtaVConfigs } from './intel/gta-v.js';
import { configs as intelEldenRingConfigs } from './intel/elden-ring.js';
import { configs as intelNarakaConfigs } from './intel/naraka.js';
import { configs as intelGenshinConfigs } from './intel/genshin.js';
import { configs as intelFo4Configs } from './intel/fo4.js';
import { configs as intelBlackMythWukongConfigs } from './intel/black-myth-wukong.js';
// Import các cấu hình Intel cho các game khác

import { configs as amdValorantConfigs } from './amd/valorant.js';
import { configs as amdCsgoConfigs } from './amd/csgo.js';
import { configs as amdPubgConfigs } from './amd/pubg.js';
import { configs as amdLolConfigs } from './amd/lol.js';
import { configs as amdGtaVConfigs } from './amd/gta-v.js';
import { configs as amdEldenRingConfigs } from './amd/elden-ring.js';
import { configs as amdNarakaConfigs } from './amd/naraka.js';
import { configs as amdGenshinConfigs } from './amd/genshin.js';
import { configs as amdFo4Configs } from './amd/fo4.js';
import { configs as amdBlackMythWukongConfigs } from './amd/black-myth-wukong.js';
// Import các cấu hình AMD cho các game khác

// Tải tất cả các tệp cấu hình
import intelImportedConfigs from './intel/index.js';
import amdImportedConfigs from './amd/index.js';

// Đảm bảo rằng các cấu hình được import chính xác
const intelConfigs = intelImportedConfigs || {};
const amdConfigs = amdImportedConfigs || {};

// Kiểm tra và log các cấu hình
console.log('✅ Intel configs loaded:', Object.keys(intelConfigs).length, 'games');
console.log('✅ AMD configs loaded:', Object.keys(amdConfigs).length, 'games');

// Kiểm tra xem chúng có phải là đối tượng rỗng không
if (Object.keys(intelConfigs).length === 0) {
    console.error('❌ ERROR: Intel configs failed to load properly!');
}

if (Object.keys(amdConfigs).length === 0) {
    console.error('❌ ERROR: AMD configs failed to load properly!');
}

/**
 * Hàm lấy cấu hình dựa trên loại CPU, game và ngân sách
 * @param {string} cpuType - Loại CPU ('Intel' hoặc 'Amd')
 * @param {string} gameId - ID của game
 * @param {string} budgetKey - Khóa ngân sách (ví dụ: '3M', '5M', '7M')
 * @returns {Object|null} - Cấu hình được chọn hoặc null nếu không tìm thấy
 */
function getConfig(cpuType, gameId, budgetKey) {
    // ==================== ĐỒNG BỘ HÓA VÀ XÁC MINH CPU TYPE ======================
    
    // CRITICAL FIX: Normalize cpuType to 'Intel' or 'Amd'
    let paramCpuType = null;
    if (typeof cpuType === 'string') {
        paramCpuType = cpuType.toLowerCase().includes('amd') ? 'Amd' : 'Intel';
    }
    
    // 1. Luôn ưu tiên lấy giá trị từ dropdown - đây là nguồn chính xác nhất
    const cpuTypeDropdown = document.getElementById('cpu-type');
    const dropdownCpuType = cpuTypeDropdown ? cpuTypeDropdown.value : null;
    
    // 2. Log tất cả các nguồn để debug
    const displayedIndicator = document.querySelector('#permanent-cpu-indicator')?.textContent || '';
    const displayedCpuType = displayedIndicator.includes('AMD') ? 'Amd' : 'Intel';
    const bodyCpuType = document.body.getAttribute('data-selected-cpu-type');
    const bodyClassType = document.body.classList.contains('amd-mode') ? 'Amd' : 'Intel';
    const storedCpuType = localStorage.getItem('selectedCpuType');
    
    console.log(`%c [getConfig] CHECKING CPU TYPES:`, 'background: #333; color: #ff0; font-weight: bold;');
    console.log(`- Param: ${paramCpuType}`);
    console.log(`- Dropdown: ${dropdownCpuType}`);
    console.log(`- Body attribute: ${bodyCpuType}`);
    console.log(`- Body class: ${bodyClassType}`);
    console.log(`- UI indicator: ${displayedCpuType}`);
    console.log(`- localStorage: ${storedCpuType}`);
    
    // 3. Xác định giá trị finalCpuType cuối cùng - LẤY GIÁ TRỊ DROPDOWN LÀM ƯU TIÊN CAO NHẤT
    let finalCpuType;
    
    if (dropdownCpuType === 'Intel' || dropdownCpuType === 'Amd') {
        finalCpuType = dropdownCpuType;
        console.log(`%c ✅ Sử dụng CPU type từ dropdown: ${finalCpuType}`, 'color: green; font-weight: bold;');
    } else if (bodyCpuType === 'Intel' || bodyCpuType === 'Amd') {
        finalCpuType = bodyCpuType;
        console.warn(`❌ Dropdown CPU type không hợp lệ, dùng body attribute: ${finalCpuType}`);
    } else if (displayedCpuType === 'Intel' || displayedCpuType === 'Amd') {
        finalCpuType = displayedCpuType;
        console.warn(`❌ Body attribute không hợp lệ, dùng hiển thị UI: ${finalCpuType}`);
    } else if (bodyClassType === 'Intel' || bodyClassType === 'Amd') {
        finalCpuType = bodyClassType;
        console.warn(`❌ UI indicator không hợp lệ, dùng body class: ${finalCpuType}`);
    } else if (storedCpuType === 'Intel' || storedCpuType === 'Amd') {
        finalCpuType = storedCpuType;
        console.warn(`❌ Body class không hợp lệ, dùng localStorage: ${finalCpuType}`);
    } else if (paramCpuType === 'Intel' || paramCpuType === 'Amd') {
        finalCpuType = paramCpuType;
        console.warn(`❌ Tất cả các nguồn đều không hợp lệ, dùng tham số: ${finalCpuType}`);
    } else {
        // Mặc định cuối cùng là Intel nếu tất cả đều thất bại
        finalCpuType = 'Intel';
        console.error(`❌ CRITICAL: Không thể xác định CPU type, mặc định dùng Intel`);
    }
    
    // 4. Đồng bộ hóa lại tất cả các trạng thái để đảm bảo nhất quán trên toàn ứng dụng
    // 4.1 Cập nhật dropdown
    if (cpuTypeDropdown && cpuTypeDropdown.value !== finalCpuType) {
        cpuTypeDropdown.value = finalCpuType;
        console.log(`✅ Đã cập nhật dropdown value: ${finalCpuType}`);
        // Kích hoạt sự kiện change để các listener khác biết về thay đổi
        try {
            cpuTypeDropdown.dispatchEvent(new Event('change', { bubbles: true }));
        } catch (e) {
            console.error("Error dispatching change event:", e);
        }
    }
    
    // 4.2 Cập nhật data attributes trên body
    document.body.setAttribute('data-selected-cpu-type', finalCpuType);
    document.body.setAttribute('data-current-cpu-type', finalCpuType);
    
    // 4.3 Cập nhật class trên body
    document.body.classList.remove('intel-mode', 'amd-mode');
    document.body.classList.add(finalCpuType.toLowerCase() + '-mode');
    
    // 4.4 Cập nhật localStorage
    localStorage.setItem('selectedCpuType', finalCpuType);
    
    // 4.5 Cập nhật visual UI (Intel/AMD options)
    const intelOption = document.getElementById('intel-option');
    const amdOption = document.getElementById('amd-option');
    
    if (finalCpuType === 'Intel') {
        intelOption?.classList.add('selected');
        amdOption?.classList.remove('selected');
    } else {
        amdOption?.classList.add('selected');
        intelOption?.classList.remove('selected');
    }
    
    // 4.6 Cập nhật indicator cố định
    const existingIndicator = document.getElementById('permanent-cpu-indicator');
    if (existingIndicator) {
        existingIndicator.textContent = `${finalCpuType.toUpperCase()} MODE`;
        existingIndicator.style.backgroundColor = finalCpuType === 'Intel' ? '#0071c5' : '#ED1C24';
    } else {
        // Tạo mới nếu không tìm thấy
        const cpuIndicator = document.createElement('div');
        cpuIndicator.style.position = 'fixed';
        cpuIndicator.style.bottom = '20px';
        cpuIndicator.style.right = '20px';
        cpuIndicator.style.padding = '15px 20px';
        cpuIndicator.style.backgroundColor = finalCpuType === 'Intel' ? '#0071c5' : '#ED1C24';
        cpuIndicator.style.color = 'white';
        cpuIndicator.style.fontWeight = 'bold';
        cpuIndicator.style.fontSize = '18px';
        cpuIndicator.style.zIndex = '10000';
        cpuIndicator.style.borderRadius = '5px';
        cpuIndicator.style.boxShadow = '0 0 15px rgba(0,0,0,0.5)';
        cpuIndicator.id = 'permanent-cpu-indicator';
        cpuIndicator.textContent = `${finalCpuType.toUpperCase()} MODE`;
        document.body.appendChild(cpuIndicator);
    }
    
    // 5. Hiển thị indicator rõ ràng về loại CPU đang được sử dụng (xóa sau 5 giây)
    const debugCpuType = document.createElement('div');
    debugCpuType.style.position = 'fixed';
    debugCpuType.style.top = '150px';
    debugCpuType.style.right = '10px';
    debugCpuType.style.padding = '15px 20px';
    debugCpuType.style.fontSize = '20px';
    debugCpuType.style.fontWeight = 'bold';
    debugCpuType.style.zIndex = '10000';
    debugCpuType.style.borderRadius = '5px';
    debugCpuType.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
    debugCpuType.id = 'config-cpu-type-indicator';
    
    if (finalCpuType === 'Intel') {
        debugCpuType.style.backgroundColor = '#0071c5';
        debugCpuType.style.color = 'white';
        debugCpuType.innerHTML = '⚙️ <strong>INTEL</strong> CONFIG';
    } else { // Amd
        debugCpuType.style.backgroundColor = '#ED1C24';
        debugCpuType.style.color = 'white';
        debugCpuType.innerHTML = '⚙️ <strong>AMD</strong> CONFIG';
    }
    
    // Xóa indicator cũ nếu có
    if (document.getElementById('config-cpu-type-indicator')) {
        document.getElementById('config-cpu-type-indicator').remove();
    }
    
    document.body.appendChild(debugCpuType);
    setTimeout(() => {
        if (document.getElementById('config-cpu-type-indicator')) {
            document.getElementById('config-cpu-type-indicator').remove();
        }
    }, 5000);
    
    // ==================== TIẾP TỤC LOGIC TÌM CẤU HÌNH ======================
    
    // Ensure budgetKey is always a string like '18M'
    if (typeof budgetKey === 'number') {
        budgetKey = `${budgetKey}M`;
    } else if (typeof budgetKey === 'string' && /^[0-9]+$/.test(budgetKey)) {
        budgetKey = `${budgetKey}M`;
    }
    
    console.log(`%c getConfig running with: CPU=${finalCpuType}, game=${gameId}, budget=${budgetKey} `, 
               'background: ' + (finalCpuType === 'Intel' ? '#0071c5' : '#ED1C24') + 
               '; color: white; font-weight: bold; font-size: 16px; padding: 5px 10px;');
    
    // CRITICAL: Chọn đúng nguồn cấu hình dựa trên CPU type
    // CRITICAL FIX: Make sure we're using the correct source object
    const useIntelConfigs = (typeof intelConfigs === 'object') ? intelConfigs : window.intelConfigs;
    const useAmdConfigs = (typeof amdConfigs === 'object') ? amdConfigs : window.amdConfigs;
    const configSource = finalCpuType === 'Intel' ? useIntelConfigs : useAmdConfigs;
    
    // VERIFICATION: Log the actual objects to ensure they're not empty
    console.log(`%c DEBUG CONFIG OBJECTS:`, 'background: #333; color: white;');
    console.log(`Intel Configs:`, useIntelConfigs);
    console.log(`AMD Configs:`, useAmdConfigs);
    console.log(`Selected source (${finalCpuType}):`, configSource);
    
    // CRITICAL CHECK: Ensure configSource is valid
    if (!configSource || typeof configSource !== 'object' || Object.keys(configSource).length === 0) {
        console.error(`CRITICAL ERROR: Config source for ${finalCpuType} is invalid or empty!`);
        // Try to fallback to the other config source
        const fallbackSource = finalCpuType === 'Intel' ? useAmdConfigs : useIntelConfigs;
        if (fallbackSource && typeof fallbackSource === 'object' && Object.keys(fallbackSource).length > 0) {
            console.log(`Using fallback config source (${finalCpuType === 'Intel' ? 'AMD' : 'Intel'})`);
            return getConfig(finalCpuType === 'Intel' ? 'Amd' : 'Intel', gameId, budgetKey);
        }
        
        showErrorMessage(`Không thể tải cấu hình cho CPU ${finalCpuType}`);
        return null;
    }
    
    // Log rõ ràng nguồn cấu hình đang dùng
    console.log(`%c USING CONFIG SOURCE: ${finalCpuType.toUpperCase()}`, 
               'background: ' + (finalCpuType === 'Intel' ? '#0071c5' : '#ED1C24') + 
               '; color: white; font-weight: bold; padding: 5px;');
    
    // Hiển thị hiệu ứng rõ ràng cho người dùng thấy đang dùng cấu hình nào
    const flashEffect = document.createElement('div');
    flashEffect.style.position = 'fixed';
    flashEffect.style.top = '0';
    flashEffect.style.left = '0';
    flashEffect.style.width = '100%';
    flashEffect.style.height = '100%';
    flashEffect.style.backgroundColor = finalCpuType === 'Intel' ? 'rgba(0, 113, 197, 0.2)' : 'rgba(237, 28, 36, 0.2)';
    flashEffect.style.zIndex = '9998';
    flashEffect.style.opacity = '0.8';
    flashEffect.style.pointerEvents = 'none';
    flashEffect.id = 'cpu-config-flash-effect';
    
    document.body.appendChild(flashEffect);
    setTimeout(() => {
        if (document.getElementById('cpu-config-flash-effect')) {
            document.getElementById('cpu-config-flash-effect').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('cpu-config-flash-effect')?.remove();
            }, 500);
        }
    }, 300);
    
    // Verify and log available games and budgets
    if (logConfigSource(finalCpuType, gameId, budgetKey)) {
        console.log(`%c ✓ Verification successful for ${finalCpuType} ${gameId} ${budgetKey}`, 'color: green; font-weight: bold;');
    } else {
        console.warn(`%c ⚠ Verification failed for ${finalCpuType} ${gameId} ${budgetKey}`, 'color: orange; font-weight: bold;');
    }
    
    // Check if the game exists
    if (!configSource || !gameId || !configSource[gameId]) {
        console.error(`Game configuration not found for ${gameId} with CPU type ${finalCpuType}`);
        // Hiển thị thông báo lỗi
        showErrorMessage(`Không tìm thấy cấu hình game ${gameId} cho CPU ${finalCpuType}`);
        return null;
    }
    
    // Check if the budget exists for this game
    if (!budgetKey || !configSource[gameId][budgetKey]) {
        console.warn(`Budget configuration not found for ${gameId} at budget ${budgetKey} with CPU type ${finalCpuType}`);
        
        // Try to find closest budget if exact match not found
        const availableBudgets = Object.keys(configSource[gameId])
            .filter(key => key.endsWith('M'))
            .map(key => parseInt(key.replace('M', '')))
            .filter(val => !isNaN(val))
            .sort((a, b) => a - b);
            
        if (availableBudgets.length === 0) {
            console.error(`No budget configurations available for ${gameId} with CPU type ${finalCpuType}`);
            showErrorMessage(`Không có cấu hình budget nào cho game ${gameId} với CPU ${finalCpuType}`);
            return null;
        }
        
        // Extract the numeric value from budgetKey (e.g., '7M' -> 7)
        let requestedBudget = NaN;
        if (typeof budgetKey === 'string' && budgetKey.endsWith('M')) {
            requestedBudget = parseInt(budgetKey.replace('M', ''));
        } else if (typeof budgetKey === 'number') {
            requestedBudget = budgetKey;
        } else if (typeof budgetKey === 'string') {
            requestedBudget = parseInt(budgetKey);
        }
        
        if (isNaN(requestedBudget)) {
            console.error(`Invalid budget key format: ${budgetKey}. Expected format like '7M'.`);
            showErrorMessage(`Định dạng budget không hợp lệ: ${budgetKey}`);
            return null;
        }
        
        // Find the closest budget
        const closestBudget = availableBudgets.reduce((prev, curr) => 
            Math.abs(curr - requestedBudget) < Math.abs(prev - requestedBudget) ? curr : prev, 
            availableBudgets[0]
        );
        
        const closestBudgetKey = `${closestBudget}M`;
        console.log(`Using closest available budget: ${closestBudgetKey} for requested budget: ${budgetKey}`);
        
        // Hiển thị thông báo sử dụng budget gần nhất
        const budgetMessage = document.createElement('div');
        budgetMessage.style.position = 'fixed';
        budgetMessage.style.bottom = '70px';
        budgetMessage.style.right = '10px';
        budgetMessage.style.padding = '10px 15px';
        budgetMessage.style.backgroundColor = '#FF9800';
        budgetMessage.style.color = 'white';
        budgetMessage.style.borderRadius = '5px';
        budgetMessage.style.zIndex = '10000';
        budgetMessage.style.fontWeight = 'bold';
        budgetMessage.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
        budgetMessage.id = 'budget-message';
        budgetMessage.textContent = `Đã chọn budget gần nhất: ${closestBudgetKey}`;
        
        // Xóa thông báo cũ nếu có
        if (document.getElementById('budget-message')) {
            document.getElementById('budget-message').remove();
        }
        
        document.body.appendChild(budgetMessage);
        setTimeout(() => {
            if (document.getElementById('budget-message')) {
                document.getElementById('budget-message').remove();
            }
        }, 5000);
        
        if (!configSource[gameId][closestBudgetKey]) {
            console.error(`Closest budget configuration not found for ${gameId} at budget ${closestBudgetKey}`);
            showErrorMessage(`Không tìm thấy cấu hình cho budget ${closestBudgetKey}`);
            return null;
        }
        
        return configSource[gameId][closestBudgetKey];
    }
    
    // Tạo hiệu ứng thành công và trả về cấu hình
    const successIndicator = document.createElement('div');
    successIndicator.style.position = 'fixed';
    successIndicator.style.bottom = '70px';
    successIndicator.style.left = '50%';
    successIndicator.style.transform = 'translateX(-50%)';
    successIndicator.style.padding = '10px 20px';
    successIndicator.style.backgroundColor = '#4CAF50';
    successIndicator.style.color = 'white';
    successIndicator.style.borderRadius = '5px';
    successIndicator.style.zIndex = '10000';
    successIndicator.style.fontWeight = 'bold';
    successIndicator.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
    successIndicator.id = 'config-success-indicator';
    successIndicator.innerHTML = `<strong>${finalCpuType === 'Intel' ? 'INTEL' : 'AMD'}</strong>: Đã tìm thấy cấu hình ${gameId} - ${budgetKey}`;
    
    // Xóa indicator cũ nếu có
    if (document.getElementById('config-success-indicator')) {
        document.getElementById('config-success-indicator').remove();
    }
    
    document.body.appendChild(successIndicator);
    setTimeout(() => {
        if (document.getElementById('config-success-indicator')) {
            document.getElementById('config-success-indicator').remove();
        }
    }, 3000);
    
    // Return the requested configuration
    return configSource[gameId][budgetKey];
}

// Helper function to show error messages
function showErrorMessage(message) {
    const errorMessage = document.createElement('div');
    errorMessage.style.position = 'fixed';
    errorMessage.style.top = '50%';
    errorMessage.style.left = '50%';
    errorMessage.style.transform = 'translate(-50%, -50%)';
    errorMessage.style.padding = '15px 25px';
    errorMessage.style.backgroundColor = '#F44336';
    errorMessage.style.color = 'white';
    errorMessage.style.borderRadius = '5px';
    errorMessage.style.zIndex = '10001';
    errorMessage.style.fontWeight = 'bold';
    errorMessage.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
    errorMessage.style.textAlign = 'center';
    errorMessage.id = 'config-error-message';
    errorMessage.innerHTML = `⚠️ ${message}`;
    
    // Xóa thông báo cũ nếu có
    if (document.getElementById('config-error-message')) {
        document.getElementById('config-error-message').remove();
    }
    
    document.body.appendChild(errorMessage);
    setTimeout(() => {
        if (document.getElementById('config-error-message')) {
            document.getElementById('config-error-message').remove();
        }
    }, 5000);
}

// Debug available configurations
console.log('Configs exposed to window object:');
console.log('- Intel games:', Object.keys(intelConfigs));
console.log('- AMD games:', Object.keys(amdConfigs));

// Expose configs to window object - CRITICAL for AMD/Intel selection to work
window.intelConfigs = intelConfigs;
window.amdConfigs = amdConfigs;
window.getConfig = getConfig;

// Add helper function to verify configuration source
function logConfigSource(cpuType, gameId, budgetKey) {
    // CRITICAL DEBUG: Show which source is being used
    const sourceType = cpuType === 'Intel' ? 'Intel' : 'Amd';
    const configSource = sourceType === 'Intel' ? intelConfigs : amdConfigs;
    
    console.log(`%c VERIFYING CONFIG SOURCE FOR ${sourceType.toUpperCase()} `, 
              'background: ' + (sourceType === 'Intel' ? '#0071c5' : '#ED1C24') + 
              '; color: white; font-weight: bold; font-size: 14px;');
    
    // Log which source we're using
    console.log('Using config source:', sourceType);
    
    // Log available games
    if (configSource) {
        console.log('Available games:', Object.keys(configSource));
        
        // Check if game exists
        if (gameId && configSource[gameId]) {
            console.log(`Game ${gameId} found in ${sourceType} configs`);
            
            // Check if budget exists
            if (budgetKey && configSource[gameId][budgetKey]) {
                console.log(`Budget ${budgetKey} found for game ${gameId}`);
                console.log('Config:', configSource[gameId][budgetKey]);
                return true;
            } else {
                console.log(`Budget ${budgetKey} NOT found for game ${gameId}`);
                console.log('Available budgets:', Object.keys(configSource[gameId]));
                return false;
            }
        } else {
            console.log(`Game ${gameId} NOT found in ${sourceType} configs`);
            return false;
        }
    } else {
        console.error(`Config source for ${sourceType} is not available!`);
        return false;
    }
}

// Export the helper function
window.logConfigSource = logConfigSource;

// Add a handler for direct Intel/AMD button clicks
window.handleCpuTypeSelection = function(cpuType) {
    console.log(`Manual CPU selection: ${cpuType}`);
    
    // Validate input
    if (cpuType !== 'Intel' && cpuType !== 'Amd') {
        console.error(`Invalid CPU type: ${cpuType}. Must be 'Intel' or 'Amd'`);
        return;
    }
    
    // Update dropdown first
    const cpuTypeDropdown = document.getElementById('cpu-type');
    if (cpuTypeDropdown) {
        cpuTypeDropdown.value = cpuType;
        console.log(`✅ Updated dropdown to ${cpuType}`);
        
        // Trigger change event to apply the change
        try {
            const event = new Event('change', { bubbles: true });
            cpuTypeDropdown.dispatchEvent(event);
            console.log('✅ Change event dispatched successfully');
        } catch (e) {
            console.error('Error dispatching change event:', e);
            
            // Fallback: manually update everything
            document.body.setAttribute('data-selected-cpu-type', cpuType);
            document.body.setAttribute('data-current-cpu-type', cpuType);
            document.body.classList.remove('intel-mode', 'amd-mode');
            document.body.classList.add(cpuType.toLowerCase() + '-mode');
            localStorage.setItem('selectedCpuType', cpuType);
        }
    } else {
        console.error('CPU type dropdown not found!');
        
        // Direct update if dropdown not found
        document.body.setAttribute('data-selected-cpu-type', cpuType);
        document.body.setAttribute('data-current-cpu-type', cpuType);
        document.body.classList.remove('intel-mode', 'amd-mode');
        document.body.classList.add(cpuType.toLowerCase() + '-mode');
        localStorage.setItem('selectedCpuType', cpuType);
    }
    
    // Update visual indicators
    const intelOption = document.getElementById('intel-option');
    const amdOption = document.getElementById('amd-option');
    
    if (cpuType === 'Intel') {
        intelOption?.classList.add('selected');
        amdOption?.classList.remove('selected');
    } else {
        amdOption?.classList.add('selected');
        intelOption?.classList.remove('selected');
    }
    
    // Update or create permanent indicator
    const existingIndicator = document.getElementById('permanent-cpu-indicator');
    if (existingIndicator) {
        existingIndicator.textContent = `${cpuType.toUpperCase()} MODE`;
        existingIndicator.style.backgroundColor = cpuType === 'Intel' ? '#0071c5' : '#ED1C24';
    } else {
        // Create new indicator
        const cpuIndicator = document.createElement('div');
        cpuIndicator.style.position = 'fixed';
        cpuIndicator.style.bottom = '20px';
        cpuIndicator.style.right = '20px';
        cpuIndicator.style.padding = '15px 20px';
        cpuIndicator.style.backgroundColor = cpuType === 'Intel' ? '#0071c5' : '#ED1C24';
        cpuIndicator.style.color = 'white';
        cpuIndicator.style.fontWeight = 'bold';
        cpuIndicator.style.fontSize = '18px';
        cpuIndicator.style.zIndex = '10000';
        cpuIndicator.style.borderRadius = '5px';
        cpuIndicator.style.boxShadow = '0 0 15px rgba(0,0,0,0.5)';
        cpuIndicator.id = 'permanent-cpu-indicator';
        cpuIndicator.textContent = `${cpuType.toUpperCase()} MODE`;
        document.body.appendChild(cpuIndicator);
    }
    
    // Show selection notification
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '70px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.padding = '15px 25px';
    notification.style.backgroundColor = cpuType === 'Intel' ? '#0071c5' : '#ED1C24';
    notification.style.color = 'white';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '10000';
    notification.style.fontWeight = 'bold';
    notification.style.fontSize = '16px';
    notification.style.boxShadow = '0 0 15px rgba(0,0,0,0.3)';
    notification.id = 'cpu-selection-notification';
    notification.textContent = `Đã chuyển sang chế độ ${cpuType.toUpperCase()}`;
    
    // Remove existing notification if any
    if (document.getElementById('cpu-selection-notification')) {
        document.getElementById('cpu-selection-notification').remove();
    }
    
    document.body.appendChild(notification);
    setTimeout(() => {
        if (document.getElementById('cpu-selection-notification')) {
            document.getElementById('cpu-selection-notification').style.opacity = '0';
            document.getElementById('cpu-selection-notification').style.transition = 'opacity 0.5s';
            setTimeout(() => {
                if (document.getElementById('cpu-selection-notification')) {
                    document.getElementById('cpu-selection-notification').remove();
                }
            }, 500);
        }
    }, 2000);
    
    // Check if we should auto-select based on current game and budget
    if (typeof window.debugSelections === 'function') {
        window.debugSelections();
    }
    
    const gameId = document.getElementById('game-genre')?.value;
    const budget = parseInt(document.getElementById('budget-range')?.value);
    
    if (gameId && !isNaN(budget) && typeof window.autoSelectConfig === 'function') {
        console.log(`Auto-selecting config for ${cpuType} with game=${gameId}, budget=${budget}`);
        window.autoSelectConfig(gameId, budget, cpuType);
    } else {
        console.log('Not auto-selecting because game, budget or autoSelectConfig function is missing');
    }
};

// Export the configurations and getConfig function
export { getConfig, intelConfigs, amdConfigs };