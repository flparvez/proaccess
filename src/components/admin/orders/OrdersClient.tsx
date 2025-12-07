"use client";

import * as React from "react";
import {
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card"; // Import Card
import { ChevronLeft, ChevronRight, Search, Trash2, MoreHorizontal } from "lucide-react";
import { columns, OrderColumn } from "./columns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface OrdersClientProps {
  data: OrderColumn[];
}

export function OrdersClient({ data }: OrdersClientProps) {
  const router = useRouter();
  
  // 1. Local State to handle Deletion updates instantly
  const [orders, setOrders] = React.useState<OrderColumn[]>(data);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  // 2. Delete Handler
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;

    setLoadingId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Order deleted successfully");
        // Update UI immediately
        setOrders((prev) => prev.filter((order) => order._id !== id));
        router.refresh();
      } else {
        toast.error("Failed to delete order");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoadingId(null);
    }
  };

  // Initialize Table Hook with LOCAL state (orders)
  const table = useReactTable({
    data: orders, 
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    globalFilterFn: (row, columnId, filterValue) => {
      const txId = row.original.transactionId.toLowerCase();
      const email = row.original.user.email.toLowerCase();
      const search = filterValue.toLowerCase();
      return txId.includes(search) || email.includes(search);
    },
  });

  return (
    <div className="space-y-4">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search Transaction ID or Email..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-8 h-9 w-full"
          />
        </div>
      </div>

      {/* --- DESKTOP VIEW (Table) --- */}
      <div className="hidden md:block rounded-md border bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
                {/* Extra Header for Delete Button */}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                  {/* Manual Delete Cell for Desktop */}
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(row.original._id)}
                      disabled={loadingId === row.original._id}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      {loadingId === row.original._id ? (
                        <span className="animate-spin text-xs">...</span> 
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE VIEW (Cards) --- */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <Card key={row.id} className="border shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">#{row.original.transactionId}</p>
                    <h3 className="font-semibold text-slate-800">{row.original.product.title}</h3>
                  </div>
                  {/* Reuse Status Badge Logic from Columns if possible, or render custom */}
                  <div className="scale-90 origin-top-right">
                    {flexRender(row.getVisibleCells().find(c => c.column.id === 'status')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'status')?.getContext() as any)}
                  </div>
                </div>

                <div className="text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span className="font-medium">{row.original.user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-bold text-green-600">৳{row.original.amount}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t mt-2">
                  {/* Main Action (Verify/Details) - Getting it from the existing columns */}
                  <div className="flex-1">
                     {flexRender(row.getVisibleCells().find(c => c.column.id === 'actions')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'actions')?.getContext() as any)}
                  </div>
                  
                  {/* Delete Button */}
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleDelete(row.original._id)}
                    disabled={loadingId === row.original._id}
                    className="border-red-200 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center p-4 text-muted-foreground">No orders found.</div>
        )}
      </div>

      {/* --- PAGINATION --- */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}