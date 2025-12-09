"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession, signIn } from "next-auth/react"; // ✅ Import signIn
import { toast } from "sonner";
import { Loader2, ArrowRight, Lock, User, Phone, Mail, ShieldCheck } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { cart, totalAmount } = useCart();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  // Auto-Fill if logged in
  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        phone: (session.user as any).phone || "",
      });
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      // 1. Create Order & User (API)
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cartItems: cart,
          paymentMethod: "RupantorPay",
        }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // 🟢 2. AUTO LOGIN LOGIC
      // If the API says this is a new user, log them in using Email as password
      if (orderData.isNewUser) {
        await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.email, // Default password strategy
        });
      }

      // 3. Initiate Payment Gateway
      const payRes = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          orderId: orderData.orderId 
        }),
      });

      const payData = await payRes.json();

      if (payData.url) {
        window.location.href = payData.url;
      } else {
        throw new Error("Payment gateway failed to initialize");
      }
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
      setLoading(false);
    }
  };

  // ... Rest of the UI (Cart Empty State, Form Layout) remains exactly the same ...
  // (Included below for completeness if you copy-paste)
  
  if (cart.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center flex-col bg-black text-white">
         <div className="text-center">
            <h2 className="text-2xl font-bold">Your cart is empty</h2>
            <Button onClick={() => router.push("/")} className="mt-4 bg-white text-black">Go Shopping</Button>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen py-10 text-white selection:bg-green-500/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col items-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-2">Checkout</h1>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <Lock className="w-3 h-3" /> Secure Encrypted Transaction
          </p>
        </div>

        <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: User Info */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border border-gray-800 bg-[#111] shadow-xl">
              <CardHeader className="border-b border-gray-800 pb-4">
                <CardTitle className="flex items-center gap-3 text-lg font-bold text-white">
                  <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg shadow-green-900/20">1</div>
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold ml-1">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                    <Input name="name" placeholder="e.g. Rahim Uddin" value={formData.name} onChange={handleChange} className="pl-10 h-12 bg-[#0a0a0a] border-gray-700 text-white focus-visible:ring-green-500/50" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold ml-1">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                      <Input name="phone" placeholder="017xxxxxxxx" value={formData.phone} onChange={handleChange} className="pl-10 h-12 bg-[#0a0a0a] border-gray-700 text-white focus-visible:ring-green-500/50" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold ml-1">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                      <Input name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} className="pl-10 h-12 bg-[#0a0a0a] border-gray-700 text-white focus-visible:ring-green-500/50" required readOnly={!!session?.user?.email} style={{ opacity: session?.user?.email ? 0.7 : 1 }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-6 rounded-xl border border-green-900/30 bg-green-900/10 flex items-start gap-4">
               <div className="p-2 bg-green-500/10 rounded-full shrink-0"><ShieldCheck className="w-6 h-6 text-green-500" /></div>
               <div>
                 <h3 className="text-green-400 font-bold text-sm mb-1">Secure Payment Gateway</h3>
                 <p className="text-gray-400 text-xs leading-relaxed">You will be redirected to RupantorPay to complete your purchase securely using Bkash, Nagad, or Rocket.</p>
               </div>
            </div>
          </div>

          {/* Right Column: Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <Card className="border border-gray-800 bg-[#111] shadow-2xl overflow-hidden">
                <CardHeader className="bg-[#1a1a1a] border-b border-gray-800 py-5">
                  <CardTitle className="text-lg font-bold text-white flex justify-between items-center">
                    Order Summary
                    <span className="text-xs font-normal text-gray-400 bg-black px-2 py-1 rounded border border-gray-800">{cart.length} Items</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-400"><span>Subtotal</span><span className="font-medium text-gray-200">৳{totalAmount.toLocaleString()}</span></div>
                    <div className="flex justify-between text-gray-400"><span>Delivery</span><span className="text-green-400 font-medium">Free (Digital)</span></div>
                    <div className="pt-4 border-t border-gray-800 mt-4"><div className="flex justify-between items-end"><span className="text-gray-300 font-medium">Total Amount</span><div className="text-right"><span className="text-2xl font-bold text-white">৳{totalAmount.toLocaleString()}</span></div></div></div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full mt-8 h-14 text-base font-bold bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all transform hover:scale-[1.01] active:scale-[0.99]">
                    {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</> : <>Pay Now <ArrowRight className="ml-2 h-5 w-5" /></>}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}