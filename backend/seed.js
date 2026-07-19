require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seed = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected!');

    // Check if admin already exists
    const existing = await User.findOne({ email: 'admin@melodyfashion.com' });
    if (existing) {
      console.log('⚠️  Admin already exists:', existing.email);
      console.log('   Role:', existing.role);
      process.exit(0);
    }

    // Create admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@melodyfashion.com',
      password: 'admin123',
      role: 'admin',
    });

    console.log('\n🎉 Admin user created successfully!');
    console.log('   Name :', admin.name);
    console.log('   Email:', admin.email);
    console.log('   Role :', admin.role);
    console.log('\n👉 Login at: http://localhost:5173/login');
    console.log('   Email   : admin@melodyfashion.com');
    console.log('   Password: admin123\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

seed();
