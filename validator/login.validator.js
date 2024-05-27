const ErrorHandler = require("../config/ErrorHandler");
const { isValidEmail, isValidUsername, normalizeEmail } = require("./utils.validator");
const loginValidator = (req, res, next) => {
  if (req.body.email === "") {
    return next(new ErrorHandler("Email/username is a required Field", 400));
  }
  else if (req.body.password === "") {
    return next(new ErrorHandler("Password is a required Field", 400));
  }
  req.body.email=normalizeEmail(req.body.email)
  if (isValidEmail(req.body.email) || isValidUsername(req.body.email)) {
    return next();
  } else {
    return next(new ErrorHandler("Email/ username is not valid", 400));
  }
};
module.exports = loginValidator;