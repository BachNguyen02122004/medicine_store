const database = require("../config/database");
const { AppError } = require("../middleware/errorHandler");

class BenhNhanModel {
  static tableName = "benhnhan";

  static async findAll() {
    try {
      const query = `SELECT * FROM ${this.tableName} ORDER BY updatedat DESC`;
      const result = await database.query(query);
      return result.rows;
    } catch (error) {
      throw new AppError("Lỗi khi lấy danh sách bệnh nhân", 500);
    }
  }

  static async findWithPagination(limit, offset, search = "") {
    try {
      let whereClause = "";
      let params = [];
      let countParams = [];

      if (search && search.trim() !== "") {
        whereClause =
          "WHERE LOWER(hoten) LIKE $1 OR LOWER(sodienthoai) LIKE $1";
        const searchPattern = `%${search.toLowerCase()}%`;
        params.push(searchPattern);
        countParams.push(searchPattern);
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) FROM ${this.tableName} ${whereClause}`;
      const totalResult = await database.query(countQuery, countParams);
      const total = parseInt(totalResult.rows[0].count);

      // Get paginated data
      const dataQuery = `
                SELECT * FROM ${this.tableName} 
                ${whereClause} 
                ORDER BY updatedat DESC 
                LIMIT $${params.length + 1} OFFSET $${params.length + 2}
            `;
      params.push(limit, offset);
      const dataResult = await database.query(dataQuery, params);

      return {
        data: dataResult.rows,
        total,
      };
    } catch (error) {
      throw new AppError("Lỗi khi lấy danh sách bệnh nhân có phân trang", 500);
    }
  }

  static async findById(id) {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE benhnhanid = $1`;
      const result = await database.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new AppError("Lỗi khi tìm bệnh nhân theo ID", 500);
    }
  }

  static async create(data) {
    try {
      const { hoten, tuoi, sodienthoai, tiensubenh, diachi, email } = data;
      const query = `
                INSERT INTO ${this.tableName} 
                (hoten, tuoi, sodienthoai, tiensubenh, diachi, email, createdat, updatedat) 
                VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
                RETURNING *
            `;
      const result = await database.query(query, [
        hoten,
        tuoi || null,
        sodienthoai || null,
        tiensubenh || null,
        diachi || null,
        email || null,
      ]);
      return result.rows[0];
    } catch (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        throw new AppError("Số điện thoại hoặc email đã tồn tại", 409);
      }
      throw new AppError("Lỗi khi tạo bệnh nhân mới", 500);
    }
  }

  static async update(id, data) {
    try {
      const { hoten, tuoi, sodienthoai, tiensubenh, diachi, email } = data;
      const query = `
                UPDATE ${this.tableName} 
                SET hoten = $1, tuoi = $2, sodienthoai = $3, tiensubenh = $4, 
                    diachi = $5, email = $6, updatedat = NOW() 
                WHERE benhnhanid = $7 
                RETURNING *
            `;
      const result = await database.query(query, [
        hoten,
        tuoi || null,
        sodienthoai || null,
        tiensubenh || null,
        diachi || null,
        email || null,
        id,
      ]);

      if (result.rows.length === 0) {
        throw new AppError("Bệnh nhân không tồn tại", 404);
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.code === "23505") {
        throw new AppError("Số điện thoại hoặc email đã tồn tại", 409);
      }
      throw new AppError("Lỗi khi cập nhật bệnh nhân", 500);
    }
  }

  static async delete(id) {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE benhnhanid = $1 RETURNING *`;
      const result = await database.query(query, [id]);

      if (result.rows.length === 0) {
        throw new AppError("Bệnh nhân không tồn tại", 404);
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.code === "23503") {
        // Foreign key constraint violation
        throw new AppError("Không thể xóa bệnh nhân vì đang có đơn thuốc", 409);
      }
      throw new AppError("Lỗi khi xóa bệnh nhân", 500);
    }
  }
}

module.exports = BenhNhanModel;
