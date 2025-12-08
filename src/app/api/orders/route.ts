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
    const { name, email, phone, paymentMethod, cartItems } = body;

    // 1. Validation
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    await connectToDatabase();

    // 2. Generate Unique Transaction ID
    const systemTransactionId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // ============================================================
    // 3. USER LOGIC (Fixes Duplicate Key Error)
    // ============================================================
    let userId;

    // Step A: Check if user exists by Email OR Phone
    const existingUser = await User.findOne({
      $or: [
        { email: email }, 
        { phone: phone }
      ]
    });

    if (existingUser) {
      // ✅ USER EXISTS: Use their ID, do NOT create new user
      console.log(`Using existing user: ${existingUser._id}`);
      userId = existingUser._id;

      // Optional: If they didn't have a phone before, try to add it (safely)
      if (!existingUser.phone && phone) {
        try {
          existingUser.phone = phone;
          await existingUser.save();
        } catch (updateErr) {
          // If update fails (phone taken), ignore it. We have the ID, that's what matters.
          console.log("Could not update phone on existing user (duplicate).");
        }
      }

    } else {
      // ✅ USER DOES NOT EXIST: Create New
      const hashedPassword = await bcrypt.hash(email, 10);
      
      try {
        const newUser = await User.create({
          name,
          email,
          phone, 
          password: hashedPassword, 
          role: "user"
        });
        userId = newUser._id;
      } catch (err: any) {
        // 🚨 SAFETY NET: Handle Race Conditions / Hidden Duplicates
        // If create failed because phone/email actually DID exist (E11000)
        if (err.code === 11000) {
          console.log("Duplicate error caught during creation. Recovering existing user...");
          
          // Find the user that caused the conflict
          const conflictUser = await User.findOne({
            $or: [{ email }, { phone }]
          });
          
          if (conflictUser) {
            userId = conflictUser._id; // Use the existing ID
          } else {
            return NextResponse.json({ error: "User conflict could not be resolved." }, { status: 400 });
          }
        } else {
          return NextResponse.json({ error: "User creation failed." }, { status: 500 });
        }
      }
    }

    // ============================================================
    // 4. Create Order(s)
    // ============================================================
    
    const orderPromises = cartItems.map(async (item: any) => {
      const dbProduct = await Product.findById(item.productId);
      if (!dbProduct) return null;

      return Order.create({
        user: userId, // Guaranteed valid ID from logic above
        product: item.productId,
        transactionId: systemTransactionId,
        paymentMethod,
        amount: dbProduct.salePrice * item.quantity, 
        
        // Statuses from your updated Model
        status: "pending", 
        paymentStatus: "unpaid", 
        
        deliveredContent: {}
      });
    });

    const createdOrders = await Promise.all(orderPromises);
    const primaryOrder = createdOrders.find(o => o !== null);

    if (!primaryOrder) {
      return NextResponse.json({ error: "Failed to generate order" }, { status: 500 });
    }

    // Return the Order ID so frontend can initiate payment
    return NextResponse.json({ 
      success: true, 
      orderId: primaryOrder._id, 
      transactionId: systemTransactionId
    });

  } catch (error: any) {
    console.error("Order Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
// ==============================================================================
// GET: Fetch Orders (Secure & Role-Based)
// ==============================================================================
export async function GET(req: NextRequest) {
  try {
    // 1. 🔒 AUTH CHECK: Ensure user is logged in
    const session = await getServerSession(authOptions);
       
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();

    // 2. 🟢 FILTERING LOGIC
    // Default: Restrict query to the logged-in user's ID
    let query: any = { user: session.user.id };
    
    // Override: If Admin, remove the restriction (Show ALL orders)
    // Note: Matches 'admin' lowercase from your User model enum
    if (session.user.role === "ADMIN") {
      query = {}; 
    }

    // 3. FETCH DATA
    const orders = await Order.find(query)
      // Get Product details for the UI (Image, Title, Price)
      .populate("product", "title thumbnail slug regularPrice salePrice") 
      // Get User details (Crucial for Admin to know who bought what)
      .populate("user", "name email phone image") 
      .sort({ createdAt: -1 }) // Newest first
      .lean();

    return NextResponse.json({ success: true, orders }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Error fetching orders:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" }, 
      { status: 500 }
    );
  }
}