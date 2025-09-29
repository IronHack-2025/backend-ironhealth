import request from 'supertest';
import app from '../../app';
import { connect, closeDatabase, clearDatabase } from '../../api/config/mongoConfigTesting';

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

import Patient from '../../api/models/Patient.model.js';
import Professional from '../../api/models/professionals.model.js';

describe('Appointment Routes', () => {
  let patient;
  let professional;

  beforeEach(async () => {
    patient = await Patient.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      birthDate: '1990-01-01',
    });

    professional = await Professional.create({
      firstName: 'Jane',
      lastName: 'Doe',
      profession: '2001',
      email: 'jane.doe@example.com',
      color: '#FFFFFF',
    });
  });

  const newAppointment = () => ({
    patientId: patient._id,
    professionalId: professional._id,
    startDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  });

  describe('GET /api/appointment', () => {
    it('should get all appointments', async () => {
      const res = await request(app).get('/api/appointment');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('POST /api/appointment', () => {
    it('should create a new appointment', async () => {
      const appointmentData = newAppointment();
      const res = await request(app).post('/api/appointment').send(appointmentData);
      expect(res.statusCode).toEqual(201);
      expect(res.body.data.patientId).toBe(patient._id.toString());
    });
  });

  describe('DELETE /api/appointment/:id', () => {
    it('should delete an appointment', async () => {
      const appointmentData = newAppointment();
      const created = await request(app).post('/api/appointment').send(appointmentData);
      const res = await request(app).delete(`/api/appointment/${created.body.data._id}`);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('PUT /api/appointment/:id', () => {
    it('should cancel an appointment', async () => {
      const appointmentData = newAppointment();
      const created = await request(app).post('/api/appointment').send(appointmentData);
      const res = await request(app).put(`/api/appointment/${created.body.data._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.status.cancelled).toBe(true);
    });
  });

  describe('PATCH /api/appointment/:id/notes', () => {
    it('should update appointment notes', async () => {
      const appointmentData = newAppointment();
      const created = await request(app).post('/api/appointment').send(appointmentData);
      const notes = { notes: 'Test notes' };
      const res = await request(app)
        .patch(`/api/appointment/${created.body.data._id}/notes`)
        .send(notes);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.notes).toBe(notes.notes);
    });
  });
});
