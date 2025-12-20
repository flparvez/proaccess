import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { IdParams } from "@/types/index"; 
import { NextRequest, NextResponse } from "next/server";

// ==================================================================
// GET → Fetch Single Product
// ⚡ SMART SECURITY: Reveal 'accessLink' only if Admin requests it
// ==================================================================
export async function GET(req: NextRequest, { params }: IdParams) {
  try {
    const { id } = await params;
    await connectToDatabase();
    
    // Check Session to see if requester is Admin
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";

    // ⚡ FIX: Type 'query' as 'any' to avoid TypeScript mismatch errors 
    // when chaining .select() conditionally.
    let query: any = Product.findById(id).populate("category");

    // 🔓 If Admin: Unlock the secure fields for editing
    if (isAdmin) {
      // variants is usually public, but accessLink & accessNote are hidden by default
      query = query.select("+accessLink +accessNote");
    }

    const product = await query.lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    console.error("Fetch Product Error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// ==================================================================
// PUT → Update Product (Admin Only)
// ==================================================================
export async function PUT(req: NextRequest, { params }: IdParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    await connectToDatabase();

    // ⚡ Handle Logic for Variants and Secure Fields automatically
    // Mongoose $set will update 'variants', 'accessLink', etc. if they exist in body
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Product updated successfully", product: updatedProduct },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update Product Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ==================================================================
// DELETE → Delete Product (Admin Only)
// ==================================================================
export async function DELETE(req: NextRequest, { params }: IdParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
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
    console.error("Delete Product Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}