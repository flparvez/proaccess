"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  BookOpen, 
  CreditCard, 
  User, 
  LogOut, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Copy, 
  Key, 
  Download, 
  Loader2,
  ShoppingBag,
  Zap,
  Star,
  Menu // Added Menu icon for potential mobile drawer trigger
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet"; // Import Sheet for Mobile Sidebar
import { IOrder } from "@/types";

export default function UserDashboard() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats Logic
  const approvedOrders = orders.filter(o => o.status === "completed").length;
  const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "processing").length;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchOrders();
  }, [session]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-green-500" />
      </div>
    );
  }

  // Define Navigation Items for Reuse
  const NavItems = () => (
    <nav className="flex-1 p-4 space-y-2">
      <Button variant="ghost" className="w-full justify-start text-green-400 bg-green-900/10 hover:bg-green-900/20 hover:text-green-300">
        <LayoutDashboard className="mr-3 h-4 w-4" /> Overview
      </Button>
      <Button variant="ghost" className="w-full justify-start text-gray-400 hover:bg-gray-800 hover:text-white">
        <BookOpen className="mr-3 h-4 w-4" /> My Courses
      </Button>
      <Button variant="ghost" className="w-full justify-start text-gray-400 hover:bg-gray-800 hover:text-white">
        <CreditCard className="mr-3 h-4 w-4" /> Payment History
      </Button>
      <Button variant="ghost" className="w-full justify-start text-gray-400 hover:bg-gray-800 hover:text-white">
        <User className="mr-3 h-4 w-4" /> Profile
      </Button>
    </nav>
  );

  const SignOutButton = () => (
    <div className="p-4 border-t border-gray-800">
      <Button variant="ghost" onClick={() => signOut()} className="w-full justify-start text-red-500 hover:bg-red-900/20 hover:text-red-400">
        <LogOut className="mr-3 h-4 w-4" /> Sign Out
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row">
      
      {/* === MOBILE HEADER (Visible on lg and below) === */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-800 sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <span className="font-bold text-lg">Student Portal</span>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6 text-gray-300" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-[#0a0a0a] border-r-gray-800 text-white w-64 p-0">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold tracking-tight">Menu</h2>
            </div>
            <NavItems />
            <SignOutButton />
          </SheetContent>
        </Sheet>
      </div>

      {/* === SIDEBAR (Desktop) === */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-gray-800 bg-[#0a0a0a] fixed h-full inset-y-0 left-0 z-50">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold tracking-tight text-white">Student Portal</h2>
        </div>
        <NavItems />
        <SignOutButton />
      </aside>

      {/* === MAIN CONTENT === */}
      <main className="flex-1 lg:pl-64 w-full">
        <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-white">Welcome back, {session?.user?.name}!</h1>
            <p className="text-sm md:text-base text-gray-400">Here's your learning journey at a glance</p>
          </motion.div>

          {/* Stats Grid - Responsive Grid cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard 
              title="Courses Enrolled" 
              value={approvedOrders} 
              icon={<BookOpen className="h-5 w-5 text-blue-400" />} 
              color="border-blue-500/20 bg-blue-500/5"
            />
            <StatsCard 
              title="Pending Payments" 
              value={pendingOrders} 
              icon={<Clock className="h-5 w-5 text-yellow-400" />} 
              color="border-yellow-500/20 bg-yellow-500/5"
            />
            <StatsCard 
              title="Completed Orders" 
              value={approvedOrders} 
              icon={<CheckCircle2 className="h-5 w-5 text-green-400" />} 
              color="border-green-500/20 bg-green-500/5"
            />
            <StatsCard 
              title="Profile Score" 
              value="100%" 
              icon={<Star className="h-5 w-5 text-purple-400" />} 
              color="border-purple-500/20 bg-purple-500/5"
            />
          </div>

          {/* Main Dashboard Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Quick Actions & Orders */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Quick Actions */}
              <Card className="bg-[#111] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ActionButton icon={<BookOpen />} title="My Courses" desc="Continue learning" />
                  <ActionButton icon={<CreditCard />} title="Payment History" desc="View transactions" />
                  <ActionButton icon={<LayoutDashboard />} title="Browse Courses" desc="Explore new content" />
                  <ActionButton icon={<User />} title="My Profile" desc="Update Info" />
                </CardContent>
              </Card>

              {/* Recent Orders List */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-gray-400"/> Recent Orders
                </h2>
                {orders.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-3">
                    {orders.map((order, index) => (
                      <OrderCard 
                        key={order._id} 
                        order={order} 
                        index={index} 
                        onCopy={copyToClipboard}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Recent Payments / Empty State */}
            <div className="lg:col-span-1">
              <Card className="bg-[#111] border-gray-800 h-full min-h-[300px]">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex justify-between">
                    Recent Payments <CreditCard className="w-4 h-4 text-gray-500"/>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-[200px] text-gray-500">
                  <CreditCard className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-sm">No recent payments</p>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

// === SUB-COMPONENTS ===

function StatsCard({ title, value, icon, color }: any) {
  return (
    <div className={`p-5 rounded-xl border ${color} flex flex-col justify-between h-28 md:h-32 relative overflow-hidden group hover:bg-opacity-10 transition-all`}>
      <div className="flex justify-between items-start z-10">
        <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
      </div>
      <div className="z-10">
        <h3 className="text-2xl font-bold text-white">{value}</h3>
        <p className="text-xs text-gray-400 mt-1">{title}</p>
      </div>
      <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity transform scale-150">
        {icon}
      </div>
    </div>
  )
}

function ActionButton({ icon, title, desc }: any) {
  return (
    <button className="flex items-start gap-4 p-4 rounded-lg bg-[#1a1a1a] border border-gray-800 hover:bg-gray-800 hover:border-gray-700 transition-all text-left group w-full">
      <div className="p-2 bg-gray-800 rounded-md text-gray-300 group-hover:text-white group-hover:bg-gray-700 transition-colors shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <h4 className="font-semibold text-sm text-gray-200 group-hover:text-white truncate">{title}</h4>
        <p className="text-xs text-gray-500 group-hover:text-gray-400 truncate">{desc}</p>
      </div>
    </button>
  )
}

function OrderCard({ order, index, onCopy }: { order: IOrder, index: number, onCopy: (t: string) => void }) {
  const product = typeof order.product === 'object' && order.product ? order.product : { title: "Unknown", thumbnail: "" };
  
  const statusConfig = {
    pending: { color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", icon: Clock },
    processing: { color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: Zap },
    completed: { color: "text-green-400 bg-green-400/10 border-green-400/20", icon: CheckCircle2 },
    declined: { color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
    cancelled: { color: "text-gray-400 bg-gray-400/10 border-gray-400/20", icon: XCircle },
  };

  const status = statusConfig[order.status] || statusConfig.pending;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-[#111] border border-gray-800 hover:border-gray-700 transition-colors">
        
        {/* Row 1: Image + Title (Mobile) */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-12 h-12 md:w-14 md:h-14 bg-gray-900 rounded-lg overflow-hidden shrink-0 border border-gray-800">
            {product.thumbnail && <Image src={product.thumbnail} alt="" fill className="object-cover" />}
          </div>
          <div className="flex-1 min-w-0 sm:hidden">
             <h4 className="font-semibold text-white truncate text-sm">{product.title}</h4>
             <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] uppercase border ${status.color}`}>
                {order.status}
             </span>
          </div>
        </div>

        {/* Row 2: Info (Desktop) + Meta Data */}
        <div className="flex-1 min-w-0 hidden sm:block">
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-semibold text-white truncate pr-2">{product.title}</h4>
            <Badge className={`${status.color} border px-2 py-0.5 text-[10px] uppercase shrink-0`}>
              {order.status}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="font-mono">#{order.transactionId.slice(-6)}</span>
            <span className="w-1 h-1 rounded-full bg-gray-700"></span>
            <span>৳{order.amount}</span>
            <span className="w-1 h-1 rounded-full bg-gray-700"></span>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Mobile Meta Data Row */}
        <div className="flex sm:hidden items-center justify-between text-xs text-gray-500 w-full pt-2 border-t border-gray-800/50">
           <span>৳{order.amount}</span>
           <span>{new Date(order.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Action Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="w-full sm:w-auto text-gray-400 hover:text-white hover:bg-gray-800">
              <span className="sm:hidden mr-2">View Details</span> 
              <ChevronRight className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          
          <DialogContent className="bg-[#111] border-gray-800 text-white sm:max-w-lg w-[95%] rounded-xl">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription className="text-gray-400 truncate">ID: <span className="font-mono text-white">{order.transactionId}</span></DialogDescription>
            </DialogHeader>

            {/* === THE VAULT === */}
            <div className="mt-4 space-y-4">
              {order.status === "completed" ? (
                <div className="bg-green-900/10 border border-green-500/20 rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5"><Key className="w-32 h-32 text-green-500" /></div>
                  
                  <div className="relative z-10 space-y-4">
                    <h4 className="font-bold text-green-400 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> Access Granted
                    </h4>
                    
                    {/* Credentials List */}
                    <div className="space-y-3">
                      {order.deliveredContent?.accountEmail && (
                        <CredentialItem label="Email / Username" value={order.deliveredContent.accountEmail} onCopy={onCopy} />
                      )}
                      {order.deliveredContent?.accountPassword && (
                        <CredentialItem label="Password" value={order.deliveredContent.accountPassword} onCopy={onCopy} />
                      )}
                      {order.deliveredContent?.downloadLink && (
                         <Button asChild className="w-full bg-green-600 hover:bg-green-500 text-white font-bold">
                            <a href={order.deliveredContent.downloadLink} target="_blank">
                               <Download className="w-4 h-4 mr-2"/> Download Content
                            </a>
                         </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Pending State
                <div className="bg-yellow-900/10 border border-yellow-500/20 rounded-xl p-6 text-center">
                  <Clock className="w-12 h-12 text-yellow-500/50 mx-auto mb-3" />
                  <h4 className="font-semibold text-yellow-400 mb-1">Verifying Payment</h4>
                  <p className="text-sm text-gray-400">
                    Your payment is being reviewed. usually takes 10-30 minutes.
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
}

function CredentialItem({ label, value, onCopy }: any) {
  return (
    <div className="bg-black/40 p-3 rounded-lg border border-green-500/10 flex justify-between items-center group">
      <div className="min-w-0 pr-2">
        <p className="text-[10px] text-green-500/70 font-bold uppercase tracking-wider">{label}</p>
        <code className="text-sm font-mono text-gray-200 truncate block">{value}</code>
      </div>
      <button onClick={() => onCopy(value)} className="p-2 text-gray-500 hover:text-white transition-colors shrink-0">
        <Copy className="w-4 h-4" />
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-gray-800 rounded-xl bg-[#111]">
      <div className="bg-gray-800/50 p-4 rounded-full mb-3">
        <ShoppingBag className="w-6 h-6 text-gray-500" />
      </div>
      <p className="text-gray-400 text-sm">No orders found</p>
    </div>
  );
}