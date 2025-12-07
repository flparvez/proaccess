import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// ==================================================================
// GET → Fetch All Products 
// (SECURE: 'accessLink' is automatically hidden by Model Schema)
// ==================================================================
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const isFeatured = searchParams.get("featured");
 await Category.find();
    let query: any = { isAvailable: true };

    // 1. Filter by Category
    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) {
        query.category = category._id;
      }
    }

    // 2. Filter by Featured
    if (isFeatured === "true") {
      query.isFeatured = true;
    }

    // 3. Fetch Data

    const products = await Product.find(query)
      .populate("category", "name slug") 
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// ==================================================================
// POST → Create New Product (Admin Only)
// ==================================================================
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // ✅ Uncomment this for production to protect the route
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    const body = await req.json();
    await connectToDatabase();

    // 1. Validation
    if (!body.title || !body.regularPrice) {
      return NextResponse.json({ error: "Title and Price are required" }, { status: 400 });
    }

    // 2. Generate Slug
    const slug = body.slug || body.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

    // 3. Check for Duplicate
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    // 4. Create Product
    // We explicitly map fields to ensure secure data (accessLink) is saved
    const newProduct = await Product.create({
      title: body.title,
      slug: slug,
      description: body.description,
      shortDescription: body.shortDescription || "",
      
      regularPrice: Number(body.regularPrice),
      salePrice: Number(body.salePrice),
      
      thumbnail: body.thumbnail,
      gallery: body.gallery || [],
      
      category: body.category,
      tags: body.tags || [],
      features: body.features || [],
      
      isAvailable: body.isAvailable ?? true,
      isFeatured: body.isFeatured ?? false,
      fileType: body.fileType || "Credentials",
      
      salesCount: 0,

      // 🔒 SECURE DATA SAVING
      // Even though 'select: false' is in schema, we can WRITE to it here.
      accessLink: body.accessLink || "", 
      accessNote: body.accessNote || ""
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