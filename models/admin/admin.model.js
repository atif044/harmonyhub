const schema = require("../mongoose");
const mongoose = require("mongoose");
modal = {
  name: {
    type: String,
    required: [true, "It is a Required Field"],
    min: [2, "Firt Name must be atleast 2 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is a required field"],
    unique: [true, "Email must be unique"],
  },
  
  password: {
    type: String,
    required: [true, "Password is a required field"],
  },
  
};
module.exports=schema.modelMake("Admin",schema.schemaMake(modal))