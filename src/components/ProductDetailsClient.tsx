"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IProduct } from "@/types";
import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  Heart, 
  CheckCircle2, 
  ShieldCheck, 
  Share2, 
  Flame, 
  CreditCard,
  ChevronRight,
  Minus,
  Plus
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function ProductDetailsClient({ product }: { product: IProduct }) {
  // State for Gallery
  const [mainImage, setMainImage] = useState(product.thumbnail);
  const [qty, setQty] = useState(1);

  // Combine thumbnail + gallery for the slider
  const allImages = [product.thumbnail, ...product.gallery];

  // Calculations
  const discount = product.regularPrice > product.salePrice
    ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
    : 0;

  // Safe Category Name
  const categoryName = typeof product.category === "object" && product.category 
    ? product.category.name 
    : "Digital Product";

  // Handlers
  const handleAddToCart = () => {
    toast.success(`Added ${qty} x ${product.title} to cart`);
    // Add your cart logic here (Zustand/Redux)
  };

  const handleBuyNow = () => {
    toast.success("Redirecting to checkout...");
    // Redirect logic
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 text-sm text-muted-foreground flex items-center gap-2">
          <Link href="/" className="hover:text-primary">Home</Link> 
          <ChevronRight className="w-4 h-4" />
          <Link href="/shop" className="hover:text-primary">{categoryName}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          
          {/* === LEFT COLUMN: GALLERY === */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border bg-white shadow-sm"
            >
              <Image 
                src={mainImage} 
                alt={product.title} 
                fill 
                className="object-cover"
                priority
              />
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-primary text-lg px-3 py-1 hover:bg-primary">
                  -{discount}% OFF
                </Badge>
              )}
            </motion.div>

            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {allImages.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    mainImage === img ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <Image src={img} alt="thumb" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* === RIGHT COLUMN: INFO === */}
          <div className="flex flex-col gap-6">
            
            {/* Title & Stats */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                {product.title}
              </h1>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                  <Flame className="w-4 h-4" /> Best Seller
                </span>
                <span className="text-muted-foreground">SKU: {product._id.slice(-6).toUpperCase()}</span>
                {product.isAvailable ? (
                  <span className="text-green-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> In Stock
                  </span>
                ) : (
                  <span className="text-red-600 font-bold">Out of Stock</span>
                )}
              </div>
            </div>

            {/* Urgency Ticker (Matches Screenshot) */}
            <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex items-center gap-2 text-red-600 text-sm animate-pulse">
              <Flame className="w-4 h-4 fill-red-600" />
              <span className="font-bold">{product.salesCount + 18}</span> people bought this in the last hour!
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 pb-4 border-b border-dashed">
              <span className="text-4xl font-extrabold text-primary">
                ৳{product.salePrice.toLocaleString()}
              </span>
              {product.regularPrice > product.salePrice && (
                <span className="text-xl text-muted-foreground line-through mb-1">
                  ৳{product.regularPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-slate-600 leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            {/* Features List */}
            {product.features.length > 0 && (
              <ul className="space-y-2">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {/* Quantity (Optional) */}
              <div className="flex items-center border rounded-lg h-12 w-fit">
                <button 
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="px-3 hover:bg-gray-100 h-full"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold">{qty}</span>
                <button 
                  onClick={() => setQty(q => q + 1)}
                  className="px-3 hover:bg-gray-100 h-full"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-3 flex-1">
                <Button 
                  onClick={handleAddToCart}
                  size="lg" 
                  variant="outline" 
                  className="flex-1 h-12 border-primary text-primary hover:bg-primary hover:text-white font-bold text-base"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
                </Button>
                <Button 
                  onClick={handleBuyNow}
                  size="lg" 
                  className="flex-1 h-12 bg-primary hover:bg-primary/90 font-bold text-base"
                >
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900">Secure Payment</p>
                  <p className="text-[10px] text-slate-500">100% Protected</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900">Instant Access</p>
                  <p className="text-[10px] text-slate-500">Digital Delivery</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* === BOTTOM SECTION: TABS === */}
        <div className="mt-16 bg-white rounded-2xl shadow-sm border p-6 md:p-10">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">Reviews (0)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="animate-in fade-in-50">
              <div 
                className="prose prose-green max-w-none text-slate-600"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </TabsContent>
            
            <TabsContent value="reviews">
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                <div className="bg-gray-100 p-4 rounded-full">
                  <Heart className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold">No Reviews Yet</h3>
                <p className="text-muted-foreground">Be the first to review this product!</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  );
}