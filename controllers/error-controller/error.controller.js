const ErrorHandler = require("../../config/ErrorHandler");
module.exports = (err, req, res, next) => {
  err.statusCode = ((err.statusCode>=400&&err.statusCode<=429)||(err.statusCode>=500&&err.statusCode<=505))?err.statusCode : 500;
  err.message = err.message || "Internal Server Error";
  res.status(err.statusCode).json({
    status: "failed",
    message: err.message,
  });
};
