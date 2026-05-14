import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const CTASection = () => {
    return (
        <section className="py-32 relative overflow-hidden">
            {/* Background with deep focus */}
            <div className="absolute inset-0 bg-background z-0"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[800px] bg-primary/20 blur-[120px] rounded-[100%] z-0"></div>

            <div className="container mx-auto px-4 relative z-10 glass-card rounded-3xl md:p-24 p-10 text-center shadow-2xl">
                <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                    Deploy Your First <br /> AI Agent Today
                </h2>
                <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                    Stop Managing Tools. Start Scaling. Let Solo Spider autonomously grow your business 24/7.
                </p>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Link to="/auth">
                        <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-[#00FF66] text-black hover:bg-[#00CC52] font-bold shadow-xl shadow-[#00FF66]/20 hover:shadow-[#00FF66]/40 hover:-translate-y-1 transition-all">
                            Deploy Your Agents Now
                        </Button>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-4 sm:mt-0 sm:ml-4 sm:text-left hidden sm:block">
                        No credit card <br /> required to start.
                    </p>
                </div>
            </div>
        </section>
    );
};
