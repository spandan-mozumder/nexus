"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Archive,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createDocument, deleteDocument } from "../actions";
import { toast } from "sonner";

interface Document {
  id: string;
  title: string | null;
  icon: string | null;
  parentId: string | null;
  createdAt: Date;
  _count?: {
    children: number;
  };
}

interface DocumentTreeProps {
  documents: Document[];
  workspaceId: string;
  currentDocumentId?: string;
}

export function DocumentTree({
  documents,
  workspaceId,
  currentDocumentId,
}: DocumentTreeProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const documentMap = new Map<string, Document & { children: Document[] }>();
  const rootDocuments: (Document & { children: Document[] })[] = [];

  documents.forEach((doc) => {
    documentMap.set(doc.id, { ...doc, children: [] });
  });

  documents.forEach((doc) => {
    const docWithChildren = documentMap.get(doc.id);
    if (!docWithChildren) return;

    if (doc.parentId) {
      const parent = documentMap.get(doc.parentId);
      if (parent) {
        parent.children.push(
          docWithChildren as Document & { children: Document[] },
        );
      } else {
        rootDocuments.push(docWithChildren);
      }
    } else {
      rootDocuments.push(docWithChildren);
    }
  });

  const filteredDocuments = searchQuery
    ? documents.filter((doc) =>
        (doc.title || "Untitled")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      )
    : rootDocuments;

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleCreateDocument = async (parentId?: string) => {
    const result = await createDocument({
      title: "Untitled",
      workspaceId,
      parentId,
    });

    if (result.error) {
      toast.error(result.error);
    } else if (result.data) {
      toast.success("Document created");
      router.push(`/workspace/${workspaceId}/documents/${result.data.id}`);
    }
  };

  const handleDeleteDocument = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to archive "${title}"?`)) {
      return;
    }

    const result = await deleteDocument({ id });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Document archived");
      router.refresh();
    }
  };

  const renderDocument = (
    doc: Document & { children: Document[] },
    level = 0,
  ) => {
    const hasChildren = doc.children && doc.children.length > 0;
    const isExpanded = expandedIds.has(doc.id);
    const isActive = currentDocumentId === doc.id;

    return (
      <div key={doc.id}>
        <div
          className={cn(
            "group flex items-center gap-1 py-2 px-2 rounded-lg hover:bg-muted cursor-pointer transition-all border-2 border-transparent hover:border-primary/20 mb-1",
            isActive && "bg-muted border-primary/40 shadow-sm",
            level > 0 && "ml-4",
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          {}
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-transparent hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(doc.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="h-6 w-6" />
          )}

          {}
          <div
            className="flex items-center gap-2 flex-1 min-w-0"
            onClick={() =>
              router.push(`/workspace/${workspaceId}/documents/${doc.id}`)
            }
          >
            <span className="text-lg flex-shrink-0">
              {doc.icon || (
                <FileText
                  className={cn("h-4 w-4", isActive && "text-primary")}
                />
              )}
            </span>
            <span
              className={cn(
                "text-sm truncate flex-1 font-medium",
                isActive && "text-primary",
              )}
            >
              {doc.title || "Untitled"}
            </span>
            {doc._count && doc._count.children > 0 && (
              <Badge variant="secondary" className="text-xs h-5">
                {doc._count.children}
              </Badge>
            )}
          </div>

          {}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                handleCreateDocument(doc.id);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-primary/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDocument(doc.id, doc.title || "Untitled");
                  }}
                  className="text-destructive"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {}
        {hasChildren && isExpanded && (
          <div>
            {doc.children.map((child) =>
              renderDocument(
                child as Document & { children: Document[] },
                level + 1,
              ),
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background to-muted/20">
      {}
      <div className="p-4 border-b space-y-3 bg-gradient-to-r from-background to-muted/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Documents
            </h2>
            <Badge variant="secondary" className="text-xs">
              {documents.length}
            </Badge>
          </div>
          <Button
            size="sm"
            onClick={() => handleCreateDocument()}
            className="hover:shadow-md transition-shadow"
          >
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>

        {}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-2 focus:border-primary"
          />
        </div>
      </div>

      {}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 w-fit mx-auto mb-4">
                <FileText className="h-12 w-12 mx-auto text-primary" />
              </div>
              <p className="text-base font-semibold mb-2">
                {searchQuery ? "No documents found" : "No documents yet"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery
                  ? "Try a different search term"
                  : "Start by creating your first document"}
              </p>
              {!searchQuery && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleCreateDocument()}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first document
                </Button>
              )}
            </div>
          ) : searchQuery ? (
            filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  "flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted cursor-pointer transition-all border-2 border-transparent hover:border-primary/20 mb-1",
                  currentDocumentId === doc.id &&
                    "bg-muted border-primary/40 shadow-sm",
                )}
                onClick={() =>
                  router.push(`/workspace/${workspaceId}/documents/${doc.id}`)
                }
              >
                <span className="text-lg">
                  {doc.icon || <FileText className="h-4 w-4 text-primary" />}
                </span>
                <span className="text-sm font-medium truncate">
                  {doc.title || "Untitled"}
                </span>
              </div>
            ))
          ) : (
            rootDocuments.map((doc) => renderDocument(doc))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
