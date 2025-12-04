import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import {
  CheckCircle2,
  LayoutDashboard,
  MessageSquare,
  FileText,
  Trello,
  Palette,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Users,
  Rocket,
} from "lucide-react";

const features = [
  {
    icon: CheckCircle2,
    title: "Project Management",
    description: "Track issues, plan sprints, and manage projects with ease.",
    color: "from-blue-500/20 to-blue-600/10",
    iconColor: "text-blue-500",
  },
  {
    icon: Trello,
    title: "Task Boards",
    description: "Organize work with intuitive Kanban boards.",
    color: "from-indigo-500/20 to-indigo-600/10",
    iconColor: "text-indigo-500",
  },
  {
    icon: FileText,
    title: "Documentation",
    description: "Create beautiful docs and wikis for your team.",
    color: "from-purple-500/20 to-purple-600/10",
    iconColor: "text-purple-500",
  },
  {
    icon: MessageSquare,
    title: "Team Chat",
    description: "Real-time messaging and organized channels.",
    color: "from-green-500/20 to-green-600/10",
    iconColor: "text-green-500",
  },
  {
    icon: Palette,
    title: "Whiteboard",
    description: "Visual brainstorming and collaboration.",
    color: "from-pink-500/20 to-pink-600/10",
    iconColor: "text-pink-500",
  },
  {
    icon: LayoutDashboard,
    title: "Unified Dashboard",
    description: "Everything you need in one place.",
    color: "from-orange-500/20 to-orange-600/10",
    iconColor: "text-orange-500",
  },
];

const benefits = [
  { icon: Zap, text: "Save money on subscriptions" },
  { icon: CheckCircle2, text: "Boost team productivity" },
  { icon: MessageSquare, text: "Better collaboration" },
  { icon: FileText, text: "Unified search" },
  { icon: LayoutDashboard, text: "Stay organized" },
  { icon: Sparkles, text: "Scales with your team" },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo size="md" />
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all duration-300">
              Nexus
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="gap-1.5">
                Get Started
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] animate-pulse-subtle" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[80px] animate-pulse-subtle" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/3 to-secondary/3 rounded-full blur-[120px]" />
        </div>
        
        <div className="container mx-auto px-4 py-20 md:py-28 text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-8 animate-fade-in-down">
            <Sparkles className="h-4 w-4" />
            <span>All-in-One Workspace</span>
          </div>
          
          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              One Platform.
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Five Tools.
            </span>
          </h1>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up stagger-2">
            Project management, task boards, documentation, team chat, and whiteboards — 
            unified in one powerful workspace.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up stagger-3">
            <Link href="/sign-up">
              <Button size="xl" className="w-full sm:w-auto gap-2">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="xl" variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground animate-fade-in stagger-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span>Team Friendly</span>
            </div>
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-purple-500" />
              <span>Fast & Reliable</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Five powerful tools working together seamlessly
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="group relative p-6 rounded-2xl border bg-card hover:bg-card/80 hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Teams Choose Nexus
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A unified workspace makes work easier
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((benefit, index) => (
              <div 
                key={benefit.text}
                className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-accent/50 hover:border-primary/20 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of teams who have already made the switch to Nexus.
          </p>
          <Link href="/sign-up">
            <Button size="xl" className="gap-2">
              Start your free trial
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <span className="font-semibold">Nexus</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Nexus. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
