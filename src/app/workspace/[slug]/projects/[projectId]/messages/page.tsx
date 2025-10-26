import { protectRoute } from "@/lib/auth-guard";
import { getProjectById } from "@/features/projects/actions";
import { getProjectChannels } from "@/features/messages/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Plus, MessageSquare, Users, Hash } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { CreateProjectChannelModal } from "./create-project-channel-modal";

interface ProjectMessagesPageProps {
  params: Promise<{
    slug: string;
    projectId: string;
  }>;
}

export default async function ProjectMessagesPage({
  params,
}: ProjectMessagesPageProps) {
  await protectRoute();

  const { slug, projectId } = await params;
  const [projectResult, channelsResult] = await Promise.all([
    getProjectById(projectId),
    getProjectChannels(projectId),
  ]);

  if (projectResult.error || !projectResult.data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  const project = projectResult.data;
  const channels = channelsResult.success ? channelsResult.data : [];

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {project.name} - Messages
          </h2>
          <p className="text-muted-foreground">
            Project-specific communication channels
          </p>
        </div>
        <CreateProjectChannelModal projectId={projectId} workspaceSlug={slug} />
      </div>

      {}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {channels.map((channel) => (
          <Link
            key={channel.id}
            href={`/workspace/${slug}/messages/channel/${channel.id}`}
          >
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: project.color || "#6366f1" }}
                    >
                      {project.key}
                    </div>
                    <Hash className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base">{channel.name}</CardTitle>
                </div>
                {channel.description && (
                  <CardDescription className="text-sm">
                    {channel.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{channel._count.members} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{channel._count.messages} messages</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {}
      {channels.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No channels yet</h3>
            <p className="text-muted-foreground mb-4">
              Create a channel to start team communication for this project
            </p>
            <CreateProjectChannelModal
              projectId={projectId}
              workspaceSlug={slug}
            />
          </CardContent>
        </Card>
      )}

      {}
      <Card>
        <CardHeader>
          <CardTitle>About Project Channels</CardTitle>
          <CardDescription>
            Project-specific communication channels help keep discussions
            organized
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">General Channel</h4>
              <p className="text-sm text-muted-foreground">
                Every project automatically gets a general channel for broad
                discussions
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Custom Channels</h4>
              <p className="text-sm text-muted-foreground">
                Create additional channels for specific topics, features, or
                teams
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
