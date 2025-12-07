import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  regularPrice: number;
  salePrice: number;
  thumbnail: string;
  gallery: string[];
  description: string;
  shortDescription?: string;
  features: string[];
  category: mongoose.Types.ObjectId; 
  tags: string[];
  isAvailable: boolean;
  isFeatured: boolean;
  fileType: string;
  salesCount: number;
  
  // 🔒 SECURE FIELDS (New)
  accessLink?: string; // The private URL (Drive, Telegram, etc.)
  accessNote?: string; // e.g. "Join with this password: 123"
}

const productSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    
    regularPrice: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, required: true, min: 0 },
    
    thumbnail: { type: String, required: true },
    gallery: [{ type: String }],
    
    description: { type: String, required: true },
    shortDescription: { type: String, maxlength: 500 },
    features: [{ type: String }],
    
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    tags: [{ type: String }],
    
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    fileType: { type: String, default: "Credentials" },
    
    salesCount: { type: Number, default: 0 },

    // 🔒 SECURE CONTENT CONFIGURATION
    // select: false ensures this NEVER goes to the public frontend API
    accessLink: { 
      type: String, 
      select: false // <--- HIDDEN FROM PUBLIC
    },
    accessNote: { 
      type: String, 
      select: false // <--- HIDDEN FROM PUBLIC
    }
  },
  { timestamps: true }
);

export const Product: Model<IProduct> = 
  mongoose.models?.Product || mongoose.model<IProduct>("Product", productSchema);