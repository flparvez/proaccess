"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IProduct } from "@/types";
import { motion } from "framer-motion";
import { useCart } from "@/lib/CartContext";
import { 
  ShoppingCart, 
  Heart, 
  CheckCircle2, 
  ShieldCheck, 
  Flame, 
  CreditCard,
  ChevronRight,
  Minus,
  Plus,
  PlayCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function ProductDetailsClient({ product }: { product: IProduct }) {
  const router = useRouter();
  const { addToCart, mapProductToCartItem } = useCart();

  const [mainImage, setMainImage] = useState(product.thumbnail);
  const [qty, setQty] = useState(1);

  const allImages = [product.thumbnail, ...(product.gallery || [])];

  const discount = product.regularPrice > product.salePrice
    ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
    : 0;

  const categoryName = typeof product.category === "object" && product.category 
    ? product.category.name 
    : "Course";

  const handleAddToCart = () => {
    const item = mapProductToCartItem(product, qty);
    addToCart(item);
    toast.success(`${qty} x ${product.title} added to cart`);
  };

  const handleBuyNow = () => {
    const item = mapProductToCartItem(product, qty);
    addToCart(item);
    toast.success("Proceeding to checkout...");
    router.push("/checkout");
  };

  return (
    <div className="bg-black text-white min-h-screen pb-20">
      
      {/* === BREADCRUMB === */}
      <div className="border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 text-sm text-gray-400 flex items-center gap-2 overflow-hidden">
          <Link href="/" className="hover:text-white transition-colors shrink-0">Home</Link> 
          <ChevronRight className="w-4 h-4 shrink-0 text-gray-600" />
          <Link href="/shop" className="hover:text-white transition-colors shrink-0">{categoryName}</Link>
          <ChevronRight className="w-4 h-4 shrink-0 text-gray-600" />
          <span className="text-white font-medium truncate">{product.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* === LEFT COLUMN: GALLERY (7 Cols) === */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Main Image */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-video w-full overflow-hidden rounded-2xl border border-gray-800 bg-[#111] shadow-2xl group"
            >
              <Image 
                src={mainImage} 
                alt={product.title} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

              {/* Play Button Overlay (Visual Cue for Video Courses) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30">
                    <PlayCircle className="w-12 h-12 text-white fill-white/20" />
                 </div>
              </div>

              {/* Discount Badge */}
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-yellow-500 text-black text-sm px-3 py-1 font-bold shadow-lg shadow-yellow-500/20 hover:bg-yellow-400 border-0">
                  SAVE {discount}%
                </Badge>
              )}
            </motion.div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
              >
                {allImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      mainImage === img 
                        ? "border-green-500 ring-2 ring-green-500/30 opacity-100" 
                        : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-600"
                    }`}
                  >
                    <Image src={img} alt="thumb" fill className="object-cover" />
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* === RIGHT COLUMN: INFO (5 Cols) === */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Title & Meta */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
                {product.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 mt-4 text-sm font-medium">
                {product.isFeatured && (
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 uppercase tracking-wider shadow-lg shadow-orange-500/20">
                    <Flame className="w-3.5 h-3.5 fill-white" /> Trending
                  </span>
                )}
                
                <div className="flex items-center gap-2 text-gray-400 border-l border-gray-700 pl-3">
                  <span>SKU:</span>
                  <span className="font-mono text-gray-300">{product._id.slice(-6).toUpperCase()}</span>
                </div>
              </div>
            </motion.div>

            {/* Price Box */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#111] border border-gray-800 p-6 rounded-2xl shadow-inner"
            >
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-extrabold text-white">
                  ৳{product.salePrice.toLocaleString()}
                </span>
                {product.regularPrice > product.salePrice && (
                  <span className="text-xl text-gray-500 line-through font-medium">
                    ৳{product.regularPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-green-400 text-sm font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Lifetime Access + Updates
              </p>
            </motion.div>

            {/* Urgency */}
            <div className="flex items-center gap-3 text-sm text-red-400 font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </div>
              <span><strong className="text-white">{product.salesCount + 24}</strong> people enrolled recently!</span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {/* Quantity */}
              <div className="flex items-center bg-[#111] border border-gray-800 rounded-lg h-14 w-fit">
                <button 
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="px-4 h-full text-gray-400 hover:text-white transition-colors disabled:opacity-30"
                  disabled={qty <= 1}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-10 text-center font-bold text-lg">{qty}</span>
                <button 
                  onClick={() => setQty(q => q + 1)}
                  className="px-4 h-full text-gray-400 hover:text-white transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-3 flex-1">
                <Button 
                  onClick={handleAddToCart}
                  size="lg" 
                  variant="outline" 
                  className="flex-1 h-14 border-gray-700 bg-transparent text-white hover:bg-white hover:text-black font-bold text-base transition-all"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" /> Add Cart
                </Button>
                <Button 
                  onClick={handleBuyNow}
                  size="lg" 
                  className="flex-1 h-14 bg-white text-black hover:bg-gray-200 font-bold text-base shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all transform hover:scale-[1.02]"
                >
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Features (Checklist) */}
            {product.features && product.features.length > 0 && (
              <div className="grid grid-cols-1 gap-2 pt-2">
                {product.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Trust Badges */}
            <div className="flex items-center gap-6 pt-4 border-t border-gray-800 text-gray-500 text-xs font-medium uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gray-400" /> Secure Payment
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-400" /> Instant Access
              </div>
            </div>

          </div>
        </div>

        {/* === BOTTOM SECTION: TABS === */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="flex w-full md:w-auto border-b border-gray-800 bg-transparent p-0 mb-8 gap-4">
              <TabsTrigger 
                value="description" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent data-[state=active]:text-green-500 text-gray-400 text-lg px-0 pb-3"
              >
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent data-[state=active]:text-green-500 text-gray-400 text-lg px-0 pb-3"
              >
                Reviews (0)
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="animate-in fade-in-50 slide-in-from-bottom-2">
              <div className="bg-[#111] border text-white border-gray-800 rounded-2xl p-2 shadow-inner">
                <div 
                  className="prose prose-invert max-w-none text-white bg-black prose-p:text-gray-300 prose-headings:text-white prose-a:text-green-400"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="reviews">
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-[#111] border border-gray-800 rounded-2xl">
                <div className="bg-gray-800/50 p-5 rounded-full">
                  <Heart className="w-10 h-10 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">No Reviews Yet</h3>
                  <p className="text-gray-400 max-w-sm mx-auto">Be the first to share your thoughts on this product!</p>
                </div>
                <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
                  Write a Review
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  );
}