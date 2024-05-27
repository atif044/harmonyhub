const schema = require("../mongoose");
const mongoose = require("mongoose");
const modal = {
  EventName: {
    type: String,
    required: true,
  },
  EventImage:{
    type:String,
  },
  EventDescription: {
    type: String,
    required: true,
  },
  VolunteersRequired: {
    type: Number,
    required: true,
  },
  VolunteersCount: {
    type: Number,
  },
  VolunteersIdApplied: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  VolunteersIdAppliedRequested: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  
  VolunteersIdAppliedRejected: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  
  eventLocationLink:{
    type:String,
    requiried:true
  },
  eventLocationName:{
    type:String,
    required:true
  },
  eventLocationEmbededLink:{
    type:String,
    required:true
  },
  longitude:{
    type:Number
  },
  latitude:{
    type:Number
  },
  eventDurationInDays:{
    type:String,
    required:true
  },
  organizationId:{
    type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
  },
  universityId:{
    type: mongoose.Schema.Types.ObjectId,
        ref: "University",
  },
  eventStartDate:{
    type:Date,
    required:true
  },
  eventEndDate:{
    type:Date,
    required:true
  },
  eventStartTime:{
    type:String,
    required:true
  },
  eventEndTime:{
    type:String,
    required:true
  },
  eventStatus:{
    type:String,
    default:"upcoming"
  },
  country:{
type:String,
required:true
},
  city:{
type:String,
required:true

  }
};
module.exports = schema.modelMake("Event", schema.schemaMake(modal));
