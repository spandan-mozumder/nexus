"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Editor } from "@/features/documents/components/editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Upload,
  Trash2,
  Archive,
  Globe,
  Lock,
  Smile,
} from "lucide-react";
import { updateDocument, deleteDocument } from "@/features/documents/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import EmojiPicker from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DocumentEditorProps {
  document: {
    id: string;
    title: string | null;
    content: any;
    icon: string | null;
    coverImage: string | null;
    isPublished: boolean;
    workspaceId: string;
  };
}

export function DocumentEditor({
  document: initialDocument,
}: DocumentEditorProps) {
  const router = useRouter();
  const [document, setDocument] = useState({
    ...initialDocument,
    title: initialDocument.title || "Untitled",
    content:
      typeof initialDocument.content === "string"
        ? initialDocument.content
        : initialDocument.content || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleContentChange = async (content: string) => {
    setDocument((prev) => ({ ...prev, content }));
    setIsSaving(true);

    try {
      await updateDocument({
        id: document.id,
        content,
      });
    } catch (error) {
      console.error("Error saving content:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleChange = async (title: string) => {
    if (!title.trim()) return;

    setDocument((prev) => ({ ...prev, title }));
    setIsSaving(true);

    try {
      const result = await updateDocument({
        id: document.id,
        title: title.trim(),
      });

      if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error updating title:", error);
      toast.error("Failed to update title");
    } finally {
      setIsSaving(false);
      setIsEditingTitle(false);
    }
  };

  const handleIconChange = async (icon: string) => {
    setDocument((prev) => ({ ...prev, icon }));
    setShowEmojiPicker(false);

    const result = await updateDocument({
      id: document.id,
      icon,
    });

    if (result.error) {
      toast.error(result.error);
    }
  };

  const handleRemoveIcon = async () => {
    setDocument((prev) => ({ ...prev, icon: null }));

    const result = await updateDocument({
      id: document.id,
      icon: "",
    });

    if (result.error) {
      toast.error(result.error);
    }
  };

  const handleTogglePublish = async () => {
    const newPublishState = !document.isPublished;
    setDocument((prev) => ({ ...prev, isPublished: newPublishState }));

    const result = await updateDocument({
      id: document.id,
      isPublished: newPublishState,
    });

    if (result.error) {
      toast.error(result.error);
      setDocument((prev) => ({ ...prev, isPublished: !newPublishState }));
    } else {
      toast.success(
        newPublishState ? "Document published" : "Document unpublished",
      );
    }
  };

  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive this document?")) {
      return;
    }

    const result = await deleteDocument({ id: document.id });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Document archived");
      router.push(`/workspace/${document.workspaceId}/documents`);
    }
  };

  return (
    <div className="relative h-full">
      {}
      <div className="sticky top-0 z-10 bg-background border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {}
          <Button
            variant={document.isPublished ? "default" : "outline"}
            size="sm"
            onClick={handleTogglePublish}
          >
            {document.isPublished ? (
              <>
                <Globe className="h-4 w-4 mr-2" />
                Published
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Publish
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {}
          {isSaving && (
            <span className="text-xs text-muted-foreground">Saving...</span>
          )}

          {}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleArchive}
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
      <div className="max-w-4xl mx-auto py-8">
        {}
        {document.coverImage && (
          <div className="mb-8">
            <img
              src={document.coverImage}
              alt="Cover"
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        {}
        <div className="px-8 mb-6 space-y-4">
          {}
          <div className="flex items-center gap-2">
            {document.icon ? (
              <div className="group relative">
                <button
                  className="text-6xl hover:opacity-70 transition-opacity"
                  onClick={() => setShowEmojiPicker(true)}
                >
                  {document.icon}
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  onClick={handleRemoveIcon}
                >
                  ×
                </Button>
              </div>
            ) : (
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    <Smile className="h-4 w-4 mr-2" />
                    Add icon
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <EmojiPicker
                    onEmojiClick={(emoji) => handleIconChange(emoji.emoji)}
                    width="100%"
                  />
                </PopoverContent>
              </Popover>
            )}

            {showEmojiPicker && document.icon && (
              <div className="absolute z-50">
                <EmojiPicker
                  onEmojiClick={(emoji) => handleIconChange(emoji.emoji)}
                />
              </div>
            )}
          </div>

          {}
          {isEditingTitle ? (
            <Input
              autoFocus
              value={document.title}
              onChange={(e) =>
                setDocument((prev) => ({ ...prev, title: e.target.value }))
              }
              onBlur={() => handleTitleChange(document.title)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleTitleChange(document.title);
                }
                if (e.key === "Escape") {
                  setIsEditingTitle(false);
                }
              }}
              className="text-5xl font-bold border-none focus-visible:ring-0 px-0 h-auto"
            />
          ) : (
            <h1
              className="text-5xl font-bold cursor-text hover:bg-muted/50 rounded px-2 -ml-2 transition-colors"
              onClick={() => setIsEditingTitle(true)}
            >
              {document.title}
            </h1>
          )}
        </div>

        {}
        <Editor
          content={document.content}
          onChange={handleContentChange}
          placeholder="Start writing..."
        />
      </div>
    </div>
  );
}
