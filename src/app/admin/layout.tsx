import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { MobileSidebar } from "@/components/admin/MobileSidebar"; 
import { UserNav } from "@/components/admin/UserNav"; 
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <div className="hidden border-r bg-muted/40 md:block">
        <AdminSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col">
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <MobileSidebar /> {/* Burger Menu for Mobile */}
          
          <div className="w-full flex-1">
            <h1 className="font-semibold text-lg hidden md:block">Dashboard Control</h1>
          </div>
          
          <UserNav /> 
        </header>

        {/* Page Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-slate-50/50">
           {children}
        </main>
      </div>
    </div>
  );
}