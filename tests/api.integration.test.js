import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let app;
let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
  process.env.NODE_ENV = 'test';

  // import app after setting MONGODB_URI
  const mod = await import('../app.js');
  app = mod.default;

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

describe('API integration tests (excluding newsletter)', () => {
  test('/api/ping should return pong', async () => {
    const res = await request(app).get('/api/ping');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'pong' });
  });

  test('POST /api/professionals should create a professional', async () => {
    const payload = {
      name: 'Ana',
      surname: 'Gomez',
      profession: 'Doctor',
      email: 'ana.gomez@example.com'
    };

    const res = await request(app).post('/api/professionals').send(payload);
    expect([200,201]).toContain(res.status);
    expect(res.body).toHaveProperty('email', payload.email);
  });

  test('POST /api/patients should create a patient', async () => {
    const payload = {
      firstName: 'Luis',
      lastName: 'Perez',
      email: 'luis.perez@example.com',
      phone: '123456789',
      birthDate: '1990-01-01'
    };

    const res = await request(app).post('/api/patients').send(payload);
    expect([200,201]).toContain(res.status);
  });
});
