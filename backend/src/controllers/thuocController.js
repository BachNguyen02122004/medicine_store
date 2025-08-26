const ThuocModel = require("../models/thuocModel");

const thuocController = {
    async getAllThuocNoPaging(req, res) {
        try {
            const data = await ThuocModel.getAll();
            res.json({ data });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    async getAllThuoc(req, res) {
        try {
            let { page, limit, search } = req.query;
            page = parseInt(page) || 1;
            limit = parseInt(limit) || 10;
            const offset = (page - 1) * limit;
            const { data, total } = await ThuocModel.getPagination(limit, offset, search);
            res.json({
                data,
                totalPages: Math.ceil(total / limit),
                total,
                page,
                limit,
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async createThuoc(req, res) {
        try {
            const { tenthuoc, soluongcong, giatienmotcong } = req.body;
            const newThuoc = await ThuocModel.create({
                tenthuoc,
                soluongcong,
                giatienmotcong,
            });
            res.status(201).json(newThuoc);
        } catch (err) {
            console.error('Lỗi khi thêm thuốc:', err);
            res.status(500).json({ error: err.message });
        }
    },

    async updateThuoc(req, res) {
        try {
            const { id } = req.params;
            const { tenthuoc, soluongcong, giatienmotcong } = req.body;
            const updated = await ThuocModel.update(id, {
                tenthuoc,
                soluongcong,
                giatienmotcong,
            });
            res.json(updated);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async deleteThuoc(req, res) {
        try {
            const { id } = req.params;
            const result = await ThuocModel.delete(id);
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
};

module.exports = thuocController;
