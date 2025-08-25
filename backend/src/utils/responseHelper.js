const sendResponse = (res, statusCode, status, message, data = null) => {
  const response = {
    status,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

const sendSuccess = (res, message, data = null, statusCode = 200) => {
  sendResponse(res, statusCode, "success", message, data);
};

const sendError = (res, message, statusCode = 500, errors = null) => {
  const response = {
    status: "error",
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};

const sendPaginatedResponse = (res, message, data, pagination) => {
  res.status(200).json({
    status: "success",
    message,
    data,
    pagination: {
      currentPage: pagination.page,
      totalPages: pagination.totalPages,
      totalItems: pagination.total,
      itemsPerPage: pagination.limit,
    },
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginatedResponse,
};
