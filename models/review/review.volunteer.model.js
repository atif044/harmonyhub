const schema = require("../mongoose");
const mongoose = require("mongoose");
modal={
userId:{
    type:mongoose.Schema.ObjectId,
    ref:"User"
},
eventId:{
    type:mongoose.Schema.ObjectId,
    ref:"Event"
},
rating:{
    type:String,
    enum:["p","n"]
}
}
module.exports=schema.modelMake("ReviewVolunteer",schema.schemaMake(modal));