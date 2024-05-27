const ErrorHandler = require('../../config/ErrorHandler');
const catchAsyncErrors = require('../../config/catchAsyncErrors');
const Event = require('../../models/event/event.model');
const Token=require('../../models/token/token.model');
const User = require('../../models/user/user.model');
const { uniqueToken } = require('../../utils/generateToken');
const {sendEmail}=require('../email-controller/email.controller');
const bcrypt=require("bcrypt");
const generateJwt=require('../../utils/generateJwt');
const { uploadaImageToCloudinary } = require('../../utils/uploadToCloudinary');
const { default: mongoose } = require('mongoose');
const Attendance=require("../../models/attendance/attendance.model");
const Request=require("../../models/request-certificate/request.certificate.model");
const University=require('../../models/university/university.model');
const {calculateDistance}=require('../../utils/eventsByLocation');
const ReviewEvent=require('../../models/review/review.event.model');
const organizationModel = require('../../models/organization/organization.model');
const reviewVolunteer=require('../../models/review/review.volunteer.model')
exports.createUserAccount=catchAsyncErrors(async(req,res,next)=>{
  try {
    const {email,password,gender,fullName,country,city,universityId,dateOfBirth,enrollmentNo}=req.body;
    let response= await User.findOne({email:email});    
    if(response){
      return next(new ErrorHandler("An Account with this email already exists",400));
    }
     let profilePic=await uploadaImageToCloudinary(req.files[0].buffer);
     let cnicFront=await uploadaImageToCloudinary(req.files[2].buffer);
     let cnicBack=await uploadaImageToCloudinary(req.files[1].buffer);
     let studentCard=null
     req.files[3]?.buffer  && (studentCard=await uploadaImageToCloudinary(req.files[3]?.buffer))
    let hashedPassword=await bcrypt.hash(password,10);
    if(hashedPassword){
      const body=req.body;

      let account=await User.create(
        {
          profilePic:profilePic.secure_url,
          cnicBack:cnicBack.secure_url,
          cnicFront:cnicFront.secure_url,
          studentCardPic:studentCard?.secure_url||"",
          password:hashedPassword,
          enrollmentNo:enrollmentNo||"",
          email,
          gender:gender,
          fullName,country,city,
          universityId:universityId||null,
          dateOfBirth
        }
      )
    await account.save();
    const data = {
      user: {
        id: account._id,
        email: account.email,
      },
    };
    let authToken=generateJwt(data);
    if(universityId){
      let uniId=await University.findByIdAndUpdate({_id:universityId},{ $push: { ["pendingStudentList"]: account._id }});
    }
    res.cookie("harmony-hub-volunteer", authToken, {
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
      email: account.email,
      token: emailVerificationToken,
      tokenType: "emailVerification",
      tokenExpiry: new Date(Date.now()), // 1 hour
    });
    await token.save();
    await sendEmail(
      account.email,
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
    return next(new ErrorHandler(error.message, error.code || error.statusCode))
  }
});
exports.verifyEmailToken=catchAsyncErrors(async(req,res,next)=>{
    const { token } = req.params;
    try {
      const validToken = await Token.findOne({
        token: token,
        tokenType:"emailVerification"
      });
      if (!validToken) {
        return next(new ErrorHandler("Invalid or Expired Token",400))
      }
      const email = validToken.email;
      let user = await User.findOne({ email },{isVerified:false});
      if(!user){
        return next(new ErrorHandler("User Not Found",404))
      }
      user.isVerified=true;
      let saved=await user.save();
      if(!saved){
        return next("Error Verifying your account. Please try again later",400)
      }
      await Token.findByIdAndDelete(validToken._id);
      res.cookie("isVerified", true, {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      return res
        .status(200)
        .json({ status: "success", message: "Email Verified Successful" });
    } catch (error) {
      return next(new ErrorHandler(error.message, error.code || error.statusCode))
    }
  });
exports.resendOTP=catchAsyncErrors(async(req,res,next)=>{
    const userId=req.userData.user.id;
    try {
      let user=await User.findById(userId).select("email").select("isVerified");
      if(!user){
        return next(new ErrorHandler("User Not Found",400));
      }
      if(user.isVerified===true){
        return next(new ErrorHandler("Already Verified",400));
      }
        let emailVerificationToken=uniqueToken(5);
        await Token.findOneAndDelete({email:user.email})
        let token= new Token({
          email:user.email,
          token:emailVerificationToken,
          tokenType:"emailVerifcation",
          tokenExpiry:Date.now()
        })
        await token.save()
        await sendEmail(user.email,"Email Verification",`Your OTP is:${emailVerificationToken}`)
        return res.status(200).json({status:"success",message:"A Email has send to you. Please verify Email"})
  
      
    } catch (error) {
      return next(new ErrorHandler(error.message, error.code || error.statusCode))
  
    }
  });
  exports.loginUserAccount=catchAsyncErrors(async(req,res,next)=>{
    const {email,password}=req.body;
    try {
      let response=await User.findOne({email});
      if(!response){
        return next(new ErrorHandler("Email or Password is incorrect",400));
      }
      let passwordCompare = await bcrypt.compare(password, response.password);
    if (!passwordCompare) {
      return next(new ErrorHandler("Email or password is incorrect", 400));
    }
    const data = {
      user: {
        id: response._id,
        email: response.email,
      },
    };
    const authToken = generateJwt(data);
    res.cookie("harmony-hub-volunteer", authToken, {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
      res.cookie("isVerified", response.isVerified, {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      if(response.isVerified===false){
        const emailVerificationToken = uniqueToken(5);
      const token = new Token({
        email: response.email,
        token: emailVerificationToken,
        tokenType: "emailVerification",
        tokenExpiry: new Date(Date.now()), // 1 hour
      });
      await token.save();
      await sendEmail(
        response.email,
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
      isVerified:response.isVerified
    });
    } catch (error) {
      return next(new ErrorHandler(error.message, error.code || error.statusCode))

    }
  });
  exports.findAllEventsInCountry=catchAsyncErrors(async(req,res,next)=>{
    const id =new mongoose.Types.ObjectId(req.userData.user.id);
    const today = new Date();
today.setHours(0, 0, 0, 0);
    try {
        let user=await User.findById(id);
        let events = await Event.find({
          country: user.country,
          eventStatus:"upcoming",
          eventStartDate: { $gte: today }, // Filter for events starting from today or in the future
          $nor: [
            { VolunteersIdApplied: user._id },
            { VolunteersIdAppliedRequested: user._id },
            { VolunteersIdAppliedRejected: user._id }
          ]
        })
        .populate("universityId")
        .populate("organizationId");
        // let events=await Event.find({country:user.country}).populate("universityId").populate("organizationId");
        return res.status(200).json({
          status:"success",
          body:events
        })
    } catch (error) {
      return next(new ErrorHandler(error.message, error.code || error.statusCode))
    }
  });
  exports.eventDetails=catchAsyncErrors(async(req,res,next)=>{
   const id =new mongoose.Types.ObjectId(req.params.id);
    try {
      let event=await Event.findById(id).populate("organizationId").populate("universityId");
      if(!event){
        return next(new ErrorHandler("Event with Such id doesnot exit"))
      }
      return res.status(200).json({
        status:"success",
        body:event
      })
    } catch (error) {
      return next(new ErrorHandler(error.message, error.code || error.statusCode))
    }
  });
  exports.joinEvent=catchAsyncErrors(async(req,res,next)=>{
    const id =new mongoose.Types.ObjectId(req.body.id);
    let userId= new mongoose.Types.ObjectId(req.userData.user.id);
    try {
      let event=await Event.findById(id);
      if(!event){
        return next(new ErrorHandler("Event with Such id doesnot exit"))
      }
      const date=new Date();
      date.setHours(0, 0, 0, 0);
      if(date>event.eventStartDate){
        return next(new ErrorHandler("Event has started! You can't join this",400));
      }
      if(event.VolunteersIdAppliedRequested.includes(userId)||event.VolunteersIdApplied.includes(userId)){
        return next(new ErrorHandler("You have already applied for this"));
      }
      if(event.VolunteersIdAppliedRejected.includes(userId)){
        return next(new ErrorHandler("You have been already rejected from this event",400))
      }
      if(event.VolunteersIdApplied.length===event.VolunteersRequired){
        return next(new ErrorHandler("Sorry! The slots have been filled :(",400));
      }
      await User.updateOne({_id:userId}, { $push: { ["eventAppliedForRequested"]: event._id }, });
      await Event.updateOne({_id:event._id},{ $push: { ["VolunteersIdAppliedRequested"]: userId }, })
      return res.status(200).json({
        status:"success",
        message:"Your Approval for this Event is Pending"
      })
    } catch (error) {
      return next(new ErrorHandler(error.message, error.code || error.statusCode))
    }
  });
  exports.fetchMyAppliedEventsPending=catchAsyncErrors(async(req,res,next)=>{
    let id=req.userData.user.id;
    try {
      let user=await User.findById(id).select("-password").populate({
        path: 'eventAppliedForRequested',
        match: { eventStatus: 'upcoming' }});
      return res.status(200).json({
        status:"success",
        pending:user.eventAppliedForRequested.length>0?user.eventAppliedForRequested:[],
      })
    } catch (error) {
      return next(new ErrorHandler(error.message, error.code || error.statusCode))
    }
  });
  exports.fetchMyAppliedEventsAccepted=catchAsyncErrors(async(req,res,next)=>{
    let id=req.userData.user.id;
    try {
      let user=await User.findById(id).select("-password").populate("eventAppliedFor");
      return res.status(200).json({
        status:"success",
        accepted:user.eventAppliedFor.length>0?user.eventAppliedFor:[],
      })
    } catch (error) {
      return next(new ErrorHandler(error.message, error.code || error.statusCode))
    }
  });
  exports.getMyAttendanceForParticularEvent=catchAsyncErrors(async(req,res,next)=>{
    const id=req.userData.user.id;
    let eventId=req.params.id;
    try {
      let email=await User.findById(id)
      let attendance=await Attendance.find({
        users: { $elemMatch: { user: id } },
        event:eventId
      });
      if(!attendance){
        return res.status(200).json({status:"success",body:"0"});
      }
      let presentCount = 0;
      let absentCount = 0;
    attendance.forEach(record => {
  // Iterate over users array of each record
        record.users.forEach(user => {
        if (user.user==id &&user.status == 'p') {
            ++presentCount;
          }  
         if (user.user==id &&user.status == 'a') {
            ++absentCount;
            }
  });
});
  let attendancePercentage=(presentCount/(presentCount+absentCount))*100.0;
  return res.status(200).json({status:"success",body:`${attendancePercentage} %`,email:email.email});
    } catch (error) {
      return next(new ErrorHandler(error.message, error.code || error.statusCode))
    }
  });
  exports.requestForCertificate=catchAsyncErrors(async(req,res,next)=>{
    let id =req.userData.user.id;
    let eventId=req.params.id;
    try {
      let event=await Event.findById(eventId);
      if(!event){
        return next(new ErrorHandler("The event with this id doesnt exist",400));
      }
      if(!event.VolunteersIdApplied.includes(id)){
        return next(new ErrorHandler("You were not a part of this event",400))
      }
      if(event.eventStatus!="ended"){
        return next(new ErrorHandler("The Event is not ended yet",400))
      }
      let attendance=await Attendance.find({
        users: { $elemMatch: { user: id } },
        event:eventId
      });
      let presentCount = 0;
      let absentCount = 0;
    attendance.forEach(record => {
        record.users.forEach(user => {
        if (user.user==id &&user.status == 'p') {
            ++presentCount;
          }  
         if (user.user==id &&user.status == 'a') {
            ++absentCount;
            }
          
  });
});
  let attendancePercentage=(presentCount/(presentCount+absentCount))*100.0;
  if(attendancePercentage<75.0){
    return next(new ErrorHandler("Your Attendance is short you can't request the certificate",400));
  }
  let result=await Request.find({
      userId:id,
      eventId:eventId
  })
  if(result.length==1){
    return next(new ErrorHandler("You have already requested",400));
  }
  let creation=new Request(
    {
      userId:id,
      eventId:eventId
    }
  )
  await creation.save();
  return res.status(200).json({
    status:"success",
    message:"Your Request has been successfully recieved"
  });      
    } catch (error) {
      return next(new ErrorHandler(error.message, error.code || error.statusCode))
    }
  });
  exports.checkIfRequested=catchAsyncErrors(async(req,res,next)=>{
    let id=req.params.id;
    let userId=req.userData.user.id;
    try {
      let response=await Request.find(
        {
          userId:userId,
          eventId:id
        }
      );
      if(response.length===0){
       return res.status(200).json({
          status:"success",
          body:false
        })
      }
     return res.status(200).json({
        status:"success",
        body:true
      })
      
    } catch (error) {
      return next(new ErrorHandler(error.message, error.code || error.statusCode));
    }
  });
  exports.getMyProfileDetails=catchAsyncErrors(async(req,res,next)=>{
    const id=req.userData.user.id;
    try {
      let user=await User.findById(id).select("-password").populate("eventAppliedFor");
      if(user.universityId){
        let universityStudent=await University.findById(user.universityId).select("-universityPassword")
        if(universityStudent?.studentsList?.includes(id)){
          return res.status(200).json({status:"success",body:user,university:universityStudent});
        }
      }
      return res.status(200).json({status:"success",body:user,university:null});
      
    } catch (error) {
      return next(new ErrorHandler(error.message, error.code || error.statusCode));
    }
  })
  exports.getUserProfileDetails=catchAsyncErrors(async(req,res,next)=>{
    const id=req.params.id;
    try {
      let user=await User.findById(id).select("-password").populate("eventAppliedFor");
      if(user.universityId){
        let universityStudent=await University.findById(user.universityId).select("-universityPassword")
        if(universityStudent.studentsList.includes(id)){
          return res.status(200).json({status:"success",body:user,university:universityStudent});
        }
      }
      return res.status(200).json({status:"success",body:user,university:null});
      
    } catch (error) {
      return next(new ErrorHandler(error.message, error.code || error.statusCode));
    }
  })

  exports.addBio=catchAsyncErrors(async(req,res,next)=>{
    let id=req.userData.user.id;
    let about=req.body.about;
    try {
      let response=await User.findById(id);
      response.about=about;
     await response.save();
     res.status(200).json({
      status:"success",
      message:"Bio Added Successfully"
     })

      
    } catch (error) {
      return next(new ErrorHandler(error.message, error.code || error.statusCode));
    }
  })
exports.findEventsNearby=catchAsyncErrors(async(req,res,next)=>{
  const id =new mongoose.Types.ObjectId(req.userData.user.id)
  const today = new Date();
today.setHours(0, 0, 0, 0);
  try {
    const {longitude,latitude}=req.body.location;
    const maxDistance=10;
    let user=await User.findById(id);
    const events = await Event.find({
      eventStatus:"upcoming",
      eventStartDate: { $gte: today }, // Filter for events starting from today or in the future
      $nor: [
        { VolunteersIdApplied: user._id },
        { VolunteersIdAppliedRequested: user._id },
        { VolunteersIdAppliedRejected: user._id }
      ]}).populate("universityId")
      .populate("organizationId");

        const nearbyEvents = events.filter(event => {
            const distance = calculateDistance(
                latitude,
                longitude,
                event.latitude,
                event.longitude
            );
            return distance <= maxDistance;
        })

        return res.status(200).json({
          status:"success",
          body:nearbyEvents
        });
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});
exports.checkIfAlreadyReviewed=catchAsyncErrors(async(req,res,next)=>{
  let eventId=req.params.eventId;
  let userId=req.userData.user.id;
  try {
    let response=await ReviewEvent.find({
      eventId:eventId,
      userId:userId
    })
     return res.status(200).json({
      status:"success",
      body:response.length>0?true:false
     });
    
    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});
exports.reviewEvent=catchAsyncErrors(async(req,res,next)=>{
  let eventId=req.params.eventId;
  let userId=req.userData.user.id;
  let rating=req.body.rating;
  try {
    let event=await Event.findById(eventId);
    if(event.eventStatus!=="ended"){
      return next(new ErrorHandler("Event Not Ended Yet",400));
    }
    let response=await ReviewEvent.find({
      userId:userId,
      eventId:eventId
    });
    if(response.length>0){
      await ReviewEvent.findOneAndUpdate({userId:userId},{
        rating:rating
      });
      return res.status(200).json({
        status:"success",
        message:"Rating has been updated"
      })
    }
    let review=new ReviewEvent({
      userId,
      eventId,
      rating
    })
    await review.save();
    return res.status(200).json({
      status:"success",
      message:"Event has been rated"
    }); 
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});

exports.getVolunteerCountAndOrganizationCountAndEventCount=catchAsyncErrors(async(req,res,next)=>{
  try {
    let organization=await organizationModel.find({});
    let users=await User.find({});
    let events=await Event.find({});
    return res.status(200).json({
      status:"success",
      "org":organization.length,
      "events":events.length,
      "users":users.length
    })
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});

exports.getRating=catchAsyncErrors(async(req,res,next)=>{
  let id=req.userData.user.id;
  try {
    const counts = await reviewVolunteer.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = counts.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, { p: 0, n: 0 });
    let rating
    if((result.p+result.n)!==0){
      rating=((result.p)/(result.p+result.n))*5.0;
    }
    else{
      rating=5
    }
    res.status(200).json({status:"success",rating:rating})    

    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});
exports.getRatingPublic=catchAsyncErrors(async(req,res,next)=>{
  let id=req.params.id;
  try {
    const response=await reviewVolunteer.find({userId:id});
    const counts = await reviewVolunteer.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = counts.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, { p: 0, n: 0 });
    let rating
    if((result.p+result.n)!==0){
      rating=((result.p)/(result.p+result.n))*5.0;
    }
    else{
      rating=5
    }
    res.status(200).json({status:"success",rating:rating})    

    
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
    let update=await User.findByIdAndUpdate(id,{
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


exports.getAllUniversityEvents=catchAsyncErrors(async(req,res,next)=>{
  const id=req.userData.user.id;
  try {
    let uni=await University.find({
      studentsList: { $in: [id] }
    })
    if(!uni){
      return next(new ErrorHandler("You are not the part of university"));
    }
    let user=await User.findById(id);
    if(user.universityId==null){
      return next(new ErrorHandler("You are not the part of university"));
    }
    let university=await University.findById(user.universityId).populate({
      path:'currentCollaboratedEvents',
      match: { eventStatus: 'upcoming' }
    });
    return res.status(200).json({
      status:"success",
      body:university
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});

exports.withdrawfromEvents=catchAsyncErrors(async(req,res,next)=>{
  let id=req.params.id;
  let userId=req.userData.user.id;
  try {
    let eventCheck=await Event.findById(id);
    if(eventCheck.eventStatus!=="upcoming"){
      return next(new ErrorHandler("Event is started cant withdraw now",400))
    }

    let response=await User.findByIdAndUpdate(userId,
      {
        $pull: { eventAppliedFor: id },
      $pull: { eventAppliedForRequested: id } 
      }
    )
    let event =await Event.findByIdAndUpdate(id,{
      $pull: { VolunteersIdApplied: userId },
      $pull: { VolunteersIdAppliedRequested: userId }, 
      $pull: { VolunteersIdAppliedRejected: userId } 
    })
    return res.status(200).json({
      status:"success",
      message:"Withdraw success"
    })
    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode)); 
  }
})
