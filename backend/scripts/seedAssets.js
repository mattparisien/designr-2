import mongoose from 'mongoose';
import Asset from '../src/models/Asset';

// Sample assets data
const sampleAssets = [
  {
    name: 'Sample Image 1',
    originalFilename: 'sample1.jpg',
    type: 'image',
    url: 'https://via.placeholder.com/300x200/3b82f6/ffffff?text=Sample+1',
    mimeType: 'image/jpeg',
    fileSize: 12345,
    thumbnail: 'https://via.placeholder.com/150x100/3b82f6/ffffff?text=Sample+1',
    userId: 'mock-user',
    tags: ['sample', 'blue'],
  },
  {
    name: 'Sample Image 2',
    originalFilename: 'sample2.jpg',
    type: 'image',
    url: 'https://via.placeholder.com/300x200/10b981/ffffff?text=Sample+2',
    mimeType: 'image/jpeg',
    fileSize: 23456,
    thumbnail: 'https://via.placeholder.com/150x100/10b981/ffffff?text=Sample+2',
    userId: 'mock-user',
    tags: ['sample', 'green'],
  },
  {
    name: 'Sample Image 3',
    originalFilename: 'sample3.jpg',
    type: 'image',
    url: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=Sample+3',
    mimeType: 'image/jpeg',
    fileSize: 34567,
    thumbnail: 'https://via.placeholder.com/150x100/f59e0b/ffffff?text=Sample+3',
    userId: 'mock-user',
    tags: ['sample', 'yellow'],
  },
  {
    name: 'Sample Image 4',
    originalFilename: 'sample4.jpg',
    type: 'image',
    url: 'https://via.placeholder.com/300x200/ec4899/ffffff?text=Sample+4',
    mimeType: 'image/jpeg',
    fileSize: 45678,
    thumbnail: 'https://via.placeholder.com/150x100/ec4899/ffffff?text=Sample+4',
    userId: 'mock-user',
    tags: ['sample', 'pink'],
  },
  {
    name: 'Sample Image 5',
    originalFilename: 'sample5.jpg',
    type: 'image',
    url: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Sample+5',
    mimeType: 'image/jpeg',
    fileSize: 56789,
    thumbnail: 'https://via.placeholder.com/150x100/8b5cf6/ffffff?text=Sample+5',
    userId: 'mock-user',
    tags: ['sample', 'purple'],
  }
];

async function seedAssets() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/design-tool';
    console.log('Connecting to MongoDB:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing sample assets
    await Asset.deleteMany({ userId: 'mock-user' });
    console.log('Cleared existing sample assets');

    // Insert sample assets
    const insertedAssets = await Asset.insertMany(sampleAssets);
    console.log(`Inserted ${insertedAssets.length} sample assets`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
    console.log('✅ Asset seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding assets:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedAssets();
