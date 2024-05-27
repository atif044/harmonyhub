const { cloudinaryConfig, uploader,api } = require('../config/cloudinaryConfig');
const ErrorHandler=require("../config/ErrorHandler")
const multer=require("multer");
const storage = multer.memoryStorage();
exports.upload = multer({ storage: storage });
cloudinaryConfig();

exports.uploadaImageToCloudinary = (imageBuffer) => {
    return new Promise((resolve, reject) => {
      uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
        if (error) {
            console.log(error)
          reject(new ErrorHandler("Error Uploading", 400));
        } else {
          // Cloudinary returns the uploaded image URL in the result
                    resolve(result);
        }
      }).end(imageBuffer); // Upload the processed image buffer
    });
  };
  
