"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IProduct } from "@/types"; // Use the consolidated type definition

export default async function FeaturedCourses() {
        const response = await fetch('/api/products'); 
          // const response = await fetch('/api/products?featured=true'); 
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const products: IProduct[] = await response.json();
     
        
  if (!products || products.length === 0) return null;

  return (
    <section className="py-6 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 uppercase tracking-tight">
            Our Featured Courses
          </h2>
        </div>

        {/* The Green Border Container */}
        <div className="relative border-2 border-green-500 rounded-3xl p-6 md:p-10">
          
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {products.map((product) => {
                // 1. Calculate Discount
                const discount = product.regularPrice > product.salePrice
                  ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
                  : 0;

                // 2. Safe Category Access (Handle populated object vs string ID)
                const categoryName = typeof product.category === 'object' && product.category 
                  ? product.category.name 
                  : "Digital Product";

                return (
                  <CarouselItem key={product._id} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <Link href={`/product/${product.slug}`} className="group h-full block">
                      <Card className="h-full border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-white group-hover:-translate-y-1">
                        
                        {/* Image Area */}
                        <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
                          <Image
                            src={product.thumbnail} // ✅ Correct Field
                            alt={product.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          
                          {/* Discount Badge */}
                          {discount > 0 && (
                            <Badge className="absolute top-3 left-3 bg-green-500 hover:bg-green-600 text-white font-bold border-0 px-2 py-1 shadow-sm">
                              -{discount}%
                            </Badge>
                          )}

                          {/* HOT Badge (If Featured) */}
                          {product.isFeatured && (
                             <Badge className="absolute top-3 left-16 bg-orange-500 hover:bg-orange-600 text-white font-bold border-0 px-2 py-1 shadow-sm">
                               HOT
                             </Badge>
                          )}

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <Button className="bg-white text-black hover:bg-green-500 hover:text-white rounded-full font-bold shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                View Details
                             </Button>
                          </div>
                        </div>

                        {/* Content Area */}
                        <CardContent className="p-4 flex flex-col gap-2">
                          <h3 className="font-bold text-slate-800 line-clamp-2 min-h-[3rem] group-hover:text-green-600 transition-colors">
                            {product.title}
                          </h3>
                          
                          <p className="text-xs text-slate-500 line-clamp-1 uppercase tracking-wide">
                            {categoryName}
                          </p>
                          
                          {/* Price Section */}
                          <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-100">
                            {product.regularPrice > product.salePrice && (
                                <span className="text-sm text-slate-400 line-through decoration-slate-400">
                                   ৳{product.regularPrice.toLocaleString()}
                                </span>
                            )}
                            <span className="text-xl font-extrabold text-green-600">
                               ৳{product.salePrice.toLocaleString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            
            {/* Navigation Buttons */}
            <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white border shadow-lg hover:bg-green-50 hover:text-green-600 w-10 h-10 lg:w-12 lg:h-12" />
            <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white border shadow-lg hover:bg-green-50 hover:text-green-600 w-10 h-10 lg:w-12 lg:h-12" />
          </Carousel>

          {/* Visual Pagination Dots */}
          <div className="flex justify-center gap-2 mt-8">
             {[...Array(Math.min(products.length, 5))].map((_, i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === 0 ? 'bg-green-500 scale-125' : 'bg-slate-200'}`}></div>
             ))}
          </div>

        </div>
      </div>
    </section>
  );
}