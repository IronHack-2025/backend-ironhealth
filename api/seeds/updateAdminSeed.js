import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';

const updateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ironhealth');
    console.log('Conectado a MongoDB');

    const adminEmail = 'admin@ironhealth.com';
    const newPassword = '123456'; // Contraseña simple para pruebas
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Actualizar la contraseña del admin
    const result = await User.updateOne(
      { email: adminEmail, role: 'admin' },
      {
        password: hashedPassword,
      }
    );

    if (result.matchedCount > 0) {
      console.log('Admin password updated successfully:');
      console.log(`Email: ${adminEmail}`);
      console.log(`New Password: ${newPassword}`);
    } else {
      console.log('Admin user not found');
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error updating admin:', err);
    await mongoose.disconnect();
  }
};

updateAdmin();
