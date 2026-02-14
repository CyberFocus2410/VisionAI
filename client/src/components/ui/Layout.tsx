import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Leaf, Heart, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export function Layout({ children, showNav = true }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {showNav && (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                <Leaf className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display font-bold text-xl text-secondary tracking-tight">
                Nutri<span className="text-primary">Safe</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location === "/" ? "text-primary" : "text-slate-600"
              )}>
                Home
              </Link>
              <Link href="/analyze" className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location === "/analyze" ? "text-primary" : "text-slate-600"
              )}>
                Analyze
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link href="/analyze">
                <button className="hidden sm:flex items-center gap-2 bg-secondary text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-secondary/90 transition-all hover:shadow-lg hover:shadow-secondary/20 active:scale-95">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-100 py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              <span className="text-sm font-medium text-slate-600">
                Medical-grade nutrition planning
              </span>
            </div>
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} NutriSafe. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
