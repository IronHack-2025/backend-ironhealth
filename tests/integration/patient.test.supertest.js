// tests/patients.test.js
import request from 'supertest'
import app from '../app.js'   // tu servidor Express

// Seguimos utilizando la base de datos de test !!!!

describe('Patients API', () => {
  it('GET /api/patients debería devolver lista de pacientes', async () => {
    const res = await request(app).get('/api/patients')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('POST /api/patients debería crear un paciente', async () => {
    const newPatient = { ssn: "123456789012", name: "Juan" }
    const res = await request(app).post('/api/patients').send(newPatient)
    expect(res.status).toBe(201)
    expect(res.body.name).toBe("Juan")
  })
})
