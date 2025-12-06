"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/CartContext"; // Import hook
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Clock,
  Headset,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const navLinks = [
  { href: "/", label: "HOME" },
  { href: "/creative", label: "CREATIVE" },
  { href: "/business", label: "BUSINESS" },
  { href: "/design", label: "DESIGN" },
  { href: "/development", label: "DEVELOPMENT" },
  { href: "/freelancing", label: "FREELANCING" },
  { href: "/marketing", label: "MARKETING" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCart(); // Get dynamic count

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      {/* ===== TOP BAR ===== */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 md:gap-4 flex-wrap md:flex-nowrap">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <div className="relative w-32 h-9 md:w-40 md:h-10">
            <Image
              src="/ProAccess-Logo.png"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 min-w-0 md:px-4 lg:px-6">
          <div className="flex w-full rounded-md border border-gray-200 overflow-hidden bg-gray-50 focus-within:ring-2 focus-within:ring-green-500/20 transition-all">
            <Input
              placeholder="Search for products..."
              className="border-0 focus-visible:ring-0 text-sm h-10 bg-transparent flex-1"
            />
            <div className="hidden lg:flex items-center px-4 text-xs font-semibold text-gray-500 border-l bg-white cursor-pointer hover:bg-gray-50">
              CATEGORY <ChevronDown className="ml-1 h-3 w-3" />
            </div>
            <Button className="h-10 rounded-none bg-green-600 hover:bg-green-700 px-5 transition-colors">
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Right Info (Desktop Only) */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-medium text-gray-600">
            <div className="flex items-center gap-2">
              <Headset className="h-8 w-8 text-gray-400 stroke-1" />
              <div className="flex flex-col">
                <span className="font-bold text-gray-800">24/7 Support</span>
                <span className="text-[10px]">Call anytime</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-gray-400 stroke-1" />
              <div className="flex flex-col">
                <span className="font-bold text-gray-800">Fast Delivery</span>
                <span className="text-[10px]">Digital Goods</span>
              </div>
            </div>
          </div>

          {/* Cart + Wishlist + Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dynamic Cart Icon */}
            <NavbarIcon
              href="/cart"
              icon={<ShoppingBag className="h-5 w-5" />}
              count={totalItems} // Use context value
            />
            <NavbarIcon
              href="/wishlist"
              icon={<Heart className="h-5 w-5" />}
              count={0} // Wishlist logic can be added later
            />

            {/* Mobile Menu Trigger */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <Menu className="h-7 w-7 text-gray-700" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[280px] p-0 bg-gray-900 text-white border-r-gray-800"
                >
                  {/* ... mobile menu content same as before ... */}
                  <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
                    <span className="font-bold text-lg text-green-400">MENU</span>
                    <SheetClose asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="hover:bg-gray-800 text-gray-400"
                      >
                        <X className="h-6 w-6" />
                      </Button>
                    </SheetClose>
                  </div>
                  <nav className="p-2 space-y-1">
                    {navLinks.map((l) => (
                      <SheetClose asChild key={l.href}>
                        <Link
                          href={l.href}
                          className="block px-4 py-3 rounded-lg hover:bg-gray-800 text-sm font-medium transition-colors"
                        >
                          {l.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* ===== BOTTOM BAR ===== */}
      <div className="bg-gray-900 text-white shadow-inner">
        <div className="max-w-7xl mx-auto px-4 py-2 md:py-0 md:h-14 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Desktop Nav */}
          <div className="hidden md:block w-full md:w-auto md:flex-1">
            <nav className="flex gap-6 lg:gap-8 text-[13px] font-bold tracking-wide h-full items-center overflow-x-auto">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="relative h-full flex items-center text-gray-300 hover:text-green-400 transition group whitespace-nowrap"
                >
                  {l.label}
                  <span className="absolute bottom-0 left-0 h-[3px] w-full bg-green-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Mobile Search */}
          <div className="flex md:hidden w-full relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full h-10 pl-4 pr-10 rounded-md bg-gray-800 border border-gray-700 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-green-500 transition-colors"
            />
            <button className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center text-gray-400 hover:text-green-400">
              <Search className="h-5 w-5" />
            </button>
          </div>

          {/* User Profile (Desktop) */}
          <div className="hidden md:flex items-center justify-end w-full md:w-auto md:ml-auto">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-700 ml-2">
                <Avatar className="h-9 w-9 border-2 border-green-600">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback className="bg-gray-800 text-gray-400">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 leading-none mb-1">
                    HELLO,
                  </span>
                  <span className="text-xs font-bold text-white truncate max-w-[120px]">
                    PROJUKTI BD
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavbarIcon({
  href,
  icon,
  count,
}: {
  href: string;
  icon: React.ReactNode;
  count: number;
}) {
  return (
    <Link href={href} className="relative group">
      <div className="p-2.5 rounded-full bg-green-600 group-hover:bg-green-500 text-white transition-all shadow-md group-hover:shadow-green-500/20">
        {icon}
      </div>
      {count > 0 && (
        <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold bg-white text-green-700 border-2 border-gray-900">
          {count}
        </Badge>
      )}
    </Link>
  );
}