import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { initiatePayment } from "@/lib/rupantor";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    
    await connectToDatabase();
    
    // 1. Fetch Order to get amount
    const order = await Order.findById(orderId).populate("user");
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // 2. Call RupantorPay
    const paymentResponse = await initiatePayment({
      amount: order.amount,
      transactionId: order.transactionId, // Using your custom Transaction ID
      name: order.user.name,
      phone: order.user.phone || "01700000000",
    });

    // 3. Handle Gateway Response
    // Rupantor usually returns { success: true, payment_url: "..." }
    if (paymentResponse.success && paymentResponse.payment_url) {
      return NextResponse.json({ url: paymentResponse.payment_url });
    } else {
      console.error("Gateway Error:", paymentResponse);
      return NextResponse.json({ error: "Gateway error", details: paymentResponse }, { status: 400 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}