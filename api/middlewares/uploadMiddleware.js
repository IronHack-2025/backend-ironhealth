// api/middlewares/uploadMiddleware.js

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Multer: almacenamiento en memoria (no en disco)
const upload = multer({ storage: multer.memoryStorage() });

// Middleware para subir el archivo a Cloudinary
const uploadToCloudinary = (req, res, next) => {
  if (!req.file) {
    return next(); 
  }

  const stream = cloudinary.uploader.upload_stream(
    {
      folder: 'ironhealth_uploads', 
      resource_type: 'auto',        
    },
    (error, result) => {
      if (error) {
        console.error('Error subiendo a Cloudinary:', error);
        return next(new Error('Error al subir archivo a Cloudinary'));
      }

      req.file.cloudinary = result;
      next();
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(stream);
};

export { upload, uploadToCloudinary };