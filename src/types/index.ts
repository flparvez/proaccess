export interface IdParams {
  params: Promise<{ id: string }>;
}
export interface SlugParams {
  params: Promise<{ slug: string }>;
}


// ==========================================
// 1. USER TYPE
// ==========================================
export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "ADMIN";
  image?: string;
  createdAt?: string;
}

// ==========================================
// 2. CATEGORY TYPE
// ==========================================
export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;       // URL of the category icon/image
  description?: string;
  createdAt?: string;   // ISO String from DB
  updatedAt?: string;
}

// export const SITE_URL = "http://localhost:3000";
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
// ==========================================
// 3. PRODUCT TYPE
// ==========================================
export interface IProduct {
  _id: string;
  title: string;
  slug: string;
  
  // Pricing
  regularPrice: number;
  salePrice: number;
  
  // Media
  thumbnail: string;
  gallery: string[];
  
  // Content
  description: string;
  shortDescription?: string;
  features: string[];
  
  // Relations & Meta
  // On frontend, this could be the full Object (if populated) or just the ID string
  category: ICategory | string; 
  
  tags: string[];
  isAvailable: boolean;
  isFeatured: boolean;
  fileType: "Credentials" | "License Key" | "Download Link" | "File";
  salesCount: number;
  
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// 4. ORDER TYPE
// ==========================================

// The hidden secret data (Credential/File)
export interface IDeliveredContent {
  accountEmail?: string;
  accountPassword?: string;
  accessNotes?: string;
  downloadLink?: string;
}

export interface IOrder {
  _id: string;
  
  // Relations
  user: IUser | string;      // Populated User or ID
  product: IProduct | string; // Populated Product or ID
  
  // Payment Info
  transactionId: string;
  paymentMethod: string;
  amount: number;
  screenshot?: string;
  
  // State
  status: "pending" | "completed" | "cancelled" | "declined" | "processing";
  
  // Delivery (Only present if status is completed)
  deliveredContent?: IDeliveredContent;
  
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 5. HELPER TYPES (Optional)
// ==========================================

// Useful for API Responses that return a list
export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

