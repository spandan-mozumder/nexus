"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import { CheckCircle2, XCircle, AlertCircle, Info, Loader2 } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:font-medium",
          closeButton:
            "group-[.toast]:bg-background group-[.toast]:border-border group-[.toast]:hover:bg-accent",
          success:
            "group-[.toaster]:border-green-500/20 group-[.toaster]:bg-green-50 dark:group-[.toaster]:bg-green-950/20",
          error:
            "group-[.toaster]:border-red-500/20 group-[.toaster]:bg-red-50 dark:group-[.toaster]:bg-red-950/20",
          warning:
            "group-[.toaster]:border-yellow-500/20 group-[.toaster]:bg-yellow-50 dark:group-[.toaster]:bg-yellow-950/20",
          info:
            "group-[.toaster]:border-blue-500/20 group-[.toaster]:bg-blue-50 dark:group-[.toaster]:bg-blue-950/20",
        },
      }}
      icons={{
        success: <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />,
        error: <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
        warning: <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />,
        info: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
        loading: <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />,
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
