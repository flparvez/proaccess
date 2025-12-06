"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
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
  ShoppingBag
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IOrder } from "@/types";

export default function UserDashboard() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Orders on Mount
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

  // Loading State
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* === HEADER SECTION === */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-green-100">
              <Image 
                src={session?.user?.image || '/default-profile.png'} 
                alt="Profile" 
                fill 
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Welcome, {session?.user?.name}!</h1>
              <p className="text-sm text-slate-500">{session?.user?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => signOut()} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </motion.div>

        {/* === TABS SECTION === */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6 bg-white border">
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="profile">Profile Settings</TabsTrigger>
          </TabsList>

          {/* --- ORDER TAB --- */}
          <TabsContent value="orders" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-slate-800">Order History</h2>
            </div>

            {orders.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-4">
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
          </TabsContent>

          {/* --- PROFILE TAB --- */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>Manage your personal information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <div className="p-3 bg-slate-50 rounded-md text-slate-700 border">{session?.user?.name}</div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <div className="p-3 bg-slate-50 rounded-md text-slate-700 border">{session?.user?.email}</div>
                </div>
                <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-md border border-yellow-200">
                  To change your password or update details, please contact support.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}

// === SUB-COMPONENT: ORDER CARD ===
function OrderCard({ order, index, onCopy }: { order: IOrder, index: number, onCopy: (t: string) => void }) {
  // Safe Access to Product Data
  const product = typeof order.product === 'object' && order.product ? order.product : { title: "Unknown Product", thumbnail: "" };
  
  // Status Styling
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    completed: "bg-green-100 text-green-700 border-green-200",
    declined: "bg-red-100 text-red-700 border-red-200",
    cancelled: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const statusIcon = {
    pending: <Clock className="w-3 h-3 mr-1" />,
    completed: <CheckCircle2 className="w-3 h-3 mr-1" />,
    declined: <XCircle className="w-3 h-3 mr-1" />,
    cancelled: <XCircle className="w-3 h-3 mr-1" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="p-4 md:p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
          
          {/* Product Image */}
          <div className="relative w-full md:w-24 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
            {product.thumbnail && (
              <Image src={product.thumbnail} alt={product.title} fill className="object-cover" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{product.title}</h3>
              <Badge className={`${statusStyles[order.status]} border`} variant="outline">
                {statusIcon[order.status]} {order.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Order ID: <span className="font-mono">{order.transactionId}</span></p>
            <p className="text-sm font-semibold text-slate-700">Amount: ৳{order.amount}</p>
            <p className="text-xs text-slate-400">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>

          {/* Action Button (View Details) */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto bg-slate-900 hover:bg-slate-800">
                View Details <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
                <DialogDescription>Transaction ID: {order.transactionId}</DialogDescription>
              </DialogHeader>

              {/* === THE SECRET VAULT (Hidden Content) === */}
              <div className="mt-4 space-y-4">
                
                {/* Condition: If Completed, Show Credentials */}
                {order.status === "completed" ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                      <Key className="w-24 h-24 text-green-600" />
                    </div>
                    
                    <div className="relative z-10">
                      <h4 className="font-bold text-green-800 flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-5 h-5" /> Your Access Credentials
                      </h4>
                      
                      {/* Email Field */}
                      {order.deliveredContent?.accountEmail && (
                        <div className="bg-white p-3 rounded-lg border border-green-100 mb-2">
                          <p className="text-xs text-green-600 font-semibold uppercase">Email / Username</p>
                          <div className="flex justify-between items-center mt-1">
                            <code className="text-sm font-mono text-slate-800">{order.deliveredContent.accountEmail}</code>
                            <button onClick={() => onCopy(order.deliveredContent?.accountEmail || "")} className="text-slate-400 hover:text-green-600">
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Password Field */}
                      {order.deliveredContent?.accountPassword && (
                        <div className="bg-white p-3 rounded-lg border border-green-100 mb-2">
                          <p className="text-xs text-green-600 font-semibold uppercase">Password</p>
                          <div className="flex justify-between items-center mt-1">
                            <code className="text-sm font-mono text-slate-800">{order.deliveredContent.accountPassword}</code>
                            <button onClick={() => onCopy(order.deliveredContent?.accountPassword || "")} className="text-slate-400 hover:text-green-600">
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Download Link */}
                      {order.deliveredContent?.downloadLink && (
                         <Button asChild className="w-full bg-green-600 hover:bg-green-700 mt-2">
                            <a href={order.deliveredContent.downloadLink} target="_blank" rel="noreferrer">
                               <Download className="w-4 h-4 mr-2"/> Download Resource
                            </a>
                         </Button>
                      )}

                      {/* Notes */}
                      {order.deliveredContent?.accessNotes && (
                        <div className="mt-3 text-sm text-green-800 bg-green-100/50 p-3 rounded-md">
                          <strong>Note:</strong> {order.deliveredContent.accessNotes}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Condition: If Pending/Declined
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-2">
                    <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <h4 className="font-semibold text-slate-700">
                      {order.status === 'pending' ? 'Verification in Progress' : 'Order Declined'}
                    </h4>
                    <p className="text-sm text-slate-500">
                      {order.status === 'pending' 
                        ? "Your payment is being reviewed. Once approved, your credentials will appear here automatically." 
                        : "There was an issue with your order. Please contact support."}
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300">
      <div className="bg-slate-50 p-4 rounded-full mb-4">
        <ShoppingBag className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">No orders yet</h3>
      <p className="text-slate-500 max-w-xs mb-6">Looks like you haven't purchased any courses yet.</p>
      <Button asChild className="bg-green-600 hover:bg-green-700">
        <a href="/">Browse Products</a>
      </Button>
    </div>
  );
}