const schema = require("../mongoose");
const mongoose = require("mongoose");
modal = {
  fullName: {
    type: String,
    required: [true, "It is a Required Field"],
    min: [2, "Firt Name must be atleast 2 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is a required field"],
    unique: [true, "Email must be unique"],
  },
  dateOfBirth:{
    type:Date,
    required:true
  },
  password: {
    type: String,
    required: [true, "Password is a required field"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  profilePic: {
    type: String,
    default: "",
  },
  gender:{
    type:String,
    required:true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bio: {
    type: String,
    max:255
  },
  eventAppliedFor:[
    {
        type:mongoose.Types.ObjectId,
        ref:"Event"
    }
  ],
  eventAppliedForRequested:[
    {
        type:mongoose.Types.ObjectId,
        ref:"Event"
    }
  ],
  certifications:{
    type:Array
  },
  isVerifiedByAdmin:{
    type:Boolean,
    default:false
  },
  universityId:{
    type:mongoose.Types.ObjectId,
    ref:"University"
  },
  enrollmentNo:{
    type:String,
  },
  studentCardPic:{
    type:String
  },
  cnicFront:{
    type:String,
    required:true
  },
  cnicBack:{
    type:String,
    required:true
  },
  country:{
    type:String,
    required:true
  },
  city:{
    type:String,
    required:true
  },
  cspHours:{
    type:Number,
    default:0
  },
  about:{
      type:String,
      default:"Not Added"
  }
};
module.exports=schema.modelMake("User",schema.schemaMake(modal))