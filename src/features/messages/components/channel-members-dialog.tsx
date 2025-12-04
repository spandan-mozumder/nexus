"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getChannelMembers,
  addChannelMember,
  removeChannelMember,
} from "../actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Users,
  UserPlus,
  MoreVertical,
  UserMinus,
  Crown,
  Lock,
  Loader2,
  Check,
  Search,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";

interface ChannelMembersDialogProps {
  channelId: string;
  currentUserId: string;
}

export function ChannelMembersDialog({
  channelId,
  currentUserId,
}: ChannelMembersDialogProps) {
  const [open, setOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [addMemberSearch, setAddMemberSearch] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["channel-members", channelId],
    queryFn: async () => {
      const result = await getChannelMembers(channelId);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    enabled: open,
  });

  const addMemberMutation = useMutation({
    mutationFn: (userId: string) => addChannelMember(channelId, userId),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Member added successfully");
        queryClient.invalidateQueries({ queryKey: ["channel-members", channelId] });
      }
    },
    onError: () => {
      toast.error("Failed to add member");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => removeChannelMember(channelId, userId),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Member removed successfully");
        queryClient.invalidateQueries({ queryKey: ["channel-members", channelId] });
      }
    },
    onError: () => {
      toast.error("Failed to remove member");
    },
  });

  const channelMembers = data?.channelMembers || [];
  const workspaceMembers = data?.workspaceMembers || [];
  const isPrivate = data?.isPrivate || false;
  const channelCreatorId = data?.channelCreatorId;

  // Get members not in channel
  const channelMemberIds = new Set(channelMembers.map((m) => m.userId));
  const availableMembers = workspaceMembers.filter(
    (m) => !channelMemberIds.has(m.userId)
  );

  // Filter members based on search
  const filteredChannelMembers = channelMembers.filter((member) =>
    (member.user.name || member.user.email || "")
      .toLowerCase()
      .includes(memberSearch.toLowerCase())
  );

  const filteredAvailableMembers = availableMembers.filter((member) =>
    (member.user.name || member.user.email || "")
      .toLowerCase()
      .includes(addMemberSearch.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Members</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Channel Members
            {isPrivate && (
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                Private
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Manage who has access to this channel
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Loading members...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">
                {channelMembers.length} member{channelMembers.length !== 1 ? "s" : ""}
              </span>
              {availableMembers.length > 0 && (
                <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Members</DialogTitle>
                      <DialogDescription>
                        Select workspace members to add to this channel
                      </DialogDescription>
                    </DialogHeader>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search members..."
                        value={addMemberSearch}
                        onChange={(e) => setAddMemberSearch(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <ScrollArea className="max-h-[300px] mt-2">
                      <div className="space-y-2">
                        {filteredAvailableMembers.map((member) => (
                          <div
                            key={member.userId}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                {member.user.avatar && (
                                  <AvatarImage src={member.user.avatar} />
                                )}
                                <AvatarFallback>
                                  {getInitials(member.user.name || member.user.email || "?")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">
                                  {member.user.name || member.user.email}
                                </p>
                                {member.user.name && (
                                  <p className="text-xs text-muted-foreground">
                                    {member.user.email}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addMemberMutation.mutate(member.userId)}
                              disabled={addMemberMutation.isPending}
                            >
                              {addMemberMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <UserPlus className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ))}
                        {filteredAvailableMembers.length === 0 && (
                          <p className="text-center text-sm text-muted-foreground py-4">
                            {availableMembers.length === 0
                              ? "All workspace members are already in this channel"
                              : "No members found"}
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="relative mb-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search channel members..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="pl-8"
              />
            </div>

            <Separator />

            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2 py-2">
                {filteredChannelMembers.map((member) => {
                  const isCreator = member.userId === channelCreatorId;
                  const isCurrentUser = member.userId === currentUserId;

                  return (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {member.user.avatar && (
                            <AvatarImage src={member.user.avatar} />
                          )}
                          <AvatarFallback>
                            {getInitials(member.user.name || member.user.email || "?")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">
                              {member.user.name || member.user.email}
                              {isCurrentUser && (
                                <span className="text-muted-foreground"> (you)</span>
                              )}
                            </p>
                            {isCreator && (
                              <Badge variant="secondary" className="gap-1 text-xs">
                                <Crown className="h-3 w-3" />
                                Creator
                              </Badge>
                            )}
                          </div>
                          {member.user.name && (
                            <p className="text-xs text-muted-foreground">
                              {member.user.email}
                            </p>
                          )}
                        </div>
                      </div>

                      {!isCreator && (currentUserId === channelCreatorId || isCurrentUser) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => removeMemberMutation.mutate(member.userId)}
                              disabled={removeMemberMutation.isPending}
                              className="text-destructive focus:text-destructive"
                            >
                              {removeMemberMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <UserMinus className="h-4 w-4 mr-2" />
                              )}
                              {isCurrentUser ? "Leave Channel" : "Remove from Channel"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  );
                })}
                {filteredChannelMembers.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No members found
                  </p>
                )}
              </div>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
