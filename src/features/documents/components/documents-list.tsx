"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, FileText, Calendar, User, FolderTree } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface Document {
  id: string;
  title: string | null;
  icon: string | null;
  isPublished: boolean;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string | null;
    email: string | null;
    avatar: string | null;
  };
  _count?: {
    children: number;
  };
}

interface DocumentsListProps {
  documents: Document[];
  workspaceId: string;
  workspaceSlug: string;
}

export function DocumentsList({
  documents,
  workspaceId,
  workspaceSlug,
}: DocumentsListProps) {
  if (documents.length === 0) {
    return (
      <div className="space-y-8 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Documents
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Create and organize your team's knowledge base
            </p>
          </div>
          <Link href={`/workspace/${workspaceSlug}/documents/new`}>
            <Button size="lg">
              <Plus className="h-4 w-4 mr-2" />
              New Document
            </Button>
          </Link>
        </div>

        <Card className="p-12 border-2 bg-gradient-to-br from-background to-muted/20">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20">
              <FileText className="h-16 w-16 text-primary" />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-bold">Welcome to Documents</h3>
              <p className="text-muted-foreground max-w-md text-lg">
                Create rich documents with powerful editing tools, organize them
                in nested pages, and collaborate with your team.
              </p>
            </div>
            <div className="grid gap-6 text-left max-w-md w-full mt-4">
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 h-fit">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Rich Text Editor</p>
                  <p className="text-sm text-muted-foreground">
                    Format text, add images, create tables and more
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 h-fit">
                  <FolderTree className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Nested Pages</p>
                  <p className="text-sm text-muted-foreground">
                    Organize documents in a hierarchy
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 h-fit">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Collaboration</p>
                  <p className="text-sm text-muted-foreground">
                    Share and collaborate with your team in real-time
                  </p>
                </div>
              </div>
            </div>
            <Link href={`/workspace/${workspaceSlug}/documents/new`}>
              <Button size="lg" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Document
              </Button>
            </Link>
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
              Documents
            </h1>
            <Badge variant="secondary" className="text-sm">
              {documents.length}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2 text-lg">
            Create and organize your team's knowledge base
          </p>
        </div>
        <Link href={`/workspace/${workspaceSlug}/documents/new`}>
          <Button size="lg">
            <Plus className="h-4 w-4 mr-2" />
            New Document
          </Button>
        </Link>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {documents.map((doc) => (
          <Link
            key={doc.id}
            href={`/workspace/${workspaceSlug}/documents/${doc.id}`}
          >
            <Card className="h-full hover:shadow-xl hover:border-primary/50 transition-all duration-300 cursor-pointer group hover:-translate-y-1 bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    {doc.icon && (
                      <span className="text-2xl group-hover:scale-110 transition-transform">
                        {doc.icon}
                      </span>
                    )}
                    {!doc.icon && (
                      <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </div>
                  {doc.isPublished && (
                    <Badge variant="secondary" className="text-xs">
                      Published
                    </Badge>
                  )}
                </div>
                <CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors">
                  {doc.title || "Untitled Document"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6 border">
                    {doc.createdBy.avatar && (
                      <AvatarImage src={doc.createdBy.avatar} />
                    )}
                    <AvatarFallback className="text-xs">
                      {getInitials(
                        doc.createdBy.name || doc.createdBy.email || "U",
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate">
                    {doc.createdBy.name || doc.createdBy.email}
                  </span>
                </div>
                {doc._count && doc._count.children > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FolderTree className="h-3 w-3" />
                    <span>{doc._count.children} nested pages</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
