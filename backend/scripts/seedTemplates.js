import mongoose from 'mongoose';
import { Template } from '../src/models/Template.js';
import dotenv from 'dotenv';

dotenv.config();

const templates = [
  {
    name: 'Instagram Post - Product Launch',
    category: 'social-post',
    vibe: 'bold',
    width: 1080,
    height: 1080,
    thumbnailUrl: '/templates/product-launch.jpg',
    templateData: {
      backgroundColor: '#ffffff',
      elements: [
        {
          type: 'text',
          content: 'NEW PRODUCT LAUNCH',
          x: 40,
          y: 150,
          width: 1000,
          height: 80,
          style: { fontSize: '48px', fontWeight: 'bold', color: '#000000' }
        },
        {
          type: 'text',
          content: 'Revolutionary innovation at your fingertips',
          x: 40,
          y: 250,
          width: 1000,
          height: 60,
          style: { fontSize: '24px', color: '#666666' }
        },
        {
          type: 'text',
          content: 'Shop Now',
          x: 440,
          y: 850,
          width: 200,
          height: 60,
          style: { fontSize: '18px', fontWeight: 'bold', color: '#ffffff', backgroundColor: '#FF6B6B' }
        }
      ]
    }
  },
  {
    name: 'Elegant Quote Card',
    category: 'social-post',
    vibe: 'elegant',
    width: 1080,
    height: 1080,
    thumbnailUrl: '/templates/quote-card.jpg',
    templateData: {
      backgroundColor: '#f8f9fa',
      elements: [
        {
          type: 'text',
          content: '"Success is not final, failure is not fatal"',
          x: 100,
          y: 400,
          width: 880,
          height: 200,
          style: { fontSize: '36px', fontStyle: 'italic', color: '#2c3e50', textAlign: 'center' }
        },
        {
          type: 'text',
          content: '- Winston Churchill',
          x: 100,
          y: 650,
          width: 880,
          height: 60,
          style: { fontSize: '20px', color: '#7f8c8d', textAlign: 'center' }
        }
      ]
    }
  },
  {
    name: 'Playful Event Poster',
    category: 'social-post',
    vibe: 'playful',
    width: 1080,
    height: 1080,
    thumbnailUrl: '/templates/event-poster.jpg',
    templateData: {
      backgroundColor: '#FFE066',
      elements: [
        {
          type: 'text',
          content: 'SUMMER FESTIVAL',
          x: 40,
          y: 200,
          width: 1000,
          height: 100,
          style: { fontSize: '52px', fontWeight: 'bold', color: '#FF6B6B', transform: 'rotate(-5deg)' }
        },
        {
          type: 'text',
          content: 'Join us for an amazing day of music, food, and fun!',
          x: 40,
          y: 350,
          width: 1000,
          height: 80,
          style: { fontSize: '24px', color: '#4ECDC4' }
        },
        {
          type: 'text',
          content: 'Get Tickets',
          x: 440,
          y: 800,
          width: 200,
          height: 60,
          style: { fontSize: '18px', fontWeight: 'bold', color: '#ffffff', backgroundColor: '#FF6B6B' }
        }
      ]
    }
  },
  {
    name: 'Minimal Business Card',
    category: 'business',
    vibe: 'minimal',
    width: 1080,
    height: 1080,
    thumbnailUrl: '/templates/business-card.jpg',
    templateData: {
      backgroundColor: '#ffffff',
      elements: [
        {
          type: 'text',
          content: 'John Doe',
          x: 40,
          y: 400,
          width: 1000,
          height: 80,
          style: { fontSize: '48px', fontWeight: '300', color: '#2c3e50' }
        },
        {
          type: 'text',
          content: 'Creative Director',
          x: 40,
          y: 500,
          width: 1000,
          height: 40,
          style: { fontSize: '20px', color: '#95a5a6' }
        },
        {
          type: 'text',
          content: 'hello@johndoe.com',
          x: 40,
          y: 600,
          width: 1000,
          height: 40,
          style: { fontSize: '18px', color: '#34495e' }
        }
      ]
    }
  },
  {
    name: 'Professional Announcement',
    category: 'social-post',
    vibe: 'professional',
    width: 1080,
    height: 1080,
    thumbnailUrl: '/templates/announcement.jpg',
    templateData: {
      backgroundColor: '#f8f9fa',
      elements: [
        {
          type: 'text',
          content: 'IMPORTANT ANNOUNCEMENT',
          x: 40,
          y: 200,
          width: 1000,
          height: 80,
          style: { fontSize: '40px', fontWeight: 'bold', color: '#2c3e50' }
        },
        {
          type: 'text',
          content: 'We are excited to share some important news with our community',
          x: 40,
          y: 350,
          width: 1000,
          height: 120,
          style: { fontSize: '24px', color: '#34495e', lineHeight: '1.4' }
        },
        {
          type: 'text',
          content: 'Learn More',
          x: 440,
          y: 800,
          width: 200,
          height: 60,
          style: { fontSize: '18px', fontWeight: 'bold', color: '#ffffff', backgroundColor: '#3498db' }
        }
      ]
    }
  }
];

async function seedTemplates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/design-tool');
    console.log('Connected to MongoDB');

    // Clear existing templates
    await Template.deleteMany({});
    console.log('Cleared existing templates');

    // Insert new templates
    await Template.insertMany(templates);
    console.log('Seeded templates successfully');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding templates:', error);
    process.exit(1);
  }
}

seedTemplates();
