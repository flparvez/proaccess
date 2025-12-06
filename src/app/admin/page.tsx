"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Users, CreditCard } from "lucide-react";

// Types for the stats we fetched in previous step
interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real data from the API we built earlier
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to load stats");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (loading) return <div className="p-8">Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <StatsCard 
           title="Total Revenue" 
           value={`৳${stats?.totalRevenue.toLocaleString()}`} 
           icon={DollarSign} 
           desc="Lifetime earnings"
           variants={item}
        />
        <StatsCard 
           title="Pending Orders" 
           value={stats?.pendingOrders.toString() || "0"} 
           icon={CreditCard} 
           desc="Requires Verification"
           variants={item}
           className="border-orange-200 bg-orange-50"
        />
        <StatsCard 
           title="Total Orders" 
           value={stats?.totalOrders.toString() || "0"} 
           icon={ShoppingCart} 
           desc="All time orders"
           variants={item}
        />
        <StatsCard 
           title="Active Users" 
           value={stats?.totalUsers.toString() || "0"} 
           icon={Users} 
           desc="Registered accounts"
           variants={item}
        />
      </motion.div>

      {/* You can add a Chart or Recent Orders Table here later */}
    </div>
  );
}

// Reusable Stats Card Component
function StatsCard({ title, value, icon: Icon, desc, variants, className }: any) {
  return (
    <motion.div variants={variants}>
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}