"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export function OrderActionModal({ order }: { order: any }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form States for the Hidden Content
  const [accountEmail, setAccountEmail] = useState(order.deliveredContent?.accountEmail || "");
  const [accountPassword, setAccountPassword] = useState(order.deliveredContent?.accountPassword || "");
  const [notes, setNotes] = useState(order.deliveredContent?.accessNotes || "");

  async function handleUpdateStatus(status: "completed" | "declined") {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${order._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          deliveredContent: {
            accountEmail,
            accountPassword,
            accessNotes: notes,
          },
        }),
      });

      if (res.ok) {
        setOpen(false);
        router.refresh(); // Refreshes the table data
      }
    } catch (error) {
      console.error("Failed to update order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {order.status === "pending" ? "Verify" : "Details"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Order Verification</DialogTitle>
          <DialogDescription>
            Review payment and deliver credentials.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* 1. Transaction Info (Read Only) */}
          <div className="p-3 bg-slate-50 rounded-lg border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transaction ID:</span>
              <span className="font-mono font-bold">{order.transactionId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-bold text-green-600">৳{order.amount}</span>
            </div>
          </div>

          {/* 2. Delivery Inputs (Where you type the credentials) */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="text-sm font-medium leading-none">Digital Delivery Data</h4>
            
            <div className="grid gap-2">
              <Label htmlFor="ac_email">Account Email / Username</Label>
              <Input
                id="ac_email"
                placeholder="e.g. user@premium.com"
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ac_pass">Account Password</Label>
              <Input
                id="ac_pass"
                placeholder="e.g. SecretPass123"
                value={accountPassword}
                onChange={(e) => setAccountPassword(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="e.g. Do not change the password."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {/* Decline Button */}
          <Button 
             variant="destructive" 
             onClick={() => handleUpdateStatus("declined")}
             disabled={loading}
          >
             <XCircle className="mr-2 h-4 w-4" /> Decline
          </Button>

          {/* Complete Button */}
          <Button 
             onClick={() => handleUpdateStatus("completed")} 
             disabled={loading}
             className="bg-green-600 hover:bg-green-700"
          >
             {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
             Complete & Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}