import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import templateRoutes from './template';
import Template from '../models/Template';

// Mock the AI utils to avoid making actual API calls during testing
jest.mock('../utils/ai', () => ({
  generateDescriptionAndTags: jest.fn().mockResolvedValue({
    description: 'AI-generated test description',
    tags: ['test', 'ai-generated', 'social', 'design']
  })
}));

const { generateDescriptionAndTags } = require('../utils/ai');

let mongoServer: MongoMemoryServer;
let app: express.Application;
let createdTemplateId: string;

beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    // Start in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to test database
    await mongoose.connect(mongoUri);
    
    // Create a minimal Express app for testing
    app = express();
    app.use(express.json());
    app.use('/api/templates', templateRoutes);
    
    // Clean the database before tests
    await Template.deleteMany({});
});

afterAll(async () => {
    // Clean up after tests
    await Template.deleteMany({});
    await mongoose.connection.close();
    
    // Stop the in-memory MongoDB instance
    if (mongoServer) {
        await mongoServer.stop();
    }
});

describe('Template API', () => {
    const baseUrl = '/api/templates';

    it('should create a new template with valid data', async () => {
        const res = await request(app).post(baseUrl).send({
            title: 'Test Template',
            category: 'social',
            canvasSize: { width: 1080, height: 1920 },
            pages: [{
                id: 'page1',
                canvas: {
                    elements: [
                        {
                            type: 'text',
                            content: 'Welcome to our store!',
                            color: '#333333',
                            fontSize: 32,
                            fontFamily: 'Helvetica',
                            x: 50,
                            y: 50,
                            width: 400,
                            height: 100
                        }
                    ],
                    backgroundColor: '#f0f0f0',
                    canvasSize: { width: 1080, height: 1920 }
                }
            }],
            isPublic: true,
            createdBy: new mongoose.Types.ObjectId(),
        });

        expect(res.status).toBe(201);
        expect(res.body._id).toBeDefined();
        expect(res.body.description).toBe('AI-generated test description');
        expect(res.body.tags).toEqual(['test', 'ai-generated', 'social', 'design']);
        expect(generateDescriptionAndTags).toHaveBeenCalled();
        createdTemplateId = res.body._id;
    });

    it('should fail to create a template with missing fields', async () => {
        const res = await request(app).post(baseUrl).send({ title: 'Incomplete' });
        expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('should get all templates', async () => {
        const res = await request(app).get(baseUrl);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should filter templates by category', async () => {
        const res = await request(app).get(`${baseUrl}?category=social`);
        expect(res.status).toBe(200);
    });

    it('should return 500 for invalid ID format on GET', async () => {
        const res = await request(app).get(`${baseUrl}/invalid-id`);
        expect(res.status).toBe(500);
    });

    it('should get a template by valid ID', async () => {
        const res = await request(app).get(`${baseUrl}/${createdTemplateId}`);
        expect(res.status).toBe(200);
        expect(res.body._id).toBe(createdTemplateId);
    });

    it('should update a template by ID', async () => {
        const res = await request(app).put(`${baseUrl}/${createdTemplateId}`).send({
            title: 'Updated Template',
            pages: [{
                id: 'page1',
                canvas: {
                    elements: [
                        {
                            type: 'text',
                            content: 'Hello World',
                            color: '#000000',
                            fontSize: 24,
                            fontFamily: 'Arial',
                            x: 100,
                            y: 100,
                            width: 200,
                            height: 50
                        },
                        {
                            type: 'shape',
                            shapeType: 'rectangle',
                            fill: '#ff0000',
                            stroke: '#000000',
                            strokeWidth: 2,
                            x: 50,
                            y: 50,
                            width: 300,
                            height: 150
                        }
                    ],
                    backgroundColor: '#ffffff',
                    canvasSize: { width: 1080, height: 1920 }
                }
            }]
        });
        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Updated Template');
        expect(res.body.description).toBe('AI-generated test description');
        expect(res.body.tags).toEqual(['test', 'ai-generated', 'social', 'design']);
        expect(generateDescriptionAndTags).toHaveBeenCalled();
    });

    it('should return 404 when deleting non-existent template', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app).delete(`${baseUrl}/${fakeId}`);
        expect(res.status).toBe(404);
    });

    it('should delete the template by ID', async () => {
        const res = await request(app).delete(`${baseUrl}/${createdTemplateId}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Template deleted');
    });
});
