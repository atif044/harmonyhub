const schema = require("../mongoose");
modal={
    email:{
        type:String,
        required:true
    },
    token:{
        type:String,
        required:true
    },
    tokenType:{
        type:String,
        required:true
    },
    tokenExpiry:{
        type:Date,
        index: { expires: '1h' }
    }
}
module.exports=schema.modelMake("token",schema.schemaMake(modal));