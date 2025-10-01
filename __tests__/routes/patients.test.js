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

describe('Patient Routes', () => {
  let adminToken;
  let professionalToken;
  let patientToken;
  let patientData;

  const newPatient = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1122334455',
    birthDate: '1990-01-01',
    dni: '23456789P',
    gender: 'male',
    street: 'Main Street 123',
    city: 'Madrid',
    postalCode: '28001',
    nationality: 'Spanish',
    emergencyContact: '+5544332211',
  };

  beforeEach(async () => {
    const admin = await createAdminToken();
    adminToken = admin.token;

    const professional = await createProfessionalToken();
    professionalToken = professional.token;

    const patient = await createPatientToken();
    patientToken = patient.token;
    patientData = patient.patient;
  });

  describe('GET /api/patients', () => {
    it('should get all patients with admin token', async () => {
      const res = await request(app)
        .get('/api/patients')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should get all patients with professional token', async () => {
      const res = await request(app)
        .get('/api/patients')
        .set('Authorization', `Bearer ${professionalToken}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should not get patients without token', async () => {
      const res = await request(app).get('/api/patients');
      expect(res.statusCode).toEqual(401);
    });

    it('should not get patients with patient token', async () => {
      const res = await request(app)
        .get('/api/patients')
        .set('Authorization', `Bearer ${patientToken}`);
      expect(res.statusCode).toEqual(403);
    });
  });

  describe('POST /api/patients', () => {
    it('should create a new patient with admin token', async () => {
      const res = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newPatient);
      expect(res.statusCode).toEqual(201);
      expect(res.body.data.patient.firstName).toBe(newPatient.firstName);
      expect(res.body.data.authCreated).toBe(true);
      expect(res.body.data.credentials.email).toBe(newPatient.email);
    });

    it('should create a new patient with professional token', async () => {
      const res = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${professionalToken}`)
        .send(newPatient);
      expect(res.statusCode).toEqual(201);
      expect(res.body.data.patient.firstName).toBe(newPatient.firstName);
    });

    it('should not create a patient without token', async () => {
      const res = await request(app).post('/api/patients').send(newPatient);
      expect(res.statusCode).toEqual(401);
    });

    it('should not create a patient with patient token', async () => {
      const res = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(newPatient);
      expect(res.statusCode).toEqual(403);
    });

    it('should not create a patient with missing required fields', async () => {
      const incompletePatient = { ...newPatient };
      delete incompletePatient.firstName;
      const res = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompletePatient);
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should not create a patient with invalid email', async () => {
      const invalidPatient = { ...newPatient, email: 'invalid-email' };
      const res = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidPatient);
      expect(res.statusCode).toEqual(400);
    });

    it('should not create a patient with invalid DNI', async () => {
      const invalidPatient = { ...newPatient, dni: 'INVALID' };
      const res = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidPatient);
      expect(res.statusCode).toEqual(400);
    });

    it('should not create a patient with duplicate email', async () => {
      await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newPatient);
      const res = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newPatient);
      expect(res.statusCode).toEqual(400);
    });

    it('should not create a patient with invalid gender', async () => {
      const invalidPatient = { ...newPatient, gender: 'invalid' };
      const res = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidPatient);
      expect(res.statusCode).toEqual(400);
    });

    it('should not create a patient with future birthDate', async () => {
      const invalidPatient = { ...newPatient, birthDate: '2030-01-01' };
      const res = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidPatient);
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /api/patients/:id', () => {
    it('should get a patient by id with admin token', async () => {
      const res = await request(app)
        .get(`/api/patients/${patientData._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data._id).toBe(patientData._id.toString());
    });

    it('should get own patient profile with patient token', async () => {
      const res = await request(app)
        .get(`/api/patients/${patientData._id}`)
        .set('Authorization', `Bearer ${patientToken}`);
      expect(res.statusCode).toEqual(200);
    });

    it('should not get patient without token', async () => {
      const res = await request(app).get(`/api/patients/${patientData._id}`);
      expect(res.statusCode).toEqual(401);
    });

    it('should return 404 for non-existent patient', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/api/patients/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(404);
    });

    it('should return 400 for invalid patient id', async () => {
      const res = await request(app)
        .get('/api/patients/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('PUT /api/patients/:id/edit', () => {
    it('should update a patient with admin token', async () => {
      const updateData = {
        ...newPatient,
        firstName: 'Jane',
        email: 'jane.doe@example.com',
        dni: '87654321X',
        phone: '+9876543210',
      };
      const res = await request(app)
        .put(`/api/patients/${patientData._id}/edit`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.firstName).toBe('Jane');
    });

    it('should update a patient with professional token', async () => {
      const updateData = {
        ...newPatient,
        firstName: 'Jane',
        email: 'jane.doe@example.com',
        dni: '87654321X',
        phone: '+9876543210',
      };
      const res = await request(app)
        .put(`/api/patients/${patientData._id}/edit`)
        .set('Authorization', `Bearer ${professionalToken}`)
        .send(updateData);
      expect(res.statusCode).toEqual(200);
    });

    it('should not update patient without token', async () => {
      const updateData = { ...newPatient, firstName: 'Jane' };
      const res = await request(app).put(`/api/patients/${patientData._id}/edit`).send(updateData);
      expect(res.statusCode).toEqual(401);
    });

    it('should not update patient with patient token', async () => {
      const updateData = { ...newPatient, firstName: 'Jane' };
      const res = await request(app)
        .put(`/api/patients/${patientData._id}/edit`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(updateData);
      expect(res.statusCode).toEqual(403);
    });

    it('should return 404 for non-existent patient', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = { ...newPatient };
      const res = await request(app)
        .put(`/api/patients/${fakeId}/edit`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /api/patients/:id/delete', () => {
    it('should soft delete a patient with admin token', async () => {
      const res = await request(app)
        .put(`/api/patients/${patientData._id}/delete`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.active).toBe(false);
    });

    it('should soft delete a patient with professional token', async () => {
      const res = await request(app)
        .put(`/api/patients/${patientData._id}/delete`)
        .set('Authorization', `Bearer ${professionalToken}`);
      expect(res.statusCode).toEqual(200);
    });

    it('should not delete patient without token', async () => {
      const res = await request(app).put(`/api/patients/${patientData._id}/delete`);
      expect(res.statusCode).toEqual(401);
    });

    it('should not delete patient with patient token', async () => {
      const res = await request(app)
        .put(`/api/patients/${patientData._id}/delete`)
        .set('Authorization', `Bearer ${patientToken}`);
      expect(res.statusCode).toEqual(403);
    });

    it('should return 404 for non-existent patient', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .put(`/api/patients/${fakeId}/delete`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(404);
    });
  });
});
