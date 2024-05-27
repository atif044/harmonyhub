const schema = require("../mongoose");
const mongoose = require("mongoose");
modal = {
    eventDate: Date,
    users: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Reference to the User schema
      },
      status: { type: String, enum: ['p', 'a'] } // 'p' for present, 'a' for absent
    }],
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event' // Reference to the Event schema
    },
    addedAt:{
      type:Date,
    },
    lastUpdatedAt:{
      type:Date,
      default:Date.now
    }
  }
module.exports=schema.modelMake("Attendance",schema.schemaMake(modal));