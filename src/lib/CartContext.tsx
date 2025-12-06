"use client";

import { IProduct } from "@/types"; // Use your main type
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

// --- Cart Specific Types ---
export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  regularPrice?: number; // For showing discounts in cart
  quantity: number;
  category?: string;
  // Simplified for now - add variants back if your schema supports them
  selectedVariants?: Record<string, string>; 
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Helper to convert DB Product -> Cart Item
  mapProductToCartItem: (product: IProduct, qty?: number) => CartItem;
  
  totalAmount: number;
  totalItems: number;
  isInitialized: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_KEY = "proaccess-cart-v1"; // Unique key

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Load from LocalStorage (Client Side Only)
  useEffect(() => {
    const stored = localStorage.getItem(CART_KEY);
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch (e) {
        console.error("Cart parse error", e);
        localStorage.removeItem(CART_KEY);
      }
    }
    setIsInitialized(true);
  }, []);

  // 2. Save to LocalStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  // --- Actions ---

  const addToCart = useCallback((newItem: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === newItem.productId);
      if (existing) {
        // Increment quantity if exists
        return prev.map((item) =>
          item.productId === newItem.productId
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prev, newItem];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, quantity) } // Prevent 0
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  // --- Helper: Map DB Product to Cart Item ---
  const mapProductToCartItem = useCallback((product: IProduct, quantity = 1): CartItem => {
    return {
      productId: product._id,
      name: product.title,
      image: product.thumbnail,
      price: product.salePrice, // Always use Sale Price
      regularPrice: product.regularPrice,
      quantity,
      category: typeof product.category === 'object' ? product.category.name : "Product"
    };
  }, []);

  // --- Derived State ---
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        mapProductToCartItem,
        totalAmount,
        totalItems,
        isInitialized,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};