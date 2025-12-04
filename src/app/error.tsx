"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-destructive/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      <Card className="w-full max-w-md relative glass-card animate-scale-in">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center animate-bounce-gentle">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">
              Something went wrong
            </CardTitle>
            <CardDescription className="text-base">
              We encountered an unexpected error. Don&apos;t worry, our team has been notified.
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-4">
          {error.message && (
            <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <p className="text-sm text-destructive font-mono truncate">
                {error.message}
              </p>
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={reset} 
              className="w-full gap-2 h-11"
              size="lg"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                onClick={() => window.history.back()}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go back
              </Button>
            </div>
          </div>
          
          <div className="pt-4 border-t flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Logo size="sm" />
            <span>Nexus</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
