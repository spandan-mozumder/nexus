"use client";

import { useState, useCallback } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Trash2, Loader2, GripVertical } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { deleteIssue, updateIssue } from "@/features/boards/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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

interface BoardIssuesKanbanProps {
  issues: Issue[];
  boardId: string;
  workspaceSlug: string;
  projectId: string;
  onCreateIssue: (status: string) => void;
}

const COLUMNS = [
  { id: "BACKLOG", title: "Backlog", color: "bg-slate-100 dark:bg-slate-800/50", borderColor: "border-slate-200 dark:border-slate-700" },
  { id: "TODO", title: "To Do", color: "bg-blue-50 dark:bg-blue-900/20", borderColor: "border-blue-200 dark:border-blue-800" },
  { id: "IN_PROGRESS", title: "In Progress", color: "bg-amber-50 dark:bg-amber-900/20", borderColor: "border-amber-200 dark:border-amber-800" },
  { id: "IN_REVIEW", title: "In Review", color: "bg-purple-50 dark:bg-purple-900/20", borderColor: "border-purple-200 dark:border-purple-800" },
  { id: "DONE", title: "Done", color: "bg-emerald-50 dark:bg-emerald-900/20", borderColor: "border-emerald-200 dark:border-emerald-800" },
];

const PRIORITY_STYLES = {
  URGENT: { variant: "destructive" as const, className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  HIGH: { variant: "default" as const, className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  MEDIUM: { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  LOW: { variant: "outline" as const, className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
};

export function BoardIssuesKanban({
  issues: initialIssues,
  boardId,
  workspaceSlug,
  projectId,
  onCreateIssue,
}: BoardIssuesKanbanProps) {
  const router = useRouter();
  const [issues, setIssues] = useState(initialIssues);
  const [isDragging, setIsDragging] = useState(false);
  const [deletingIssueId, setDeletingIssueId] = useState<string | null>(null);

  const onDragEnd = useCallback(async (result: DropResult) => {
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

    // Optimistic update
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId ? { ...issue, status: newStatus } : issue,
      ),
    );

    try {
      const result = await updateIssue({
        id: issueId,
        status: newStatus as any,
      });
      
      if (result.error) {
        toast.error(result.error);
        setIssues(initialIssues);
      } else {
        toast.success("Issue updated", { duration: 2000 });
      }
    } catch (error) {
      setIssues(initialIssues);
      console.error("Failed to update issue status:", error);
      toast.error("Failed to update issue status");
    }
  }, [initialIssues]);

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const getIssuesByStatus = useCallback((status: string) => {
    return issues.filter((issue) => issue.status === status);
  }, [issues]);

  const getPriorityStyle = (priority: string) => {
    return PRIORITY_STYLES[priority as keyof typeof PRIORITY_STYLES] || PRIORITY_STYLES.LOW;
  };

  const handleDeleteIssue = async (issueId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this issue? This action cannot be undone.")) {
      return;
    }

    setDeletingIssueId(issueId);
    try {
      const result = await deleteIssue({ id: issueId });
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Issue deleted");
        setIssues((prev) => prev.filter((issue) => issue.id !== issueId));
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to delete issue");
    } finally {
      setDeletingIssueId(null);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
      <div className="flex gap-4 p-6 h-full overflow-x-auto pb-8">
        {COLUMNS.map((column) => {
          const columnIssues = getIssuesByStatus(column.id);

          return (
            <div key={column.id} className="flex-shrink-0 w-80">
              <div className="flex flex-col h-full">
                {/* Column Header */}
                <div className={cn(
                  "rounded-t-xl p-3 border-b",
                  column.color,
                  column.borderColor
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-foreground">{column.title}</h3>
                      <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs font-medium">
                        {columnIssues.length}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-7 w-7 hover:bg-background/50"
                      onClick={() => onCreateIssue(column.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Column Content */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "flex-1 p-2 space-y-2 rounded-b-xl transition-colors duration-200",
                        "bg-muted/30 dark:bg-muted/10",
                        snapshot.isDraggingOver && "bg-primary/5 ring-2 ring-primary/20 ring-inset"
                      )}
                      style={{ minHeight: "200px" }}
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
                              className={cn(
                                "cursor-grab active:cursor-grabbing transition-all duration-200",
                                "bg-card hover:shadow-md border",
                                snapshot.isDragging && "shadow-xl ring-2 ring-primary/30 rotate-1 scale-105"
                              )}
                            >
                              <CardHeader className="p-3 pb-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-2 flex-1 min-w-0">
                                    <div 
                                      {...provided.dragHandleProps}
                                      className="mt-0.5 text-muted-foreground/50 hover:text-muted-foreground cursor-grab"
                                    >
                                      <GripVertical className="h-4 w-4" />
                                    </div>
                                    <CardTitle className="text-sm font-medium line-clamp-2 flex-1">
                                      {issue.title}
                                    </CardTitle>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                      >
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={(e) => handleDeleteIssue(issue.id, e)}
                                        disabled={deletingIssueId === issue.id}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        {deletingIssueId === issue.id ? (
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-4 w-4 mr-2" />
                                        )}
                                        {deletingIssueId === issue.id ? "Deleting..." : "Delete"}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </CardHeader>
                              <CardContent className="p-3 pt-0">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <Badge
                                      variant="outline"
                                      className="text-xs h-5 px-1.5 font-normal"
                                    >
                                      {issue.type}
                                    </Badge>
                                    <Badge
                                      variant="secondary"
                                      className={cn("text-xs h-5 px-1.5 font-normal border-0", getPriorityStyle(issue.priority).className)}
                                    >
                                      {issue.priority}
                                    </Badge>
                                  </div>
                                  {issue.assignee && (
                                    <Avatar className="h-6 w-6 border">
                                      {issue.assignee.avatar && (
                                        <AvatarImage
                                          src={issue.assignee.avatar}
                                        />
                                      )}
                                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
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
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <p className="text-sm text-muted-foreground mb-2">No issues</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => onCreateIssue(column.id)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add issue
                          </Button>
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
