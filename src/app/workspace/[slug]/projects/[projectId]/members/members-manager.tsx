"use client";

import { useState, useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addProjectMember,
  removeProjectMember,
} from "@/features/projects/actions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreVertical,
  UserPlus,
  Trash2,
  Crown,
  Shield,
  Eye,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";

interface ProjectMembersManagerProps {
  projectId: string;
  workspaceSlug: string;
  currentMembers: any[];
  workspaceMembers: any[];
}

export function ProjectMembersManager({
  projectId,
  workspaceSlug,
  currentMembers,
  workspaceMembers,
}: ProjectMembersManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<
    "ADMIN" | "MEMBER" | "VIEWER"
  >("MEMBER");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddMember = async () => {
    if (!selectedUserId) return;

    setIsLoading(true);
    try {
      const result = await addProjectMember({
        projectId,
        userId: selectedUserId,
        role: selectedRole,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Member added successfully!");
        setOpen(false);
        setSelectedUserId("");
        setSelectedRole("MEMBER");
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to add member");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (
      !confirm(`Are you sure you want to remove ${userName} from this project?`)
    ) {
      return;
    }

    try {
      const result = await removeProjectMember({
        projectId,
        userId,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Member removed successfully!");
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

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
    <div className="flex items-center gap-2">
      {}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Project Member</DialogTitle>
            <DialogDescription>
              Select a workspace member to add to this project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Member</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a member..." />
                </SelectTrigger>
                <SelectContent>
                  {workspaceMembers.map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          {member.user.avatar && (
                            <AvatarImage src={member.user.avatar} />
                          )}
                          <AvatarFallback className="text-xs">
                            {getInitials(
                              member.user.name || member.user.email || "U",
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.user.name || member.user.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select
                value={selectedRole}
                onValueChange={(value: any) => setSelectedRole(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">
                    <div className="flex items-center gap-2">
                      <Crown className="h-3 w-3" />
                      Admin - Full access
                    </div>
                  </SelectItem>
                  <SelectItem value="MEMBER">
                    <div className="flex items-center gap-2">
                      <Shield className="h-3 w-3" />
                      Member - Can edit content
                    </div>
                  </SelectItem>
                  <SelectItem value="VIEWER">
                    <div className="flex items-center gap-2">
                      <Eye className="h-3 w-3" />
                      Viewer - Read only
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddMember}
                disabled={!selectedUserId || isLoading}
              >
                {isLoading ? "Adding..." : "Add Member"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {}
      <div className="flex items-center gap-1">
        {currentMembers.map((member) => (
          <div key={member.id} className="relative group">
            <Avatar className="h-8 w-8">
              {member.user.avatar && <AvatarImage src={member.user.avatar} />}
              <AvatarFallback className="text-xs">
                {getInitials(member.user.name || member.user.email || "U")}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1">
              <Badge
                variant={getRoleColor(member.role)}
                className="h-4 px-1 text-xs"
              >
                {getRoleIcon(member.role)}
              </Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -top-1 -right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    handleRemoveMember(
                      member.userId,
                      member.user.name || member.user.email,
                    )
                  }
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-3 w-3" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
}
