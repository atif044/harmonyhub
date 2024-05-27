const jwt = require("jsonwebtoken");
const generateJwtAdmin = (data) => {
  const token = jwt.sign(data, process.env.JWT_SIGNATURE_ADMIN, { expiresIn: "1d" });
  return token;
};
module.exports = generateJwtAdmin;
