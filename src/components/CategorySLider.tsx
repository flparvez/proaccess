"use client";

import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    id: "hsc-27",
    title: "HSC 27",
    subtitle: "ACADEMIC REVISION ADMISSION",
    gradientStart: "from-yellow-400",
    gradientEnd: "to-white",
    logoPath: "/easy-education-logo.png",
    href: "/category/hsc-27",
  },
  {
    id: "hsc-26",
    title: "HSC 26",
    subtitle: "ACADEMIC REVISION ADMISSION",
    gradientStart: "from-yellow-400",
    gradientEnd: "to-white",
    logoPath: "/easy-education-logo.png",
    href: "/category/hsc-26",
  },
  {
    id: "hsc-25",
    title: "HSC 25",
    subtitle: "ACADEMIC REVISION ADMISSION",
    gradientStart: "from-yellow-400",
    gradientEnd: "to-white",
    logoPath: "/easy-education-logo.png",
    href: "/category/hsc-25",
  },
  {
    id: "hsc-24",
    title: "HSC 24",
    subtitle: "ACADEMIC REVISION ADMISSION",
    gradientStart: "from-yellow-400",
    gradientEnd: "to-white",
    logoPath: "/easy-education-logo.png",
    href: "/category/hsc-24",
  },
];

function CategoryCard({ category }: { category: (typeof categories)[0] }) {
  return (
    <Link href={category.href} className="block h-full">
      <div className="h-full overflow-hidden rounded-xl bg-white transition-all hover:shadow-lg hover:-translate-y-0.5">
        
        {/* Top Section */}
        <div
          className={`relative flex items-center justify-between bg-gradient-to-r ${category.gradientStart} ${category.gradientEnd} p-3 sm:p-4`}
        >
          {/* Pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M10 0l10 10-10 10L0 10z\" fill=\"black\"/%3E%3C/svg%3E')",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            <span className="inline-block rounded bg-yellow-300 px-2 py-0.5 text-[11px] font-bold text-black">
              {category.title}
            </span>

            <p className="mt-1 text-xs sm:text-sm font-extrabold uppercase leading-tight text-black max-w-[170px] sm:max-w-[240px]">
              {category.subtitle}
            </p>
          </div>

          {/* Logo */}
          <div className="relative z-10 ml-2 h-10 w-14 sm:h-14 sm:w-20 flex-shrink-0">
            <Image
              src={category.logoPath}
              alt="Easy Education"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="bg-black py-2">
          <p className="text-center text-sm font-semibold text-white">
            {category.title}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function CategorySection() {
  return (
    <section className="bg-black py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-3 sm:px-4">

        {/* Title */}
        <h2 className="mb-4 sm:mb-6 text-xl sm:text-3xl font-bold text-white">
          Browse by Category
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-2">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
