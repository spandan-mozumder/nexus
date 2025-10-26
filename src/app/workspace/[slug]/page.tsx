import { protectRoute } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import { getWorkspaceBySlug } from "@/features/workspaces/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  CheckSquare,
  FileText,
  MessageSquare,
  Palette,
  FolderKanban,
  Users,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default async function WorkspaceOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await protectRoute();

  const { slug } = await params;
  const result = await getWorkspaceBySlug(slug);

  if (result.error || !result.workspace) {
    redirect("/dashboard");
  }

  const workspace = result.workspace;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto p-6 lg:p-8 space-y-8">
        {}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold tracking-tight">
                  {workspace.name}
                </h1>
                <Badge variant="secondary" className="px-3 py-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              {workspace.description && (
                <p className="text-lg text-muted-foreground max-w-2xl">
                  {workspace.description}
                </p>
              )}
            </div>
          </div>
          <Separator className="my-4" />
        </div>

        {}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Team Members
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {workspace.members.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Active collaborators
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center">
                <FolderKanban className="h-4 w-4 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Start tracking work
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Tasks
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                <CheckSquare className="h-4 w-4 text-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">In progress</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-4 w-4 text-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Knowledge base
              </p>
            </CardContent>
          </Card>
        </div>

        {}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">
              Quick Access
            </h2>
            <Badge variant="outline">5 Tools Available</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="Project Management"
              description="Track issues, plan sprints, and manage your projects with agile workflows"
              icon={<FolderKanban className="h-10 w-10" />}
              href={`/workspace/${slug}/projects`}
              gradient="from-primary/20 to-primary/5"
              badgeText="Jira-like"
            />
            <FeatureCard
              title="Task Boards"
              description="Organize work with Kanban boards, lists, and drag-and-drop task management"
              icon={<CheckSquare className="h-10 w-10" />}
              href={`/workspace/${slug}/boards`}
              gradient="from-secondary/20 to-secondary/5"
              badgeText="Trello-like"
            />
            <FeatureCard
              title="Documents"
              description="Create and share rich documentation, wikis, and notes with your team"
              icon={<FileText className="h-10 w-10" />}
              href={`/workspace/${slug}/documents`}
              gradient="from-accent/20 to-accent/5"
              badgeText="Notion-like"
            />
            <FeatureCard
              title="Team Chat"
              description="Real-time messaging, channels, and direct conversations for seamless collaboration"
              icon={<MessageSquare className="h-10 w-10" />}
              href={`/workspace/${slug}/messages`}
              gradient="from-muted to-muted/30"
              badgeText="Slack-like"
            />
            <FeatureCard
              title="Whiteboard"
              description="Visual collaboration canvas for brainstorming, diagrams, and creative work"
              icon={<Palette className="h-10 w-10" />}
              href={`/workspace/${slug}/whiteboard`}
              gradient="from-primary/10 to-secondary/10"
              badgeText="Miro-like"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
  href,
  gradient,
  badgeText,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  gradient: string;
  badgeText: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full border-2 hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardHeader className="space-y-4">
          <div
            className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
          >
            <div className="text-primary">{icon}</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{title}</CardTitle>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <Badge variant="secondary" className="text-xs">
              {badgeText}
            </Badge>
          </div>
          <CardDescription className="text-sm leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
