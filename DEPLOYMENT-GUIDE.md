# 🔒 **Hướng Dẫn Deploy An Toàn - Trường Phát Computer**

## 🎯 **Tổng Quan Bảo Mật**

Dự án đã được trang bị **hệ thống bảo vệ source code hoàn chỉnh** để ngăn chặn việc sao chép và đạo nhái:

### **📂 Cấu Trúc Bảo Mật:**
```
webchuan/
├── 🔐 complete-pc-builder.js    # Source gốc (backup riêng tư)
├── 🔐 index.html                # Source gốc (backup riêng tư)  
├── 🚫 obfuscate.js             # Tool bảo vệ (ẩn hoàn toàn)
└── 📦 dist/                    # Version bảo vệ (public deploy)
    ├── ✅ complete-pc-builder.js # Code đã obfuscated
    ├── ✅ index.html            # HTML đã obfuscated
    ├── ✅ server.js             # Server production
    └── ✅ js/, images/, etc.    # Assets đầy đủ
```

---

## 🛡️ **Mức Độ Bảo Vệ Đã Áp Dụng**

### **1. Code Obfuscation (Làm Rối Code)**
- ✅ **Variable names**: `budget` → `_0xa1b2c3`, `cpu` → `_0xd4e5f6`
- ✅ **String encoding**: `"text"` → `Buffer.from("dGV4dA==","base64").toString()`
- ✅ **Comments removed**: Tất cả comment đã bị xóa
- ✅ **Console.logs removed**: Debug code đã bị loại bỏ
- ✅ **Code minification**: Code được nén thành 1 dòng dài
- ✅ **Fake functions**: Thêm functions giả để gây nhiễu

### **2. Repository Protection**
- ✅ **GitHub Private** (khuyến nghị chuyển repo thành private)
- ✅ **Source code backup**: File gốc được backup an toàn
- ✅ **Tool protection**: Script obfuscation bị ẩn hoàn toàn

---

## 🚀 **Phương Pháp Deploy**

### **Phương Pháp 1: GitHub Pages (Miễn Phí)**

#### **Bước 1: Chuyển Repository Thành Private**
1. Truy cập: https://github.com/namhbcf1/new/settings
2. Scroll xuống **"Danger Zone"**
3. Click **"Change repository visibility"** → **"Make private"**
4. Confirm để bảo vệ source code

#### **Bước 2: Deploy Dist Folder**
```bash
# Option A: Deploy từ dist folder
cd dist
git init
git add .
git commit -m "Deploy protected version"
git remote add origin https://github.com/namhbcf1/webchuan-public.git
git push -u origin main

# Option B: Deploy branch riêng
git checkout -b gh-pages
git add dist/
git commit -m "Deploy to GitHub Pages"
git subtree push --prefix dist origin gh-pages
```

#### **Bước 3: Enable GitHub Pages**
1. Vào **Settings** > **Pages**
2. Source: **Deploy from a branch**
3. Branch: **gh-pages** / **main**
4. Folder: **/ (root)** hoặc **/dist**

---

### **Phương Pháp 2: Hosting Platforms**

#### **Netlify (Khuyến Nghị)**
```bash
# Deploy dist folder trực tiếp
cd dist
npm install
# Upload folder dist lên Netlify drag & drop
```

#### **Vercel**
```bash
cd dist
npm install
vercel --prod
```

#### **Heroku**
```bash
cd dist
# Tạo Procfile
echo "web: node server.js" > Procfile
git init && git add . && git commit -m "Deploy"
heroku create truongphat-pc-builder
git push heroku main
```

---

## 🔧 **Production Setup**

### **Environment Variables (Nếu Cần)**
```env
NODE_ENV=production
PORT=3000
DOMAIN=https://your-domain.com
```

### **Server Configuration**
```javascript
// dist/server.js đã được tối ưu cho production
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('.'));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

---

## 🛡️ **Bảo Mật Nâng Cao (Optional)**

### **1. Domain Protection**
```javascript
// Thêm vào server.js để chặn domain lạ
app.use((req, res, next) => {
    const allowedDomains = ['truongphat.com', 'localhost'];
    const host = req.get('host');
    if (!allowedDomains.some(domain => host.includes(domain))) {
        return res.status(403).send('Access Denied');
    }
    next();
});
```

### **2. Rate Limiting**
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
});
app.use(limiter);
```

### **3. Security Headers**
```javascript
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});
```

---

## 📊 **Monitoring & Analytics**

### **Google Analytics (Khuyến Nghị)**
Thêm vào `dist/index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## ⚠️ **Lưu Ý Quan Trọng**

### **✅ Được Phép:**
- Deploy thư mục `dist/` lên hosting platforms
- Share link website với khách hàng
- Sử dụng cho mục đích kinh doanh

### **❌ Không Được Phép:**
- Chia sẻ file `obfuscate.js` 
- Upload source code gốc (`complete-pc-builder.js`, `index.html`) lên public
- Share private repository với người không có quyền

### **🔄 Quy Trình Update:**
```bash
# 1. Sửa source code gốc
# 2. Chạy obfuscation
node obfuscate.js

# 3. Deploy dist mới
cd dist
git add .
git commit -m "Update features"
git push origin main
```

---

## 🆘 **Khắc Phục Sự Cố**

### **Vấn Đề Thường Gặp:**

#### **1. Website không load được:**
```bash
# Kiểm tra dependencies
cd dist
npm install
node server.js
```

#### **2. Images không hiển thị:**
- Đảm bảo folder `images/` đã copy đầy đủ
- Kiểm tra path trong code obfuscated

#### **3. Obfuscated code lỗi:**
```bash
# Re-run obfuscation tool
node obfuscate.js

# Kiểm tra syntax
cd dist
node -c complete-pc-builder.js
```

---

## 📞 **Hỗ Trợ**

### **Deployment Issues:**
- GitHub Pages: [GitHub Docs](https://docs.github.com/en/pages)
- Netlify: [Netlify Docs](https://docs.netlify.com/)
- Vercel: [Vercel Docs](https://vercel.com/docs)

### **Security Concerns:**
- Kiểm tra obfuscation: `view-source:` trên browser
- Test performance: Google PageSpeed Insights
- Monitor usage: Google Analytics

---

**🎯 Website đã sẵn sàng deploy với bảo mật cao cấp! Reverse engineering gần như không thể thực hiện được với mức độ obfuscation này.** 