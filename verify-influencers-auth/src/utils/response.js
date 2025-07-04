exports.successResponse = (res, message, data = {}, status = 200) => {
  res.status(status).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

exports.errorResponse = (res, message, status = 400) => {
  res.status(status).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
  });
};
