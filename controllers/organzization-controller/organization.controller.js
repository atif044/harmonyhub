const ErrorHandler = require("../../config/ErrorHandler");
const catchAsyncErrors = require("../../config/catchAsyncErrors");
const Organization = require("../../models/organization/organization.model");
const generateJwtOrganization = require("../../utils/generateJwtOrganization");
const Token = require("../../models/token/token.model");
const bcrypt = require("bcrypt");
const { uniqueToken } = require("../../utils/generateToken");
const { sendEmail } = require("../email-controller/email.controller");
const { uploadaImageToCloudinary } = require("../../utils/uploadToCloudinary");
const Event=require("../../models/event/event.model");
const University=require('../../models/university/university.model');
const { default: mongoose, Mongoose } = require("mongoose");
const User=require("../../models/user/user.model");
const Attendance = require("../../models/attendance/attendance.model");
const attendanceModel = require("../../models/attendance/attendance.model");
const { differenceInCalendarDays } = require('date-fns');
const ReviewVoulunteer=require('../../models/review/review.volunteer.model')
exports.createOrganizationAccount = catchAsyncErrors(async (req, res, next) => {
  const { organizationEmail, organizationPassword, organizationName,organizationPhoneNo,organizationWebsiteLink,organizationSize } =
    req.body.data;
  try {
    let organizationAccount = await Organization.find({
      organizationEmail,
    });
    if (organizationAccount.length === 1) {
      return next(new ErrorHandler("Account Already Exists", 400));
    }

    let hashedPassword = await bcrypt.hash(organizationPassword,10)
    if (hashedPassword) {
      let account = await Organization.create({
        organizationEmail,
        organizationPassword: hashedPassword,
        organizationName,
        organizationPhoneNo,
        organizationWebsiteLink,
        organizationSize
      });
      await account.save();
      const data = {
        user: {
          id: account._id,
          email: account.organizationEmail,
        },
      };
      const authToken = generateJwtOrganization(data);
      res.cookie("harmony-hub-organization", authToken, {
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
        email: account.organizationEmail,
        token: emailVerificationToken,
        tokenType: "emailVerification",
        tokenExpiry: new Date(Date.now()), // 1 hour
      });
      await token.save();
      await sendEmail(
        account.organizationEmail,
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
exports.loginOrganizationAccount = catchAsyncErrors(async (req, res, next) => {
  const { organizationEmail, organizationPassword } = req.body.data;
  try {
    const response = await Organization.find({ organizationEmail });
    if (response.length === 0) {
      return next(new ErrorHandler("Email or Password is Incorrect", 400));
    }
    let passwordCompare = await bcrypt.compare(organizationPassword, response[0].organizationPassword);
    if (!passwordCompare) {
      return next(new ErrorHandler("Email or password is incorrect", 400));
    }
    const data = {
      user: {
        id: response[0]._id,
        email: response[0].organizationEmail,
      },
    };
    const authToken = generateJwtOrganization(data);
    res.cookie("harmony-hub-organization", authToken, {
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
        email: response[0].organizationEmail,
        token: emailVerificationToken,
        tokenType: "emailVerification",
        tokenExpiry: new Date(Date.now()), // 1 hour
      });
      await token.save();
      await sendEmail(
        response[0].organizationEmail,
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
    const organizationEmail = validToken.email;
    let  organization= await Organization.findOne({ organizationEmail },{isVerified:false});
    if(!organization){
      return next(new ErrorHandler("Organization Not Found",404))
    }
    organization.isVerified=true;
    let saved=await organization.save();
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
    let user=await Organization.findById(userId).select("organizationEmail").select("isVerified");
    if(!user){
      return next(new ErrorHandler("User Not Found",400));
    }
    if(user.isVerified===true){
      return next(new ErrorHandler("Already Verified",400));
    }
      let emailVerificationToken=uniqueToken(5);
      await Token.findOneAndDelete({email:user.organizationEmail})
      let token= new Token({
        email:user.organizationEmail,
        token:emailVerificationToken,
        tokenType:"emailVerification",
        tokenExpiry:Date.now()
      })
      await token.save()
      await sendEmail(user.organizationEmail,"Email Verification",`Your OTP is:${emailVerificationToken}`)
      return res.status(200).json({status:"success",message:"A Email has send to you. Please verify Email"})    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode))

  }
});
exports.createEvent=catchAsyncErrors(async(req,res,next)=>{
  let id=req.userData.user.id;
  const {EventName,EventDescription,VolunteersRequired,eventLocationLink,longitude,latitude,eventLocationName,eventLocationEmbededLink,eventDurationInDays,eventStartDate,eventEndDate,eventStartTime,eventEndTime,universityId,country,city}=req.body;
 
  try {
    let url=await uploadaImageToCloudinary(req.file.buffer);
    let event=new Event({
      EventName,
      EventDescription,
      VolunteersRequired:VolunteersRequired,
      eventLocationLink,
      eventLocationName,
      eventLocationEmbededLink,
      eventDurationInDays,
      EventImage:url.secure_url,
      longitude:Number(longitude),
      latitude:Number(latitude),
      universityId:!universityId?null:universityId,
      organizationId:id,
      eventStartDate,
      eventEndDate,
      eventStartTime,
      eventEndTime,
      country:country,
      city:city
    });
    let saved=await event.save();
    await Organization.updateOne({_id:id}, { $push: { ["currentOrganizationEvents"]: saved._id }, });
    if(universityId){
      await University.updateOne({_id:universityId,},{ $push: { ["pendingCollaborateEvents"]: saved._id }, })
    }
    return res.status(201).json({status:"success",message:"Event Listed Successfully"});
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});
exports.allEvents=catchAsyncErrors(async(req,res,next)=>{
  const id=req.userData.user.id;
  try{
    let events=await Organization.findOne({_id:id}).populate({
      path: 'currentOrganizationEvents',
      match: { eventStatus: 'upcoming' }});
      return res.status(200).json({status:"success",body:events.currentOrganizationEvents});
  }
  catch(error){
        return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});
exports.allEventsStarted=catchAsyncErrors(async(req,res,next)=>{
  const id=req.userData.user.id;
  try{
    let events=await Organization.findOne({_id:id}).populate({
      path: 'currentOrganizationEvents',
      match: { eventStatus: 'started' }});
      return res.status(200).json({status:"success",body:events.currentOrganizationEvents});
  }
  catch(error){
        return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});
exports.allEventsEnded=catchAsyncErrors(async(req,res,next)=>{
  const id=req.userData.user.id;
  try{
    let events=await Organization.findOne({_id:id}).populate('pastOrganizationEvents')
      return res.status(200).json({status:"success",body:events.pastOrganizationEvents});
  }
  catch(error){
        return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});
exports.eventDetails=catchAsyncErrors(async(req,res,next)=>{
  const id = new mongoose.Types.ObjectId(req.params.id);
  const orgId =new mongoose.Types.ObjectId(req.userData.user.id);
  try {
    let event=await Event.findOne({_id:id,organizationId:orgId}).populate('universityId');
    return res.status(200).json({status:"success",body:event});
    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));

  }
});
exports.editEventDetails=catchAsyncErrors(async(req,res,next)=>{
  const eventId=req.params.id;
  let id=req.userData.user.id;
  const {EventName,EventDescription,VolunteersRequired,eventLocationLink,longitude,latitude,eventLocationName,eventLocationEmbededLink,eventDurationInDays,eventStartDate,eventEndDate,eventStartTime,eventEndTime,universityId}=req.body;

  try {
    let url=null;
    let event=null;
    const mongooseEventId= new mongoose.Types.ObjectId(eventId)
    let beforeEvent=await Event.findById({_id:mongooseEventId});
    if(req.file){
       url=await uploadaImageToCloudinary(req.file.buffer);
        event=await  Event.findByIdAndUpdate({_id:eventId},{
        EventName,
        EventDescription,
        VolunteersRequired:VolunteersRequired,
        eventLocationLink,
        eventLocationName,
        eventLocationEmbededLink,
        eventDurationInDays,
        EventImage:url?.secure_url,
        longitude:longitude,
        latitude:latitude,
        organizationId:id,
        eventStartDate,
        eventEndDate,
        eventStartTime,
        universityId:universityId!==null?universityId:beforeEvent.universityId
      });
    }
    else{
       event= await Event.findByIdAndUpdate({_id:eventId},{
        EventName,
        EventDescription,
        VolunteersRequired:VolunteersRequired,
        eventLocationLink,
        eventLocationName,
        eventLocationEmbededLink,
        eventDurationInDays,
        longitude:longitude,
        latitude:latitude,
        organizationId:id,
        eventStartDate,
        eventEndDate,
        eventStartTime,
        eventEndTime,
        universityId:universityId!==null?universityId:beforeEvent.universityId
      });
    }
    let saved=await event.save();

    return res.status(201).json({status:"success",message:"Event Updated Successfully"});
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));

  }
})
exports.checkIfPendingOrApprovedByUniversity=catchAsyncErrors(async(req,res,next)=>{
  const eventId=req.params.id;
  let {uniId}=req.body;
  try {
    const university = await University.findById(uniId);
    if(!university){
      return next(new ErrorHandler("University Not Found",400));
    }
    else if (university.pendingCollaborateEvents.includes(eventId))
    {
      return res.status(200).json({status:"success",body:"pending"})
    }
    else if (university.currentCollaboratedEvents.includes(eventId)) {
      return res.status(200).json({status:"success",body:"approved"});
  }
  return next(new ErrorHandler('No Event Exist with this id in the university',400));
    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));

  }
});
exports.findAllPendingAcceptedAndRejectedVolunteers=catchAsyncErrors(async(req,res,next)=>{
  const id=req.params.id;
  try {
    let event=await Event.findById(id).populate("VolunteersIdAppliedRequested","-password").populate("VolunteersIdApplied","-password").populate("VolunteersIdAppliedRejected","-password");
    if(!event){
      return next(new ErrorHandler("Event with Such id does not exit",400));
    }
    return res.status(200).json({
      status:"success",
      pending:event.VolunteersIdAppliedRequested,
      accepted:event.VolunteersIdApplied,
      rejected:event.VolunteersIdAppliedRejected,
    });
    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode))
  }
});
exports.acceptTheVolunteer=catchAsyncErrors(async(req,res,next)=>{
  let userId=req.body.id;
  let eventId=req.body.eventId;
  try {
    let user=await User.findById(userId)
    let event=await Event.findById(eventId);
    if(!event){
      return next(new ErrorHandler("Event with Such id does not exit",400));
    }
    if(!event.VolunteersIdAppliedRequested.includes(userId)){
        return next(new ErrorHandler("This User Has Not Applied For It",400));
    }
    await Event.updateOne(
      { _id: event._id },
      { $pull: { VolunteersIdAppliedRequested: userId } }
    );
    await Event.updateOne({_id:event._id},{ $push: { ["VolunteersIdApplied"]: userId }, });
    
    await User.updateOne({_id:userId}, { $pull: { eventAppliedForRequested: event._id }
     })
    await User.updateOne({_id:userId},{ $push: { ["eventAppliedFor"]: event._id }, });

    await sendEmail(user.email,`Request Accepted For Volunteer for Event ${event.EventName}`,`Dear ${user.fullName},
    We are pleased to inform you that you have been approved for the ${event.EventName}. Please make sure your presence.
    `)
    return res.status(200).json({
      status:"success",
      message:"User Approved for this event"
    })

    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
})
exports.rejectTheVolunteer=catchAsyncErrors(async(req,res,next)=>{
  let userId=req.body.id;
  let eventId=req.body.eventId;
  try {
    let user=await User.findById(userId)
    let event=await Event.findById(eventId);
    if(!event){
      return next(new ErrorHandler("Event with Such id does not exit",400));
    }
    if(!event.VolunteersIdAppliedRequested.includes(userId)){
        return next(new ErrorHandler("This User Has Not Applied For It",400));
    }
    await Event.updateOne(
      { _id: event._id },
      { $pull: { VolunteersIdAppliedRequested: userId } }
    );
    await Event.updateOne({_id:event._id},{ $push: { ["VolunteersIdAppliedRejected"]: userId }, });
    await User.updateOne({_id:userId}, { $pull: { eventAppliedForRequested: event._id }
     })
     await sendEmail(user.email,`Request Rejected For Volunteer for Event ${event.EventName}`,`Dear ${user.fullName},
    We are sad to inform you that you have been rejected for the ${event.EventName}. DOnt be sad you are just not a perfect fit here.
    `)
    return res.status(200).json({
      status:"success",
      message:"User Rejected for this event"
    });

    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});
exports.FromAcceptTorejectTheVolunteer=catchAsyncErrors(async(req,res,next)=>{
  let userId=req.body.id;
  let eventId=req.body.eventId;
  try {
    let user=await User.findById(userId)

    let event=await Event.findById(eventId);
    if(!event){
      return next(new ErrorHandler("Event with Such id does not exit",400));
    }
    if(!event.VolunteersIdApplied.includes(userId)){
        return next(new ErrorHandler("This User is not approved list",400));
    }
    await Event.updateOne(
      { _id: event._id },
      { $pull: { VolunteersIdApplied: userId } }
    );
    await Event.updateOne({_id:event._id},{ $push: { ["VolunteersIdAppliedRejected"]: userId }, });
    await User.updateOne({_id:userId}, { $pull: { eventAppliedFor: event._id }
     });
     await sendEmail(user.email,` Rejected For Volunteer for Event ${event.EventName}`,`Dear ${user.fullName},
    We are sad to inform you that you were approved by mistake and now you have been rejected for the ${event.EventName}. Dont be sad you are just not a perfect fit here.
    `)
    return res.status(200).json({
      status:"success",
      message:"User Rejected for this event"
    }); 
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});
exports.FromRejectToAcceptTheVolunteer=catchAsyncErrors(async(req,res,next)=>{
  let userId=req.body.id;
  let eventId=req.body.eventId;
  try {
    let user=await User.findById(userId)

    let event=await Event.findById(eventId);
    if(!event){
      return next(new ErrorHandler("Event with Such id does not exit",400));
    }
    if(!event.VolunteersIdAppliedRejected.includes(userId)){
        return next(new ErrorHandler("This User is not in Rejected list",400));
    }
    await Event.updateOne(
      { _id: event._id },
      { $pull: { VolunteersIdAppliedRejected: userId } }
    );
    await Event.updateOne({_id:event._id},{ $push: { ["VolunteersIdApplied"]: userId }, });
    await User.updateOne({_id:userId}, { $push: { ["eventAppliedFor"]: event._id }
     });
     await sendEmail(user.email,` Accepted For Volunteer for Event ${event.EventName}`,`Dear ${user.fullName},
     We are pleased to inform you that you were rejected by mistake and now you have been approved for the ${event.EventName}. Dont be sad you are  a perfect fit here and we will love to have you as a volunteer.
     `)
    return res.status(200).json({
      status:"success",
      message:"User accepted for this event"
    }); 
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});
exports.getVolunteersByEvent=catchAsyncErrors(async(req,res,next)=>{
  let id=req.params.id;
  try {
    let event=await Event.findById(id).populate("VolunteersIdApplied","-password");
    if(!event){
        return next(new ErrorHandler("No Event Found",400));
    }
    return res.status(200).json(
      {
        status:"success",
        body:event.VolunteersIdApplied,
        start:event.eventStartDate,
        end:event.eventEndDate
      }
    );
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});
exports.markAttendance=catchAsyncErrors(async(req,res,next)=>{
  // event id
  let id=req.params.id;
  let {users,eventDate}=req.body;
  try {
    let event=await Event.findById(id);
    var parts = eventDate.split("/");
    var formattedDate = parts[2] + "-" + parts[1] + "-" + parts[0];
    const formattedDateInput=new Date(formattedDate);
    const evntStart=new Date(event.eventStartDate)
    const evntEnd=new Date(event.eventEndDate);
    const todayDate=new Date().toLocaleDateString();
    let todayFormatted=todayDate.split("/");
    var todayformattedDate = todayFormatted[2] + "-" + todayFormatted[1] + "-" + todayFormatted[0];
    const todayDateLatest=new Date(todayformattedDate);
    if(!event){
      return next(new ErrorHandler("No Such Event Occurs",400));
    }
    let attend=await Attendance.findOne({eventDate:formattedDateInput,event:id});
    if(attend){
      return next(new ErrorHandler("You Have already marked attendance for this date",400));
    }
    if(formattedDateInput>evntEnd){
      return next(new ErrorHandler("Date is greater than event's end Date",400));
    }
    if(formattedDateInput<evntStart){
      return next(new ErrorHandler("Date is lesser than event's start Date",400));
    }
    if((formattedDateInput<=evntEnd&&formattedDateInput>=evntStart)&&todayDateLatest<formattedDateInput){
      return next(new ErrorHandler("Attendance can only be marked on the same date",400));
    }

    const attendance=new Attendance(
      {
        eventDate:new Date(formattedDateInput),
        users:users,
        event:id,
        addedAt:Date.now()
      }
    )
    await attendance.save();

    return res.status(200).json({
      status:"success",
      message:"Attendance marked successfully"
    })
    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});
exports.getAttendance=catchAsyncErrors(async(req,res,next)=>{
  let id=req.params.id;
  try {
    let attendance=await Attendance.find({event:id});
    if(!attendance){
      return res.status(200).json({
        status:"success",
        message:"Not Marked Yet",
        body:[]
      });
    }
    return res.status(200).json({
      status:"success",
      message:"Fetched Successfully",
      body:attendance
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});
exports.getAttendeesByDate=catchAsyncErrors(async(req,res,next)=>{
  let id=req.params.id;
  const {date}=req.body;
  try {
    let attendees=await Attendance.findOne({
      eventDate:date,
      event:id
    }).populate("users.user","fullName");
    if(!attendees){
      return next(new ErrorHandler("No Such Attendance occured with this details",400));
    }
    return res.status(200).json({
      status:"success",
      body:attendees.users
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});
exports.editAttendanceByDate=catchAsyncErrors(async(req,res,next)=>{
  let id=req.params.id;
  const {date,users}=req.body;
  try {
    let response = await Attendance.findOneAndUpdate(
      { event: id, eventDate: date },
      { $set: { users: users, lastUpdatedAt: Date.now() } },
      { new: true } // To return the updated document
  );
      if(!response){
      return next(new ErrorHandler("Attendnace doesnt exists",400))
    }
    return res.status(200).json({
      status:"success",
      message:"Successfully edited the Attendance"
    })
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});
exports.checkTheStatusOfEvent=catchAsyncErrors(async(req,res,next)=>{
  let id=req.params.id;
  try {
    let event=await Event.findById(id);
    if(!event){
      return next(new ErrorHandler("Event doesnt exits",400));
    }
    return res.status(200).json({status:"success",body:event.eventStatus})
    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});
exports.changeEventStatus=catchAsyncErrors(async(req,res,next)=>{
  let id=req.params.id;
  try {
    const today=new Date()
    const checkerStartDate = await Event.findOne({
      _id: id,
      eventStartDate: { $lte: today },
    });
    if(!checkerStartDate){
      return next(new ErrorHandler("You can only Start the event on the start date",400))
    }
    if(checkerStartDate.VolunteersIdApplied===0){
      return next(new ErrorHandler("No Volunteer is approved/has applied",400))
    }
    let event=await Event.findOneAndUpdate({_id:id,
      eventStatus:"upcoming"
    },
    {
      eventStatus:"started"
    }
  );
  return res.status(200).json({
    status:"success",
    message:"Event has been started"
  })
    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});
exports.endEvent=catchAsyncErrors(async(req,res,next)=>{
  const id=req.params.id;
  try {
    const today = new Date();
    const date = today.getFullYear() + "-" + ((today.getMonth() + 1) > 9 ? (today.getMonth() + 1) : "0" + (today.getMonth() + 1)) + "-" + ((today.getDate()) > 9 ? (today.getDate()) : "0" + (today.getDate()));
    const todaysDate = new Date(date)
    let result = await Event.findById(id);
        const startDate = new Date(result.eventStartDate);
        const endDate = new Date(result.eventEndDate);
        const daysDifference = differenceInCalendarDays(endDate, startDate) + 1;
        let response = await attendanceModel.find({ event: id });
        if (response.length == daysDifference) {
          const updatedOrganizations = await Organization.updateOne(
            { 
                _id:result.organizationId, // Filter by organizationIds
                currentOrganizationEvents: { $in: id} // Filter by eventIds in currentOrganizationEvents
            },
            { 
                $pull: { currentOrganizationEvents: id}, // Remove eventIds from currentOrganizationEvents
                $push: { ['pastOrganizationEvents']: id } // Add eventIds to pastOrganizationEvents
            },
        );
          const updatedUniveristy = await University.updateOne(
            { 
                _id:result.universityId, // Filter by organizationIds
                currentCollaboratedEvents: { $in: id} // Filter by eventIds in currentOrganizationEvents
            },
            { 
                $pull: { currentCollaboratedEvents: id}, // Remove eventIds from currentOrganizationEvents
                $push: { ['pastCollaboratedEvents']: id } // Add eventIds to pastOrganizationEvents
            },
        );
          await Event.findByIdAndUpdate(id,{eventStatus:"ended"})
          return res.status(200).json({
            status:"success",
            message:"event ended"
          });
        }
        return next(new ErrorHandler("Attendance pending",400));
    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});
exports.getAllVolunteers=catchAsyncErrors(async(req,res,next)=>{
  let id=req.params.id;
  try {
    let event=await Event.findById(id).populate('VolunteersIdApplied','-password');
    return res.status(200).json({
      status:"success",
      body:event.VolunteersIdApplied
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
})
exports.reviewVolunteer=catchAsyncErrors(async(req,res,next)=>{
  let eventId=req.params.eventId;
  let userId=req.body.userId;
  let rating=req.body.rating;
  try {
    let event=await Event.findById(eventId);
    if(event.eventStatus!=="ended"){
      return next(new ErrorHandler("Event Not Ended Yet",400));
    }
    let response=await ReviewVoulunteer.find({
      userId:userId,
      eventId:eventId
    });
    if(response.length>0){
      await ReviewVoulunteer.findOneAndUpdate({userId:userId},{
        rating:rating
      });
      return res.status(200).json({
        status:"success",
        message:"Rating has been updated"
      })
    }
    let review=new ReviewVoulunteer({
      userId,
      eventId,
      rating
    })
    await review.save();
    return res.status(200).json({
      status:"success",
      message:"User has been rated"
    }); 
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});

exports.getMyProfile=catchAsyncErrors(async(req,res,next)=>{
  let id=req.userData.user.id;
  try {
    let response=await Organization.findById(id).select('-organizationPassword').populate('currentOrganizationEvents').populate('pastOrganizationEvents');
    if(!response){
      return next(new ErrorHandler("No Organization Found",400));
    }
    return res.status(200).json({
      status:"success",
      body:response
    })
    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
})
exports.getMyPublicProfile=catchAsyncErrors(async(req,res,next)=>{
  let id=req.params.id;
  try {
    let response=await Organization.findById(id).select('-organizationPassword').populate('currentOrganizationEvents').populate('pastOrganizationEvents');
    if(!response){
      return next(new ErrorHandler("No Organization Found",400));
    }
    return res.status(200).json({
      status:"success",
      body:response
    })
    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
})
exports.addBio=catchAsyncErrors(async(req,res,next)=>{
  let id=req.userData.user.id;
  let about=req.body.about;
  try {
    let response=await Organization.findById(id);
    response.organizationDescription=about;
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
    let update=await Organization.findByIdAndUpdate(id,{
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
exports.deleteEvent=catchAsyncErrors(async(req,res,next)=>{
  let id=req.params.id;
  let userId=req.userData.user.id;
  try {
    let event=await Event.findById(id);
    const userIds = [
      ...event.VolunteersIdApplied,
      ...event.VolunteersIdAppliedRequested,
      ...event.VolunteersIdAppliedRejected
    ];
    const uniqueUserIds = [...new Set(userIds.map(id => id.toString()))];

    if(event.organizationId==id){
      return next(new ErrorHandler("You are not the owner for this event",400))
    }
     await Event.findByIdAndDelete(id);
     await Organization.findByIdAndUpdate(userId,
      { $pull: { currentOrganizationEvents: id } 
    },
     )
     await University.findByIdAndUpdate(event.universityId,     
       {
      $pull: { currentCollaboratedEvents: id },
      $pull: { pendingCollaboratedEvents: id } 
     });
     await User.updateMany(
      { _id: { $in: uniqueUserIds } },
      {
        $pull: {
          eventAppliedFor: id,
          eventAppliedForRequested: id
        }
      }
    );
    return res.status(200).json({
      status:"success",
      message:"Event Deleted Successfully"
    });    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});

