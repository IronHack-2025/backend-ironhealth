import request from 'supertest';
import app from '../../app';
import { connect, closeDatabase, clearDatabase } from '../../api/config/mongoConfigTesting';
import {
  createAdminToken,
  createProfessionalToken,
  createPatientToken,
} from '../helpers/authHelper';

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Professional Routes', () => {
  let adminToken;
  let professionalToken;
  let patientToken;
  let professionalData;

  const newProfessional = {
    firstName: 'Jane',
    lastName: 'Smith',
    profession: '2001',
    specialty: 'CAR', // Cardiology specialty code
    email: 'jane.smith@example.com',
    dni: '34567890Q',
    professionLicenceNumber: 'MED12345',
  };

  beforeEach(async () => {
    const admin = await createAdminToken();
    adminToken = admin.token;

    const professional = await createProfessionalToken();
    professionalToken = professional.token;
    professionalData = professional.professional;

    const patient = await createPatientToken();
    patientToken = patient.token;
  });

  describe('GET /api/professionals', () => {
    it('should get all professionals with admin token', async () => {
      const res = await request(app)
        .get('/api/professionals')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should get all professionals with professional token', async () => {
      const res = await request(app)
        .get('/api/professionals')
        .set('Authorization', `Bearer ${professionalToken}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should get all professionals with patient token', async () => {
      const res = await request(app)
        .get('/api/professionals')
        .set('Authorization', `Bearer ${patientToken}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should not get professionals without token', async () => {
      const res = await request(app).get('/api/professionals');
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('POST /api/professionals', () => {
    it('should create a new professional with admin token', async () => {
      const res = await request(app)
        .post('/api/professionals')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProfessional);
      expect(res.statusCode).toEqual(201);
      expect(res.body.data.professional.firstName).toBe(newProfessional.firstName);
      expect(res.body.data.authCreated).toBe(true);
      expect(res.body.data.credentials.email).toBe(newProfessional.email);
    });

    it('should not create a professional without token', async () => {
      const res = await request(app).post('/api/professionals').send(newProfessional);
      expect(res.statusCode).toEqual(401);
    });

    it('should not create a professional with professional token', async () => {
      const res = await request(app)
        .post('/api/professionals')
        .set('Authorization', `Bearer ${professionalToken}`)
        .send(newProfessional);
      expect(res.statusCode).toEqual(403);
    });

    it('should not create a professional with patient token', async () => {
      const res = await request(app)
        .post('/api/professionals')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(newProfessional);
      expect(res.statusCode).toEqual(403);
    });

    it('should not create a professional with missing required fields', async () => {
      const incompleteProfessional = { ...newProfessional };
      delete incompleteProfessional.firstName;
      const res = await request(app)
        .post('/api/professionals')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompleteProfessional);
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should not create a professional with invalid email', async () => {
      const invalidProfessional = { ...newProfessional, email: 'invalid-email' };
      const res = await request(app)
        .post('/api/professionals')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidProfessional);
      expect(res.statusCode).toEqual(400);
    });

    it('should not create a professional with invalid DNI', async () => {
      const invalidProfessional = { ...newProfessional, dni: 'INVALID' };
      const res = await request(app)
        .post('/api/professionals')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidProfessional);
      expect(res.statusCode).toEqual(400);
    });

    it('should not create a professional with duplicate email', async () => {
      await request(app)
        .post('/api/professionals')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProfessional);
      const res = await request(app)
        .post('/api/professionals')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProfessional);
      expect(res.statusCode).toEqual(400);
    });

    it('should not create a professional with invalid profession code', async () => {
      const invalidProfessional = { ...newProfessional, profession: 'X' };
      const res = await request(app)
        .post('/api/professionals')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidProfessional);
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /api/professionals/:id', () => {
    it('should get a professional by id with admin token', async () => {
      const res = await request(app)
        .get(`/api/professionals/${professionalData._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data._id).toBe(professionalData._id.toString());
    });

    it('should get a professional by id with professional token', async () => {
      const res = await request(app)
        .get(`/api/professionals/${professionalData._id}`)
        .set('Authorization', `Bearer ${professionalToken}`);
      expect(res.statusCode).toEqual(200);
    });

    it('should get a professional by id with patient token', async () => {
      const res = await request(app)
        .get(`/api/professionals/${professionalData._id}`)
        .set('Authorization', `Bearer ${patientToken}`);
      expect(res.statusCode).toEqual(200);
    });

    it('should not get professional without token', async () => {
      const res = await request(app).get(`/api/professionals/${professionalData._id}`);
      expect(res.statusCode).toEqual(401);
    });

    it('should return 404 for non-existent professional', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/api/professionals/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(404);
    });

    it('should return 400 for invalid professional id', async () => {
      const res = await request(app)
        .get('/api/professionals/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('PUT /api/professionals/:id/edit', () => {
    it('should update a professional with admin token', async () => {
      const updateData = {
        ...newProfessional,
        firstName: 'Janet',
        email: 'janet.smith@example.com',
        dni: '45678901R',
      };
      const res = await request(app)
        .put(`/api/professionals/${professionalData._id}/edit`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.firstName).toBe('Janet');
    });

    it('should not update professional without token', async () => {
      const updateData = { ...newProfessional, firstName: 'Janet' };
      const res = await request(app)
        .put(`/api/professionals/${professionalData._id}/edit`)
        .send(updateData);
      expect(res.statusCode).toEqual(401);
    });

    it('should not update professional with professional token', async () => {
      const updateData = { ...newProfessional, firstName: 'Janet' };
      const res = await request(app)
        .put(`/api/professionals/${professionalData._id}/edit`)
        .set('Authorization', `Bearer ${professionalToken}`)
        .send(updateData);
      expect(res.statusCode).toEqual(403);
    });

    it('should not update professional with patient token', async () => {
      const updateData = { ...newProfessional, firstName: 'Janet' };
      const res = await request(app)
        .put(`/api/professionals/${professionalData._id}/edit`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(updateData);
      expect(res.statusCode).toEqual(403);
    });

    it('should return 404 for non-existent professional', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = { ...newProfessional };
      const res = await request(app)
        .put(`/api/professionals/${fakeId}/edit`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /api/professionals/:id/delete', () => {
    it('should toggle professional active status with admin token', async () => {
      const res = await request(app)
        .put(`/api/professionals/${professionalData._id}/delete`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.active).toBe(false);
    });

    it('should not delete professional without token', async () => {
      const res = await request(app).put(`/api/professionals/${professionalData._id}/delete`);
      expect(res.statusCode).toEqual(401);
    });

    it('should not delete professional with professional token', async () => {
      const res = await request(app)
        .put(`/api/professionals/${professionalData._id}/delete`)
        .set('Authorization', `Bearer ${professionalToken}`);
      expect(res.statusCode).toEqual(403);
    });

    it('should not delete professional with patient token', async () => {
      const res = await request(app)
        .put(`/api/professionals/${professionalData._id}/delete`)
        .set('Authorization', `Bearer ${patientToken}`);
      expect(res.statusCode).toEqual(403);
    });

    it('should return 404 for non-existent professional', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .put(`/api/professionals/${fakeId}/delete`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(404);
    });
  });
});
