"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Copy } from "lucide-react";
import { OrderActionModal } from "./OrderActionModal"; // The modal we created earlier
import { toast } from "sonner"; // Optional: For copy toast

// This type must match the data shape we created in page.tsx
export type OrderColumn = {
  _id: string;
  transactionId: string;
  amount: number;
  status: "pending" | "completed" | "declined" | "cancelled";
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  product: {
    title: string;
  };
  deliveredContent?: {
    accountEmail?: string;
  };
};

export const columns: ColumnDef<OrderColumn>[] = [
  // 1. Transaction ID Column
  {
    accessorKey: "transactionId",
    header: "Transaction ID",
    cell: ({ row }) => {
      const id = row.getValue("transactionId") as string;
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono font-medium text-blue-600">{id}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              navigator.clipboard.writeText(id);
              toast.success("Copied Transaction ID");
            }}
          >
            <Copy className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div>
      );
    },
  },

  // 2. User Info Column
  {
    accessorKey: "user",
    header: "Customer",
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{user.name}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
      );
    },
  },

  // 3. Product Column
  {
    accessorKey: "product.title",
    header: "Product",
    cell: ({ row }) => (
      <span className="font-medium truncate max-w-[200px] block" title={row.original.product.title}>
        {row.original.product.title}
      </span>
    ),
  },

  // 4. Amount Column (Sortable)
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      // Format as Bangladeshi Taka
      const formatted = new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency: "BDT",
      }).format(amount);
      return <div className="font-bold text-green-700">{formatted}</div>;
    },
  },

  // 5. Status Column (Styled Badges)
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      
      const styles: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100",
        completed: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
        declined: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
      };

      return (
        <Badge 
          className={styles[status] || "bg-gray-100 text-gray-800"} 
          variant="outline"
        >
          {status.toUpperCase()}
        </Badge>
      );
    },
  },

  // 6. Actions Column (The Modal Trigger)
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const order = row.original;
      return <OrderActionModal order={order} />;
    },
  },
];