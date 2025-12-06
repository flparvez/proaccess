import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for the Secret Data (What user pays for)
interface IDeliveredContent {
  accountEmail?: string;
  accountPassword?: string;
  accessNotes?: string;
  downloadLink?: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  
  // Transaction Info
  transactionId: string;
  paymentMethod: string;
  amount: number;
  screenshot?: string; // Optional: URL if they upload proof
  
  // Status
  status: "pending" | "completed" | "cancelled" | "declined";
  
  // The Digital Product Delivery
  deliveredContent?: IDeliveredContent;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },

    transactionId: { type: String, required: true, trim: true },
    paymentMethod: { type: String, default: "Manual" },
    amount: { type: Number, required: true },
    screenshot: { type: String },

    status: { 
      type: String, 
      enum: ["pending", "completed", "cancelled", "declined"], 
      default: "pending" 
    },

    // Hidden content only filled by Admin
    deliveredContent: {
      accountEmail: { type: String, default: "" },
      accountPassword: { type: String, default: "" },
      accessNotes: { type: String, default: "" },
      downloadLink: { type: String, default: "" },
    }
  },
  { timestamps: true }
);

export const Order: Model<IOrder> = 
  mongoose.models?.Order || mongoose.model<IOrder>("Order", orderSchema);