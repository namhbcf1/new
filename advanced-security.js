// ADVANCED SECURITY SYSTEM - TRƯỜNG PHÁT COMPUTER
// Hệ thống bảo mật nâng cao chống sao chép và sử dụng trái phép

class TruongPhatSecurity {
    constructor() {
        this.allowedDomains = [
            'localhost',
            'truongphat.com',
            'truongphatcomputer.com',
            '127.0.0.1'
        ];
        this.licenseKey = this.generateLicenseKey();
        this.init();
    }

    // 1. DOMAIN VALIDATION - Chặn domain lạ
    validateDomain() {
        const currentDomain = window.location.hostname;
        const isAllowed = this.allowedDomains.some(domain => 
            currentDomain.includes(domain) || domain.includes(currentDomain)
        );
        
        if (!isAllowed) {
            this.blockAccess('⚠️ DOMAIN KHÔNG HỢP LỆ!');
            return false;
        }
        return true;
    }

    // 2. LICENSE KEY VALIDATION
    generateLicenseKey() {
        const key = btoa('TRUONGPHAT-' + new Date().getFullYear() + '-LICENSED').replace(/=/g, '');
        return key;
    }

    validateLicense() {
        const storedLicense = localStorage.getItem('tp_license');
        if (storedLicense !== this.licenseKey) {
            this.blockAccess('🔐 GIẤY PHÉP KHÔNG HỢP LỆ!');
            return false;
        }
        return true;
    }

    // 3. ANTI-DEBUGGING & TAMPER DETECTION
    antiDebug() {
        // Detect DevTools
        let devtools = {open: false, orientation: null};
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > 160) {
                this.blockAccess('🚫 PHÁT HIỆN DEVTOOLS!');
            }
        }, 1000);

        // Detect console usage
        let consoleReportInterval = 3000;
        setInterval(() => {
            console.clear();
            console.log('%c⚠️ TRƯỜNG PHÁT COMPUTER', 'color: red; font-size: 20px; font-weight: bold;');
            console.log('%c🚫 NGHIÊM CẤM COPY SOURCE CODE!', 'color: red; font-size: 16px;');
            console.log('%c📞 Liên hệ: 0836.768.597', 'color: blue; font-size: 14px;');
        }, consoleReportInterval);
    }

    // 4. USAGE TRACKING & ANALYTICS
    trackUsage() {
        const usageData = {
            domain: window.location.hostname,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            sessionId: this.generateSessionId()
        };

        // Send to tracking server (if implemented)
        this.sendAnalytics(usageData);
    }

    generateSessionId() {
        return 'TP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    sendAnalytics(data) {
        // Could send to Google Analytics, Firebase, or custom server
        console.log('📊 Usage tracked:', data);
    }

    // 5. WATERMARK & COPYRIGHT INJECTION
    addWatermark() {
        const watermark = document.createElement('div');
        watermark.innerHTML = '© Trường Phát Computer - Licensed Software';
        watermark.style.cssText = `
            position: fixed;
            bottom: 5px;
            right: 5px;
            font-size: 10px;
            color: rgba(255,255,255,0.3);
            z-index: 999999;
            pointer-events: none;
            user-select: none;
        `;
        document.body.appendChild(watermark);

        // Invisible copyright
        const hiddenCopyright = document.createElement('meta');
        hiddenCopyright.name = 'copyright';
        hiddenCopyright.content = 'Trường Phát Computer - Unauthorized use prohibited';
        document.head.appendChild(hiddenCopyright);
    }

    // 6. BLOCK ACCESS FUNCTION
    blockAccess(reason) {
        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #dc2626, #b91c1c);
                color: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-family: Arial, sans-serif;
                z-index: 999999;
            ">
                <h1 style="font-size: 3rem; margin-bottom: 1rem;">🚫 TRUY CẬP BỊ CHẶN</h1>
                <h2 style="font-size: 1.5rem; margin-bottom: 2rem;">${reason}</h2>
                <div style="text-align: center; max-width: 600px;">
                    <p style="font-size: 1.2rem; margin-bottom: 1rem;">
                        ⚖️ Phần mềm này được bảo vệ bởi bản quyền
                    </p>
                    <p style="font-size: 1rem; margin-bottom: 2rem;">
                        Việc sử dụng trái phép có thể bị xử lý theo pháp luật Việt Nam
                    </p>
                    <div style="border: 2px solid white; padding: 1rem; border-radius: 10px;">
                        <h3>📞 LIÊN HỆ HỢP PHÁP:</h3>
                        <p>🏪 Trường Phát Computer Hòa Bình</p>
                        <p>📱 Hotline: 0836.768.597</p>
                        <p>🌐 Facebook: Trường Phát Computer Hòa Bình</p>
                    </div>
                </div>
            </div>
        `;
        
        // Prevent further execution
        throw new Error('Access blocked: ' + reason);
    }

    // 7. INITIALIZATION
    init() {
        // License setup for first time
        if (!localStorage.getItem('tp_license')) {
            localStorage.setItem('tp_license', this.licenseKey);
        }

        // Run all security checks
        if (!this.validateDomain()) return;
        if (!this.validateLicense()) return;
        
        this.antiDebug();
        this.trackUsage();
        this.addWatermark();
        
        console.log('🛡️ Trường Phát Security System Active');
    }
}

// ACTIVATE SECURITY SYSTEM
const tpSecurity = new TruongPhatSecurity();

// ADDITIONAL PROTECTION FUNCTIONS
window.addEventListener('contextmenu', e => e.preventDefault()); // Disable right-click
window.addEventListener('keydown', e => {
    // Disable F12, Ctrl+Shift+I, Ctrl+U
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
        tpSecurity.blockAccess('🚫 PHÍM TẮT BỊ VÔ HIỆU HÓA!');
    }
});

// Anti-iframe protection
if (window.top !== window.self) {
    tpSecurity.blockAccess('🚫 KHÔNG ĐƯỢC NHÚNG TRONG IFRAME!');
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TruongPhatSecurity;
} 