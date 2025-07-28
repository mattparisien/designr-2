// Test script to debug Cloudinary environment variables
// Run this in the backend directory: node test-cloudinary-env.js

require('dotenv').config({ path: '.env' });

console.log('=== Cloudinary Environment Variables Test ===');
console.log('Current working directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('');

console.log('Cloudinary Configuration:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET present:', !!process.env.CLOUDINARY_API_SECRET);
console.log('');

// Test Cloudinary connection
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Cloudinary config object:');
console.log('cloud_name:', cloudinary.config().cloud_name);
console.log('api_key:', cloudinary.config().api_key);
console.log('api_secret present:', !!cloudinary.config().api_secret);
console.log('');

// Test if Cloudinary is properly configured
const isConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

console.log('Is Cloudinary properly configured?', isConfigured);

if (isConfigured) {
  console.log('✅ Cloudinary should work for uploads');
  console.log('Note: Files will be stored in Cloudinary in the "design-tool-assets" folder');
} else {
  console.log('❌ Cloudinary is NOT configured properly');
  console.log('Files will fallback to local storage in uploads/assets/');
  console.log('');
  console.log('To fix this:');
  console.log('1. Sign up at https://cloudinary.com');
  console.log('2. Get your cloud_name, api_key, and api_secret');
  console.log('3. Add them to your backend/.env file');
}

console.log('');
console.log('=== End Test ===');
