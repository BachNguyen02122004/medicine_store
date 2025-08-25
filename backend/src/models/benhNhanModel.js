const pool = require("../../db");

const BenhNhanModel = {
    async getAll(page = 1, limit = 10, query = "") {
        try {
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const offset = (pageNum - 1) * limitNum;
            let whereClause = "";
            let params = [];
            let countParams = [];
            let sqlQuery = "";


            if (query && typeof query === "string" && query.trim() !== "") {
                whereClause = "WHERE LOWER(hoten) LIKE $1 OR LOWER(sodienthoai) LIKE $1";
                const searchTerm = `%${query.trim().toLowerCase()}%`;
                params.push(searchTerm);
                countParams.push(searchTerm);
                sqlQuery = `SELECT * FROM benhnhan ${whereClause} ORDER BY updatedat DESC LIMIT $2 OFFSET $3`;
                params.push(limitNum, offset);
            } else {
                sqlQuery = `SELECT * FROM benhnhan ORDER BY updatedat DESC LIMIT $1 OFFSET $2`;
                params = [limitNum, offset];
            }


            const result = await pool.query(sqlQuery, params);

            const countQuery = `SELECT COUNT(*) as total FROM benhnhan ${whereClause}`;
            const totalResult = await pool.query(countQuery, countParams);
            const total = parseInt(totalResult.rows[0].total, 10);


            return { data: result.rows, total };
        } catch (error) {
            console.error("Error in getAll:", error);
            throw new Error("Không thể lấy danh sách bệnh nhân");
        }
    },

    async getById(id) {
        try {
            const result = await pool.query(
                "SELECT * FROM benhnhan WHERE benhnhanid = $1",
                [parseInt(id)]
            );
            if (result.rows.length === 0) {
                throw new Error("Bệnh nhân không tồn tại");
            }
            return result.rows[0];
        } catch (error) {
            console.error("Error in getById:", error);
            throw error;
        }
    },

    async create(benhNhan) {
        try {
            const { hoten, tuoi, sodienthoai, tiensubenh } = benhNhan;
            const result = await pool.query(
                "INSERT INTO benhnhan (hoten, tuoi, sodienthoai, tiensubenh, createdat, updatedat) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *",
                [hoten, tuoi || null, sodienthoai || null, tiensubenh || null]
            );

            return result.rows[0];
        } catch (error) {
            console.error("Error in create:", error);
            throw new Error("Không thể tạo bệnh nhân");
        }
    },

    async update(id, benhNhan) {
        try {
            const { hoten, tuoi, sodienthoai, tiensubenh } = benhNhan;
            const result = await pool.query(
                "UPDATE benhnhan SET hoten=$1, tuoi=$2, sodienthoai=$3, tiensubenh=$4, updatedat=NOW() WHERE benhnhanid=$5 RETURNING *",
                [hoten, tuoi, sodienthoai, tiensubenh || null, parseInt(id)]
            );
            if (result.rows.length === 0) {
                throw new Error("Bệnh nhân không tồn tại");
            }
            return result.rows[0];
        } catch (error) {
            console.error("Error in update:", error);
            throw error;
        }
    },

    async delete(id) {
        try {
            const result = await pool.query(
                "DELETE FROM benhnhan WHERE benhnhanid=$1 RETURNING *",
                [parseInt(id)]
            );
            if (result.rowCount === 0) {
                throw new Error("Bệnh nhân không tồn tại");
            }
            return { message: "Xóa bệnh nhân thành công", rowCount: result.rowCount };
        } catch (error) {
            console.error("Error in delete:", error);
            throw error;
        }
    },
};

module.exports = BenhNhanModel;