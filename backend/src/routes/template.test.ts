import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import templateRoutes from './template';
import Template, { TemplateCategory } from '../models/Template';

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
            category: TemplateCategory.SOCIAL,
            canvasSize: { width: 1080, height: 1920 },
            pages: [],
            isPublic: true,
            createdBy: new mongoose.Types.ObjectId(),
        });

        expect(res.status).toBe(201);
        expect(res.body._id).toBeDefined();
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
            title: 'Updated Template'
        });
        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Updated Template');
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
