import request from 'supertest';
import app from '../../app';
import { connect, closeDatabase, clearDatabase } from '../../api/config/mongoConfigTesting';
import {
  createAdminToken,
  createProfessionalToken,
  createPatientToken,
} from '../helpers/authHelper';
import User from '../../api/models/User.model.js';

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Auth Routes', () => {
  let adminToken;
  let professionalToken;
  let patientToken;
  let adminUser;

  beforeEach(async () => {
    const admin = await createAdminToken();
    adminToken = admin.token;
    adminUser = admin.user;

    const professional = await createProfessionalToken();
    professionalToken = professional.token;

    const patient = await createPatientToken();
    patientToken = patient.token;
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with admin credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@test.com',
        password: 'Admin123!',
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('admin@test.com');
      expect(res.body.data.user.role).toBe('admin');
    });

    it('should login successfully with professional credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'professional@test.com',
        password: '12345678A',
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('professional@test.com');
      expect(res.body.data.user.role).toBe('professional');
      expect(res.body.data.user.profile).toBeDefined();
    });

    it('should login successfully with patient credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'patient@test.com',
        password: '87654321B',
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('patient@test.com');
      expect(res.body.data.user.role).toBe('patient');
      expect(res.body.data.user.profile).toBeDefined();
    });

    it('should not login with missing email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        password: 'Admin123!',
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should not login with missing password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@test.com',
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should not login with invalid email format', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'invalid-email',
        password: 'Admin123!',
      });
      expect(res.statusCode).toEqual(400);
    });

    it('should not login with incorrect email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@test.com',
        password: 'Admin123!',
      });
      expect(res.statusCode).toEqual(401);
    });

    it('should not login with incorrect password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@test.com',
        password: 'WrongPassword',
      });
      expect(res.statusCode).toEqual(401);
    });

    it('should not login with inactive user', async () => {
      // Deactivate user
      await User.findByIdAndUpdate(adminUser._id, { isActive: false });

      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@test.com',
        password: 'Admin123!',
      });
      expect(res.statusCode).toEqual(401);
    });

    it('should return profile data for professional login', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'professional@test.com',
        password: '12345678A',
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.user.profile).toBeDefined();
      expect(res.body.data.user.profile.firstName).toBe('Test');
      expect(res.body.data.user.profile.lastName).toBe('Professional');
    });

    it('should return profile data for patient login', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'patient@test.com',
        password: '87654321B',
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.user.profile).toBeDefined();
      expect(res.body.data.user.profile.firstName).toBe('Test');
      expect(res.body.data.user.profile.lastName).toBe('Patient');
    });

    it('should not return profile data for admin login', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@test.com',
        password: 'Admin123!',
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.user.profile).toBeNull();
      expect(res.body.data.user.profileId).toBeNull();
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password successfully with admin token', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          currentPassword: 'Admin123!',
          newPassword: 'NewPassword123!',
        });
      expect(res.statusCode).toEqual(200);

      // Verify new password works
      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'admin@test.com',
        password: 'NewPassword123!',
      });
      expect(loginRes.statusCode).toEqual(200);
    });

    it('should change password successfully with professional token', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${professionalToken}`)
        .send({
          currentPassword: '12345678A',
          newPassword: 'NewPassword123!',
        });
      expect(res.statusCode).toEqual(200);
    });

    it('should change password successfully with patient token', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          currentPassword: '87654321B',
          newPassword: 'NewPassword123!',
        });
      expect(res.statusCode).toEqual(200);
    });

    it('should not change password without token', async () => {
      const res = await request(app).post('/api/auth/change-password').send({
        currentPassword: 'Admin123!',
        newPassword: 'NewPassword123!',
      });
      expect(res.statusCode).toEqual(401);
    });

    it('should not change password with missing currentPassword', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          newPassword: 'NewPassword123!',
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should not change password with missing newPassword', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          currentPassword: 'Admin123!',
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should not change password with newPassword too short', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          currentPassword: 'Admin123!',
          newPassword: '12345',
        });
      expect(res.statusCode).toEqual(400);
    });

    it('should not change password with incorrect currentPassword', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          currentPassword: 'WrongPassword',
          newPassword: 'NewPassword123!',
        });
      expect(res.statusCode).toEqual(400);
    });

    it('should hash the new password', async () => {
      await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          currentPassword: 'Admin123!',
          newPassword: 'NewPassword123!',
        });

      const user = await User.findById(adminUser._id);
      expect(user.password).not.toBe('NewPassword123!');
      expect(user.password.length).toBeGreaterThan(20); // Hashed password is longer
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully with admin token', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
    });

    it('should logout successfully with professional token', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${professionalToken}`);
      expect(res.statusCode).toEqual(200);
    });

    it('should logout successfully with patient token', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${patientToken}`);
      expect(res.statusCode).toEqual(200);
    });

    it('should not logout without token', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.statusCode).toEqual(401);
    });

    it('should not logout with invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.statusCode).toEqual(401);
    });
  });
});
