import { connectToDatabase } from "@/lib/db";
import { Category } from "@/models/Category";
import CategoryListClient from "@/components/admin/categories/CategoryListClient";

export const dynamic = "force-dynamic";

export default async function CategoryListPage() {
  await connectToDatabase();

  const categories = await Category.find({}).sort({ createdAt: -1 }).lean();

  const formattedCategories = categories.map((c: any) => ({
    ...c,
    _id: c._id.toString(),
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
      </div>
      <CategoryListClient initialData={formattedCategories} />
    </div>
  );
}