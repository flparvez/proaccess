"use client";

import { motion, Variants } from "framer-motion";
import { BadgeCheck, Truck, Headset, ShieldCheck } from "lucide-react";

const FEATURES = [
  { icon: BadgeCheck, title: "Authentic Product" },
  { icon: Truck, title: "Fast Delivery" },
  { icon: Headset, title: "10AM–12PM Support" },
  { icon: ShieldCheck, title: "Secure Checkout" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const cardContainerVariants: Variants = {
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" },
  },
};

export function FeaturesStrip() {
  return (
    <section className="w-full bg-white">
      <motion.div
        className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={containerVariants}
      >
        {/* Heading */}
        <h2 className="text-center text-lg sm:text-xl md:text-2xl font-semibold tracking-[0.06em] text-gray-800 mb-4 sm:mb-6 md:mb-7 uppercase">
          Access Thousands of Premium Courses for Less
        </h2>

        {/* Cards */}
        <motion.div
          variants={cardContainerVariants}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {FEATURES.map(({ icon: Icon, title }) => (
            <motion.div
              key={title}
              variants={cardVariants}
              whileHover={{
                y: -2,
                scale: 1.01,
              }}
              className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] px-3 py-3 sm:px-4 sm:py-4 flex flex-col items-center justify-center text-center border border-gray-100"
            >
              <div className="mb-2 sm:mb-3 flex items-center justify-center">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gray-900 text-white flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs sm:text-sm md:text-[0.9rem] font-medium text-gray-800 leading-snug">
                {title}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

export default FeaturesStrip;
