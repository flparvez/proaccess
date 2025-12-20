"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IProduct } from "@/types"; 
import { motion, AnimatePresence } from "framer-motion";
import { useCart, ICartVariant } from "@/lib/CartContext";
import { 
  ShoppingCart, Heart, CheckCircle2, ShieldCheck, Flame, CreditCard,
  ChevronRight, Minus, Plus, PlayCircle, Crown, Clock, Star, Share2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function ProductDetailsClient({ product }: { product: IProduct }) {
  const router = useRouter();
  const { addToCart, mapProductToCartItem } = useCart();

  // --- States ---
  const [mainImage, setMainImage] = useState(product.thumbnail);
  const [qty, setQty] = useState(1);
  
  // ⚡ Variant Logic: Default to 0 index if variants exist
  const hasVariants = product.variants && product.variants.length > 0;
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number>(0); 

  // --- Derived Data ---
  const allImages = [product.thumbnail, ...(product.gallery || [])];
  
  // ⚡ Pricing Logic
  const activeVariant = hasVariants ? product.variants![selectedVariantIdx] : null;
  
  // If variant selected, use its price. Otherwise use Product Sale Price.
  const currentPrice = activeVariant ? activeVariant.price : product.salePrice;
  const referencePrice = product.regularPrice; // MRP

  // Dynamic Discount Calculation
  const discount = referencePrice > currentPrice
    ? Math.round(((referencePrice - currentPrice) / referencePrice) * 100)
    : 0;

  const categoryName = typeof product.category === "object" && product.category 
    ? product.category.name 
    : "Course";

  // --- Handlers ---

  const handleAddToCart = () => {
    // Construct Variant Object for Cart
    const variantData: ICartVariant | undefined = activeVariant ? {
      name: activeVariant.name,
      validity: activeVariant.validity,
      price: activeVariant.price
    } : undefined;

    const item = mapProductToCartItem(product, qty, variantData);
    addToCart(item);
    
    toast.success(
      <div className="flex flex-col">
        <span className="font-bold">Added to Cart!</span>
        <span className="text-xs text-muted-foreground">
          {qty}x {product.title} {activeVariant ? `(${activeVariant.name})` : ""}
        </span>
      </div>
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => router.push("/checkout"), 300);
  };

  return (
    <div className="bg-black text-white min-h-screen pb-12 font-sans selection:bg-green-500 selection:text-black">
      
      {/* === BREADCRUMB (Compact) === */}
      <div className="border-b border-white/5 bg-black/90 backdrop-blur-md sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 text-xs md:text-sm text-gray-400 flex items-center gap-1.5 overflow-hidden">
          <Link href="/" className="hover:text-white transition-colors shrink-0">Home</Link> 
          <ChevronRight className="w-3 h-3 shrink-0 text-gray-600" />
          <Link href="/shop" className="hover:text-white transition-colors shrink-0">{categoryName}</Link>
          <ChevronRight className="w-3 h-3 shrink-0 text-gray-600" />
          <span className="text-white font-medium truncate">{product.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-6 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          
          {/* =================================
              LEFT COLUMN: GALLERY (7 Cols) 
          ================================= */}
          <div className="lg:col-span-7 space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-[#111] shadow-2xl group"
            >
              <Image 
                src={mainImage} 
                alt={product.title} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                 <div className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20 shadow-2xl">
                    <PlayCircle className="w-12 h-12 text-white fill-white/20" />
                 </div>
              </div>

              {discount > 0 && (
                <Badge className="absolute top-3 left-3 bg-yellow-500 text-black text-xs px-2.5 py-0.5 font-bold shadow-lg border-0 rounded-md">
                  SAVE {discount}%
                </Badge>
              )}
            </motion.div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {allImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`relative w-20 h-14 md:w-24 md:h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      mainImage === img 
                        ? "border-green-500 opacity-100 ring-2 ring-green-500/20" 
                        : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt="thumb" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* =================================
              RIGHT COLUMN: INFO (5 Cols) 
          ================================= */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            
            {/* 1. Header Info */}
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
                    {product.isFeatured && (
                      <Badge variant="outline" className="text-orange-400 border-orange-400/30 bg-orange-400/10 text-[10px] px-2 uppercase tracking-wide gap-1">
                        <Flame className="w-3 h-3 fill-orange-400" /> Hot
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500 font-mono uppercase">ID: {product._id.slice(-4)}</span>
                 </div>
                 <button className="text-gray-500 hover:text-white transition"><Share2 className="w-4 h-4" /></button>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-snug tracking-tight mb-2">
                {product.title}
              </h1>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                  {product.shortDescription}
                </p>
              )}

              {/* Ratings / Sold */}
              <div className="flex items-center gap-4 mt-3 text-xs md:text-sm font-medium border-b border-white/5 pb-4">
                 <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-yellow-500" /> 
                    <span className="text-white">4.9</span>
                 </div>
                 <span className="text-gray-600">|</span>
                 <span className="text-green-400">{product.salesCount + 10} Sold</span>
              </div>
            </motion.div>

            {/* ⚡ 2. VARIANT SELECTOR (If Exists) */}
            {hasVariants && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Choose Plan</p>
                   {activeVariant && <span className="text-xs text-green-400">{activeVariant.validity} Access</span>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {product.variants!.map((variant, idx) => {
                    const isSelected = selectedVariantIdx === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedVariantIdx(idx)}
                        className={`cursor-pointer relative p-3 rounded-xl border transition-all duration-200 flex flex-col gap-1 ${
                          isSelected 
                            ? "bg-white text-black border-white shadow-lg shadow-white/10" 
                            : "bg-[#161616] border-white/5 hover:border-white/20 text-gray-300"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`font-bold text-sm ${isSelected ? "text-black" : "text-white"}`}>
                            {variant.name}
                          </span>
                          {isSelected && <Crown className="w-3.5 h-3.5 text-black fill-black/10" />}
                        </div>
                        <div className="flex items-end justify-between mt-1">
                           <span className="text-[10px] opacity-70 flex items-center gap-1">
                             <Clock className="w-3 h-3" /> {variant.validity}
                           </span>
                           <span className="text-xs font-bold">৳{variant.price}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Pricing & Actions */}
            <motion.div 
              layout
              className="bg-[#111] border border-white/10 p-5 rounded-2xl relative overflow-hidden"
            >
              {/* Glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 blur-[40px] rounded-full pointer-events-none" />

              <div className="relative z-10 flex flex-col gap-4">
                
                {/* Price Row */}
                <div className="flex items-end gap-3">
                  <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    ৳{currentPrice.toLocaleString()}
                  </span>
                  {referencePrice > currentPrice && (
                    <div className="flex flex-col mb-1">
                      <span className="text-xs text-gray-500 line-through font-medium">
                        ৳{referencePrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-green-500 font-bold">
                        {discount}% OFF
                      </span>
                    </div>
                  )}
                </div>

                {/* Buttons Row */}
                <div className="flex gap-2 h-12">
                  {/* Quantity */}
                  <div className="flex items-center bg-black border border-white/10 rounded-lg w-24 shrink-0">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-white" disabled={qty <= 1}>
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="flex-1 text-center font-bold text-sm">{qty}</span>
                    <button onClick={() => setQty(q => q + 1)} className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-white">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <Button 
                    onClick={handleAddToCart}
                    variant="outline" 
                    className="flex-1 h-full border-white/10 bg-white/5 hover:bg-white hover:text-black font-bold text-sm rounded-lg transition-all"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" /> Cart
                  </Button>

                  {/* Buy Now */}
                  <Button 
                    onClick={handleBuyNow}
                    className="flex-1 h-full bg-white text-black hover:bg-gray-200 font-bold text-sm rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* 4. Features & Trust */}
            <div className="space-y-3">
               {product.features && product.features.length > 0 && (
                 <div className="space-y-2">
                   {product.features.slice(0, 4).map((feature, i) => (
                     <div key={i} className="flex items-start gap-2.5 text-sm text-gray-400">
                       <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                       <span className="leading-snug">{feature}</span>
                     </div>
                   ))}
                 </div>
               )}
               
               <div className="flex items-center justify-start gap-6 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" /> Secure Checkout
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                    <CreditCard className="w-3.5 h-3.5" /> Instant Delivery
                  </div>
               </div>
            </div>

          </div>
        </div>

        {/* =================================
            BOTTOM SECTION: TABS & DESC
        ================================= */}
        <div className="mt-6 md:mt-16 mx-auto">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="flex w-full md:w-auto border-b border-white/10 bg-transparent p-0 mb-6 gap-6">
              <TabsTrigger 
                value="description" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-white text-gray-500 text-base font-medium px-0 pb-3 transition-colors"
              >
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-white text-gray-500 text-base font-medium px-0 pb-3 transition-colors"
              >
                Reviews
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="animate-in fade-in-50 slide-in-from-bottom-2">
              <div className="bg-[#111] border text-gray-300 border-white/5 rounded-2xl p-1 md:p-8 leading-relaxed">
                <div 
                  className="prose prose-invert prose-sm md:prose-base max-w-none prose-p:text-gray-400 prose-headings:text-white prose-a:text-green-400 prose-strong:text-white prose-ul:list-disc prose-li:marker:text-green-500 prose-img:rounded-xl"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="reviews">
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-[#111] border border-white/5 rounded-2xl">
                <Heart className="w-12 h-12 text-gray-700" />
                <div>
                  <h3 className="text-lg font-bold text-white">No Reviews Yet</h3>
                  <p className="text-sm text-gray-500">Be the first to rate this product!</p>
                </div>
                <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white hover:text-black">
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