const ErrorHandler = require("../config/ErrorHandler");
const {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  normalizeEmail,
  isValidFirstName,
  isValidLastName
} = require("./utils.validator");

const validatorSignup = (req, res, next) => {
  req.body.email=normalizeEmail(req.body.email)
  const { firstName, lastName, username, email, password } = req.body;
  if (firstName === "") {
    return next(new ErrorHandler("First name is a Required Field", 400));
  } else if (!isValidFirstName(firstName)) {
    next(
      new ErrorHandler("First name must be alteast 2 character and max 50", 400)
    );
  }
  else if (lastName==="") {
    return next(
      new ErrorHandler("Last Name is a required field", 400)
    );
  } else if (!isValidLastName(lastName)) {
    return next(
      new ErrorHandler("Last Name must be alteast 2 character and max 50", 400)
    );
  }
  else if (username == "") {
    return next(new ErrorHandler("Username is a required Field", 400));
  }
   else if (!isValidUsername(username)) {
    return next(new ErrorHandler("Username must match the given pattern", 400));
  }
  else if (email === "") {
    return next(new ErrorHandler("Email is a required Field", 400));
  }
   else if (!isValidEmail(req.body.email)) {
    return next(new ErrorHandler("Email is not Valid", 400));
  }
  else if(password===""){
    return next (new ErrorHandler("Password is a required field",400))
  }
  else if (!isValidPassword(password)) {
    return next(new ErrorHandler("Password doesn't meet requirements", 400));
  }
  return next();
};
module.exports = validatorSignup;
