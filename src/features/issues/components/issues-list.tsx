"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ListTodo, Calendar, User, Flag, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface Issue {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  type: string;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  assignee: {
    id: string;
    name: string | null;
    email: string | null;
    avatar: string | null;
  } | null;
  reporter: {
    id: string;
    name: string | null;
    email: string | null;
    avatar: string | null;
  };
  project: {
    id: string;
    name: string;
    key: string;
    color: string | null;
  };
}

interface IssuesListProps {
  issues: Issue[];
  workspaceId: string;
  workspaceSlug: string;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "URGENT":
      return "destructive";
    case "HIGH":
      return "default";
    case "MEDIUM":
      return "secondary";
    case "LOW":
      return "outline";
    default:
      return "secondary";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "DONE":
      return "bg-green-500/10 text-green-700 dark:text-green-400";
    case "IN_PROGRESS":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
    case "IN_REVIEW":
      return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
    case "TODO":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
    case "BACKLOG":
    default:
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
  }
};

export function IssuesList({
  issues,
  workspaceId,
  workspaceSlug,
}: IssuesListProps) {
  if (issues.length === 0) {
    return (
      <div className="space-y-8 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Issues
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Track bugs, tasks, and feature requests
            </p>
          </div>
        </div>

        <Card className="p-12 border-2 bg-gradient-to-br from-background to-muted/20">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20">
              <ListTodo className="h-16 w-16 text-primary" />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-bold">Welcome to Issues</h3>
              <p className="text-muted-foreground max-w-md text-lg">
                Track and manage bugs, tasks, and feature requests across your
                projects.
              </p>
            </div>
            <div className="grid gap-6 text-left max-w-md w-full mt-4">
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 h-fit">
                  <ListTodo className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Issue Tracking</p>
                  <p className="text-sm text-muted-foreground">
                    Create and manage issues with status, priority, and
                    assignees
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 h-fit">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Team Collaboration</p>
                  <p className="text-sm text-muted-foreground">
                    Assign issues to team members and track progress
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 h-fit">
                  <Flag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Priority Management</p>
                  <p className="text-sm text-muted-foreground">
                    Set priorities and due dates to stay organized
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Create issues from project pages or the sidebar
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 min-h-screen bg-gradient-to-br from-background to-muted/20 p-8 rounded-xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Issues
            </h1>
            <Badge variant="secondary" className="text-sm">
              {issues.length}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2 text-lg">
            Track bugs, tasks, and feature requests
          </p>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        {issues.map((issue) => (
          <Link
            key={issue.id}
            href={`/workspace/${workspaceSlug}/projects/${issue.project.id}/issues/${issue.id}`}
          >
            <Card className="hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {}
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 h-fit">
                    <ListTodo className="h-4 w-4 text-primary" />
                  </div>

                  {}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                          {issue.title}
                        </h3>
                        {issue.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {issue.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={getPriorityColor(issue.priority) as any}
                        className="shrink-0"
                      >
                        {issue.priority}
                      </Badge>
                    </div>

                    {}
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      {}
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-3 h-3 rounded-sm"
                          style={{
                            backgroundColor: issue.project.color || "#6366f1",
                          }}
                        />
                        <span className="font-medium text-muted-foreground">
                          {issue.project.key}
                        </span>
                      </div>

                      {}
                      <Badge
                        variant="outline"
                        className={`text-xs ${getStatusColor(issue.status)}`}
                      >
                        {issue.status.replace("_", " ")}
                      </Badge>

                      {}
                      <Badge variant="outline" className="text-xs">
                        {issue.type}
                      </Badge>

                      {}
                      {issue.assignee && (
                        <div className="flex items-center gap-1.5">
                          <Avatar className="h-5 w-5 border">
                            {issue.assignee.avatar && (
                              <AvatarImage src={issue.assignee.avatar} />
                            )}
                            <AvatarFallback className="text-xs">
                              {getInitials(
                                issue.assignee.name ||
                                  issue.assignee.email ||
                                  "U",
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground truncate max-w-[100px]">
                            {issue.assignee.name || issue.assignee.email}
                          </span>
                        </div>
                      )}

                      {}
                      {issue.dueDate && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {new Date(issue.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
