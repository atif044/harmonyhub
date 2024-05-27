const User = require("../../models/user/user.model");
const catchAsyncErrors = require("../../config/catchAsyncErrors");
const ErrorHandler = require("../../config/ErrorHandler");
const generateJwt = require("../../utils/generateJwt");
const { sendEmail } = require("../email-controller/email.controller");
const Organization=require("../../models/organization/organization.model")
const { uniqueToken } = require("../../utils/generateToken");
const Token = require("../../models/token/token.model");
const { hash, compare } = require("bcrypt");
exports.signupController = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, username, email, password, dateOfBirth } =
    req.body;
  try {
    let user = await User.find({ $or: [{ email }, { username }] });
    if (
      user.length === 2 ||
      (user[0]?.email === email && user[0]?.username === username)
    ) {
      return next(new ErrorHandler("Email and Username already exists", 400));
    }
    if (user[0]?.email === email) {
      return next(new ErrorHandler("Email already exists", 400));
    }
    if (user[0]?.username === username) {
      return next(new ErrorHandler("username already exists", 400));
    }
    let hashedPassword = await hash(password, 10);
    if (hashedPassword) {
      let USER = await User.create({
        firstName,
        lastName,
        email,
        username,
        password:hashedPassword,
        dateOfBirth,
      });
      await USER.save();
      const data = {
        user: {
          id: USER._id,
          username: USER.username,
        },
      };
      const authToken = generateJwt(data);
      res.cookie("harmony-hub", authToken, {
        secure: false,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      const emailVerificationToken = uniqueToken(5);
      const token = new Token({
         email: USER.email,
         token: emailVerificationToken,
         tokenType: "emailVerification",
         tokenExpiry: new Date(Date.now()), // 1 hour
       });
       await token.save();
       await sendEmail(
         USER.email,
         "Email Verification",
         `Your One Time Password(OTP) is ${emailVerificationToken}`
       );
       return res.status(201).json({
         status: "success",
         verified: USER.isVerified,
         message: [
           "Successfully signed up",
           "An email is sent to your account to verify your identity.",
         ],
         body: authToken,
       });
    }
    return next(new ErrorHandler("Error Hashing the password",400))
  } catch (error) {
   return next(
      new ErrorHandler(error.message, error.code || error.statusCode)
    );
   return
  } finally {
   req.body=null;
  }
});
exports.loginController = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({
      $or: [{ email: email }, { username: email }],
    });
    if (!user) {
      return next(new ErrorHandler("Invalid email/username or password", 404));
    }
    const isPasswordCorrect = await compare(password, user.password);
    if (!isPasswordCorrect) {
      return next(new ErrorHandler("Invalid email or password", 400));
    }
    if (user.deleted === true) {
      return next(
        new ErrorHandler(
          "Your Account is Suspended. Please Contact admin.",
          400
        )
      );
    }
    const data = {
      user: {
        id: user.id,
        username: user.username,
      },
    };
    const authToken = generateJwt(data);
    res.cookie("local-stories", authToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    return res.status(200).json({
      status: "success",
      message: "Logged in successfully",
      authToken,
      verified: user.isVerified,
      body: data.user,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.statusCode || error.code)
    );
  } finally {
    req.body = undefined;
  }
});

