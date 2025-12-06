
import { OrdersClient } from "@/components/admin/orders/OrdersClient"; // We build this next
import { columns } from "@/components/admin/orders/columns"; // We build this next
import { SITE_URL } from "@/types";


export default async function OrdersPage() {

  // Fetch all orders with User details
  // Convert to plain object (lean) + stringify ObjectIds for Client Component
const res = await fetch(`${SITE_URL}/api/orders`, {
    cache: 'no-store', // Ensure fresh data on each request
  });
  const orders = await res.json();

  // Fix MongoDB ObjectId serialization issue for Client Components
  const formattedOrders = orders?.orders.map((order: any) => ({
    ...order,
    _id: order._id.toString(),
    user: { ...order.user, _id: order.user._id.toString() },
    product: { ...order.product, _id: order.product._id.toString() },
    createdAt: order.createdAt,
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