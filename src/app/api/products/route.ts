import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category"; // Ensure this model exists
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// ==========================
// GET → Fetch All Products (with optional Category/Featured filter)
// ==========================
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const isFeatured = searchParams.get("featured");

    let query: any = { isAvailable: true };

    // Filter by Category Slug
    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) {
        query.category = category._id;
      }
    }

    // Filter by Featured Status
    if (isFeatured === "true") {
      query.isFeatured = true;
    }

    const products = await Product.find(query)
      .populate("category", "name slug") // Get category name instead of just ID
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// ==========================
// POST → Create New Product (Admin Only)
// ==========================
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // if (!session || session.user.role !== "admin") {
    //   return NextResponse.json({ error: "Admins only" }, { status: 403 });
    // }

    const body = await req.json();
    await connectToDatabase();

    // Generate Slug from Title if not provided
    const slug = body.slug || body.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

    // Check if Slug exists
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const newProduct = await Product.create({
      ...body,
      slug,
      salesCount: 0
    });

    return NextResponse.json(
      { success: true, message: "Product created successfully", product: newProduct }, 
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}