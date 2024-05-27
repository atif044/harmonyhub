const schema = require("../mongoose");
const mongoose = require("mongoose");
const modal = {
  organizationName: {
    type: String,
    required: true,
  },
  organizationEmail: {
    type: String,
    required: true,
  },
  organizationPassword: {
    type: String,
    required: true,
  },
  organizationPhoneNo:{
    type: String,
    required: true,
  },
  organizationSize:{
    type:Number,
    required:true
  },
  organizationWebsiteLink:{
    type: String,
    required: true,
  },
  organizationDescription:{
    type: String,
    // required: true,
  },
  isVerified: {
    type: Boolean,
    default: 0,
  },
  isVerifiedByAdmin: {
    type: Boolean,
    default: false,
  },
  currentOrganizationEvents:[
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
  ],
  pastOrganizationEvents:[
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
  ],
  profilePic:{
    type:String,
    default:"https://res.cloudinary.com/dc5z2ofbj/image/upload/v1713971862/rxu2kuyegzgrk9obq49w.png"
  }

};
module.exports = schema.modelMake("Organization", schema.schemaMake(modal));
