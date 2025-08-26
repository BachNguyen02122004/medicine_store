const ActionLog = require('../models/actionLogModel');
const { Op } = require('sequelize');

const createActionLog = async (req, res) => {
    try {
        const { action, object, objectId, changes } = req.body;
        if (!action) return res.status(400).json({ error: 'Thiếu action' });
        await ActionLog.create({
            action,
            object: object || null,
            objectId: objectId || null,
            changes: changes || null,
            createdat: new Date(),
            updatedat: new Date(),
        });
        res.json({ success: true });
    } catch (err) {
        console.error('Lỗi khi ghi log:', err);
        res.status(500).json({ error: 'Lỗi khi ghi log' });
    }
};

const getActionLog = async (req, res) => {
    try {
        const result = await ActionLog.findAll({
            attributes: ['logid', 'action', 'object', 'objectId', 'changes', 'createdat', 'updatedat'],
            order: [['createdat', 'DESC']]
        });
        res.json(result);
    } catch (err) {
        console.error('Lỗi khi lấy log:', err);
        res.status(500).json({ error: 'Lỗi khi lấy log' });
    }
};

module.exports = {
    createActionLog,
    getActionLog
};