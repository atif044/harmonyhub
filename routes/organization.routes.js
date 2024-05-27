const cron = require('node-cron');

const { changeEventsStatus,changeEventToEnd,pullFromCurrentEventsAndPushToPastEvents } = require('../controllers/automated-api-controller/automated.api.controller'); // Import your controller function
const express = require("express");
const router=express.Router()
const { checkIfLoggedIn } = require("../middleware/checkIfAlreadyLoggedIn");
const verifyJwtOrganization=require("../middleware/verifyJwtOrganization");
const {createOrganizationAccount,loginOrganizationAccount,verifyEmailToken,resendOTP, createEvent, allEvents, eventDetails, editEventDetails, checkIfPendingOrApprovedByUniversity, findAllPendingAcceptedAndRejectedVolunteers, acceptTheVolunteer, rejectTheVolunteer, FromAcceptTorejectTheVolunteer, FromRejectToAcceptTheVolunteer, getVolunteersByEvent, markAttendance, getAttendance, getAttendeesByDate, editAttendanceByDate, allEventsStarted, allEventsEnded, checkTheStatusOfEvent, changeEventStatus, endEvent, getAllVolunteers, reviewVolunteer, getMyProfile, getMyPublicProfile, addBio, addProfilePic, deleteEvent} = require("../controllers/organzization-controller/organization.controller");
const { upload } = require("../utils/uploadToCloudinary");
const {checkIfUserApprovedByAdmin}=require('../middleware/CheckOrganizationApproval')
router.route("/createOrganizationAccount").post(checkIfLoggedIn,createOrganizationAccount);
router.route("/loginOrganizationAccount").post(checkIfLoggedIn,loginOrganizationAccount);
router.route('/verifyEmail/:token').post(verifyJwtOrganization,verifyEmailToken);
router.route('/resendEmail').post(verifyJwtOrganization,resendOTP);
router.route('/createEvent').post(verifyJwtOrganization,checkIfUserApprovedByAdmin,upload.single('image'),createEvent);
router.route('/allevents').get(verifyJwtOrganization,checkIfUserApprovedByAdmin,allEvents)
router.route('/alleventsStarted').get(verifyJwtOrganization,allEventsStarted)
router.route('/alleventsEnded').get(verifyJwtOrganization,allEventsEnded)
router.route("/eventdetails/:id").get(verifyJwtOrganization,checkIfUserApprovedByAdmin,eventDetails);
router.route('/eventUpdate/:id').post(verifyJwtOrganization,checkIfUserApprovedByAdmin,upload.single('image'),editEventDetails);
router.route('/checkIfpending/:id').post(verifyJwtOrganization,checkIfUserApprovedByAdmin,checkIfPendingOrApprovedByUniversity);
router.route("/fetchVolunteersForApproval/:id").get(verifyJwtOrganization,checkIfUserApprovedByAdmin,findAllPendingAcceptedAndRejectedVolunteers);
router.route("/acceptTheVolunteer").post(verifyJwtOrganization,checkIfUserApprovedByAdmin,acceptTheVolunteer);
router.route("/rejectTheVolunteer").post(verifyJwtOrganization,checkIfUserApprovedByAdmin,rejectTheVolunteer);
router.route("/acceptTorejectTheVolunteer").post(verifyJwtOrganization,checkIfUserApprovedByAdmin,FromAcceptTorejectTheVolunteer);
router.route("/rejectToAcceptTheVolunteer").post(verifyJwtOrganization,checkIfUserApprovedByAdmin,FromRejectToAcceptTheVolunteer);
router.route("/getEventVolunteers/:id").get(verifyJwtOrganization,checkIfUserApprovedByAdmin,getVolunteersByEvent);
router.route("/markAttendance/:id").post(verifyJwtOrganization,checkIfUserApprovedByAdmin,markAttendance);
router.route("/getAttendance/:id").get(verifyJwtOrganization,checkIfUserApprovedByAdmin,getAttendance);
router.route("/getAttendeesByDate/:id").post(verifyJwtOrganization,checkIfUserApprovedByAdmin,getAttendeesByDate);
router.route("/editAttendanceByDate/:id").post(verifyJwtOrganization,checkIfUserApprovedByAdmin,editAttendanceByDate);
router.route("/checkTheStatusOfEvent/:id").get(verifyJwtOrganization,checkIfUserApprovedByAdmin,checkTheStatusOfEvent);
router.route("/changeTheStatusOfEvent/:id").get(verifyJwtOrganization,checkIfUserApprovedByAdmin,changeEventStatus);
router.route("/endEvent/:id").post(verifyJwtOrganization,checkIfUserApprovedByAdmin,endEvent);
router.route("/getAllVolunteer/:id").get(verifyJwtOrganization,checkIfUserApprovedByAdmin,getAllVolunteers);
router.route("/reviewVolunteer/:eventId").post(verifyJwtOrganization,checkIfUserApprovedByAdmin,reviewVolunteer);
router.route("/getMyProfile").get(verifyJwtOrganization,getMyProfile);
router.route("/getMyPublicProfile/:id").get(getMyPublicProfile);
router.route("/addBio").post(verifyJwtOrganization,addBio);
router.route("/addPP").post(verifyJwtOrganization,upload.single("image"),addProfilePic);
router.route('/deleteEvent/:id').delete(verifyJwtOrganization,checkIfUserApprovedByAdmin,deleteEvent)
// // Define your cron schedule (runs every minute)
// cron.schedule('*/5 * * * * *', async () => {
//     try {
//         // Call your controller function
//          changeEventsStatus();
//          changeEventToEnd();
// pullFromCurrentEventsAndPushToPastEvents()
         

//         // Log success message
//         console.log('Controller function executed successfully.');
//     } catch (error) {
//         // Handle errors
//         console.error('Error executing controller function:', error);
//     }
// }, {
//     scheduled: true,
//     timezone: "Asia/Karachi" // Set timezone to Pakistan (Asia/Karachi)

// });
// changeEventsStatus()
// console.log('Cron job scheduled to run every minute.');
module.exports=router;