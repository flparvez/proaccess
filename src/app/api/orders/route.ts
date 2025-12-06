import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import {  authOptions }  from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

// ==========================
// Helper: Safe Type Casting
// ==========================
const safeNumber = (value: any, defaultValue: number = 0): number => {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

// ==========================
// POST → User Creates a New Order (Checkout)
// ==========================
export async function POST(req: NextRequest) {
  try {
    // ✅ Fix: Use getServerSession with authOptions for v4
       const session = await getServerSession(authOptions);
       
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // 1. Basic Validation
    if (!body.productId || !body.transactionId || !body.amount) {
      return NextResponse.json(
        { error: "Product ID, Transaction ID, and Amount are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 2. Validate Product Existence
    const product = await Product.findById(body.productId);
    if (!product) {
      return NextResponse.json({ error: "Product invalid" }, { status: 404 });
    }

    // 3. Create Order
    const newOrder = await Order.create({
      user: session.user.id, // Link to logged-in user
      product: body.productId,
      transactionId: body.transactionId,
      paymentMethod: body.paymentMethod || "Manual",
      amount: safeNumber(body.amount),
      screenshot: body.screenshot || "",
      status: "pending",
      deliveredContent: {} // Empty initially
    });

    return NextResponse.json(
      { success: true, message: "Order placed successfully!", orderId: newOrder._id },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("❌ Error creating order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to place order" },
      { status: 500 }
    );
  }
}

// ==========================
// GET → Fetch Orders (Admin sees All, User sees Theirs)
// ==========================
export async function GET(req: NextRequest) {
  try {
     const session = await getServerSession(authOptions);
       
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    let query = {};
    
    // 🟢 Security Logic: Admin vs User
    // If Admin: show all. If User: show only their own.
    if (session.user.role !== "admin") {
      query = { user: session.user.id };
    }

    const orders = await Order.find(query)
      .populate("product", "name price thumbnail slug") // Join with Product data
      .populate("user", "name email") // Join with User data (for Admin view)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, orders }, { status: 200 });

  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}