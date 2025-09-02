
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import newsletterRoutes from './api/routes/newsletter.js'

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para CORS (permite todas las solicitudes)
app.use(cors());
app.use(express.json());

// Usar la arquitectura MVC que hemos visto en clase. No va a hacer vistas como tal (no hay EJS), pero el JSON que devuelven los endpoints se puede llegar a considerar una especie de vista en este modelo.
app.use("/api", newsletterRoutes);

// Conexión a MongoDB Atlas usando variables de entorno
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch((err) => console.error('Error de conexión a MongoDB:', err));

// Endpoint de ejemplo
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
