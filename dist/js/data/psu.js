// Dữ liệu PSU
window.psuData = {
    "350W": {
        name: "Nguồn VSP Delta P350W",
        price: 350000,
        image: "images/vsp-delta-p350w.jpg",
        brand: "VSP",
        warranty: "24 tháng",
        condition: "NEW",
        power: "350W",
        connectors: {
            mainboard: "1x 24-pin",
            cpu: ["1x 4+4-pin ATX12V"],
            pcie: ["1x 6+2-pin"],
            sata: 3,
            molex: 2
        },
        score: 1 // Added score
    },
    "DT660": {
        name: "Nguồn VSP Elite DT660 650W",
        price: 700000,
        image: "images/vsp-elite-dt660-650w.jpg",
        brand: "VSP",
        warranty: "36 tháng",
        condition: "NEW",
        power: "650W",
        connectors: {
            mainboard: "1x 24-pin",
            cpu: ["2x 8-pin (4+4) ATX12V"],
            pcie: ["2x 8-pin (6+2)"],
            sata: 4,
            molex: 2
        },
        score: 4 // Added score
    },
    "VSP750": {
        name: "Nguồn VSP VGP750BRN 80Plus Bronze 750W",
        price: 1000000,
        image: "images/vsp-vgp750brn-80plus-bronze-750w.jpg",
        brand: "VSP",
        warranty: "36 tháng",
        condition: "NEW",
        power: "750W",
        connectors: {
            mainboard: "1x 24-pin",
            cpu: ["1x 8-pin (4+4) ATX12V"],
            pcie: ["2x 8-pin (6+2)"],
            sata: 6,
            molex: 3
        },
        score: 6 // Added score
    },
    "COSAIR750": {
        name: "Nguồn Máy Tính Corsair CV750 - 750W 80 Plus",
        price: 1690000,
        image: "images/nguon-corsair-cv750.jpg",
        brand: "Corsair",
        warranty: "36 tháng",
        condition: "NEW",
        power: "750W",
        connectors: {
            mainboard: "1x 24-pin",
            cpu: ["1x 8-pin (4+4) ATX12V"],
            pcie: ["4x 8-pin (6+2)"],
            sata: 8,
            molex: 4
        },
        score: 6 // Added score
    },
    "TMR1000": {
        name: "Nguồn Máy Tính Thermalright TG-1000 1000W ATX 3.0 (80 Plus Gold)",
        price: 2400000,
        image: "images/nguon-thermalright-tg-1000.jpg",
        brand: "Thermalright",
        warranty: "36 tháng",
        condition: "NEW",
        power: "1000W",
        connectors: {
            mainboard: "1x 24-pin",
            cpu: ["2x 8-pin (4+4) ATX12V"],
            pcie: ["3x 8-pin (6+2)", "1x 12-pin (12VHPWR)"],
            sata: 8,
            molex: 4
        },
        score: 8 // Added score
    },
    "COSAIR850": {
        name: "Nguồn Máy Tính Corsair RM850e ATX 3.0 850W (80 Plus Gold)",
        price: 1800000,
        image: "images/nguon-corsair-rm850e.jpg",
        brand: "Corsair",
        warranty: "36 tháng",
        condition: "NEW",
        power: "850W",
        connectors: {
            mainboard: "1x 24-pin",
            cpu: ["2x 8-pin (4+4) ATX12V"],
            pcie: ["3x 8-pin (6+2)", "1x 12-pin (12VHPWR)"],
            sata: 10,
            molex: 4
        },
        score: 7 // Added score
    },
    "CENTAUR750": {
        name: "Nguồn Centaur 750W 80 Plus",
        price: 899000,
        image: "images/nguon-centaur-750w-80-plus.jpg",
        brand: "Khác",
        warranty: "36 tháng",
        condition: "NEW",
        power: "750W",
        connectors: {
            mainboard: "1x 24-pin",
            cpu: ["1x 8-pin (4+4) ATX12V"],
            pcie: ["2x 8-pin (6+2)"],
            sata: 6,
            molex: 3
        },
        score: 5 // Added score
    }
}; 