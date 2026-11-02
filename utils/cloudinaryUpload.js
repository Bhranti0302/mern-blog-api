const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },

      (error, result) => {
        if (error) {
          console.log("Cloudinary error:", error);
          console.log("Error name:", error.name);
          console.log("HTTP code:", error.http_code);
          console.log("Error response:", error.response);
          console.log("Error stack:", error.stack);
          console.dir(error, { depth: null });

          return reject(error);
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      },
    );

    // Send image buffer to Cloudinary
    uploadStream.end(fileBuffer);
  });
};

module.exports = uploadToCloudinary;
