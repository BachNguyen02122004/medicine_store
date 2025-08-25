const BenhNhanModel = require("../models/benhNhanModel");
const { catchAsync } = require("../utils/helpers");
const {
  sendSuccess,
  sendPaginatedResponse,
} = require("../utils/responseHelper");
const { AppError } = require("../middleware/errorHandler");

class BenhNhanController {
  static getAllBenhNhan = catchAsync(async (req, res) => {
    const { page, limit, offset } = req.pagination;
    const { search = "" } = req.query;

    const result = await BenhNhanModel.findWithPagination(
      limit,
      offset,
      search
    );

    sendPaginatedResponse(
      res,
      "Lấy danh sách bệnh nhân thành công",
      result.data,
      {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      }
    );
  });

  static getBenhNhanById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const benhNhan = await BenhNhanModel.findById(id);

    if (!benhNhan) {
      throw new AppError("Bệnh nhân không tồn tại", 404);
    }

    sendSuccess(res, "Lấy thông tin bệnh nhân thành công", benhNhan);
  });

  static createBenhNhan = catchAsync(async (req, res) => {
    const benhNhanData = req.body;

    const newBenhNhan = await BenhNhanModel.create(benhNhanData);

    sendSuccess(res, "Tạo bệnh nhân mới thành công", newBenhNhan, 201);
  });

  static updateBenhNhan = catchAsync(async (req, res) => {
    const { id } = req.params;
    const benhNhanData = req.body;

    const updatedBenhNhan = await BenhNhanModel.update(id, benhNhanData);

    sendSuccess(res, "Cập nhật bệnh nhân thành công", updatedBenhNhan);
  });

  static deleteBenhNhan = catchAsync(async (req, res) => {
    const { id } = req.params;

    await BenhNhanModel.delete(id);

    sendSuccess(res, "Xóa bệnh nhân thành công");
  });
}

module.exports = BenhNhanController;
