const ThuocModel = require("../models/thuocModel");
const { catchAsync } = require("../utils/helpers");
const {
  sendSuccess,
  sendPaginatedResponse,
} = require("../utils/responseHelper");
const { AppError } = require("../middleware/errorHandler");

class ThuocController {
  static getAllThuoc = catchAsync(async (req, res) => {
    const { page, limit, offset } = req.pagination;
    const { search = "" } = req.query;

    const result = await ThuocModel.findWithPagination(limit, offset, search);

    sendPaginatedResponse(res, "Lấy danh sách thuốc thành công", result.data, {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    });
  });

  static getThuocById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const thuoc = await ThuocModel.findById(id);

    if (!thuoc) {
      throw new AppError("Thuốc không tồn tại", 404);
    }

    sendSuccess(res, "Lấy thông tin thuốc thành công", thuoc);
  });

  static createThuoc = catchAsync(async (req, res) => {
    const { tenthuoc, soluongcong, giatienmotcong } = req.body;

    const newThuoc = await ThuocModel.create({
      tenthuoc,
      soluongcong,
      giatienmotcong,
    });

    sendSuccess(res, "Tạo thuốc mới thành công", newThuoc, 201);
  });

  static updateThuoc = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { tenthuoc, soluongcong, giatienmotcong } = req.body;

    const updatedThuoc = await ThuocModel.update(id, {
      tenthuoc,
      soluongcong,
      giatienmotcong,
    });

    sendSuccess(res, "Cập nhật thuốc thành công", updatedThuoc);
  });

  static deleteThuoc = catchAsync(async (req, res) => {
    const { id } = req.params;

    await ThuocModel.delete(id);

    sendSuccess(res, "Xóa thuốc thành công");
  });
}

module.exports = ThuocController;
