"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, LayoutGrid, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreateBoardModal } from "./create-board-modal";

interface Board {
  id: string;
  title: string;
  description: string | null;
  backgroundColor: string | null;
  _count?: {
    lists: number;
  };
}

interface BoardListProps {
  boards: Board[];
  workspaceId: string;
}

export function BoardList({ boards, workspaceId }: BoardListProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  if (boards.length === 0) {
    return (
      <>
        <div className="space-y-8 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Boards
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Organize your work with Kanban boards
              </p>
            </div>
            <Button onClick={() => setCreateModalOpen(true)} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              New Board
            </Button>
          </div>

          <Card className="p-12 border-2 bg-gradient-to-br from-background to-muted/20">
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20">
                <LayoutGrid className="h-16 w-16 text-primary" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-bold">Welcome to Boards</h3>
                <p className="text-muted-foreground max-w-md text-lg">
                  Create Trello-style boards to organize your tasks with lists
                  and cards. Use drag & drop to move cards between lists.
                </p>
              </div>
              <div className="grid gap-6 text-left max-w-md w-full mt-4">
                <div className="flex gap-4 items-start">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 h-fit">
                    <LayoutGrid className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Kanban Boards</p>
                    <p className="text-sm text-muted-foreground">
                      Visualize your workflow with customizable boards
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 h-fit">
                    <LayoutGrid className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Drag & Drop</p>
                    <p className="text-sm text-muted-foreground">
                      Move cards between lists effortlessly
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 h-fit">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Customizable</p>
                    <p className="text-sm text-muted-foreground">
                      Add colors, labels, and due dates to cards
                    </p>
                  </div>
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => setCreateModalOpen(true)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Board
              </Button>
            </div>
          </Card>
        </div>

        <CreateBoardModal
          workspaceId={workspaceId}
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
        />
      </>
    );
  }

  return (
    <div className="space-y-8 min-h-screen bg-gradient-to-br from-background to-muted/20 p-8 rounded-xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Boards
            </h1>
            <Badge variant="secondary" className="text-sm">
              {boards.length}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2 text-lg">
            Organize your work with Kanban boards
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          New Board
        </Button>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {boards.map((board) => (
          <Link
            key={board.id}
            href={`/workspace/${workspaceId}/boards/${board.id}`}
          >
            <Card
              className="h-40 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary group"
              style={{
                backgroundColor: board.backgroundColor || "#0079BF",
              }}
            >
              <CardHeader className="p-4 h-full flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-white text-xl font-bold line-clamp-2">
                      {board.title}
                    </CardTitle>
                    <ArrowRight className="h-5 w-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                  {board.description && (
                    <CardDescription className="text-white/80 text-sm line-clamp-2">
                      {board.description}
                    </CardDescription>
                  )}
                </div>
                {board._count && (
                  <Badge
                    variant="secondary"
                    className="w-fit bg-white/20 text-white border-white/30 hover:bg-white/30"
                  >
                    {board._count.lists}{" "}
                    {board._count.lists === 1 ? "list" : "lists"}
                  </Badge>
                )}
              </CardHeader>
            </Card>
          </Link>
        ))}

        {}
        <Card
          className="h-40 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 border-dashed border-2 hover:border-primary group bg-gradient-to-br from-background to-muted/20"
          onClick={() => setCreateModalOpen(true)}
        >
          <CardContent className="p-4 h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground group-hover:text-primary transition-colors">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 w-fit mx-auto mb-3">
                <Plus className="h-8 w-8" />
              </div>
              <p className="font-semibold text-lg">Create New Board</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateBoardModal
        workspaceId={workspaceId}
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </div>
  );
}
