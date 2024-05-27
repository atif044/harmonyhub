const ErrorHandler = require('../../config/ErrorHandler');
const catchAsyncErrors = require('../../config/catchAsyncErrors');
const { uniqueToken } = require('../../utils/generateToken');
const Organization = require("../../models/organization/organization.model");
const University=require('../../models/university/university.model');
const User = require('../../models/user/user.model');
const { sendEmail } = require('../email-controller/email.controller');
const ForgotPasswordToken=require('../../models/reset-tokens/reset.password.model');
const bcrypt=require('bcrypt')
exports.sendResetPasswordLink=catchAsyncErrors(async(req,res,next)=>{
    const {email,type}=req.body;
    try {
        let checkIfExist=await ForgotPasswordToken.findOne({email:email,type:type})
        if(checkIfExist){
            return next(new ErrorHandler("Please Wait 15 minutes before trying again",400))
        }
        let response;
        const token=uniqueToken(10);
        if(type==="org"){
            response=await Organization.findOne({organizationEmail:email});

        }
        else if(type==="uni"){
            response=await University.findOne({universityEmail:email});
        }
        else if(type==="volun"){
            response=await User.findOne({email:email});
        }
        else{
            return next(new ErrorHandler("Invalid Option Selected",400))
        }
        if(!response){
            return next(new ErrorHandler("No Such Account With this email found"));
        }
        let addTokenToDatabase=await new ForgotPasswordToken(
            {
                email,
                token,
                type: type,
                tokenExpiry: Date.now() + 900000 
            }

        ).save()
        await sendEmail(email,"Forgot Password Link",`Open The Link Below To Change your password \n
        ${process.env.FRONTEND_LINK}/forgotPassword/${token}
        `);
        return res.status(200).json({
            status:'success',
            message:'An Email is sent to you'
        })
        
    } catch (error) {
        return next(new ErrorHandler(error.message, error.code || error.statusCode));
    }
});
exports.checkLink=catchAsyncErrors(async(req,res,next)=>{
    let token=req.params.token
    try {
            let checkIfExist=await ForgotPasswordToken.findOne({token:token});
            return res.status(200).json({
                status:"success",
                body:!checkIfExist?false:true
            });
    
    } catch (error) {
        return next(new ErrorHandler(error.message, error.code || error.statusCode));
    }
});
exports.resetPassword=catchAsyncErrors(async(req,res,next)=>{
        const {password,token}=req.body
        let hashedPassword=await bcrypt.hash(password,10)
    try {
        let checkIfExist=await ForgotPasswordToken.findOne({token:token});  
        if(!checkIfExist){
            return next(new ErrorHandler("Token Expired Or Inalid",400));
        } 
        if(checkIfExist.type==="org"){
            let org=await Organization.findOneAndUpdate({organizationEmail:checkIfExist.email},{organizationPassword:hashedPassword})
        } 
        else if(checkIfExist.type==="uni"){
            let uni=await University.findOneAndUpdate({universityEmail:checkIfExist.email},{universityPassword:hashedPassword})

        } 
        else if(checkIfExist.type==="volun"){
            let vol=await User.findOneAndUpdate({email:checkIfExist.email},{password:hashedPassword})
        } 
        await ForgotPasswordToken.findOneAndDelete({token:token,email:checkIfExist.email});
        return res.status(200).json({
            status:"success",
            message:"Successfully Updated the password"
        })
    } catch (error) {
        return next(new ErrorHandler(error.message, error.code || error.statusCode));
    }
})