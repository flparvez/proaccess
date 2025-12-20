"use client";

import { IProduct } from "@/types"; // Ensure IProduct includes the new variants interface
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

// 1. Define the Variant shape for the Cart
export interface ICartVariant {
  name: string;      // e.g. "Silver"
  validity: string;  // e.g. "30 Days"
  price: number;     // e.g. 500
}

// 2. Updated Cart Item Interface
export interface CartItem {
  cartId: string; // ⚡ Unique ID (productId + variantName) to distinguish items
  productId: string;
  name: string;
  image: string;
  price: number; // This will store either SalePrice or VariantPrice
  regularPrice?: number;
  quantity: number;
  category?: string;
  
  // ✅ Variant Support
  variant?: ICartVariant; 
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartId: string) => void; // Remove by cartId, not productId
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Updated Helper: Accepts optional variant
  mapProductToCartItem: (product: IProduct, qty?: number, variant?: ICartVariant) => CartItem;
  
  totalAmount: number;
  totalItems: number;
  isInitialized: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_KEY = "eduaccess-cart-v2"; // Changed key version to reset old carts

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // --- Load Cart ---
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

  // --- Save Cart ---
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  // --- Actions ---

  const addToCart = useCallback((newItem: CartItem) => {
    setCart((prev) => {
      // Check if this exact product+variant combo exists
      const existing = prev.find((item) => item.cartId === newItem.cartId);
      
      if (existing) {
        // Increment quantity
        return prev.map((item) =>
          item.cartId === newItem.cartId
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      // Add new item
      return [...prev, newItem];
    });
  }, []);

  const removeFromCart = useCallback((cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  }, []);

  const updateQuantity = useCallback((cartId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.cartId === cartId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  // --- ⚡ CRITICAL: Map Product -> Cart Item Logic ---
  const mapProductToCartItem = useCallback(
    (product: IProduct, quantity = 1, selectedVariant?: ICartVariant): CartItem => {
      
      // 1. Determine Price: Variant Price OR Product Sale Price
      const finalPrice = selectedVariant ? selectedVariant.price : product.salePrice;

      // 2. Generate Unique Cart ID
      // If variant exists: "prod123-Silver"
      // If no variant: "prod123-default"
      const uniqueCartId = selectedVariant 
        ? `${product._id}-${selectedVariant.name}` 
        : `${product._id}-default`;

      return {
        cartId: uniqueCartId,
        productId: String(product._id),
        name: product.title,
        image: product.thumbnail,
        
        // Price Logic Applied Here
        price: finalPrice, 
        regularPrice: product.regularPrice,
        
        quantity,
        category: typeof product.category === 'object' ? (product.category as any).name : "Product",
        
        // Store the variant details if selected
        variant: selectedVariant,
      };
    },
    []
  );

  // --- Calculations ---
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