import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  email: string;
  passwordHash: string;
  name: string;
}

const AdminSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// Prevent overwrite model error in hot reload
export default mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);
