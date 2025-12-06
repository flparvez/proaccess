import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { Product } from "@/models/Product";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, transactionId, paymentMethod, cartItems } = body;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    await connectToDatabase();

    // ============================================================
    // STEP 1: Handle User (Find or Create)
    // ============================================================
    let userId;
    let user = await User.findOne({ email });

    if (user) {
      // User exists, use their ID
      userId = user._id;
      // Optional: Update phone if missing
      if (!user.phone && phone) {
        user.phone = phone;
        await user.save();
      }
    } else {
      // 🟢 AUTO-REGISTER LOGIC
      // Password = Email (Hashed)
      const hashedPassword = await bcrypt.hash(email, 10);
      
      const newUser = await User.create({
        name,
        email,
        phone, // Saving the number here
        password: hashedPassword, 
        role: "user"
      });
      
      userId = newUser._id;
    }

    // ============================================================
    // STEP 2: Create Orders
    // Your Model supports 1 Product per Order document.
    // So we loop through cart items and create an Order for each.
    // ============================================================
    
    const orderPromises = cartItems.map(async (item: any) => {
      // Double check price from DB to prevent tampering
      const dbProduct = await Product.findById(item.productId);
      if (!dbProduct) return null;

      return Order.create({
        user: userId,
        product: item.productId,
        transactionId,
        paymentMethod,
        // Calculate total for this specific item (price * qty)
        amount: dbProduct.salePrice * item.quantity, 
        status: "pending",
        deliveredContent: {} // Empty until Admin verifies
      });
    });

    await Promise.all(orderPromises);

    return NextResponse.json({ 
      success: true, 
      message: "Order placed successfully! Please check your dashboard." 
    });

  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message || "Checkout failed" }, { status: 500 });
  }
}

// ==========================
// GET → Fetch Orders (Admin sees All, User sees Theirs)
// ==========================
export async function GET(req: NextRequest) {
  try {
     const session = await getServerSession(authOptions);
       
    // if (!session || !session.user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    await connectToDatabase();

    let query = {};
    
    // 🟢 Security Logic: Admin vs User
    // If Admin: show all. If User: show only their own.
    // if (session.user.role !== "admin") {
    //   query = { user: session.user.id };
    // }

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