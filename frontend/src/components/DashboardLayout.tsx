import { Outlet, useLocation } from "react-router-dom";
import { ErrorBoundary } from "./ErrorBoundary";
import AppSidebar from "@/components/AppSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const DashboardLayout = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close sheet on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(144,37,242,0.08),transparent_55%),radial-gradient(900px_500px_at_90%_0%,rgba(236,72,153,0.07),transparent_55%),#f8fafc] text-ink">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-sidebar-border bg-panel z-20">
        <img src="/assets/solospider-logo.png" alt="Solo Spider" className="h-[24px] w-auto" />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r-0">
            <AppSidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      
      <main className="flex-1 w-full overflow-auto relative min-h-[100dvh] md:min-h-0 bg-transparent">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default DashboardLayout;
