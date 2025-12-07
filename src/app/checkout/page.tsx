"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/CartContext"; // Updated path based on previous conv
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react"; // 1. Import Session Hook
import { toast } from "sonner";
import { Loader2, ArrowRight, Lock, User, Phone, Mail, ShieldCheck } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession(); // 2. Get User Data
  const { cart, totalAmount } = useCart();
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  // 3. Auto-Fill Effect
  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        phone: (session.user as any).phone || "", // Cast if phone isn't in default type yet
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
      // Step 1: Create Order
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

      // Step 2: Initiate Payment
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

  if (cart.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center flex-col bg-black text-white">
        <div className="bg-[#111] p-8 rounded-2xl shadow-lg border border-gray-800 text-center max-w-sm w-full">
          <div className="bg-gray-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
             <ShoppingBagIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-white">Your cart is empty</h2>
          <p className="text-gray-400 text-sm mb-6">Looks like you haven't added any courses yet.</p>
          <Button onClick={() => router.push("/")} className="w-full bg-white text-black hover:bg-gray-200 font-bold">
            Browse Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen py-10 text-white selection:bg-green-500/30">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-2">Checkout</h1>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <Lock className="w-3 h-3" /> Secure Encrypted Transaction
          </p>
        </div>

        <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* === LEFT COLUMN: User Info === */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Customer Info Card */}
            <Card className="border border-gray-800 bg-[#111] shadow-xl">
              <CardHeader className="border-b border-gray-800 pb-4">
                <CardTitle className="flex items-center gap-3 text-lg font-bold text-white">
                  <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg shadow-green-900/20">1</div>
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                
                {/* Name */}
                <div className="space-y-2">
                  <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold ml-1">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                    <Input 
                      name="name" 
                      placeholder="e.g. Rahim Uddin" 
                      value={formData.name} 
                      onChange={handleChange}
                      className="pl-10 h-12 bg-[#0a0a0a] border-gray-700 text-white focus-visible:ring-green-500/50 focus-visible:border-green-500 transition-all placeholder:text-gray-600"
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Phone */}
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold ml-1">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                      <Input 
                        name="phone" 
                        placeholder="017xxxxxxxx" 
                        value={formData.phone} 
                        onChange={handleChange}
                        className="pl-10 h-12 bg-[#0a0a0a] border-gray-700 text-white focus-visible:ring-green-500/50 focus-visible:border-green-500 transition-all placeholder:text-gray-600"
                        required 
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold ml-1">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                      <Input 
                        name="email" 
                        type="email" 
                        placeholder="you@example.com" 
                        value={formData.email} 
                        onChange={handleChange}
                        className="pl-10 h-12 bg-[#0a0a0a] border-gray-700 text-white focus-visible:ring-green-500/50 focus-visible:border-green-500 transition-all placeholder:text-gray-600"
                        required 
                        readOnly={!!session?.user?.email} // Optional: Lock email if logged in
                        style={{ opacity: session?.user?.email ? 0.7 : 1 }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Notice */}
            <div className="p-6 rounded-xl border border-green-900/30 bg-green-900/10 flex items-start gap-4">
               <div className="p-2 bg-green-500/10 rounded-full shrink-0">
                 <ShieldCheck className="w-6 h-6 text-green-500" />
               </div>
               <div>
                 <h3 className="text-green-400 font-bold text-sm mb-1">Secure Payment Gateway</h3>
                 <p className="text-gray-400 text-xs leading-relaxed">
                   You will be redirected to RupantorPay to complete your purchase securely using Bkash, Nagad, or Rocket. No payment info is stored on our servers.
                 </p>
               </div>
            </div>

          </div>

          {/* === RIGHT COLUMN: Order Summary === */}
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
                  {/* Items List */}
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar-dark">
                    {cart.map((item) => (
                      <div key={item.productId} className="flex gap-4 items-start group">
                        <div className="relative w-16 h-12 bg-gray-900 rounded-md overflow-hidden shrink-0 border border-gray-800 group-hover:border-gray-600 transition-colors">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-200 line-clamp-2 group-hover:text-white transition-colors">{item.name}</p>
                          <p className="text-xs text-gray-500 mt-1">Qty: <span className="text-gray-300">{item.quantity}</span></p>
                        </div>
                        <div className="text-sm font-bold text-white tabular-nums">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-6 bg-gray-800" />

                  {/* Totals */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal</span>
                      <span className="font-medium text-gray-200">৳{totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Delivery</span>
                      <span className="text-green-400 font-medium">Free (Digital)</span>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-800 mt-4">
                      <div className="flex justify-between items-end">
                        <span className="text-gray-300 font-medium">Total Amount</span>
                        <div className="text-right">
                           <span className="text-2xl font-bold text-white">৳{totalAmount.toLocaleString()}</span>
                           <p className="text-[10px] text-gray-500 mt-1">Including VAT & Taxes</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pay Button */}
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full mt-8 h-14 text-base font-bold bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all transform hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        Pay Now <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 mt-5 text-xs text-gray-500 font-medium opacity-70">
                    <Lock className="w-3 h-3" /> Encrypted & Secure Payment
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

// Simple Helper Icon for Empty State
function ShoppingBagIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}