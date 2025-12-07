import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { IdParams } from "@/types/index"; // Ensure you have this type defined
import { NextRequest, NextResponse } from "next/server";

// ==========================
// GET → Fetch Single Product by ID (Or Slug if you prefer logic swap)
// ==========================
export async function GET(req: NextRequest, { params }: IdParams) {
  try {
    const { id } = await params;
    await connectToDatabase();

    // Try finding by ID first, if fails (or valid hex), try finding by slug
    // Note: Usually [id] implies ID, but for SEO we often look up slugs. 
    // Here we assume ID for admin editing, but we can do a hybrid check.
    
    const product = await Product.findById(id).populate("category").lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// ==========================
// PUT → Update Product (Admin Only)
// ==========================
export async function PUT(req: NextRequest, { params }: IdParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    await connectToDatabase();

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Product updated", product: updatedProduct },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ==========================
// DELETE → Delete Product (Admin Only)
// ==========================
export async function DELETE(req: NextRequest, { params }: IdParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    const { id } = await params;
    await connectToDatabase();

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}