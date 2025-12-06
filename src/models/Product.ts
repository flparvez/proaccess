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
  category: mongoose.Types.ObjectId; // Link to Category Model
  tags: string[];
  isAvailable: boolean;
  isFeatured: boolean;
  fileType: string;
  salesCount: number;
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
    shortDescription: { type: String, maxlength: 200 },
    features: [{ type: String }],
    
    // Relationship: Link to the Category Model we created earlier
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    
    tags: [{ type: String }],
    
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    fileType: { type: String, default: "Credentials" },
    
    salesCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Product: Model<IProduct> = 
  mongoose.models?.Product || mongoose.model<IProduct>("Product", productSchema);