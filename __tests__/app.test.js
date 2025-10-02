import request from 'supertest';
import app from '../app';
import { connect, closeDatabase, clearDatabase } from '../api/config/mongoConfigTesting';

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe('API Endpoints', () => {
  it('should return pong from /api/ping', async () => {
    const res = await request(app).get('/api/ping');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'pong');
  });
});
