const pool = require("../../db");

exports.getServices = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM dichvu ORDER BY dichvuid ASC");
        res.json({ data: result.rows });
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi lấy danh sách dịch vụ" });
    }
};

// Thêm dịch vụ mới
exports.createService = async (req, res) => {
    const { tendichvu, giadichvu, songay } = req.body;
    if (!tendichvu || !giadichvu || !songay) {
        return res.status(400).json({ error: "Thiếu thông tin dịch vụ" });
    }
    try {
        const result = await pool.query(
            "INSERT INTO dichvu (tendichvu, giadichvu, songay, createdat, updatedat) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *",
            [tendichvu, giadichvu, songay]
        );
        res.json({ data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi thêm dịch vụ" });
    }
};

