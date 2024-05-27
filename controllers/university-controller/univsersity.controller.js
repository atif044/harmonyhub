const ErrorHandler = require("../../config/ErrorHandler");
const catchAsyncErrors = require("../../config/catchAsyncErrors");
const University = require("../../models/university/university.model");
const generateJwtUniversity = require("../../utils/generateJwtUniversity");
const Token = require("../../models/token/token.model");
const bcrypt= require("bcrypt");
const {uniqueToken}=require("../../utils/generateToken");
const {sendEmail}=require('../email-controller/email.controller');
const { default: mongoose, Mongoose } = require("mongoose");
const Event=require('../../models/event/event.model');
const userModel = require("../../models/user/user.model");
const { uploadaImageToCloudinary } = require("../../utils/uploadToCloudinary");
const { sendMail } = require("../../config/emailConfig");
exports.createUniversityAccount = catchAsyncErrors(async (req, res, next) => {
  const { universityName,universityEmail,universityPassword,campus,country,city } =
    req.body;
  try {
    let universityAccount = await University.find({
      universityEmail,
    });
    if (universityAccount.length === 1) {
      return next(new ErrorHandler("Account Already Exists", 400));
    }

    let hashedPassword = await bcrypt.hash(universityPassword,10)
    if (hashedPassword) {
      let account = await University.create({
        universityEmail,
        universityPassword: hashedPassword,
        universityName,
        campus,
        country,
        city
      });
      await account.save();
      const data = {
        user: {
          id: account._id,
          email: account.universityEmail,
        },
      };
      const authToken = generateJwtUniversity(data);
      res.cookie("harmony-hub-university", authToken, {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      res.cookie("isVerified", account.isVerified, {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      const emailVerificationToken = uniqueToken(5);
      const token = new Token({
        email: account.universityEmail,
        token: emailVerificationToken,
        tokenType: "emailVerification",
        tokenExpiry: new Date(Date.now()), // 1 hour
      });
      await token.save();
      await sendEmail(
        account.universityEmail,
        "Email Verification",
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification - Organization</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
    }

    h1 {
      color: #333333;
    }

    p {
      color: #666666;
    }

    a {
      color: #007bff;
      text-decoration: none;
    }

    @media only screen and (max-width: 600px) {
      .container {
        padding: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Verify Your Email</h1>
    <p>Your verification cod is ${emailVerificationToken}</p>
  </div>
</body>
</html>`
      );
      return res.status(201).json({
        status: "success",
        verified: account.isVerified,
        message: [
          "Successfully signed up",
          "An email is sent to your account to verify your identity.",
        ],
        body: authToken,
      });
    }
    return next(new ErrorHandler("Error Hashing the password", 400));
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.code || error.statusCode)
    );
  } finally {
    req.body = null;
  }
});
exports.loginUniversityAccount = catchAsyncErrors(async (req, res, next) => {
  const { universityEmail, universityPassword } = req.body;
  try {
    const response = await University.find({ universityEmail });
    if (response.length === 0) {
      return next(new ErrorHandler("Email or Password is Incorrect", 400));
    }
    let passwordCompare = await bcrypt.compare(universityPassword, response[0].universityPassword);
    if (!passwordCompare) {
      return next(new ErrorHandler("Email or password is incorrect", 400));
    }
    const data = {
      user: {
        id: response[0]._id,
        email: response[0].universityEmail,
      },
    };
    const authToken = generateJwtUniversity(data);
    res.cookie("harmony-hub-university", authToken, {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
      res.cookie("isVerified", response[0].isVerified, {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      if(response[0]===false){
        const emailVerificationToken = uniqueToken(5);
      const token = new Token({
        email: response[0].universityEmail,
        token: emailVerificationToken,
        tokenType: "emailVerification",
        tokenExpiry: new Date(Date.now()), // 1 hour
      });
      await token.save();
      await sendEmail(
        response[0].universityEmail,
        "Email Verification",
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification - Organization</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
    }

    h1 {
      color: #333333;
    }

    p {
      color: #666666;
    }

    a {
      color: #007bff;
      text-decoration: none;
    }

    @media only screen and (max-width: 600px) {
      .container {
        padding: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Verify Your Email</h1>
    <p>Your verification cod is ${emailVerificationToken}</p>
  </div>
</body>
</html>`
      );
      }
    return res.status(200).json({
      status: "success",
      message: "Logged in successfully",
      body: authToken,
      isVerified:response[0].isVerified
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.code || error.statusCode)
    );
  } finally {
    req.body = null;
  }
});
exports.verifyEmailToken=catchAsyncErrors(async(req,res,next)=>{
  const { token } = req.params;
  const email=req.userData.user.email;
  try {
    const validToken = await Token.findOne({
      token: token,
      tokenType:"emailVerification",
      email:email
      
    });
    if (!validToken) {
      return next(new ErrorHandler("Invalid or Expired Token",400))
    }
    const universityEmail = validToken.email;
    let  university= await University.findOne({ universityEmail },{isVerified:false});
    if(!university){
      return next(new ErrorHandler("University Not Found",404))
    }
    university.isVerified=true;
    let saved=await university.save();
    if(!saved){
      return next("Error Verifying your account. Please try again later",400);
    }
    await Token.findByIdAndDelete(validToken._id);
    res.cookie("isVerified", true, {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    return res
      .status(200)
      .json({ status: "success", message: "Email Verified Successful",body:"true" });
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode))
  }
});
exports.resendOTP=catchAsyncErrors(async(req,res,next)=>{
  const userId=req.userData.user.id;
  try {
    let user=await University.findById(userId).select("universityEmail").select("isVerified");
    if(!user){
      return next(new ErrorHandler("UNiversity Not Found",400));
    }
    if(user.isVerified===true){
      return next(new ErrorHandler("Already Verified",400));
    }
      let emailVerificationToken=uniqueToken(5);
      await Token.findOneAndDelete({email:user.universityEmail})
      let token= new Token({
        email:user.universityEmail,
        token:emailVerificationToken,
        tokenType:"emailVerification",
        tokenExpiry:Date.now()
      })
      await token.save()
      await sendEmail(user.universityEmail,"Email Verification",`Your OTP is:${emailVerificationToken}`)
      return res.status(200).json({status:"success",message:"A Email has send to you. Please verify Email"})    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode))

  }
});

exports.getAllUniversities=catchAsyncErrors(async(req,res,next)=>{
  try {
    const universities=await University.find().select("universityName").select('city').select("country").select("_id");
    return res.json(universities);
    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode))

  }
});
exports.getAllPendingEvents=catchAsyncErrors(async(req,res,next)=>{
  let userId=req.userData.user.id;
  try {
    let UniversityEvents=await University.findById(userId).populate('pendingCollaborateEvents');
    return res.status(200).json({status:"success",message:"All Pending Events",body:UniversityEvents});

    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode))

  }
});

