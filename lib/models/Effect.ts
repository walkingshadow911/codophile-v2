import mongoose, { Schema, Document } from 'mongoose';

export interface IEffect extends Document {
  id: string; // The URL slug alias
  title: string;
  description: string;
  tags: string[];
  keywords: string[];
  code: {
    html: string;
    css: string;
    js: string;
    react: string;
  };
  isPublished: boolean;
  previewImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EffectSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: [{ type: String }],
  keywords: [{ type: String }],
  code: {
    html: { type: String, default: "" },
    css: { type: String, default: "" },
    js: { type: String, default: "" },
    react: { type: String, default: "" },
  },
  isPublished: { type: Boolean, default: false },
  previewImage: { type: String }
}, { timestamps: true });

export default mongoose.models.Effect || mongoose.model<IEffect>('Effect', EffectSchema);
