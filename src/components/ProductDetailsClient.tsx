"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation"; // 1. For Redirect
import { IProduct } from "@/types";
import { motion } from "framer-motion";
import { useCart } from "@/lib/CartContext"; // 2. Import Cart Hook
import { 
  ShoppingCart, 
  Heart, 
  CheckCircle2, 
  ShieldCheck, 
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
  const router = useRouter();
  const { addToCart, mapProductToCartItem } = useCart(); // 3. Use Cart Hook

  // State
  const [mainImage, setMainImage] = useState(product.thumbnail);
  const [qty, setQty] = useState(1);

  // Gallery Logic
  const allImages = [product.thumbnail, ...product.gallery];

  // Calculations
  const discount = product.regularPrice > product.salePrice
    ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
    : 0;

  // Safe Category Name
  const categoryName = typeof product.category === "object" && product.category 
    ? product.category.name 
    : "Digital Product";

  // --- Handlers ---

  const handleAddToCart = () => {
    // 4. Map and Add
    const item = mapProductToCartItem(product, qty);
    addToCart(item);
    toast.success(`${qty} x ${product.title} added to cart`);
  };

  const handleBuyNow = () => {
    // 5. Add to Cart AND Redirect
    const item = mapProductToCartItem(product, qty);
    addToCart(item);
    toast.success("Proceeding to checkout...");
    router.push("/checkout"); // Redirect to checkout page
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      
      {/* Breadcrumb */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm md:static md:shadow-none">
        <div className="container mx-auto px-4 py-3 md:py-4 text-sm text-muted-foreground flex items-center gap-2 overflow-hidden">
          <Link href="/" className="hover:text-primary shrink-0">Home</Link> 
          <ChevronRight className="w-4 h-4 shrink-0" />
          <Link href="/shop" className="hover:text-primary shrink-0">{categoryName}</Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <span className="text-foreground font-medium truncate">{product.title}</span>
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
              className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border bg-white shadow-sm group"
            >
              <Image 
                src={mainImage} 
                alt={product.title} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-green-600 text-lg px-3 py-1 shadow-lg">
                  -{discount}% OFF
                </Badge>
              )}
            </motion.div>

            {/* Thumbnails (Only show if gallery exists) */}
            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {allImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      mainImage === img ? "border-green-600 ring-2 ring-green-100" : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <Image src={img} alt="thumb" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* === RIGHT COLUMN: INFO === */}
          <div className="flex flex-col gap-6">
            
            {/* Title & Stats */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                {product.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1 uppercase tracking-wide">
                  <Flame className="w-3.5 h-3.5" /> Hot
                </span>
                <span className="text-muted-foreground border-l pl-3">
                  SKU: <span className="font-mono text-slate-700">{product._id.slice(-6).toUpperCase()}</span>
                </span>
                {product.isAvailable ? (
                  <span className="text-green-600 font-bold flex items-center gap-1 border-l pl-3">
                    <CheckCircle2 className="w-4 h-4" /> In Stock
                  </span>
                ) : (
                  <span className="text-red-600 font-bold border-l pl-3">Out of Stock</span>
                )}
              </div>
            </div>

            {/* Urgency Ticker */}
            <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex items-center gap-2 text-red-600 text-sm">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </div>
              <span className="font-bold">{product.salesCount + 12}</span> people bought this recently!
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 pb-4 border-b border-dashed">
              <span className="text-4xl font-extrabold text-green-600">
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
            {product.features && product.features.length > 0 && (
              <ul className="space-y-2 bg-white p-4 rounded-xl border border-slate-100">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              {/* Quantity */}
              <div className="flex items-center border rounded-lg h-12 w-fit bg-white">
                <button 
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="px-4 hover:bg-gray-50 h-full text-slate-600 transition-colors"
                  disabled={qty <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-slate-800">{qty}</span>
                <button 
                  onClick={() => setQty(q => q + 1)}
                  className="px-4 hover:bg-gray-50 h-full text-slate-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-3 flex-1">
                <Button 
                  onClick={handleAddToCart}
                  size="lg" 
                  variant="outline" 
                  className="flex-1 h-12 border-green-600 text-green-700 hover:bg-green-50 font-bold text-base transition-all"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
                </Button>
                <Button 
                  onClick={handleBuyNow}
                  size="lg" 
                  className="flex-1 h-12 bg-green-600 hover:bg-green-700 font-bold text-base shadow-lg shadow-green-600/20 transition-all"
                >
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm">
                <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900">Secure Payment</p>
                  <p className="text-[10px] text-slate-500">Encrypted & Safe</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm">
                <div className="bg-green-50 p-2 rounded-full text-green-600">
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
            <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8 bg-slate-100 p-1 rounded-lg">
              <TabsTrigger value="description" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md font-semibold text-slate-600">Description</TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md font-semibold text-slate-600">Reviews (0)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="animate-in fade-in-50">
              <div 
                className="prose prose-green max-w-none text-slate-600 leading-7"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </TabsContent>
            
            <TabsContent value="reviews">
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                <div className="bg-slate-50 p-4 rounded-full">
                  <Heart className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">No Reviews Yet</h3>
                <p className="text-muted-foreground max-w-sm">Be the first to share your thoughts on this product!</p>
                <Button variant="outline">Write a Review</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  );
}