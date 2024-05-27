const schema = require("../mongoose");
const mongoose = require("mongoose");
const modal ={
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:"User"
    },
    eventId:{
        type:mongoose.Schema.ObjectId,
        ref:"Event"
    },
    status:{
        type:String,
        default:"pending",
        enum:["pending","issued"]
    },
    time:{
        type:Date,
        default:Date.now
    }
}

module.exports=schema.modelMake("CertificateRequest",schema.schemaMake(modal));