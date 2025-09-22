// tests/patients.test.js
import mongoose from 'mongoose'

import {it, expect, afterAll} from 'vistest'

// Antes de los tests, arranca el servidor por separado (npm run dev:test)
const API_URL = 'http://localhost:4000/api/patients'

describe('POST /api/patients', () => {
    // Después de ejecutar todos los tests...
  afterAll(async () => {
    // QUIZás: LIMPIAR la base de datos DE TEST (tenemos que ver como se configura una base de datos solo para test)
    // mongose....

    await mongoose.connection.close()
    
    
  })

  it('should create a new patient with valid data', async () => {
    const newPatient = {
      firstName: 'Carlos',
      lastName: 'López',
      email: 'carlos.lopez@example.com',
      phone: '600123456',
      birthDate: '1990-01-01'
    }

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPatient)
    })

    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data).toContain('Patient added succesfully')
  })

  it('should reject invalid patient data', async () => {
    const invalidPatient = {
      firstName: 'C', // demasiado corto
      lastName: 'Lopez',
      email: 'not-an-email',
      phone: 'invalid',
      birthDate: '2050-01-01' // futuro
    }

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPatient)
    })

    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toBeDefined()
  })
})

describe('GET /api/patients')