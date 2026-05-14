import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const LandingNavbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const NavLinks = () => (
        <>
            <a href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsOpen(false)}>
                Features
            </a>
            <a href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsOpen(false)}>
                How it Works
            </a>
            <Link to="/agents" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsOpen(false)}>
                Agents
            </Link>
            <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsOpen(false)}>
                Pricing
            </Link>
        </>
    );

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link to="/" className="flex items-center space-x-2">
                        <img src="/assets/solospider-logo.png" alt="Solo Spider Logo" className="h-8 w-auto" />
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    <NavLinks />
                </nav>

                <div className="hidden md:flex items-center gap-4">
                    <Link to="/auth">
                        <Button variant="ghost" className="font-semibold">Log in</Button>
                    </Link>
                    <Link to="/auth">
                        <Button className="font-bold bg-[#00FF66] text-black hover:bg-[#00CC52] shadow-lg shadow-[#00FF66]/20 hover:shadow-[#00FF66]/40 transition-all rounded-full px-6">
                            Deploy Agents
                        </Button>
                    </Link>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden flex items-center">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="flex flex-col gap-6 pt-16">
                            <nav className="flex flex-col gap-4 items-center mt-8">
                                <NavLinks />
                            </nav>
                            <div className="flex flex-col gap-3 mt-4">
                                <Link to="/auth" onClick={() => setIsOpen(false)}>
                                    <Button variant="outline" className="w-full">Log in</Button>
                                </Link>
                                <Link to="/auth" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full bg-[#00FF66] text-black hover:bg-[#00CC52] font-bold">Deploy Agents</Button>
                                </Link>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
};
