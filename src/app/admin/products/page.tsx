import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import ProductListClient from "@/components/admin/products/ProductListClient";

export const dynamic = "force-dynamic"; // Ensure fresh data

export default async function ProductListPage() {
  await connectToDatabase();

  // Fetch products with Category details
  const products = await Product.find({})
    .populate("category", "name")
    .sort({ createdAt: -1 })
    .lean();

  // Fix ObjectId serialization
  const formattedProducts = products.map((p: any) => ({
    ...p,
    _id: p._id.toString(),
    category: p.category ? { ...p.category, _id: p.category._id.toString() } : null,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
      </div>
      <ProductListClient initialData={formattedProducts} />
    </div>
  );
}