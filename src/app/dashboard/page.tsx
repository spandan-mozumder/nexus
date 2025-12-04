import { protectRoute } from "@/lib/auth-guard";
import { getUserWorkspaces } from "@/features/workspaces/actions";
import { CreateWorkspaceModal } from "@/features/workspaces/components/create-workspace-modal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, FolderKanban, ArrowRight, Plus, Sparkles, LogOut } from "lucide-react";
import { signOutAction } from "@/features/auth/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import { getInitials } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default async function DashboardPage() {
  const session = await protectRoute();

  const result = await getUserWorkspaces();
  const workspaces = result.workspaces || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo size="md" />
            <h1 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Nexus
            </h1>
          </Link>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                  <Avatar className="h-8 w-8 border">
                    <AvatarImage src={session.user.avatar || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                      {getInitials(session.user.name || session.user.email || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden sm:block">
                    <div className="text-sm font-medium">{session.user.name || "User"}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {session.user.email}
                    </div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <form action={signOutAction}>
                  <DropdownMenuItem asChild>
                    <button type="submit" className="w-full cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </button>
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Your Workspaces
            </h2>
            <p className="text-muted-foreground">
              Select a workspace to get started or create a new one.
            </p>
          </div>
          <CreateWorkspaceModal>
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              New Workspace
            </Button>
          </CreateWorkspaceModal>
        </div>

        {/* Workspaces Grid */}
        {workspaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/20 py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">
              No workspaces yet
            </h3>
            <p className="text-muted-foreground mb-8 max-w-sm">
              Create your first workspace to start collaborating with your team.
            </p>
            <CreateWorkspaceModal>
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Workspace
              </Button>
            </CreateWorkspaceModal>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace, index) => (
              <Link
                key={workspace.id}
                href={`/workspace/${workspace.slug}`}
                className="group"
              >
                <Card 
                  variant="interactive" 
                  className="h-full border-2 hover:border-primary/30"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                        {workspace.name}
                      </CardTitle>
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                    {workspace.description && (
                      <CardDescription className="line-clamp-2 text-sm">
                        {workspace.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        <span>{workspace._count.members} members</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FolderKanban className="h-4 w-4" />
                        <span>{workspace._count.projects} projects</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
