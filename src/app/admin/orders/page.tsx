import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { OrdersClient } from "@/components/admin/orders/OrdersClient"; // We build this next
import { columns } from "@/components/admin/orders/columns"; // We build this next

export default async function OrdersPage() {
  await connectToDatabase();

  // Fetch all orders with User details
  // Convert to plain object (lean) + stringify ObjectIds for Client Component
  const orders = await Order.find({})
    .populate("user", "name email")
    .populate("product", "title")
    .sort({ createdAt: -1 })
    .lean();

  // Fix MongoDB ObjectId serialization issue for Client Components
  const formattedOrders = orders.map((order: any) => ({
    ...order,
    _id: order._id.toString(),
    user: { ...order.user, _id: order.user._id.toString() },
    product: { ...order.product, _id: order.product._id.toString() },
    createdAt: order.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Order Management</h2>
      </div>
      
      {/* The Interactive Table Component */}
      <OrdersClient data={formattedOrders} />
    </div>
  );
}