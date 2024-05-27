const express = require("express");
const router=express.Router()
const verifyJwtUniversity=require('../middleware/verifyJwtUniversity');
const { checkIfLoggedIn } = require("../middleware/checkIfAlreadyLoggedIn");
const {
createUniversityAccount,
resendOTP,
verifyEmailToken,
loginUniversityAccount,
getAllUniversities,
getAllPendingEvents,
eventDetails,
approveEvent,
getAllCollaboratedEvents,
getAllApprovedAndUnApprovedStudents,
getUserProfile,
approveTheStudent,
rejectTheStudent,
approveToReject,
rejectToApprove,
getMyProfile,
getMyPublicProfile,
addBio,
addProfilePic,
getAllStudents,
rejectTheEventCollab
}=require('../controllers/university-controller/univsersity.controller');
const {checkIfUserApprovedByAdmin}=require('../middleware/checkIfUniversityApproved')
const { upload } = require("../utils/uploadToCloudinary");
router.route("/createuniversityaccount").post(checkIfLoggedIn,createUniversityAccount);
router.route("/loginuniversityaccount").post(checkIfLoggedIn,loginUniversityAccount);
router.route("/verifyotpuniversity/:token").post(verifyJwtUniversity,verifyEmailToken);
router.route("/resendotpuniversity").post(verifyJwtUniversity,resendOTP);
router.route("/getalluniversities").get(getAllUniversities);
router.route('/getAllPendingEvents').get(verifyJwtUniversity,getAllPendingEvents);
router.route('/eventDetail/:id').get(verifyJwtUniversity,eventDetails);
router.route("/approveEvent/:id").post(verifyJwtUniversity,checkIfUserApprovedByAdmin,approveEvent);
router.route("/rejectEvent/:id").post(verifyJwtUniversity,checkIfUserApprovedByAdmin,rejectTheEventCollab)
router.route('/getAllColloabEvents').get(verifyJwtUniversity,getAllCollaboratedEvents);
router.route('/getAllStudents').get(verifyJwtUniversity,checkIfUserApprovedByAdmin,getAllApprovedAndUnApprovedStudents);
router.route("/getUserProfile/:id").get(verifyJwtUniversity,getUserProfile);
router.route('/approveTheStudent/:id').post(verifyJwtUniversity,checkIfUserApprovedByAdmin,approveTheStudent)
router.route('/rejectTheStudent/:id').post(verifyJwtUniversity,checkIfUserApprovedByAdmin,rejectTheStudent)
router.route('/approveToRejectTheStudent/:id').post(verifyJwtUniversity,checkIfUserApprovedByAdmin,approveToReject)
router.route('/rejectToApproveTheStudent/:id').post(verifyJwtUniversity,checkIfUserApprovedByAdmin,rejectToApprove)
router.route('/getMyProfile').get(verifyJwtUniversity,getMyProfile);
router.route('/getMyPublicProfile/:id').get(getMyPublicProfile);
router.route('/addBio').post(verifyJwtUniversity,addBio);
router.route('/uploadPP').post(verifyJwtUniversity,upload.single("image"),addProfilePic);
router.route('/allStudents').get(verifyJwtUniversity,checkIfUserApprovedByAdmin,getAllStudents)
module.exports=router;