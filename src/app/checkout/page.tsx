"use client";

import { useState } from "react";
import { useCart } from "@/lib/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, ArrowRight, Lock, CreditCard } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalAmount } = useCart(); // Removed clearCart (clears after payment success)
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validation
    if (!formData.name || !formData.phone || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      // ---------------------------------------------------------
      // STEP 1: Create "Pending" Order in Database
      // ---------------------------------------------------------
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cartItems: cart,
          paymentMethod: "RupantorPay", // Set method
          // Note: We don't send transactionId here, API will generate a unique one
        }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // ---------------------------------------------------------
      // STEP 2: Initiate Payment Gateway
      // ---------------------------------------------------------
      const payRes = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          orderId: orderData.orderId // Pass the DB Order ID
        }),
      });

      const payData = await payRes.json();

      if (payData.url) {
        // ---------------------------------------------------------
        // STEP 3: Redirect to RupantorPay
        // ---------------------------------------------------------
        window.location.href = payData.url;
      } else {
        throw new Error("Payment gateway failed to initialize");
      }
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
      setLoading(false); // Only stop loading on error (redirect needs loading state)
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center flex-col bg-slate-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
          <h2 className="text-2xl font-bold mb-2 text-slate-800">Your cart is empty</h2>
          <Button onClick={() => router.push("/")} className="bg-green-600 hover:bg-green-700">Go Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold text-center mb-10 text-slate-800">Checkout</h1>

        <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* === LEFT COLUMN: User Info === */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Customer Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b bg-white rounded-t-xl pb-4">
                <CardTitle className="flex items-center gap-3 text-lg font-bold">
                  <span className="bg-slate-900 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">1</span>
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Full Name <span className="text-red-500">*</span></Label>
                  <Input 
                    name="name" 
                    placeholder="e.g. Rahim Uddin" 
                    value={formData.name} 
                    onChange={handleChange}
                    className="mt-1.5 h-11"
                    required 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Phone Number <span className="text-red-500">*</span></Label>
                    <Input 
                      name="phone" 
                      placeholder="017xxxxxxxx" 
                      value={formData.phone} 
                      onChange={handleChange}
                      className="mt-1.5 h-11"
                      required 
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Email Address <span className="text-red-500">*</span></Label>
                    <Input 
                      name="email" 
                      type="email" 
                      placeholder="you@example.com" 
                      value={formData.email} 
                      onChange={handleChange}
                      className="mt-1.5 h-11"
                      required 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Payment Gateway Notice */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b bg-white rounded-t-xl pb-4">
                <CardTitle className="flex items-center gap-3 text-lg font-bold">
                  <span className="bg-slate-900 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">2</span>
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col items-center text-center">
                  <div className="flex gap-4 mb-4 grayscale opacity-80">
                    <Image src="/images/bkash-logo.png" alt="Bkash" width={50} height={50} className="object-contain" />
                    <Image src="/images/nagad-logo.png" alt="Nagad" width={50} height={50} className="object-contain" />
                    <Image src="/images/rocket-logo.png" alt="Rocket" width={50} height={50} className="object-contain" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">Pay Securely Online</h3>
                  <p className="text-sm text-slate-600 mt-2 max-w-sm">
                    You will be redirected to the secure payment gateway to complete your purchase using Bkash, Nagad, or Rocket.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* === RIGHT COLUMN: Order Summary === */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <Card className="border-0 shadow-lg shadow-slate-200/50">
                <CardHeader className="bg-slate-900 text-white rounded-t-xl py-4">
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Items List */}
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {cart.map((item) => (
                      <div key={item.productId} className="flex gap-4 items-start">
                        <div className="relative w-14 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 line-clamp-2">{item.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-bold text-slate-800 tabular-nums">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-5" />

                  {/* Totals */}
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-medium">৳{totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Delivery</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-3 border-t mt-3 text-slate-900">
                      <span>Total</span>
                      <span className="text-green-600">৳{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Pay Button */}
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full mt-6 h-12 text-base font-bold bg-green-600 hover:bg-green-700 shadow-md shadow-green-600/20 transition-all active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Redirecting...
                      </>
                    ) : (
                      <>
                        Pay Now <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-400 font-medium">
                    <Lock className="w-3 h-3" /> 256-bit SSL Secured
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}