// In-memory Multer upload: images are later pushed to Cloudinary by the
// room controller. Max 5 files, 5 MB each, images only.
const multer = require('multer');

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    return cb(null, true);
  }
  return cb(new Error('Only image files are allowed'));
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter
});

module.exports = { upload };
