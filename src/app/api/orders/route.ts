import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { Product } from "@/models/Product";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid"; // Install this: npm i nanoid
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

    // 2. Generate Unique Transaction ID for the System
    // Format: ORD-{TIMESTAMP}-{RANDOM}
    const systemTransactionId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 3. User Logic (Find or Create)
    let userId;
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });

    if (existingUser) {
      userId = existingUser._id;
      if (!existingUser.phone && phone) {
        existingUser.phone = phone;
        await existingUser.save();
      }
    } else {
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
      } catch (err) {
        return NextResponse.json({ error: "User creation failed." }, { status: 400 });
      }
    }

    // 4. Create Order(s)
    // Note: RupantorPay usually processes ONE total amount. 
    // If you have multiple items, you might want to create ONE Order document with an array of products,
    // OR create multiple orders sharing the same transactionId.
    // Based on your schema (1 product per order), we create multiple documents.
    
    const orderPromises = cartItems.map(async (item: any) => {
      const dbProduct = await Product.findById(item.productId);
      if (!dbProduct) return null;

      return Order.create({
        user: userId,
        product: item.productId,
        transactionId: systemTransactionId, // Same ID for all items in this cart checkout
        paymentMethod,
        amount: dbProduct.salePrice * item.quantity, 
        status: "pending", 
        paymentStatus: "unpaid", 
        deliveredContent: {}
      });
    });

    const createdOrders = await Promise.all(orderPromises);
    
    // Return the ID of the first order (or handle bundle logic) for the Payment Gateway
    // We send back the order ID of the first item to track the group payment
    const primaryOrder = createdOrders.find(o => o !== null);

    return NextResponse.json({ 
      success: true, 
      orderId: primaryOrder._id, // Send this to initiate payment
      transactionId: systemTransactionId
    });

  } catch (error: any) {
    console.error("Order Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ==============================================================================
// GET: Fetch Orders (With Security)
// ==============================================================================
export async function GET(req: NextRequest) {
  try {
    // 1. Auth Check
    const session = await getServerSession(authOptions);
       
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    let query: any = {};
    
    // 2. 🟢 Security Logic: Admin vs User
    // If NOT Admin, restrict query to the logged-in user's ID
    if (session.user.role !== "ADMIN") {
      query = { user: session.user.id };
    }

    // 3. Fetch Orders
    const orders = await Order.find(query)
      .populate("product", "title thumbnail slug regularPrice salePrice") // Fetch specific product fields
      .populate("user", "name email phone") // Fetch user details (helpful for Admin)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, orders }, { status: 200 });

  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}