import { cn } from "@/lib/utils";
import { LucideIcon, Inbox, Search, FolderOpen, FileX } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  variant?: "default" | "minimal" | "card";
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  actionButton,
  secondaryAction,
  className,
  variant = "default",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        variant === "default" && "py-16 px-4",
        variant === "minimal" && "py-8 px-4",
        variant === "card" && "py-12 px-6 rounded-xl border-2 border-dashed bg-muted/20",
        className
      )}
    >
      <div 
        className={cn(
          "rounded-2xl flex items-center justify-center mb-4",
          variant === "default" && "w-16 h-16 bg-primary/10",
          variant === "minimal" && "w-12 h-12 bg-muted",
          variant === "card" && "w-14 h-14 bg-primary/10"
        )}
      >
        <Icon 
          className={cn(
            "text-primary",
            variant === "default" && "h-8 w-8",
            variant === "minimal" && "h-6 w-6",
            variant === "card" && "h-7 w-7"
          )} 
        />
      </div>
      
      <h3 
        className={cn(
          "font-semibold text-foreground mb-1",
          variant === "default" && "text-xl",
          variant === "minimal" && "text-base",
          variant === "card" && "text-lg"
        )}
      >
        {title}
      </h3>
      
      {description && (
        <p 
          className={cn(
            "text-muted-foreground max-w-sm",
            variant === "default" && "text-base mb-6",
            variant === "minimal" && "text-sm mb-4",
            variant === "card" && "text-sm mb-5"
          )}
        >
          {description}
        </p>
      )}
      
      {action && (
        <div className="mt-2">{action}</div>
      )}
      
      {(actionButton || secondaryAction) && (
        <div className="flex items-center gap-3 mt-2">
          {actionButton && (
            <Button onClick={actionButton.onClick} className="gap-2">
              {actionButton.icon && <actionButton.icon className="h-4 w-4" />}
              {actionButton.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Pre-built empty states
export function EmptySearchResults({ 
  query, 
  onClear,
  className 
}: { 
  query?: string; 
  onClear?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={query ? `No results for "${query}". Try adjusting your search.` : "Try adjusting your search criteria."}
      actionButton={onClear ? { label: "Clear search", onClick: onClear } : undefined}
      className={className}
    />
  );
}

export function EmptyFolder({ 
  title = "No files yet",
  description = "Get started by uploading your first file.",
  action,
  className 
}: { 
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <EmptyState
      icon={FolderOpen}
      title={title}
      description={description}
      action={action}
      variant="card"
      className={className}
    />
  );
}

export function EmptyList({ 
  title = "Nothing here yet",
  description,
  action,
  className 
}: { 
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <EmptyState
      icon={FileX}
      title={title}
      description={description}
      action={action}
      variant="minimal"
      className={className}
    />
  );
}
