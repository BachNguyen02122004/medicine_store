const database = require("../config/database");
const { AppError } = require("../middleware/errorHandler");

class ThuocModel {
  static tableName = "Thuoc";

  static async findAll() {
    try {
      const query = `SELECT * FROM ${this.tableName} ORDER BY updatedat DESC`;
      const result = await database.query(query);
      return result.rows;
    } catch (error) {
      throw new AppError("Lỗi khi lấy danh sách thuốc", 500);
    }
  }

  static async findWithPagination(limit, offset, search = "") {
    try {
      let whereClause = "";
      let params = [];
      let countParams = [];

      if (search && search.trim() !== "") {
        whereClause = "WHERE LOWER(TenThuoc) LIKE $1";
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
      throw new AppError("Lỗi khi lấy danh sách thuốc có phân trang", 500);
    }
  }

  static async findById(id) {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE ThuocID = $1`;
      const result = await database.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new AppError("Lỗi khi tìm thuốc theo ID", 500);
    }
  }

  static async create(data) {
    try {
      const { tenthuoc, soluongcong, giatienmotcong } = data;
      const query = `
                INSERT INTO ${this.tableName} 
                (TenThuoc, SoLuongCong, GiaTienMotCong, updatedat, createdat) 
                VALUES ($1, $2, $3, NOW(), NOW()) 
                RETURNING *
            `;
      const result = await database.query(query, [
        tenthuoc,
        soluongcong,
        giatienmotcong,
      ]);
      return result.rows[0];
    } catch (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        throw new AppError("Tên thuốc đã tồn tại", 409);
      }
      throw new AppError("Lỗi khi tạo thuốc mới", 500);
    }
  }

  static async update(id, data) {
    try {
      const { tenthuoc, soluongcong, giatienmotcong } = data;
      const query = `
                UPDATE ${this.tableName} 
                SET TenThuoc = $1, SoLuongCong = $2, GiaTienMotCong = $3, updatedat = NOW() 
                WHERE ThuocID = $4 
                RETURNING *
            `;
      const result = await database.query(query, [
        tenthuoc,
        soluongcong,
        giatienmotcong,
        id,
      ]);

      if (result.rows.length === 0) {
        throw new AppError("Thuốc không tồn tại", 404);
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.code === "23505") {
        throw new AppError("Tên thuốc đã tồn tại", 409);
      }
      throw new AppError("Lỗi khi cập nhật thuốc", 500);
    }
  }

  static async delete(id) {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE ThuocID = $1 RETURNING *`;
      const result = await database.query(query, [id]);

      if (result.rows.length === 0) {
        throw new AppError("Thuốc không tồn tại", 404);
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.code === "23503") {
        // Foreign key constraint violation
        throw new AppError("Không thể xóa thuốc vì đang được sử dụng", 409);
      }
      throw new AppError("Lỗi khi xóa thuốc", 500);
    }
  }
}

module.exports = ThuocModel;
