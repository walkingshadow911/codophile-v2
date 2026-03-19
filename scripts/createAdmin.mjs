import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import process from 'process';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please provide MONGODB_URI in the environment variables.");
  process.exit(1);
}

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true }
}, { timestamps: true });

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

async function createAdmin() {
  const email = process.argv[2] || 'admin@codophile.com';
  const password = process.argv[3] || 'admin123';
  const name = process.argv[4] || 'Admin';

  try {
    console.log(`Configuring DB: ${MONGODB_URI.split('@')[1] || MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    
    // Check if exists
    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log(`Admin with email ${email} already exists!`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      email,
      passwordHash,
      name
    });

    await newAdmin.save();
    console.log(`Successfully created admin \${email}!`);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();
