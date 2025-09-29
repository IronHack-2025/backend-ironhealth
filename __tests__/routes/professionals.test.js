import request from 'supertest';
import app from '../../app';
import { connect, closeDatabase, clearDatabase } from '../../api/config/mongoConfigTesting';

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Professional Routes', () => {
  const newProfessional = {
    firstName: 'Jane',
    lastName: 'Doe',
    profession: '2001',
    email: 'jane.doe@example.com',
  };

  describe('GET /api/professionals', () => {
    it('should get all professionals', async () => {
      const res = await request(app).get('/api/professionals');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('POST /api/professionals', () => {
    it('should create a new professional', async () => {
      const res = await request(app).post('/api/professionals').send(newProfessional);
      expect(res.statusCode).toEqual(201);
      expect(res.body.data.firstName).toBe(newProfessional.firstName);
    });

    it('should not create a professional with a missing field', async () => {
      const incompleteProfessional = { ...newProfessional };
      delete incompleteProfessional.firstName;
      const res = await request(app).post('/api/professionals').send(incompleteProfessional);
      expect(res.statusCode).toEqual(400);
    });

    it('should not create a professional with a duplicate email', async () => {
      await request(app).post('/api/professionals').send(newProfessional);
      const res = await request(app).post('/api/professionals').send(newProfessional);
      expect(res.statusCode).toEqual(400);
    });
  });
});
