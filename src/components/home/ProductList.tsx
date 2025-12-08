"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // Next.js Optimized Image
import { IProduct } from "@/types";
import { ShoppingCart, ArrowRight, Star } from "lucide-react";
import { useCart } from "@/lib/CartContext"; // Ensure correct path
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (e: React.MouseEvent, product: IProduct) => {
    e.preventDefault();
    e.stopPropagation();
    const cartItem = mapProductToCartItem(product, 1);
    addToCart(cartItem);
    toast.success("Added to cart!");
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(price);

  if (loading)
    return (
      <div className="bg-black min-h-[400px] flex items-center justify-center text-gray-500 animate-pulse">
        Loading courses...
      </div>
    );

  if (error || products.length === 0) return null;

  return (
    <section className="bg-black py-4 md:py-16 text-white">
      <div className="container mx-auto px-1 md:px-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <div className="flex items-center gap-3">
             <div className="h-8 w-1 bg-green-500 rounded-full"></div>
             <h2 className="text-xl md:text-3xl font-bold tracking-wide text-white">
               Popular Courses
             </h2>
          </div>
          <Link
            href="/shop"
            className="hidden md:flex items-center text-sm font-medium text-gray-400 hover:text-green-400 transition-colors"
          >
            View All <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>

        {/* Product Grid Configuration:
           - Mobile: 2 Columns (grid-cols-2) with smaller gap (gap-3)
           - Tablet: 3 Columns (md:grid-cols-3)
           - Desktop: 4 Columns (xl:grid-cols-4) with larger gap (gap-6)
        */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {products.map((product) => {
            const regular = product.regularPrice;
            const sale = product.salePrice;
            const discount = regular > sale
                ? Math.round(((regular - sale) / regular) * 100)
                : 0;

            return (
              <div
                key={product._id}
                className="group relative flex flex-col h-full bg-[#111] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-green-900/10"
              >
                <Link
                  href={`/product/${product.slug}`}
                  className="flex h-full flex-col"
                >
                  {/* === IMAGE AREA === */}
                  {/* aspect-video (16:9) is standard for courses. 
                      Use 'fill' with 'sizes' for perfect responsiveness */}
                  <div className="relative aspect-video w-full bg-gray-900 overflow-hidden">
                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Gradient Overlay for text readability if needed */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Discount Badge */}
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 bg-yellow-500 text-black text-[10px] md:text-xs font-bold px-2 py-0.5 rounded shadow-sm">
                        -{discount}%
                      </span>
                    )}

                    {/* Hot/Running Badge */}
                    {product.isFeatured && (
                      <span className="absolute top-2 right-2 bg-green-600 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                        HOT
                      </span>
                    )}
                  </div>

                  {/* === CONTENT AREA === */}
                  <div className="flex flex-1 flex-col p-3 md:p-5">
                    
                    {/* Title */}
                    <h3
                      className="text-sm md:text-base font-bold text-gray-100 line-clamp-2 leading-snug mb-2 group-hover:text-green-400 transition-colors min-h-[2.5rem]"
                      title={product.title}
                    >
                      {product.title}
                    </h3>

                    {/* Rating / Meta (Optional placeholder) */}
                    <div className="flex items-center gap-1 mb-3">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-gray-500 font-medium">4.8 (120)</span>
                    </div>

                    {/* Price + Action Row */}
                    <div className="mt-auto pt-3 border-t border-gray-800 flex items-center justify-between">
                      <div className="flex flex-col">
                        {regular > sale && (
                          <span className="text-[10px] md:text-xs text-gray-500 line-through font-medium">
                            {formatPrice(regular)}
                          </span>
                        )}
                        <span className="text-sm md:text-lg font-extrabold text-white tracking-tight">
                          {formatPrice(sale)}
                        </span>
                      </div>

                      {/* Cart Button */}
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, product)}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:bg-white hover:text-black transition-all active:scale-90"
                        aria-label="Add to Cart"
                      >
                        <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 flex justify-center md:hidden">
          <Link href="/shop" className="w-full">
            <Button
              variant="outline"
              className="w-full border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent h-12 text-sm font-medium rounded-lg"
            >
              Browse All Courses <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductList;