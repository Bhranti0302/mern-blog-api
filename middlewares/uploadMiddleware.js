const multer = require("multer");

// Store uploaded image temporarily in memory
const storage = multer.memoryStorage();

const upload = multer({
  storage,

  // Maximum image size: 5 MB
  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  // Allow only image files
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

module.exports = upload;
