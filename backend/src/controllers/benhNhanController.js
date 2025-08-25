const BenhNhanModel = require("../models/benhNhanModel");

const benhNhanController = {
    async getAllBenhNhan(req, res) {
        try {
            const { page = 1, limit = 10, search = "" } = req.query;

            const result = await BenhNhanModel.getAll(page, limit, search);
            res.json({ data: result.data, total: result.total });
        } catch (err) {
            console.error("Lỗi khi lấy danh sách bệnh nhân:", err);
            res.status(500).json({ error: "Lỗi server: " + err.message });
        }
    },

    async getBenhNhanById(req, res) {
        try {
            const id = req.params.id;
            if (!id || isNaN(id)) {
                return res.status(400).json({ error: "ID không hợp lệ" });
            }
            const benhNhan = await BenhNhanModel.getById(id);
            if (!benhNhan) {
                return res.status(404).json({ error: "Bệnh nhân không tồn tại" });
            }
            res.json(benhNhan);
        } catch (err) {
            console.error("Lỗi khi lấy bệnh nhân:", err);
            res.status(500).json({ error: "Lỗi server: " + err.message });
        }
    },

    async createBenhNhan(req, res) {
        try {
            const benhNhan = req.body;
            if (!benhNhan.hoten) {
                return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
            }
            const newBenhNhan = await BenhNhanModel.create(benhNhan);
            res.status(201).json(newBenhNhan);
        } catch (err) {
            console.error("Lỗi khi tạo bệnh nhân:", err);
            res.status(500).json({ error: "Lỗi server: " + err.message });
        }
    },

    async updateBenhNhan(req, res) {
        try {
            const id = req.params.id;
            if (!id || isNaN(id)) {
                return res.status(400).json({ error: "ID không hợp lệ" });
            }
            const benhNhan = req.body;
            if (!benhNhan.hoten) {
                return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
            }
            const updatedBenhNhan = await BenhNhanModel.update(id, benhNhan);
            res.json(updatedBenhNhan);
        } catch (err) {
            console.error("Lỗi khi cập nhật bệnh nhân:", err);
            res.status(500).json({ error: "Lỗi server: " + err.message });
        }
    },

    async deleteBenhNhan(req, res) {
        try {
            const id = req.params.id;

            if (!id || isNaN(id)) {
                return res.status(400).json({ error: "ID không hợp lệ" });
            }
            const idInt = parseInt(id, 10);
            await BenhNhanModel.delete(idInt);
            res.json({ message: "Xóa bệnh nhân thành công" });
        } catch (err) {
            console.error("Lỗi khi xóa bệnh nhân:", err);
            res.status(500).json({ error: "Lỗi server: " + err.message });
        }
    },
};

module.exports = benhNhanController;