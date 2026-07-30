const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure base images directory exists
const baseDir = path.join(__dirname, '../public/images');
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

// Storage engine configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.uploadFolder || 'misc';
    const targetDir = path.join(baseDir, folder);
    
    // Ensure specific subfolder exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    // Generate unique name: fieldname-timestamp-random-originalName
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter (accepts images only)
const fileFilter = (req, file, cb) => {
  // Allowed extensions (including user-added avif and jfif)
  const allowedFileTypes = /jpeg|jpg|png|gif|webp|avif|jfif/;
  // Check extension
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (jpeg, jpg, png, gif, webp, avif, jfif) are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit per file
  }
});

/**
 * Middleware for single file upload
 * @param {string} fieldName - The name of the form field containing the file
 * @param {string} folder - The subfolder name (e.g. 'products', 'categories', 'banners', 'users')
 */
const uploadSingle = (fieldName, folder = 'misc') => {
  return (req, res, next) => {
    req.uploadFolder = folder;
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed.'
        });
      }
      next();
    });
  };
};

/**
 * Middleware for multiple files upload
 * @param {string} fieldName - The name of the form field containing the files array
 * @param {string} folder - The subfolder name (e.g. 'products', 'categories', 'banners', 'users')
 * @param {number} maxCount - Maximum number of files allowed
 */
const uploadMultiple = (fieldName, folder = 'misc', maxCount = 10) => {
  return (req, res, next) => {
    req.uploadFolder = folder;
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'Multiple files upload failed.'
        });
      }
      next();
    });
  };
};

/**
 * Middleware for named fields upload (e.g. two different image inputs)
 * @param {Array} fields - Array of { name, maxCount } objects
 * @param {string} folder - The subfolder name
 */
const uploadFields = (fields, folder = 'misc') => {
  return (req, res, next) => {
    req.uploadFolder = folder;
    upload.fields(fields)(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed.'
        });
      }
      next();
    });
  };
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields
};
