import request from 'supertest';
import app from '../../app';
import { connect, closeDatabase, clearDatabase } from '../../api/config/mongoConfigTesting';

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Patient Routes', () => {
  const newPatient = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    birthDate: '1990-01-01',
  };

  describe('GET /api/patients', () => {
    it('should get all patients', async () => {
      const res = await request(app).get('/api/patients');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('POST /api/patients', () => {
    it('should create a new patient', async () => {
      const res = await request(app).post('/api/patients').send(newPatient);
      expect(res.statusCode).toEqual(201);
      expect(res.body.data.firstName).toBe(newPatient.firstName);
    });

    it('should not create a patient with a missing field', async () => {
      const incompletePatient = { ...newPatient };
      delete incompletePatient.firstName;
      const res = await request(app).post('/api/patients').send(incompletePatient);
      expect(res.statusCode).toEqual(400);
    });

    it('should not create a patient with a duplicate email', async () => {
      await request(app).post('/api/patients').send(newPatient);
      const res = await request(app).post('/api/patients').send(newPatient);
      expect(res.statusCode).toEqual(400);
    });
  });
});
