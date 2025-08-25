"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        // ================== thuoc ==================
        await queryInterface.bulkInsert("thuoc", [
            { tenthuoc: "đơn sâm", soluongcong: 1000, giatienmotcong: 500, createdat: new Date(), updatedat: new Date() },
            { tenthuoc: "hoàng kỳ", soluongcong: 2000, giatienmotcong: 535, createdat: new Date(), updatedat: new Date() },
            { tenthuoc: "cam thảo", soluongcong: 1500, giatienmotcong: 450, createdat: new Date(), updatedat: new Date() },
            { tenthuoc: "đương quy", soluongcong: 1800, giatienmotcong: 620, createdat: new Date(), updatedat: new Date() },
            { tenthuoc: "xuyên khung", soluongcong: 1200, giatienmotcong: 700, createdat: new Date(), updatedat: new Date() },
            { tenthuoc: "bạch truật", soluongcong: 1400, giatienmotcong: 480, createdat: new Date(), updatedat: new Date() },
            { tenthuoc: "thục địa", soluongcong: 1600, giatienmotcong: 550, createdat: new Date(), updatedat: new Date() },
            { tenthuoc: "nhân sâm", soluongcong: 1000, giatienmotcong: 1200, createdat: new Date(), updatedat: new Date() },
            { tenthuoc: "sinh khương", soluongcong: 1300, giatienmotcong: 430, createdat: new Date(), updatedat: new Date() },
            { tenthuoc: "hà thủ ô", soluongcong: 900, giatienmotcong: 800, createdat: new Date(), updatedat: new Date() },
            { tenthuoc: "tang diệp", soluongcong: 1700, giatienmotcong: 300, createdat: new Date(), updatedat: new Date() },
            { tenthuoc: "cúc hoa", soluongcong: 1500, giatienmotcong: 350, createdat: new Date(), updatedat: new Date() },
            { tenthuoc: "kim ngân hoa", soluongcong: 2000, giatienmotcong: 400, createdat: new Date(), updatedat: new Date() },
            { tenthuoc: "trần bì", soluongcong: 1200, giatienmotcong: 390, createdat: new Date(), updatedat: new Date() },
            { tenthuoc: "bán hạ", soluongcong: 1100, giatienmotcong: 450, createdat: new Date(), updatedat: new Date() },
            { tenthuoc: "phục linh", soluongcong: 1300, giatienmotcong: 600, createdat: new Date(), updatedat: new Date() },
            { tenthuoc: "khổ qua", soluongcong: 1000, giatienmotcong: 320, createdat: new Date(), updatedat: new Date() },
            { tenthuoc: "la hán quả", soluongcong: 900, giatienmotcong: 500, createdat: new Date(), updatedat: new Date() },
            { tenthuoc: "thiên ma", soluongcong: 800, giatienmotcong: 950, createdat: new Date(), updatedat: new Date() },
            { tenthuoc: "địa liền", soluongcong: 700, giatienmotcong: 400, createdat: new Date(), updatedat: new Date() },
        ]);

        // ================== benhnhan ==================
        let benhNhanData = [];
        for (let i = 1; i <= 20; i++) {
            benhNhanData.push({
                hoten: `bệnh nhân ${i}`,
                tuoi: 20 + (i % 50),
                sodienthoai: `09000000${i.toString().padStart(2, "0")}`,
                tiensubenh: i % 3 === 0 ? "tiểu đường" : "chưa",
                createdat: new Date(),
                updatedat: new Date(),
            });
        }
        await queryInterface.bulkInsert("benhnhan", benhNhanData);

        // ================== toathuoc ==================
        let toaThuocData = [];
        for (let i = 1; i <= 20; i++) {
            toaThuocData.push({
                benhnhanid: i,
                ngaykadon: new Date(),
                createdat: new Date(),
                updatedat: new Date(),
            });
        }
        await queryInterface.bulkInsert("toathuoc", toaThuocData);

        // ================== chitiettoathuoc ==================
        let chiTietData = [];
        for (let i = 1; i <= 20; i++) {
            chiTietData.push({
                toaid: i,
                thuocid: i,
                soluong: Math.floor(Math.random() * 30) + 10,
                sothang: Math.floor(Math.random() * 5) + 1,
                chuy: i % 2 === 0 ? "uống sau bữa ăn" : "uống trước bữa ăn",
                luuydonthuoc: i % 2 === 0 ? "Lưu ý: Uống nhiều nước" : "Lưu ý: Không uống rượu",
                createdat: new Date(),
                updatedat: new Date(),
            });
        }
        await queryInterface.bulkInsert("chitiettoathuoc", chiTietData);

        // ================== thanhtoan ==================
        let thanhToanData = [];
        for (let i = 1; i <= 20; i++) {
            thanhToanData.push({
                toaid: i,
                tongtien: 100000 + i * 10000,
                createdat: new Date(),
                updatedat: new Date(),
            });
        }
        await queryInterface.bulkInsert("thanhtoan", thanhToanData);

        // ================== dichvu ==================
        await queryInterface.bulkInsert("dichvu", [
            { tendichvu: "Xét nghiệm máu", giadichvu: 150000, createdat: new Date(), updatedat: new Date() },
            { tendichvu: "Chụp X-quang", giadichvu: 200000, createdat: new Date(), updatedat: new Date() },
            { tendichvu: "Khám tổng quát", giadichvu: 100000, createdat: new Date(), updatedat: new Date() },
            { tendichvu: "Siêu âm", giadichvu: 180000, createdat: new Date(), updatedat: new Date() },
        ]);

        // ================== chitietdichvu ==================
        let chiTietDichVuData = [];
        for (let i = 1; i <= 20; i++) {
            chiTietDichVuData.push({
                toaid: i,
                dichvuid: (i % 4) + 1, // gán dịch vụ 1-4 cho từng đơn thuốc
                songay: Math.floor(Math.random() * 10) + 1,
                createdat: new Date(),
                updatedat: new Date(),
            });
        }
        await queryInterface.bulkInsert("chitietdichvu", chiTietDichVuData);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("thanhtoan", null, {});
        await queryInterface.bulkDelete("chitiettoathuoc", null, {});
        await queryInterface.bulkDelete("toathuoc", null, {});
        await queryInterface.bulkDelete("benhnhan", null, {});
        await queryInterface.bulkDelete("thuoc", null, {});
        await queryInterface.bulkDelete("chitietdichvu", null, {});
        await queryInterface.bulkDelete("dichvu", null, {});
    },
};
