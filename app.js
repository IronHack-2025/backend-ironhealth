import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import patientRoutes from './api/routes/patients.route.js';
import professionalRoutes from './api/routes/professionals.route.js';
import appointmentsRoutes from './api/routes/appointments.route.js';
import authRoutes from './api/routes/auth.route.js';
import userRoutes from './api/routes/users.route.js';
import emailRoutes from './api/routes/email.route.js';

const app = express();

// Middleware para CORS (permite todas las solicitudes)
app.use(cors());
app.use(express.json());

// Usar la arquitectura MVC que hemos visto en clase. No va a hacer vistas como tal (no hay EJS), pero el JSON que devuelven los endpoints se puede llegar a considerar una especie de vista en este modelo.

app.use('/api', patientRoutes);

app.use('/api', professionalRoutes);

app.use('/api', appointmentsRoutes);

app.use('/api', authRoutes);

app.use('/api', userRoutes);

app.use('/api', emailRoutes);

// Conexión a MongoDB Atlas usando variables de entorno
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch(err => console.error('Error de conexión a MongoDB:', err));
}

// Endpoint de ejemplo
app.get('/api/pong', (req, res) => {
  res.json({ message: 'ping pong' });
});

app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

export default app;
