"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  MessageSquare,
  FolderKanban,
  Settings,
  ChevronLeft,
  Users,
} from "lucide-react";
import { getInitials } from "@/lib/utils";

interface WorkspaceNavProps {
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
  };
}

const navigation = [
  { name: "Overview", href: "", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Messages", href: "/messages", icon: MessageSquare },
];

export function WorkspaceNav({ workspace, user }: WorkspaceNavProps) {
  const pathname = usePathname();
  const baseUrl = `/workspace/${workspace.slug}`;

  const isActive = (href: string) => {
    const fullPath = `${baseUrl}${href}`;
    if (href === "") {
      return pathname === baseUrl || pathname === `${baseUrl}/`;
    }
    return pathname.startsWith(fullPath);
  };

  return (
    <div className="flex flex-col w-64 border-r bg-background/80 backdrop-blur-xl">
      {/* Header */}
      <div className="p-4 border-b">
        <Link href="/dashboard" prefetch={true}>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start mb-3 text-muted-foreground hover:text-foreground group"
          >
            <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Workspaces
          </Button>
        </Link>
        <div className="px-2">
          <h2 className="font-semibold text-lg truncate">
            {workspace.name}
          </h2>
          <p className="text-sm text-muted-foreground truncate mt-0.5">{user.email}</p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            const href = `${baseUrl}${item.href}`;

            return (
              <Link key={item.name} href={href} prefetch={true}>
                <Button
                  variant={active ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start font-medium transition-colors",
                    active 
                      ? "bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-4 w-4",
                      active ? "text-primary" : "",
                    )}
                  />
                  {item.name}
                </Button>
              </Link>
            );
          })}

          <Separator className="my-4" />

          <Link href={`${baseUrl}/members`} prefetch={true}>
            <Button
              variant={isActive("/members") ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start font-medium transition-colors",
                isActive("/members")
                  ? "bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              <Users
                className={cn(
                  "mr-3 h-4 w-4",
                  isActive("/members") ? "text-primary" : "",
                )}
              />
              Members
            </Button>
          </Link>

          <Link href={`${baseUrl}/settings`} prefetch={true}>
            <Button
              variant={isActive("/settings") ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start font-medium transition-colors",
                isActive("/settings")
                  ? "bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              <Settings
                className={cn(
                  "mr-3 h-4 w-4",
                  isActive("/settings") ? "text-primary" : "",
                )}
              />
              Settings
            </Button>
          </Link>
        </nav>
      </ScrollArea>

      {/* User Section */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer">
          <Avatar className="h-9 w-9 border">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {getInitials(user.name || user.email || "U")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
