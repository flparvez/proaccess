import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false }, // If using credentials
  image: { type: String },
  role: { 
    type: String, 
    default: "user", 
    enum: ["user", "admin"] // Critical for Admin Panel access
  },
}, { timestamps: true });

export const User = mongoose.models?.User || mongoose.model("User", userSchema);