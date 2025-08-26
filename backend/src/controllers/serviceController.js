const DichVu = require('../models/dichvuModel');
const { Op } = require('sequelize');

exports.getAllServicesNoPaging = async (req, res) => {
    try {
        const services = await DichVu.findAll();
        res.json({ data: services });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllServices = async (req, res) => {
    try {
        const { search, page = 1, pageSize = 10 } = req.query;
        let where = {};
        if (search) {
            where = {
                [Op.or]: [
                    { tendichvu: { [Op.like]: `%${search}%` } },
                    { tendichvu: { [Op.like]: `%${search.toLowerCase()}%` } },
                    { tendichvu: { [Op.like]: `%${search.toUpperCase()}%` } }
                ]
            };
        }
        const offset = (parseInt(page) - 1) * parseInt(pageSize);
        const limit = parseInt(pageSize);
        const { rows, count } = await DichVu.findAndCountAll({
            where,
            order: [['updatedat', 'DESC']],
            offset,
            limit
        });
        res.json({
            data: rows,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lấy dịch vụ theo id
exports.getServiceById = async (req, res) => {
    try {
        const service = await DichVu.findByPk(req.params.id);
        if (!service) return res.status(404).json({ error: 'Không tìm thấy dịch vụ' });
        res.json(service);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createService = async (req, res) => {
    try {
        const { tendichvu, giadichvu } = req.body;
        const newService = await DichVu.create({ tendichvu, giadichvu, createdat: new Date(), updatedat: new Date() });
        res.status(201).json(newService);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log(err);
    }
};

// Cập nhật dịch vụ
exports.updateService = async (req, res) => {
    try {
        const { tendichvu, giadichvu } = req.body;
        const service = await DichVu.findByPk(req.params.id);
        if (!service) return res.status(404).json({ error: 'Không tìm thấy dịch vụ' });
        await service.update({ tendichvu, giadichvu, updatedat: new Date() });
        res.json(service);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteService = async (req, res) => {
    try {
        console.log('Xóa dịch vụ, req.params:', req.params);
        const service = await DichVu.findByPk(req.params.id);
        console.log('Kết quả tìm dịch vụ:', service);
        if (!service) {
            console.log('Không tìm thấy dịch vụ với id:', req.params.id);
            return res.status(404).json({ error: 'Không tìm thấy dịch vụ' });
        }
        await service.destroy();
        console.log('Đã xóa dịch vụ với id:', req.params.id);
        res.json({ message: 'Đã xóa dịch vụ' });
    } catch (err) {
        console.error('Lỗi khi xóa dịch vụ:', err);
        res.status(500).json({ error: err.message });
    }
};


