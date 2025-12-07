"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IProduct } from "@/types";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
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
      <div className="bg-black min-h-[400px] flex items-center justify-center text-gray-400">
        Loading courses...
      </div>
    );

  if (error || products.length === 0) return null;

  return (
    <section className="bg-black py-10 text-white">
      <div className="container mx-auto px-3 md:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 md:mb-8">
          <h2 className="text-xl md:text-3xl font-bold tracking-wide">
            Popular Courses
          </h2>
          <Link
            href="/shop"
            className="hidden md:flex items-center text-sm text-gray-400 hover:text-white transition-colors"
          >
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Product Grid */}
        {/* 👉 2 columns on mobile, no gap. Gaps only from md+ */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-0 md:gap-5">
          {products.map((product) => {
            const regular = product.regularPrice;
            const sale = product.salePrice;
            const discount =
              regular > sale
                ? Math.round(((regular - sale) / regular) * 100)
                : 0;

            return (
              <div
                key={product._id}
                className="group relative flex flex-col h-full bg-[#111] border border-black md:border-gray-800 md:rounded-xl overflow-hidden hover:border-gray-600 transition-all duration-300"
              >
                <Link
                  href={`/product/${product.slug}`}
                  className="flex h-full flex-col"
                >
                  {/* Image */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-900">
                    <Image
                      width={500}
                      height={500}
                      src={product.thumbnail}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Discount */}
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 bg-lime-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {discount}% OFF
                      </span>
                    )}

                    {/* Running / Featured */}
                    {product.isFeatured && (
                      <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                        HOT
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col px-2.5 py-3 md:px-4 md:py-4">
                    <h3
                      className="text-[12px] sm:text-sm md:text-base font-semibold text-gray-100 line-clamp-2 leading-snug mb-1.5 group-hover:text-lime-400 transition-colors"
                      title={product.title}
                    >
                      {product.title}
                    </h3>

                    {/* Price + Cart */}
                    <div className="mt-auto pt-2 md:pt-3 border-t border-gray-800 flex items-center justify-between">
                      <div className="flex flex-col">
                        {regular > sale && (
                          <span className="text-[10px] sm:text-xs text-gray-500 line-through">
                            {formatPrice(regular)}
                          </span>
                        )}
                        <span className="text-sm sm:text-lg font-extrabold text-white tracking-tight">
                          {formatPrice(sale)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, product)}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:bg-white hover:text-black transition-all active:scale-95"
                        title="Add to Cart"
                      >
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-6 flex justify-center md:hidden">
          <Link href="/shop">
            <Button
              variant="outline"
              className="border-gray-700 text-white hover:bg-gray-800 bg-transparent text-sm px-6"
            >
              View All Courses
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductList;
