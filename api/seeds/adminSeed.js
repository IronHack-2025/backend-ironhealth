import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';


const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch((err) => console.error('Error de conexión a MongoDB:', err));

    const adminEmail = 'admin2@ironhealth.com';
    const adminPassword = 'Admin1234!'; // Cambia esto por una contraseña segura
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // En adminSeed.js, agregar este log temporal:
    console.log('Original password:', adminPassword); // Admin1234!
    console.log('Hashed password:', hashedPassword);

    // Verifica si ya existe un admin
    const existingAdmin = await User.findOne({ email: adminEmail, role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      return process.exit(0);
    }

    const adminUser = new User({
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      profileId: null,
      profileModel: null,
      isActive: true
    });

    await adminUser.save();
    console.log('Admin user created successfully:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
};

seedAdmin();
