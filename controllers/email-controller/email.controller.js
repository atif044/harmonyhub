// controllers/emailController.js
const transporter = require('../../config/emailConfig');
async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject,
    html:text,
  };
  try{
    const info=await transporter.sendMail(mailOptions);
    if(info.response){
      return
    }

  }
  catch(error){
    throw new Error("An Error Occurred",400)
  }
}
module.exports = { sendEmail };
