import mongoose from 'mongoose';
import User from '../models/User.model.js';

const seedAdmin = async () => {
  try {
    await mongoose
      .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log('✅ Conectado a MongoDB Atlas'))
      .catch(err => console.error('❌ Error de conexión a MongoDB:', err));

    const adminEmail = 'admin@ironhealth.com';
    const adminPassword = 'Admin1234!';

    // Verifica si ya existe un admin
    const existingAdmin = await User.findOne({ email: adminEmail, role: 'admin' });
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists.');
      return;
    }

    // ✅ Crear admin SIN profileId (correcto)
    const adminUser = new User({
      email: adminEmail,
      password: adminPassword, // Sin hashear, que lo haga el middleware
      role: 'admin',
      isActive: true,
    });

    await adminUser.save();

    console.log('🎉 Admin user created successfully:');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log('🔒 Role: admin (no profile needed)');
  } catch (err) {
    console.error('❌ Error creating admin user:', err);
  }
};

seedAdmin();
