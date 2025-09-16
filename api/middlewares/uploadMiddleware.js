// api/middlewares/uploadMiddleware.js

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Configura Cloudinary desde variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer: almacenamiento en memoria (no en disco)
const upload = multer({ storage: multer.memoryStorage() });

// Middleware para subir el archivo a Cloudinary
const uploadToCloudinary = (req, res, next) => {
  if (!req.file) {
    return next(); // Si no hay archivo, sigue
  }

  const stream = cloudinary.uploader.upload_stream(
    {
      folder: 'ironhealth_uploads', // opcional: carpeta en Cloudinary
      resource_type: 'auto',        // auto-detecta imagen/video
    },
    (error, result) => {
      if (error) {
        console.error('Error subiendo a Cloudinary:', error);
        return next(new Error('Error al subir archivo a Cloudinary'));
      }

      // Adjuntamos la respuesta de Cloudinary al archivo
      req.file.cloudinary = result;
      next();
    }
  );

  // Convertimos el buffer de Multer en un stream y lo subimos
  streamifier.createReadStream(req.file.buffer).pipe(stream);
};

export { upload, uploadToCloudinary };