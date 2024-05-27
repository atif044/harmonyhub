const express = require("express");
const { checkIfLoggedIn } = require("../middleware/checkIfAlreadyLoggedIn");
const { createAdminAccount, loginAdminAccount, getAllUnApprovedUserAccounts, getAllApprovedUserAccounts, getUserProfile, approveTheVolunteerAccount, disapproveTheVolunteerAccount, getAllUnApprovedOrganizationAccounts, getAllApprovedOrganizationAccounts, approveTheOrganizationAccount, disapproveTheOrganizationAccount, getAllUnApprovedUniversityAccounts, getAllApprovedUniversityAccounts, approveTheUniversityAccount, disapproveTheUniversityAccount, getUniversityProfile, getOrganizationProfile, getAllRequests, uploadCertificateImage, changeRequest } = require("../controllers/admin-controller/admin.controller");
const verifyJwt = require("../middleware/verifyJwtAdmin");
const { upload } = require("../utils/uploadToCloudinary");
const router=express.Router()

//================================AUTHENTICATION USER
router.route("/signupAdmin").post(checkIfLoggedIn,createAdminAccount);
router.route("/loginAdmin").post(checkIfLoggedIn,loginAdminAccount);
router.route("/getAllUnapprovedVolunteerProfiles").get(verifyJwt,getAllUnApprovedUserAccounts);
router.route("/getAllApprovedVolunteerProfiles").get(verifyJwt,getAllApprovedUserAccounts);
router.route("/getUserProfile/:id").get(verifyJwt,getUserProfile);
router.route("/approveTheUser/:id").post(verifyJwt,approveTheVolunteerAccount);
router.route("/disapproveTheUser/:id").post(verifyJwt,disapproveTheVolunteerAccount);
router.route("/getAllUnapprovedOrgAccounts").get(verifyJwt,getAllUnApprovedOrganizationAccounts);
router.route("/getAllApprovedOrgAccounts").get(verifyJwt,getAllApprovedOrganizationAccounts);
router.route("/approveTheOrganization/:id").post(verifyJwt,approveTheOrganizationAccount);
router.route("/disapproveTheOrganization/:id").post(verifyJwt,disapproveTheOrganizationAccount);
router.route("/getAllUnapprovedUniAccounts").get(verifyJwt,getAllUnApprovedUniversityAccounts);
router.route("/getAllApprovedUniAccounts").get(verifyJwt,getAllApprovedUniversityAccounts);
router.route("/approveTheUniversity/:id").post(verifyJwt,approveTheUniversityAccount);
router.route("/disapproveTheUniversity/:id").post(verifyJwt,disapproveTheUniversityAccount);
router.route("/getUniversityProfile/:id").get(verifyJwt,getUniversityProfile);
router.route("/getOrganizationProfile/:id").get(verifyJwt,getOrganizationProfile);
router.route("/getAllRequests").get(verifyJwt,getAllRequests);
router.route("/uploadCertificate").post(upload.single("image"),uploadCertificateImage);
router.route("/changeRequestToCompleted/:id/:eventId").post(verifyJwt,changeRequest)
module.exports=router;
