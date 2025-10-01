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

describe('Appointment Routes', () => {
  let adminToken;
  let professionalToken;
  let professionalData;
  let patientData;

  beforeEach(async () => {
    const admin = await createAdminToken();
    adminToken = admin.token;

    const professional = await createProfessionalToken();
    professionalToken = professional.token;
    professionalData = professional.professional;

    const patient = await createPatientToken();
    patientData = patient.patient;
  });

  const newAppointment = () => ({
    patientId: patientData._id,
    professionalId: professionalData._id,
    startDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  });

  describe('GET /api/appointment', () => {
    it('should get all appointments with admin token', async () => {
      const res = await request(app)
        .get('/api/appointment')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should not get appointments without token', async () => {
      const res = await request(app).get('/api/appointment');
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('POST /api/appointment', () => {
    it('should create a new appointment with admin token', async () => {
      const appointmentData = newAppointment();
      const res = await request(app)
        .post('/api/appointment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(appointmentData);
      expect(res.statusCode).toEqual(201);
      expect(res.body.data.patientId).toBe(patientData._id.toString());
    });

    it('should not create appointment without token', async () => {
      const appointmentData = newAppointment();
      const res = await request(app).post('/api/appointment').send(appointmentData);
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('DELETE /api/appointment/:id', () => {
    it('should delete an appointment with admin token', async () => {
      const appointmentData = newAppointment();
      const created = await request(app)
        .post('/api/appointment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(appointmentData);
      const res = await request(app)
        .delete(`/api/appointment/${created.body.data._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('PUT /api/appointment/:id', () => {
    it('should cancel an appointment with admin token', async () => {
      const appointmentData = newAppointment();
      const created = await request(app)
        .post('/api/appointment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(appointmentData);
      const res = await request(app)
        .put(`/api/appointment/${created.body.data._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('PATCH /api/appointment/:id/notes', () => {
    it('should update appointment notes with professional token', async () => {
      const appointmentData = newAppointment();
      const created = await request(app)
        .post('/api/appointment')
        .set('Authorization', `Bearer ${professionalToken}`)
        .send(appointmentData);
      const notesData = { notes: 'Test notes' };
      const res = await request(app)
        .patch(`/api/appointment/${created.body.data._id}/notes`)
        .set('Authorization', `Bearer ${professionalToken}`)
        .send(notesData);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeDefined();
    });
  });
});
