const { AppError } = require("../middleware/errorHandler");

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

const validateId = (req, res, next) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id))) {
    return next(new AppError("ID không hợp lệ", 400));
  }
  req.params.id = parseInt(id);
  next();
};

const validatePagination = (req, res, next) => {
  let { page, limit } = req.query;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  if (page < 1) page = 1;
  if (limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  req.pagination = {
    page,
    limit,
    offset: (page - 1) * limit,
  };

  next();
};

module.exports = {
  catchAsync,
  validateId,
  validatePagination,
};
