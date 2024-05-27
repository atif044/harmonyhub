const ErrorHandler = require("../config/ErrorHandler")
exports.checkIfLoggedIn=(req,res,next)=>{
    if(req.cookies['harmony-hub']||req.cookies['harmony-hub-university']||req.cookies['harmony-hub-volunteer']||req.cookies['harmony-hub-admin']){
        return next(new ErrorHandler("Already Logged in",400))
      }
      next();
}