const pool = require("../../db");
const ThuocModel = {
    async getAll() {
        const result = await pool.query("SELECT * FROM Thuoc ORDER BY updatedat desc");
        return result.rows;
    },

    async getPagination(limit, offset, search) {
        let whereClause = "";
        let params = [];
        let countParams = [];
        if (search && search.trim() !== "") {
            whereClause = "WHERE LOWER(TenThuoc) LIKE $1";
            params.push(`%${search.toLowerCase()}%`);
            countParams.push(`%${search.toLowerCase()}%`);
        }
        // lấy tổng số bản ghi
        const totalResult = await pool.query(
            `SELECT COUNT(*) FROM Thuoc ${whereClause}`,
            countParams
        );
        const total = parseInt(totalResult.rows[0].count);

        // lấy dữ liệu phân trang
        let query = `SELECT * FROM Thuoc ${whereClause} ORDER BY updatedat desc LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);
        const dataResult = await pool.query(query, params);

        return { data: dataResult.rows, total };
    },

    async create({ tenthuoc, soluongcong, giatienmotcong }) {
        const result = await pool.query(
            "INSERT INTO Thuoc (TenThuoc, SoLuongCong, GiaTienMotCong, updatedat, createdat) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *",
            [tenthuoc, soluongcong, giatienmotcong]
        );
        return result.rows[0];
    },

    async update(id, { tenthuoc, soluongcong, giatienmotcong }) {
        const result = await pool.query(
            "UPDATE Thuoc SET TenThuoc=$1, SoLuongCong=$2, GiaTienMotCong=$3, updatedat=NOW() WHERE ThuocID=$4 RETURNING *",
            [tenthuoc, soluongcong, giatienmotcong, id]
        );
        return result.rows[0];
    },

    async delete(id) {
        const result = await pool.query(
            "DELETE FROM Thuoc WHERE ThuocID=$1 RETURNING *",
            [id]
        );
        return result.rows[0];
    },
};

module.exports = ThuocModel;