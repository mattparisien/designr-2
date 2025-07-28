// Test script to see exact CloudinaryStorage file object structure
require('dotenv').config();
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    return {
      folder: 'design-tool-assets',
      resource_type: 'auto'
    };
  },
});

// Mock a file upload to see the resulting file object structure
const mockFile = {
  fieldname: 'asset',
  originalname: 'test.png',
  encoding: '7bit',
  mimetype: 'image/png',
  stream: null,
  destination: '',
  filename: '',
  path: '',
  size: 0
};

storage._handleFile({}, mockFile, (err, info) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('Success! File info structure:');
    console.log(JSON.stringify(info, null, 2));
    console.log('Available properties:', Object.keys(info));
  }
});
