import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Home, ArrowLeft, Search, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/30 px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-subtle" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse-subtle" style={{ animationDelay: "1s" }} />
      </div>
      
      <div className="relative text-center space-y-8 max-w-lg animate-fade-in-up">
        {/* 404 Display */}
        <div className="relative">
          <h1 className="text-[150px] md:text-[200px] font-black text-muted/20 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center animate-bounce-gentle">
              <Compass className="h-10 w-10 text-primary" />
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Page not found
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. 
            Let&apos;s get you back on track.
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto gap-2 h-12 px-6">
              <Home className="h-4 w-4" />
              Back to home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 h-12 px-6">
              <Search className="h-4 w-4" />
              Go to dashboard
            </Button>
          </Link>
        </div>
        
        {/* Logo */}
        <div className="pt-8 flex items-center justify-center gap-2 text-muted-foreground">
          <Logo size="sm" />
          <span className="font-medium">Nexus</span>
        </div>
      </div>
    </div>
  );
}
