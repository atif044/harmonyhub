const express = require("express");
const router=express.Router()
const authController=require('../controllers/auth-controller/auth.controller');
const userController=require('../controllers/user-controller/user.controller');
const {
    checkLink,
    resetPassword,
    sendResetPasswordLink
    }=require('../controllers/password-reset-controller/passsword.reset.controller');
    const {checkIfUserApprovedByAdmin} =require('../middleware/checkIfApprovedByAdmin')
const validatorSignup = require("../validator/sigup.validator");
const { checkIfLoggedIn } = require("../middleware/checkIfAlreadyLoggedIn");
const loginValidator = require("../validator/login.validator");
const { upload } = require("../utils/uploadToCloudinary");
const verifyJwt = require("../middleware/verifyJwt");
const catchAsyncErrors = require("../config/catchAsyncErrors");
//================================AUTHENTICATION USER
router.route("/register").post(checkIfLoggedIn,upload.array("photos",4),userController.createUserAccount);
router.route("/login").post(checkIfLoggedIn,userController.loginUserAccount);
//===============================USER ACTIONS
router.route('/verifyEmail/:token').post(userController.verifyEmailToken);
router.route('/resendEmail').post(verifyJwt,userController.resendOTP);
router.route("/getAllEvents").get(verifyJwt,userController.findAllEventsInCountry);
router.route("/getEvent/:id").get(verifyJwt,userController.eventDetails);
router.route("/joinEvent").post(verifyJwt,checkIfUserApprovedByAdmin,userController.joinEvent);
router.route("/getMyPendingEvents").get(verifyJwt,checkIfUserApprovedByAdmin,userController.fetchMyAppliedEventsPending);
router.route("/getMyAcceptedEvents").get(verifyJwt,checkIfUserApprovedByAdmin,userController.fetchMyAppliedEventsAccepted);
router.route("/getMyAttendance/:id").get(verifyJwt,checkIfUserApprovedByAdmin,userController.getMyAttendanceForParticularEvent);
router.route("/requestCertificate/:id").post(verifyJwt,checkIfUserApprovedByAdmin,userController.requestForCertificate);
router.route("/checkIfRequested/:id").get(verifyJwt,checkIfUserApprovedByAdmin,userController.checkIfRequested);
router.route("/myProfile").get(verifyJwt,userController.getMyProfileDetails);
router.route("/userProfile/:id").get(userController.getUserProfileDetails);
router.route("/addBio").post(verifyJwt,userController.addBio);
router.route("/eventsByLocation").post(verifyJwt,userController.findEventsNearby);
router.route('/reviewEvent/:eventId').post(verifyJwt,checkIfUserApprovedByAdmin,userController.reviewEvent);
router.route('/send-reset-request').post(sendResetPasswordLink)
router.route('/verifyToken/:token').get(checkLink)
router.route('/updatePassword').post(resetPassword);
router.route('/getVolunteerCountAndOrganizationCountAndEventCount').get(userController.getVolunteerCountAndOrganizationCountAndEventCount);
router.route('/getRating').get(verifyJwt,userController.getRating)
router.route('/getRating/:id').get(userController.getRatingPublic)
router.route('/addProfilePic').post(verifyJwt,upload.single("image"),userController.addProfilePic)
router.route('/allUniEvents').get(verifyJwt,userController.getAllUniversityEvents);
router.route('/withdraw/:id').get(verifyJwt,checkIfUserApprovedByAdmin,userController.withdrawfromEvents);

module.exports=router;
