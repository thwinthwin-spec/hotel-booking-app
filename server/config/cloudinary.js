// Cloudinary setup. Images are sent from Multer memory storage as base64
// data URIs, so no temporary files are written to disk.
require('dotenv').config();
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Upload every Multer file buffer and return the public secure URLs.
// A failed image is logged and skipped so one bad file does not kill the request.
async function uploadRoomImages(files = []) {
  const urls = [];
  for (const file of files) {
    if (!file || !file.buffer) continue;
    try {
      const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'hotel-booking/rooms',
        resource_type: 'image'
      });
      urls.push(result.secure_url);
    } catch (error) {
      console.error('Cloudinary upload failed:', error.message);
    }
  }
  return urls;
}

module.exports = { cloudinary, uploadRoomImages };
