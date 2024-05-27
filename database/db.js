const mongoose = require("mongoose");
const {databaseName,uri}=require('./db.config')
const connectMongo = async () => {
  const connection = await mongoose.connect(
    `${uri}/${databaseName}`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  );
  if (connection) {
    console.log("Connection successful");
  } else console.log("err");
};
module.exports = connectMongo;