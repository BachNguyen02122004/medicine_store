const { body, validationResult } = require("express-validator");
const { AppError } = require("./errorHandler");

// Common validation rules
const validateThuoc = [
  body("tenthuoc")
    .trim()
    .notEmpty()
    .withMessage("Tên thuốc không được để trống")
    .isLength({ min: 2, max: 100 })
    .withMessage("Tên thuốc phải có độ dài từ 2-100 ký tự"),

  body("soluongcong")
    .isInt({ min: 0 })
    .withMessage("Số lượng công phải là số nguyên dương"),

  body("giatienmotcong")
    .isFloat({ min: 0 })
    .withMessage("Giá tiền một công phải là số dương"),
];

const validateBenhNhan = [
  body("hoten")
    .trim()
    .notEmpty()
    .withMessage("Họ tên không được để trống")
    .isLength({ min: 2, max: 100 })
    .withMessage("Họ tên phải có độ dài từ 2-100 ký tự"),

  body("sodienthoai")
    .optional()
    .isMobilePhone("vi-VN")
    .withMessage("Số điện thoại không hợp lệ"),

  body("diachi")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Địa chỉ không được quá 200 ký tự"),

  body("email").optional().isEmail().withMessage("Email không hợp lệ"),
];

const validatePrescription = [
  body("benhNhanId").isInt({ min: 1 }).withMessage("ID bệnh nhân không hợp lệ"),

  body("ngaykadon").isISO8601().withMessage("Ngày kê đơn không hợp lệ"),

  body("thuocList")
    .isArray({ min: 1 })
    .withMessage("Danh sách thuốc phải là mảng và không được rỗng"),

  body("thuocList.*.thuocId")
    .isInt({ min: 1 })
    .withMessage("ID thuốc không hợp lệ"),

  body("thuocList.*.soluong")
    .isInt({ min: 1 })
    .withMessage("Số lượng thuốc phải là số nguyên dương"),
];

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return next(new AppError(errorMessages.join(". "), 400));
  }
  next();
};

module.exports = {
  validateThuoc,
  validateBenhNhan,
  validatePrescription,
  checkValidation,
};
