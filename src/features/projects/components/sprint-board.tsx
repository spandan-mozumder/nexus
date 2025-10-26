"use client";

import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  GitBranch,
} from "lucide-react";
import { CreateIssueModal } from "./create-issue-modal";
import { updateIssue } from "../actions";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type IssueStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
type IssueType = "TASK" | "BUG" | "STORY" | "EPIC" | "FEATURE";
type IssuePriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

interface Issue {
  id: string;
  title: string;
  description: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  type: IssueType;
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
}

interface SprintBoardProps {
  projectId: string;
  issues: Issue[];
}

const columns: {
  id: IssueStatus;
  title: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { id: "TODO", title: "To Do", icon: Clock, color: "text-slate-500" },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    icon: GitBranch,
    color: "text-blue-500",
  },
  {
    id: "IN_REVIEW",
    title: "In Review",
    icon: AlertCircle,
    color: "text-orange-500",
  },
  { id: "DONE", title: "Done", icon: CheckCircle2, color: "text-green-500" },
];

const typeColors: Record<IssueType, string> = {
  TASK: "bg-blue-500",
  BUG: "bg-red-500",
  STORY: "bg-green-500",
  FEATURE: "bg-purple-500",
  EPIC: "bg-orange-500",
};

const priorityColors: Record<IssuePriority, string> = {
  LOW: "border-l-slate-400",
  MEDIUM: "border-l-yellow-400",
  HIGH: "border-l-orange-500",
  URGENT: "border-l-red-500",
};

export function SprintBoard({ projectId, issues }: SprintBoardProps) {
  const [createIssueOpen, setCreateIssueOpen] = useState(false);
  const [selectedSprintId, setSelectedSprintId] = useState<string>();
  const queryClient = useQueryClient();

  const issuesByStatus = issues.reduce(
    (acc, issue) => {
      if (!acc[issue.status]) {
        acc[issue.status] = [];
      }
      acc[issue.status].push(issue);
      return acc;
    },
    {} as Record<IssueStatus, Issue[]>,
  );

  const updateIssueMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: IssueStatus }) =>
      updateIssue({ id, status }),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
      } else {
        queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      }
    },
  });

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as IssueStatus;
    updateIssueMutation.mutate({ id: draggableId, status: newStatus });
  };

  return (
    <>
      <div className="mb-4">
        <Button onClick={() => setCreateIssueOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Issue
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-4 gap-4">
          {columns.map((column) => {
            const columnIssues = issuesByStatus[column.id] || [];

            return (
              <div key={column.id} className="flex flex-col">
                <div className="flex items-center gap-2 mb-3 px-2">
                  <column.icon className={`h-5 w-5 ${column.color}`} />
                  <h3 className="font-semibold text-sm">{column.title}</h3>
                  <Badge variant="secondary" className="ml-auto">
                    {columnIssues.length}
                  </Badge>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 rounded-lg p-2 min-h-[200px] transition-colors ${
                        snapshot.isDraggingOver ? "bg-muted/50" : "bg-muted/20"
                      }`}
                    >
                      <div className="space-y-2">
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
                                className={`cursor-pointer border-l-4 ${
                                  priorityColors[issue.priority]
                                } ${
                                  snapshot.isDragging
                                    ? "shadow-lg rotate-2"
                                    : ""
                                }`}
                              >
                                <CardContent className="p-3">
                                  <div className="flex items-start gap-2 mb-2">
                                    <div
                                      className={`w-6 h-6 rounded text-white text-xs flex items-center justify-center ${
                                        typeColors[issue.type]
                                      }`}
                                    >
                                      {issue.type[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium line-clamp-2">
                                        {issue.title}
                                      </p>
                                    </div>
                                  </div>
                                  {issue.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                      {issue.description}
                                    </p>
                                  )}
                                  {issue.assignee && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                        {issue.assignee.name?.[0] ||
                                          issue.assignee.email?.[0]}
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {issue.assignee.name ||
                                          issue.assignee.email}
                                      </span>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <CreateIssueModal
        projectId={projectId}
        sprintId={selectedSprintId}
        open={createIssueOpen}
        onOpenChange={setCreateIssueOpen}
      />
    </>
  );
}
