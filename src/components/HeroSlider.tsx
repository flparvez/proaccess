"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const slides = [
  {
    id: 1,
    image: "/images/hero-1.jpg",
    title: "Freelancing & Outsourcing",
    subtitle:
      "Learn how to build a successful career online and earn from global marketplaces.",
    ctaText: "Click Here",
    ctaLink: "/courses",
  },
  {
    id: 2,
    image: "/images/hero-2.jpg",
    title: "Master Digital Skills",
    subtitle:
      "Unlock your potential with expert-led courses in development, design & marketing.",
    ctaText: "Explore Courses",
    ctaLink: "/courses",
  },
  {
    id: 3,
    image: "/images/hero-3.jpg",
    title: "Work from Anywhere",
    subtitle:
      "Gain the freedom to work remotely and enjoy the work–life balance you deserve.",
    ctaText: "Get Started",
    ctaLink: "/register",
  },
];

const HeroSlider = () => {
  return (
    <section className="relative w-full bg-gray-900">
      {/* Make height responsive instead of fixed */}
      <div className="h-[360px] sm:h-[420px] md:h-[520px] lg:h-[620px] xl:h-[680px]">
        <Swiper
          modules={[Pagination, Autoplay, EffectFade]}
          effect="fade"
          spaceBetween={0}
          slidesPerView={1}
          loop
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          className="h-full w-full hero-swiper"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id} className="relative h-full w-full">
              {/* Background Image */}
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={slide.id === 1}
                className="object-cover"
              />

              {/* Gradient Overlay for better text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10" />

              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="max-w-xl sm:max-w-2xl text-left text-white">
                    <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-white/70 mb-2 sm:mb-3">
                      Premium Online Learning
                    </p>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold md:font-bold leading-tight mb-3 sm:mb-4">
                      {slide.title}
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-white/80 mb-4 sm:mb-6">
                      {slide.subtitle}
                    </p>
                    <Link
                      href={slide.ctaLink}
                      className="inline-flex items-center justify-center rounded-full text-xs sm:text-sm md:text-base font-semibold px-5 sm:px-6 md:px-7 py-2.5 sm:py-3 bg-white text-gray-900 hover:bg-gray-100 transition-colors shadow-md"
                    >
                      {slide.ctaText}
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Swiper pagination styling */}
      <style jsx global>{`
        .hero-swiper .swiper-pagination {
          bottom: 14px;
        }
        @media (min-width: 768px) {
          .hero-swiper .swiper-pagination {
            bottom: 20px;
          }
        }
        .hero-swiper .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.5);
          opacity: 1;
          transition: all 0.25s ease;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          width: 18px;
          border-radius: 999px;
          background: #22c55e; /* Tailwind emerald-500-ish */
        }
      `}</style>
    </section>
  );
};

export default HeroSlider;
