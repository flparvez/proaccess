"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      {/* ===== TOP BAR ===== */}
      <div className="max-w-7xl mx-auto px-3 py-2 flex items-center gap-3">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="/ProAccess-Logo.png"
            alt="Logo"
            width={140}
            height={36}
            className="object-contain"
            priority
          />
        </Link>

        {/* Search (desktop) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-auto">
          <div className="flex w-full rounded-md border overflow-hidden bg-gray-50">
            <Input
              placeholder="Search products"
              className="border-0 focus-visible:ring-0 text-sm h-9 bg-transparent"
            />
            <div className="hidden lg:flex items-center px-3 text-xs font-medium text-gray-600 border-l">
              CATEGORY <ChevronDown className="ml-1 h-3 w-3" />
            </div>
            <Button className="h-9 rounded-none bg-green-600 hover:bg-green-700 px-3">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right info (desktop) */}
        <div className="hidden lg:flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Headset className="h-4 w-4" />
            24/7 Support
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Fast Delivery
          </div>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 ml-auto md:hidden">
          {/* Search */}
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost">
                <Search className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="p-3">
              <div className="flex gap-2">
                <Input placeholder="Search..." />
                <Button>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 bg-gray-900 text-white">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <span className="font-semibold">Menu</span>
                <SheetClose asChild>
                  <Button size="icon" variant="ghost">
                    <X className="h-5 w-5" />
                  </Button>
                </SheetClose>
              </div>
              <nav className="p-3 space-y-1">
                {navLinks.map((l) => (
                  <SheetClose asChild key={l.href}>
                    <Link
                      href={l.href}
                      className="block px-3 py-2 rounded-md hover:bg-gray-800 text-sm"
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

      {/* ===== BOTTOM BAR ===== */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-3 h-12 flex items-center justify-between">
          {/* Nav (desktop) */}
          <nav className="hidden md:flex gap-6 text-xs font-semibold tracking-wide">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="relative py-3 text-gray-300 hover:text-green-400 transition"
              >
                {l.label}
                <span className="absolute left-0 bottom-1 h-[2px] w-full origin-left scale-x-0 hover:scale-x-100 bg-green-500 transition-transform" />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 ml-auto">
            <NavbarIcon href="/cart" icon={<ShoppingBag />} count={0} />
            <NavbarIcon href="/wishlist" icon={<Heart />} count={0} />

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-gray-700">
              <Avatar className="h-8 w-8 border border-green-500">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold truncate max-w-[120px]">
                PROJUKTI BD
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ======================================================= */
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
    <Link href={href} className="relative">
      <div className="p-2 rounded-full bg-green-600 hover:bg-green-700 transition">
        {icon}
      </div>
      <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-white text-green-700">
        {count}
      </Badge>
    </Link>
  );
}
