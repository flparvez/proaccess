import mongoose, { Schema, Document, Model } from "mongoose";

// ✅ 1. Define Variant Interface (Sub-document)
export interface IVariant {
  name: string;      // e.g. "Silver", "Gold", "Platinum"
  validity: string;  // e.g. "30 Days", "1 Year", "Lifetime"
  price: number;     // e.g. 500 (Price specific to this variant)
}

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
  
  // ⚡ NEW: Variants Field (Optional)
  variants?: IVariant[];

  // 🔒 SECURE FIELDS
  accessLink?: string; 
  accessNote?: string; 
}

// ✅ 2. Define Variant Schema
const variantSchema = new Schema<IVariant>(
  {
    name: { type: String, required: true },     // Silver/Gold
    validity: { type: String, required: true }, // 30 Days/Lifetime
    price: { type: Number, required: true },    // Variant Price
  },
  { _id: false } // No need for separate IDs for sub-variants usually
);

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

    // ⚡ NEW: Variants Array (Stores Silver/Gold + Validity options)
    variants: { 
      type: [variantSchema], 
      default: [] 
    },

    // 🔒 SECURE CONTENT
    accessLink: { 
      type: String, 
      select: false 
    },
    accessNote: { 
      type: String, 
      select: false 
    }
  },
  { timestamps: true }
);

export const Product: Model<IProduct> = 
  mongoose.models?.Product || mongoose.model<IProduct>("Product", productSchema);