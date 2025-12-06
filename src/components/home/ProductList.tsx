"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IProduct } from "@/types";
import { ShoppingCart, Heart } from "lucide-react";
import { useCart } from "@/lib/CartContext"; 
import { toast } from "sonner"; // Optional: For success notification

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 2. Access Cart Functions
  const { addToCart, mapProductToCartItem } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch products");

        const data = await res.json();
        if (data.success) {
          setProducts(data.products);
        } else {
          throw new Error(data.error || "Failed to load products");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 3. Handle Add to Cart Click
  const handleAddToCart = (e: React.MouseEvent, product: IProduct) => {
    e.preventDefault(); // Stop navigation to product details page
    e.stopPropagation();

    const cartItem = mapProductToCartItem(product, 1);
    addToCart(cartItem);
    
    toast.success("Added to cart!"); // Show notification
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); // Stop navigation
    e.stopPropagation();
    toast("Added to wishlist (Demo)");
  };

  const getDiscount = (regular: number, sale: number) => {
    if (!regular || !sale || regular <= sale) return 0;
    return Math.round(((regular - sale) / regular) * 100);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(price);

  if (loading)
    return (
      <div className="py-12 text-center text-gray-500 text-sm sm:text-base">
        Loading courses...
      </div>
    );

  if (error || products.length === 0) return null;

  return (
    <section className="bg-[#f7f7f8] py-6 sm:py-8">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 md:px-6">
        <h2 className="mb-5 text-center text-lg sm:text-2xl md:text-3xl font-semibold tracking-tight text-slate-800">
          Our Featured Courses
        </h2>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => {
            const regular = product.regularPrice;
            const sale = product.salePrice;
            const discount = getDiscount(regular, sale);
            const image = product.thumbnail || "/placeholder.png";
            const title = product.title || "Untitled Course";
            const categoryName =
              typeof product.category === "object" && product.category
                ? (product.category as any).name
                : "Course";

            return (
              <div
                key={product._id}
                className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <Link href={`/product/${product.slug}`} className="flex h-full flex-col">
                  
                  {/* Image Area */}
                  <div className="relative overflow-hidden rounded-t-2xl bg-gray-100 aspect-[4/3]">
                    <img
                      src={image}
                      alt={title}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />

                    {/* Badges */}
                    <div className="absolute left-2 top-2 flex flex-col gap-1">
                      {discount > 0 && (
                        <span className="rounded-full bg-[#19c16b] px-2 py-[2px] text-[10px] font-semibold text-white shadow-sm">
                          {discount}% OFF
                        </span>
                      )}
                      {product.isFeatured && (
                        <span className="rounded-full bg-[#ff8a42] px-2 py-[2px] text-[10px] font-semibold text-white shadow-sm">
                          HOT
                        </span>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={handleWishlist}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm hover:text-red-500 transition-colors"
                    >
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Content Area */}
                  <div className="flex flex-1 flex-col px-3.5 pb-3 pt-3 sm:px-4 sm:pt-3.5 sm:pb-4">
                    <h3
                      className="line-clamp-2 text-[13px] sm:text-sm font-semibold text-slate-900 leading-snug min-h-[2.5rem]"
                      title={title}
                    >
                      {title}
                    </h3>

                    <p className="mt-1 line-clamp-1 text-[11px] sm:text-xs text-slate-500 uppercase tracking-wide">
                      {categoryName}
                    </p>

                    {/* Price */}
                    <div className="mt-3 flex items-center justify-between text-xs sm:text-sm border-t pt-2 border-gray-50">
                      {regular > sale ? (
                        <span className="text-[11px] text-slate-400 line-through">
                          {formatPrice(regular)}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span className="text-[14px] sm:text-base font-bold text-[#19c16b]">
                        {formatPrice(sale)}
                      </span>
                    </div>

                    {/* Add To Cart Button */}
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, product)}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wide text-white transition-all hover:bg-green-600 hover:shadow-lg active:scale-95"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Add to Cart
                    </button>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductList;