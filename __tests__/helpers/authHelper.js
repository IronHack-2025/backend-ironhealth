import jwt from 'jsonwebtoken';
import User from '../../api/models/User.model.js';
import Patient from '../../api/models/Patient.model.js';
import Professional from '../../api/models/professionals.model.js';

// Use a consistent test secret
const TEST_JWT_SECRET = 'test-jwt-secret-key-for-testing-only';

// Set the JWT_SECRET for tests if not already set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = TEST_JWT_SECRET;
}

export const createAdminToken = async () => {
  const admin = await User.create({
    email: 'admin@test.com',
    password: 'Admin123!',
    role: 'admin',
    isActive: true,
  });

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  return { token, user: admin };
};

export const createProfessionalToken = async () => {
  const professional = await Professional.create({
    firstName: 'Test',
    lastName: 'Professional',
    profession: '2001',
    email: 'professional@test.com',
    dni: '12345678A',
    color: '#FFFFFF',
  });

  const user = await User.create({
    email: 'professional@test.com',
    password: '12345678A',
    role: 'professional',
    profileId: professional._id,
    profileModel: 'Professional',
    isActive: true,
  });

  await Professional.findByIdAndUpdate(professional._id, { userId: user._id });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  return { token, user, professional };
};

export const createPatientToken = async () => {
  const patient = await Patient.create({
    firstName: 'Test',
    lastName: 'Patient',
    email: 'patient@test.com',
    phone: '+1234567890',
    birthDate: '1990-01-01',
    dni: '87654321B',
    gender: 'male',
    street: 'Test Street 123',
    city: 'Test City',
    postalCode: '12345',
    nationality: 'Spanish',
    emergencyContact: '+9876543210',
  });

  const user = await User.create({
    email: 'patient@test.com',
    password: '87654321B',
    role: 'patient',
    profileId: patient._id,
    profileModel: 'Patient',
    isActive: true,
  });

  await Patient.findByIdAndUpdate(patient._id, { userId: user._id });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  return { token, user, patient };
};
