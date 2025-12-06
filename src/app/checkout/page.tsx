"use client";

import { useState } from "react";
import { useCart } from "@/lib/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, ArrowRight, Lock } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalAmount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    transactionId: "",
    paymentMethod: "Bkash", // Default
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic Validation
    if (!formData.name || !formData.phone || !formData.email || !formData.transactionId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cartItems: cart, // Sending cart data
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success("Order Confirmed! Check your Dashboard.");
      clearCart(); // Clear the cart context
      router.push("/dashboard"); // Redirect user
      
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center flex-col">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Button onClick={() => router.push("/")}>Go Shopping</Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold text-center mb-10">Secure Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* === LEFT COLUMN: User Info & Payment === */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Personal Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Name <span className="text-red-500">*</span></Label>
                  <Input 
                    name="name" 
                    placeholder="e.g. Rahim Uddin" 
                    value={formData.name} 
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Phone Number <span className="text-red-500">*</span></Label>
                    <Input 
                      name="phone" 
                      placeholder="017xxxxxxxx" 
                      value={formData.phone} 
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  <div>
                    <Label>Email Address <span className="text-red-500">*</span></Label>
                    <Input 
                      name="email" 
                      type="email" 
                      placeholder="you@example.com" 
                      value={formData.email} 
                      onChange={handleChange}
                      required 
                    />
                    <p className="text-xs text-muted-foreground mt-1">Your credentials will be sent here.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup 
                  defaultValue="Bkash" 
                  onValueChange={(v) => setFormData({...formData, paymentMethod: v})}
                  className="grid grid-cols-3 gap-4"
                >
                  <Label className="cursor-pointer border-2 border-muted rounded-lg p-4 flex flex-col items-center gap-2 hover:border-green-500 [&:has([data-state=checked])]:border-green-600 [&:has([data-state=checked])]:bg-green-50">
                    <RadioGroupItem value="Bkash" className="sr-only" />
                    <span className="font-bold">Bkash</span>
                  </Label>
                  <Label className="cursor-pointer border-2 border-muted rounded-lg p-4 flex flex-col items-center gap-2 hover:border-green-500 [&:has([data-state=checked])]:border-green-600 [&:has([data-state=checked])]:bg-green-50">
                    <RadioGroupItem value="Nagad" className="sr-only" />
                    <span className="font-bold">Nagad</span>
                  </Label>
                  <Label className="cursor-pointer border-2 border-muted rounded-lg p-4 flex flex-col items-center gap-2 hover:border-green-500 [&:has([data-state=checked])]:border-green-600 [&:has([data-state=checked])]:bg-green-50">
                    <RadioGroupItem value="Rocket" className="sr-only" />
                    <span className="font-bold">Rocket</span>
                  </Label>
                </RadioGroup>

                {/* Payment Instructions */}
                <div className="bg-slate-100 p-4 rounded-lg text-sm space-y-2 border border-slate-200">
                  <p className="font-semibold text-slate-700">How to pay:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600">
                    <li>Go to your {formData.paymentMethod} App</li>
                    <li>Send Money to: <span className="font-bold text-black select-all">01700000000</span> (Personal)</li>
                    <li>Reference: Your Name</li>
                    <li>Copy the <strong>Transaction ID</strong></li>
                  </ol>
                </div>

                {/* Transaction ID Input */}
                <div>
                  <Label>Enter Transaction ID <span className="text-red-500">*</span></Label>
                  <Input 
                    name="transactionId" 
                    placeholder="e.g. 8N7S6D5F" 
                    value={formData.transactionId} 
                    onChange={handleChange}
                    className="mt-1 font-mono uppercase placeholder:normal-case"
                    required 
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* === RIGHT COLUMN: Order Summary === */}
          <div className="lg:col-span-5">
            <Card className="sticky top-24 shadow-lg border-green-100">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex gap-3">
                      <div className="relative w-12 h-12 bg-gray-100 rounded-md overflow-hidden shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-bold">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>৳{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
                    <span>Total</span>
                    <span className="text-green-700">৳{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full mt-6 h-12 text-base font-bold bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      Confirm Order <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3" /> Secure SSL Encryption
                </div>
              </CardContent>
            </Card>
          </div>

        </form>
      </div>
    </div>
  );
}