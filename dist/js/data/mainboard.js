// Dữ liệu Mainboard
window.mainboardData = {
    "H61": {
        "name": "Gigabyte H61M-DS2 (LGA1155 - Cũ)",
        "price": 400000,
        "image": "images/gigabyte-h61m-ds2.jpg",
        "brand": "Gigabyte (Cũ)",
        "warranty": "1 tháng",
        "sockets": ["LGA1155"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR3",
        "condition": "2ND",
        "nvmeSlots": 0,
        "pcieVersion": "2.0",
        "formFactor": "Micro-ATX",
        "score": 1
    },
    "B75": {
        "name": "ASUS B75M-A (LGA1155 - Cũ)",
        "price": 500000,
        "image": "images/asus-b85m-g.jpg",
        "brand": "ASUS (Cũ)",
        "warranty": "1 tháng",
        "sockets": ["LGA1155"], // Tương thích với i5-3470
        "memoryType": "DDR3",
        "condition": "2ND",
        "nvmeSlots": 0,
        "pcieVersion": "2.0",
        "formFactor": "Micro-ATX",
        "score": 2
    },
    "H81": {
        "name": "ASUS H81M-E (LGA1150 - Cũ)",
        "price": 450000,
        "image": "images/asus-h81m-e.jpg",
        "brand": "ASUS (Cũ)",
        "warranty": "1 tháng",
        "sockets": ["LGA1150"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR3",
        "condition": "2ND",
        "nvmeSlots": 0,
        "pcieVersion": "2.0",
        "formFactor": "Micro-ATX",
        "score": 2
    },
    "H110": {
        "name": "Gigabyte H110M-DS2",
        "price": 650000,
        "image": "images/gigabyte-h110m-ds2.jpg",
        "brand": "Gigabyte (Cũ)",
        "warranty": "1 tháng",
        "sockets": ["LGA1151"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR4",
        "condition": "NEW",
        "nvmeSlots": 0,
        "pcieVersion": "3.0",
        "formFactor": "Micro-ATX",
        "score": 3
    },
    "B150": {
        "name": "Gigabyte B150M-D3H",
        "price": 750000,
        "image": "images/gigabyte-b150m-d3h.jpg",
        "brand": "Gigabyte (Cũ)",
        "warranty": "1 tháng",
        "sockets": ["LGA1151"], // Tương thích với i5-6500
        "memoryType": "DDR4",
        "condition": "NEW",
        "nvmeSlots": 0,
        "pcieVersion": "3.0",
        "formFactor": "Micro-ATX",
        "score": 3
    },
    "B250": {
        "name": "ASUS Prime B250M-A",
        "price": 850000,
        "image": "images/asus-prime-b250m-a.jpg",
        "brand": "ASUS (Cũ)",
        "warranty": "1 tháng",
        "sockets": ["LGA1151"], // Tương thích với i5-6500, i5-7400
        "memoryType": "DDR4",
        "condition": "NEW",
        "nvmeSlots": 1,
        "pcieVersion": "3.0",
        "formFactor": "Micro-ATX",
        "score": 4
    },
    "H310": {
        "name": "ASUS H310M-E",
        "price": 700000,
        "image": "images/asus-h310m-e.jpg",
        "brand": "ASUS (Cũ)",
        "warranty": "1 tháng",
        "sockets": ["LGA1151-v2"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR4",
        "condition": "NEW",
        "nvmeSlots": 1,
        "pcieVersion": "3.0",
        "formFactor": "Micro-ATX",
        "score": 4
    },
    "H410": {
        "name": "Gigabyte H410M H V2",
        "price": 800000,
        "image": "images/gigabyte-h410m-h-v2.jpg",
        "brand": "Gigabyte (Cũ)",
        "warranty": "1 tháng",
        "sockets": ["LGA1200"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR4",
        "condition": "NEW",
        "nvmeSlots": 1,
        "pcieVersion": "3.0",
        "formFactor": "Micro-ATX",
        "score": 4
    },
    "H510": {
        "name": "ASUS Prime H510M-E",
        "price": 900000,
        "image": "images/asus-prime-h510m-e.jpg",
        "brand": "ASUS (Cũ)",
        "warranty": "1 tháng",
        "sockets": ["LGA1200"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR4",
        "condition": "NEW",
        "nvmeSlots": 1,
        "pcieVersion": "3.0",
        "formFactor": "Micro-ATX",
        "score": 5
    },
    "ASUS-H610": {
        "name": "ASUS PRIME H610M-K D4",
        "price": 1600000,
        "image": "images/asus-prime-h610m-k-ddr4.jpg",
        "brand": "ASUS",
        "warranty": "36 tháng",
        "sockets": ["LGA1700"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR4",
        "condition": "NEW",
        "buss": "3200",
        "nvmeSlots": 1,
        "pcieVersion": "4.0",
        "formFactor": "Micro-ATX",
        "score": 5
    },
    "MSI-H610": {
        "name": "MSI PRO H610M-B DDR4",
        "price": 1790000,
        "image": "images/msi-pro-h610m-b-ddr4.jpg",
        "brand": "MSI",
        "warranty": "36 tháng",
        "sockets": ["LGA1700"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR4",
        "condition": "NEW",
        "buss": "3200",
        "nvmeSlots": 1,
        "pcieVersion": "4.0",
        "formFactor": "Micro-ATX",
        "score": 5
    },
    "HNZ-H610": {
        "name": "Huananzhi H610M-K DDR4",
        "price": 1350000,
        "image": "images/hnz-h610m-k-ddr4.jpg",
        "brand": "HNZ",
        "warranty": "36 tháng",
        "sockets": ["LGA1700"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR4",
        "condition": "NEW",
        "buss": "3200",
        "nvmeSlots": 1,
        "pcieVersion": "4.0",
        "formFactor": "Micro-ATX",
        "score": 4
    },
    "B360": {
        "name": "Gigabyte B360M D3H",
        "price": 1500000,
        "image": "images/gigabyte-b360m-d3h.jpg",
        "brand": "Gigabyte (Cũ)",
        "warranty": "1 tháng",
        "sockets": ["LGA1151-v2"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR4",
        "condition": "NEW",
        "nvmeSlots": 1,
        "pcieVersion": "3.0",
        "formFactor": "Micro-ATX",
        "score": 5
    },
    "B365": {
        "name": "ASUS Prime B365M-A",
        "price": 11000000,
        "image": "images/asus-prime-b365m-a.jpg",
        "brand": "ASUS (Cũ)",
        "warranty": "1 tháng",
        "sockets": ["LGA1151-v2"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR4",
        "condition": "NEW",
        "nvmeSlots": 1,
        "pcieVersion": "3.0",
        "formFactor": "Micro-ATX",
        "score": 5
    },
    "B460": {
        "name": "Gigabyte B460M DS3H AC",
        "price": 1900000,
        "image": "images/gigabyte-b460m-ds3h-ac.jpg",
        "brand": "Gigabyte (Cũ)",
        "warranty": "1 tháng",
        "sockets": ["LGA1200"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR4",
        "condition": "NEW",
        "nvmeSlots": 1,
        "pcieVersion": "3.0",
        "formFactor": "Micro-ATX",
        "score": 6
    },
    "B560": {
        "name": "ASUS Prime B560M-A",
        "price": 1700000,
        "image": "images/asus-prime-b560m-a.jpg",
        "brand": "ASUS (Cũ)",
        "warranty": "1 tháng",
        "sockets": ["LGA1200"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR4",
        "condition": "NEW",
        "nvmeSlots": 2,
        "pcieVersion": "4.0",
        "formFactor": "Micro-ATX",
        "score": 6
    },
    "HNZ-B760": {
        "name": "Main Huananzhi B760M-DDR4 (Màu đen)",
        "price": 1800000,
        "image": "images/main-huananzhi-b760m-DDR4-den.jpg",
        "brand": "Huananzhi",
        "warranty": "36 tháng",
        "sockets": ["LGA1700"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR4",
        "condition": "NEW",
        "buss": "3200",
        "nvmeSlots": 2,
        "pcieVersion": "4.0",
        "formFactor": "Micro-ATX",
        "score": 6
    },
    "MSI-B760": {
        "name": "Mainboard MSI PRO B760M-E DDR4",
        "price": 2450000,
        "image": "images/mainboard-msi-pro-b760m-e-ddr4.jpg",
        "brand": "MSI",
        "warranty": "36 tháng",
        "sockets": ["LGA1700"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR4",
        "condition": "NEW",
        "buss": "3200",
        "nvmeSlots": 2,
        "pcieVersion": "4.0",
        "formFactor": "Micro-ATX",
        "score": 7
    },
    "B760M-E": {
        "name": "Bo mạch chủ ASUS TUF GAMING B760M-E D4",
        "price": 3100000, // Giá không có sẵn
        "image": "images/asus-tuf-gaming-b760m-e-d4.jpg",
        "brand": "ASUS",
        "warranty": "36 tháng",
        "sockets": ["LGA1700"],
        "memoryType": "DDR4",
        "condition": "NEW",
        "buss": "3200",
        "nvmeSlots": 2,
        "pcieVersion": "4.0",
        "formFactor": "Micro-ATX",
        "score": 8
    },

    "ASUS-B760": {
        "name": "Mainboard Asus PRIME B760M-K DDR4",
        "price": 2490000,
        "image": "images/mainboard-asus-prime-b760m-k-ddr4.jpg",
        "brand": "Asus",
        "warranty": "36 tháng",
        "sockets": ["LGA1700"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR4",
        "condition": "NEW",
        "buss": "3200",
        "nvmeSlots": 2,
        "pcieVersion": "4.0",
        "formFactor": "Micro-ATX",
        "score": 7
    },
    "JGINYUE-B450": {
        "name": "JGinyue B450M-TI (AM4)",
        "price": 1390000,
        "image": "images/jginyue-b450m-ti.jpg",
        "brand": "JGinyue",
        "warranty": "36 tháng",
        "sockets": ["AM4"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR4",
        "condition": "NEW",
        "nvmeSlots": 1,
        "pcieVersion": "3.0",
        "formFactor": "Micro-ATX",
        "score": 4
    },
    "GIGA-B550": {
        "name": "Gigabyte B550M AORUS ELITE (AM4)",
        "price": 2550000,
        "image": "images/gigabyte-b550m-aorus-elite.jpg",
        "brand": "Gigabyte",
        "warranty": "36 tháng",
        "sockets": ["AM4"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR4",
        "condition": "NEW",
        "nvmeSlots": 1,
        "pcieVersion": "4.0",
        "formFactor": "Micro-ATX",
        "score": 6
    },
    "asrock-b550m-se": {
        "name": "ASRock B550M SE (AM4)",
        "price": 2299000,
        "image": "images/asrock-b550m-se.jpg",
        "brand": "ASRock",
        "warranty": "36 tháng",
        "sockets": ["AM4"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR4",
        "condition": "NEW",
        "buss": "3200",
        "nvmeSlots": 1,
        "pcieVersion": "4.0",
        "formFactor": "Micro-ATX",
        "score": 6
    },
    "gigabyte-b550m-gaming-wifi": {
        "name": "Gigabyte B550M GAMING WIFI (AM4)",
        "price": 2699000,
        "image": "images/gigabyte-b550m-gaming-wifi.jpg",
        "brand": "Gigabyte",
        "warranty": "36 tháng",
        "sockets": ["AM4"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR4",
        "buss": "3200",
        "condition": "NEW",
        "nvmeSlots": 1,
        "pcieVersion": "4.0",
        "formFactor": "Micro-ATX",
        "score": 8
    },
    "JGINYUE-B650": {
        "name": " MAINBOARD JGINYUE B650M-D (AM5)",
        "price": 1900000,
        "image": "images/jginyue-b650m-d.jpg",
        "brand": "JGINYUE",
        "warranty": "36 tháng",
        "sockets": ["AM5"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR5",
        "condition": "NEW",
        "buss": "6400",
        "nvmeSlots": 1,
        "pcieVersion": "4.0",
        "formFactor": "Micro-ATX",
        "score": 6
    },
    "JGINYUE-B650-PRO": {
        "name": " MAINBOARD JGINYUE B650M PRO (AM5)",
        "price": 2100000,
        "image": "images/jginyue-b650m-pro.jpg",
        "brand": "JGinyue",
        "warranty": "36 tháng",
        "sockets": ["AM5"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR5",
        "condition": "NEW",
        "buss": "5200",
        "nvmeSlots": 1,
        "pcieVersion": "4.0",
        "formFactor": "Micro-ATX",
        "score": 6
    },
    "ASROCK-B650M-HDV-M2": {
        "name": " MAINBOARD ASRock B650M-HDV/M.2 (AM5)",
        "price": 2790000,
        "image": "images/asrock-b650m-hdv-m2.jpg",
        "brand": "ASRock",
        "warranty": "36 tháng",
        "sockets": ["AM5"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR5",
        "condition": "NEW",
        "buss": "5600",
        "nvmeSlots": 1,
        "pcieVersion": "4.0",
        "formFactor": "Micro-ATX",
        "score": 7
    },
    "MSI-PRO-B650M-P": {
        "name": " MAINBOARD MSI PRO B650M-P (AM5)",
        "price": 2990000,
        "image": "images/msi-pro-b650m-p.jpg",
        "brand": "MSI",
        "warranty": "36 tháng",
        "sockets": ["AM5"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR5",
        "condition": "NEW",
        "buss": "5600",
        "nvmeSlots": 1,
        "pcieVersion": "4.0",
        "formFactor": "Micro-ATX",
        "score": 7
    },
    "MSI-PRO-B650M-E": {
        "name": " MAINBOARD MSI PRO B650M-E (AM5)",
        "price": 2600000,
        "image": "images/msi-pro-b650m-p.jpg",
        "brand": "MSI",
        "warranty": "36 tháng",
        "sockets": ["AM5"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR5",
        "condition": "NEW",
        "buss": "6000",
        "nvmeSlots": 1,
        "pcieVersion": "4.0",
        "formFactor": "Micro-ATX",
        "score": 7
    },
    "MSI-PRO-B650VC": {
        "name": " MAINBOARD MSI PRO B650 VC WIFI (AM5)",
        "price": 2800000,
        "image": "images/b650vc.jpg",
        "brand": "MSI",
        "warranty": "36 tháng",
        "sockets": ["AM5"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR5",
        "condition": "NEW",
        "buss": "6000",
        "nvmeSlots": 1,
        "pcieVersion": "4.0",
        "formFactor": "Micro-ATX",
        "score": 7
    },
    "ASUS-TUF-GAMING-B650M-E": {
        "name": " MAINBOARD ASUS TUF GAMING B650M-E (AM5)",
        "price": 3390000,
        "image": "images/asus-tuf-gaming-b650m-e.jpg",
        "brand": "ASUS",
        "warranty": "36 tháng",
        "sockets": ["AM5"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR5",
        "condition": "NEW",
        "buss": "5600",
        "nvmeSlots": 1,
        "pcieVersion": "4.0",
        "formFactor": "Micro-ATX",
        "score": 8
    },
    "GIGABYTE-B650M-GAMING-PLUS-WIFI": {
        "name": " MAINBOARD GIGABYTE B650M GAMING PLUS WIFI (AM5)",
        "price": 3290000,
        "image": "images/gigabyte-b650m-gaming-plus-wifi.jpg",
        "brand": "Gigabyte",
        "warranty": "36 tháng",
        "sockets": ["AM5"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR5",
        "condition": "NEW",
        "buss": "5600",
        "nvmeSlots": 1,
        "pcieVersion": "4.0",
        "formFactor": "Micro-ATX",
        "score": 8
    },
    "ASUS-TUF-GAMING-B650M-E-WIFI": {
        "name": " MAINBOARD ASUS TUF GAMING B650M-E WIFI (AM5)",
        "price": 3790000,
        "image": "images/asus-tuf-gaming-b650m-e-wifi.jpg",
        "brand": "ASUS",
        "warranty": "36 tháng",
        "sockets": ["AM5"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR5",
        "condition": "NEW",
        "buss": "5600",
        "nvmeSlots": 1,
        "pcieVersion": "4.0",
        "formFactor": "Micro-ATX",
        "score": 8
    },
    "MSI-B650M-GAMING-PLUS-WIFI": {
        "name": " MAINBOARD MSI B650M GAMING PLUS WIFI (AM5)",
        "price": 3890000,
        "image": "images/msi-b650m-gaming-plus-wifi.jpg",
        "brand": "MSI",
        "warranty": "36 tháng",
        "sockets": ["AM5"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR5",
        "condition": "NEW",
        "buss": "5600",
        "nvmeSlots": 1,
        "pcieVersion": "4.0",
        "formFactor": "Micro-ATX",
        "score": 8
    },
    "GIGABYTE-B650M-AORUS-ELITE": {
        "name": " MAINBOARD GIGABYTE B650M AORUS ELITE (AM5)",
        "price": 4290000,
        "image": "images/gigabyte-b650m-aorus-elite.jpg",
        "brand": "Gigabyte",
        "warranty": "36 tháng",
        "sockets": ["AM5"], // ĐÃ SỬA: socket -> sockets, giá trị là MẢNG
        "memoryType": "DDR5",
        "condition": "NEW",
        "buss": "5600",
        "nvmeSlots": 1,
        "pcieVersion": "4.0",
        "formFactor": "Micro-ATX",
        "score": 9
    }
}; 

// Expose to window object for use in non-module scripts
if (typeof window !== 'undefined') {
    window.mainboardData = mainboardData;
} 