exports.eventDetails=catchAsyncErrors(async(req,res,next)=>{
  const id = new mongoose.Types.ObjectId(req.params.id);
const  univId=new mongoose.Types.ObjectId(req.userData.user.id);
  try {
    let event=await Event.findOne({_id:id,universityId:univId}).populate('organizationId');
    return res.status(200).json({status:"success",body:event});
    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));

  }
});
exports.approveEvent=catchAsyncErrors(async(req,res,next)=>{
  const id=req.params.id;
  const uniId=req.userData.user.id;
  try {
    let university=await University.findOne({_id:uniId}).populate("studentsList");
    const emails=[]
    university?.studentsList?.map((val)=>{
        emails.push(val.email.trim())
    })
    if(university.currentCollaboratedEvents.includes(id)){
      return next(new ErrorHandler("You Have Already Approved this event",400));
    }
    if(!university.pendingCollaborateEvents.includes(id)){
      return next(new ErrorHandler("You are not allowed for this event",400));
    }
    let index = university.pendingCollaborateEvents.indexOf(id);
    let event=await Event.findById(id)
    emails.length >0 && await sendEmail(emails,"URGENT!!",
    `Good News Students|\n We are collaborating with this event ${event.EventName} helding at ${event.eventLocationName} if you want to join visit the university events on your volunteer portal.`)
// If the value is found, pop it and push it into the destination array
if (index !== -1) {
    let poppedValue = university.pendingCollaborateEvents.splice(index, 1)[0];
    university.currentCollaboratedEvents.push(poppedValue);
}
university.save();
return res.status(200).json({status:"success",message:"Event Collaborated"});
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));

  }
});
exports.rejectTheEventCollab=catchAsyncErrors(async(req,res,next)=>{
  let id=req.userData.user.id;
  let eventId=req.params.id;
  try {
    let check=await Event.findById(eventId);
    if(check.eventStatus!=="upcoming"){
      return next(new ErrorHandler("Event has already started or ended yet",400))
    }
    let uni=await University.findByIdAndUpdate(id,{
      $pull: { currentCollaboratedEvents: eventId },
      $pull: { pendingCollaboratedEvents: eventId } 
    })

    let event=await Event.findByIdAndUpdate(eventId,
      {
        universityId:null
      }
    )
    return res.status(200).json({
      status:"success",
      message:"successfully rejected"
    })

    
  } catch (error) {
       return next(new ErrorHandler(error.message, error.code || error.statusCode));
 
  }
})
exports.getAllCollaboratedEvents=catchAsyncErrors(async(req,res,next)=>{
  let userId=req.userData.user.id;
  try {
    let UniversityEvents=await University.findById(userId).populate('currentCollaboratedEvents').populate('pastCollaboratedEvents');
    return res.status(200).json({status:"success",message:"All collaborated Events",body:UniversityEvents});
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode))

  }
});
exports.getAllApprovedAndUnApprovedStudents=catchAsyncErrors(async(req,res,next)=>{
  let id=req.userData.user.id;
  try {
    let university=await University.findById(id).select('-universityPassword').populate("studentsList").populate("pendingStudentList").populate("rejectedStudentList");
    return res.status(200).json({status:"success",accepted:university.studentsList,pending:university.pendingStudentList,rejected:university.rejectedStudentList})
    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});
exports.getUserProfile=catchAsyncErrors(async(req,res,next)=>{
  const id=req.params.id;
  try {
    let user=await userModel.findOne({_id:id}).select("-password").populate("universityId");
    if(!user){
      return next(new ErrorHandler("No Such User Found",400));
    }
    return res.status(200).json({
      status:"success",
      body:user
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});
exports.approveTheStudent=catchAsyncErrors(async(req,res,next)=>{
  let id=req.params.id;
  try {
    let student=await userModel.findById(id).select("-password");
    if(!student){
      return next(new ErrorHandler("No Account Exist",400));
    }
    let university=await University.findById(student?.universityId).select("-universityPassword");
    if(!university){
      return next(new ErrorHandler("The University Does Not Exists",400));
    }
    if(university?.studentsList.includes(student._id)){
      return next(new ErrorHandler("Already Approved",400));
    }
    if(!university?.pendingStudentList.includes(student._id)){
      return next(new ErrorHandler("This User has not requested",400));
    }
    await University.updateOne({_id:student?.universityId},{
      $push: { ["studentsList"]: student._id },
     $pull: { pendingStudentList: student._id }
     })
    return res.status(200).json({
      status:"success",
      message:"User has been Approved"
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
})
exports.rejectTheStudent=catchAsyncErrors(async(req,res,next)=>{
  let id=req.params.id;
  try {
    let student=await userModel.findById(id).select("-password");
    if(!student){
      return next(new ErrorHandler("No Account Exist",400));
    }
    let university=await University.findById(student?.universityId).select("-universityPassword");
    if(!university){
      return next(new ErrorHandler("The University Does Not Exists",400));
    }
    if(university?.rejectedStudentList.includes(student._id)){
      return next(new ErrorHandler("Already Rejected",400));
    }
    if(!university?.pendingStudentList.includes(student._id)){
      return next(new ErrorHandler("This User has not requested",400));
    }
    await University.updateOne({_id:student?.universityId},{
      $push: { ["rejectedStudentList"]: student._id },
     $pull: { pendingStudentList: student._id }
     })
     student.universityId=null;
     await student.save()
    return res.status(200).json({
      status:"success",
      message:"User has been rejected"
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});
exports.approveToReject=catchAsyncErrors(async(req,res,next)=>{
  let id=req.params.id;
  try {
    let student=await userModel.findById(id).select("-password");
    if(!student){
      return next(new ErrorHandler("No Account Exist",400));
    }
    let university=await University.findById(student?.universityId).select("-universityPassword");
    if(!university){
      return next(new ErrorHandler("The University Does Not Exists",400));
    }
    if(university?.rejectedStudentList.includes(student._id)){
      return next(new ErrorHandler("Already Rejected",400));
    }
    if(!university?.studentsList.includes(student._id)){
      return next(new ErrorHandler("This User is not approved yet",400));
    }
    await University.updateOne({_id:student?.universityId},{
      $push: { ["rejectedStudentList"]: student._id },
     $pull: { studentsList: student._id }
     })
     student.universityId=null;
     await student.save()
    return res.status(200).json({
      status:"success",
      message:"User has been rejected"
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));    
  }
});
exports.rejectToApprove=catchAsyncErrors(async(req,res,next)=>{
  let id=req.params.id;
  try {
    let student=await userModel.findById(id).select("-password");
    if(!student){
      return next(new ErrorHandler("No Account Exist",400));
    }
    let university=await University.findOne({
      rejectedStudentList: { $in: [student._id]    }
    }).select("-universityPassword");
    if(!university){
      return next(new ErrorHandler("The University Does Not Exists",400));
    }
    if(university?.studentsList?.includes(student._id)){
      return next(new ErrorHandler("Already Approved",400));
    }
    if(!university?.rejectedStudentList?.includes(student._id)){
      return next(new ErrorHandler("This User is not rejected yet",400));
    }
    await University.updateOne({_id:university._id},{
      $push: { ["studentsList"]: student._id },
     $pull: { rejectedStudentList: student._id }
     })
     student.universityId=university._id;
     await student.save()
    return res.status(200).json({
      status:"success",
      message:"User has been approved"
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));    
  }
});

exports.getMyProfile=catchAsyncErrors(async(req,res,next)=>{
  let id=req.userData.user.id;
  try {
    let response=await University.findById(id).select('-universityPassword').populate('pastCollaboratedEvents').populate('currentCollaboratedEvents').populate('studentsList');
    if(!response){
      return next(new ErrorHandler("No University Found",400));
    }
    return res.status(200).json({
      status:"success",
      body:response
    })
    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});
exports.getMyPublicProfile=catchAsyncErrors(async(req,res,next)=>{
  let id=req.params.id;
  try {
    let response=await University.findById(id).select('-universityPassword').populate('pastCollaboratedEvents').populate('currentCollaboratedEvents').populate('studentsList');
    if(!response){
      return next(new ErrorHandler("No University Found",400));
    }
    return res.status(200).json({
      status:"success",
      body:response
    })
    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});

exports.addBio=catchAsyncErrors(async(req,res,next)=>{
  let id=req.userData.user.id;
  let about=req.body.about;
  try {
    let response=await University.findById(id);
    response.universityDescription=about;
   await response.save();
   res.status(200).json({
    status:"success",
    message:"Bio Added Successfully"
   })

    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});

exports.addProfilePic=catchAsyncErrors(async(req,res,next)=>{
  let id=req.userData.user.id
  try {
    if(!req.file){
      return next(new ErrorHandler("No Image Attached",400));
    }
    let data=await uploadaImageToCloudinary(req.file.buffer);
    let update=await University.findByIdAndUpdate(id,{
      profilePic:data.secure_url
    })
    return res.status(200).json({
      status:"success",
      message:"Profile Pic updated successfully"
    })
    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});

exports.getAllStudents=catchAsyncErrors(async(req,res,next)=>{
  let id=req.userData.user.id;
  try {
    let response=await University.findById(id).populate('studentsList',['_id','fullName','email','cspHours',"enrollmentNo"])
    return res.status(200).json({status:"success",body:response});
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});


