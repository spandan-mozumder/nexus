import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  LayoutDashboard,
  MessageSquare,
  FileText,
  Trello,
  Palette,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold tracking-tight">
              Nexus
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {}
      <section className="flex-1 flex items-center justify-center py-24 sm:py-32 md:py-40">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4 mr-2 text-primary" />
            <span>All-in-one productivity platform</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6">
            One Platform. Five Superpowers.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            Combine project management, task boards, documentation, team chat,
            and visual collaboration in one seamless workspace. Stop switching,
            start collaborating.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8 py-6 shadow-lg">
                Start Your Free Trial
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {}
      <section className="py-20 bg-muted/40">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">
            Everything Your Team Needs, All in One Place
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<CheckCircle2 className="h-8 w-8 text-blue-500" />}
              title="Project Management"
              description="Track issues, plan sprints, and manage projects with Jira-like power and flexibility."
            />
            <FeatureCard
              icon={<Trello className="h-8 w-8 text-indigo-500" />}
              title="Task Boards"
              description="Organize work with intuitive Kanban boards. Drag, drop, and get things done."
            />
            <FeatureCard
              icon={<FileText className="h-8 w-8 text-purple-500" />}
              title="Documentation"
              description="Create beautiful docs and wikis. Share knowledge across your entire team."
            />
            <FeatureCard
              icon={<MessageSquare className="h-8 w-8 text-green-500" />}
              title="Team Chat"
              description="Real-time messaging, channels, and threads. Keep everyone in the loop."
            />
            <FeatureCard
              icon={<Palette className="h-8 w-8 text-pink-500" />}
              title="Whiteboard"
              description="Brainstorm visually with an infinite canvas and real-time collaboration."
            />
            <FeatureCard
              icon={<LayoutDashboard className="h-8 w-8 text-orange-500" />}
              title="Unified Platform"
              description="Everything in one place. No more switching between apps. Boost productivity."
            />
          </div>
        </div>
      </section>

      {}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Teams Love Nexus
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <BenefitItem text="Save money - one subscription instead of five" />
            <BenefitItem text="Boost productivity - no more context switching" />
            <BenefitItem text="Collaborate better - everything is connected" />
            <BenefitItem text="Find anything - unified search across all content" />
            <BenefitItem text="Stay organized - one workspace for all your work" />
          </div>
        </div>
      </section>

      {}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>
            &copy; 2025 Nexus. Built with Next.js, TypeScript, and ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-background">
      <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
      <span className="text-lg">{text}</span>
    </div>
  );
}
