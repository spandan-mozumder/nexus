import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  label?: string;
}

const sizeMap = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-6 w-6", 
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

export function LoadingSpinner({ size = "md", className, label }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeMap[size])} />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
    </div>
  );
}

export function LoadingPulse({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" />
      <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse [animation-delay:0.2s]" />
      <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse [animation-delay:0.4s]" />
    </div>
  );
}

export function LoadingBar({ className }: { className?: string }) {
  return (
    <div className={cn("h-1 w-full bg-muted overflow-hidden rounded-full", className)}>
      <div className="h-full bg-primary rounded-full animate-[loading-bar_1.5s_ease-in-out_infinite]" 
        style={{
          width: "40%",
          animation: "loading-bar 1.5s ease-in-out infinite"
        }}
      />
    </div>
  );
}

interface FullPageLoaderProps {
  message?: string;
}

export function FullPageLoader({ message = "Loading..." }: FullPageLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-muted" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}

export function CardLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <LoadingSpinner size="lg" />
    </div>
  );
}

export function InlineLoader({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2 text-muted-foreground", className)}>
      <LoadingSpinner size="sm" />
      <span className="text-sm">Loading...</span>
    </div>
  );
}