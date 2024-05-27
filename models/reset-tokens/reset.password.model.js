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
    type:{
        type:String,
        required:true
    },
    tokenExpiry:{
        type:Date,
        index: { expires: '15m' }
    }
}
module.exports=schema.modelMake("ForgotPasswordToken",schema.schemaMake(modal));