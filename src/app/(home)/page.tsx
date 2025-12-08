
import CategorySection from "@/components/CategorySLider";
import HeroSection from "@/components/HeroSlider";
import FeaturedCourses from "@/components/home/FeaturedCourses"
import ProductList from "@/components/home/ProductList";

export default async function Home() {

          const response = await fetch('https://proaccess-sepia.vercel.app/api/products'); 
          // const response = await fetch('/api/products?featured=true'); 
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        
  return (
<div>
  <HeroSection />
<CategorySection />
  <FeaturedCourses products={data.products} />
  <ProductList />
  
</div>
  );
}
