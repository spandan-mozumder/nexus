"use client";

import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical } from "lucide-react";
import { getInitials } from "@/lib/utils";
import Link from "next/link";

interface Issue {
  id: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  assignee?: {
    id: string;
    name: string | null;
    email: string | null;
    avatar: string | null;
  } | null;
}

interface IssuesKanbanBoardProps {
  issues: Issue[];
  projectId: string;
  workspaceSlug: string;
  onStatusChange: (issueId: string, newStatus: string) => Promise<void>;
}

const COLUMNS = [
  { id: "BACKLOG", title: "Backlog", color: "bg-gray-100" },
  { id: "TODO", title: "To Do", color: "bg-blue-100" },
  { id: "IN_PROGRESS", title: "In Progress", color: "bg-yellow-100" },
  { id: "IN_REVIEW", title: "In Review", color: "bg-purple-100" },
  { id: "DONE", title: "Done", color: "bg-green-100" },
];

export function IssuesKanbanBoard({
  issues: initialIssues,
  projectId,
  workspaceSlug,
  onStatusChange,
}: IssuesKanbanBoardProps) {
  const [issues, setIssues] = useState(initialIssues);
  const [isDragging, setIsDragging] = useState(false);

  const onDragEnd = async (result: DropResult) => {
    setIsDragging(false);

    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;
    const issueId = draggableId;

    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId ? { ...issue, status: newStatus } : issue,
      ),
    );

    try {
      await onStatusChange(issueId, newStatus);
    } catch (error) {
      setIssues(initialIssues);
      console.error("Failed to update issue status:", error);
    }
  };

  const onDragStart = () => {
    setIsDragging(true);
  };

  const getIssuesByStatus = (status: string) => {
    return issues.filter((issue) => issue.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "destructive";
      case "HIGH":
        return "default";
      case "MEDIUM":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-12rem)]">
        {COLUMNS.map((column) => {
          const columnIssues = getIssuesByStatus(column.id);

          return (
            <div key={column.id} className="flex-shrink-0 w-80">
              <div className="flex flex-col h-full">
                {}
                <div className={`rounded-t-lg p-3 ${column.color}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{column.title}</h3>
                      <Badge variant="secondary" className="h-5 min-w-5 px-1.5">
                        {columnIssues.length}
                      </Badge>
                    </div>
                    <Link
                      href={`/workspace/${workspaceSlug}/projects/${projectId}/issues/new?status=${column.id}`}
                    >
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-2 space-y-2 bg-muted/30 rounded-b-lg overflow-y-auto ${
                        snapshot.isDraggingOver ? "bg-muted/50" : ""
                      }`}
                    >
                      {columnIssues.map((issue, index) => (
                        <Draggable
                          key={issue.id}
                          draggableId={issue.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`cursor-grab active:cursor-grabbing transition-shadow ${
                                snapshot.isDragging ? "shadow-lg" : "shadow-sm"
                              }`}
                            >
                              <CardHeader className="p-3 pb-2">
                                <div className="flex items-start justify-between gap-2">
                                  <CardTitle className="text-sm font-medium line-clamp-2">
                                    {issue.title}
                                  </CardTitle>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 flex-shrink-0"
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="p-3 pt-0">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    <Badge
                                      variant="outline"
                                      className="text-xs h-5"
                                    >
                                      {issue.type}
                                    </Badge>
                                    <Badge
                                      variant={getPriorityColor(issue.priority)}
                                      className="text-xs h-5"
                                    >
                                      {issue.priority}
                                    </Badge>
                                  </div>
                                  {issue.assignee && (
                                    <Avatar className="h-6 w-6">
                                      {issue.assignee.avatar && (
                                        <AvatarImage
                                          src={issue.assignee.avatar}
                                        />
                                      )}
                                      <AvatarFallback className="text-xs">
                                        {getInitials(
                                          issue.assignee.name ||
                                            issue.assignee.email ||
                                            "?",
                                        )}
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {columnIssues.length === 0 && !isDragging && (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          No issues
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
