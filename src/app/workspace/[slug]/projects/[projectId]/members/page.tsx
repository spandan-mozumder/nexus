import { protectRoute } from "@/lib/auth-guard";
import {
  getProjectById,
  getProjectMembers,
  getWorkspaceMembers,
} from "@/features/projects/actions";
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
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ArrowLeft, Plus, UserPlus, Crown, Shield, Eye } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { ProjectMembersManager } from "./members-manager";

interface ProjectMembersPageProps {
  params: Promise<{
    slug: string;
    projectId: string;
  }>;
}

export default async function ProjectMembersPage({
  params,
}: ProjectMembersPageProps) {
  const session = await protectRoute();

  const { slug, projectId } = await params;
  const [projectResult, membersResult, workspaceMembersResult] =
    await Promise.all([
      getProjectById(projectId),
      getProjectMembers(projectId),
      getWorkspaceMembers(projectId),
    ]);

  if (projectResult.error || !projectResult.data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  const project = projectResult.data;
  const members = membersResult.success ? membersResult.data : [];
  const workspaceMembers = workspaceMembersResult.success
    ? workspaceMembersResult.data
    : [];

  const currentUserMember = members.find((m) => m.userId === session.user.id);
  const isAdmin = currentUserMember?.role === "ADMIN";

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Crown className="h-3 w-3" />;
      case "MEMBER":
        return <Shield className="h-3 w-3" />;
      case "VIEWER":
        return <Eye className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "default";
      case "MEMBER":
        return "secondary";
      case "VIEWER":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/workspace/${slug}/projects/${projectId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Project
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {project.name} - Members
            </h2>
            <p className="text-muted-foreground">
              Manage project members and their permissions
            </p>
          </div>
        </div>
        {isAdmin && (
          <ProjectMembersManager
            projectId={projectId}
            workspaceSlug={slug}
            currentMembers={members}
            workspaceMembers={workspaceMembers}
          />
        )}
      </div>

      <Separator />

      {}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Project Members
          </CardTitle>
          <CardDescription>
            {members.length} {members.length === 1 ? "member" : "members"} have
            access to this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    {member.user.avatar && (
                      <AvatarImage src={member.user.avatar} />
                    )}
                    <AvatarFallback>
                      {getInitials(
                        member.user.name || member.user.email || "U",
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {member.user.name || "Unknown"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getRoleColor(member.role)} className="gap-1">
                    {getRoleIcon(member.role)}
                    {member.role}
                  </Badge>
                  {member.userId === session.user.id && (
                    <Badge variant="outline" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No members yet</p>
                <p className="text-sm">Add members to start collaborating</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Understanding what each role can do in this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                <h4 className="font-medium">Admin</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Manage project settings</li>
                <li>• Add/remove members</li>
                <li>• Create/edit all content</li>
                <li>• Delete project items</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <h4 className="font-medium">Member</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Create/edit content</li>
                <li>• Comment on items</li>
                <li>• View all project data</li>
                <li>• Cannot manage members</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-500" />
                <h4 className="font-medium">Viewer</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View project content</li>
                <li>• Read-only access</li>
                <li>• Cannot edit anything</li>
                <li>• Cannot add comments</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
