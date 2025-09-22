import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import Patient from './models/patient'

let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

beforeEach(async () => {
  await Patient.deleteMany({})
})

describe('Patient model', () => {

  it('debe crear un paciente válido', async () => {
    const patient = new Patient({
      firstName: 'Ana',
      lastName: 'Gómez',
      email: 'ana@example.com',
      phone: '+34123456789',
      birthDate: new Date('1990-05-10'),
    })

    const saved = await patient.save()
    expect(saved._id).toBeDefined()
    expect(saved.firstName).toBe('Ana')
  })

  it('debe fallar si el email no es válido', async () => {
    const patient = new Patient({
      firstName: 'Ana',
      lastName: 'Gómez',
      email: 'email-no-valido',
      phone: '+34123456789',
      birthDate: new Date('1990-05-10'),
    })

    await expect(patient.save()).rejects.toThrow(/is not a valid email/)
  })

  it('debe fallar si falta un campo requerido', async () => {
    const patient = new Patient({
      firstName: 'Ana',
      email: 'ana@example.com',
      phone: '+34123456789',
      birthDate: new Date('1990-05-10'),
    })

    await expect(patient.save()).rejects.toThrow(/Patient validation failed/)
  })

  it('debe fallar si el phone no tiene formato correcto', async () => {
    const patient = new Patient({
      firstName: 'Ana',
      lastName: 'Gómez',
      email: 'ana@example.com',
      phone: '123456',
      birthDate: new Date('1990-05-10'),
    })

    await expect(patient.save()).rejects.toThrow(/is not a valid phone number/)
  })

})
