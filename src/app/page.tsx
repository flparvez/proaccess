import FeaturesStrip from "@/components/FeaturesStrip";
import HeroSlider from "@/components/HeroSlider";
import FeaturedCourses from "@/components/home/FeaturedCourses"
import ProductList from "@/components/home/ProductList";

export default async function Home() {

          const response = await fetch('http://localhost:3000/api/products'); 
          // const response = await fetch('/api/products?featured=true'); 
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        
  return (
<div>
  <HeroSlider />
<FeaturesStrip />
  <FeaturedCourses products={data.products} />
  <ProductList />
  <h2>test</h2>
</div>
  );
}
