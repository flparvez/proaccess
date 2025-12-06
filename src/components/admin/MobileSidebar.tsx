"use client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import { useState } from "react";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation</span>
        </Button>
      </SheetTrigger>
      {/* Reusing the exact same sidebar component inside the sheet */}
      <SheetContent side="left" className="flex flex-col p-0">
        <div onClick={() => setOpen(false)}> {/* Close on click */}
            <AdminSidebar />
        </div>
      </SheetContent>
    </Sheet>
  );
}