"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createProject } from "../actions";
import { Loader2, FolderKanban, Plus, Sparkles } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  key: z
    .string()
    .min(2, "Key must be at least 2 characters")
    .max(10, "Key must be at most 10 characters")
    .regex(/^[A-Z]+$/, "Key must contain only uppercase letters"),
  description: z.string().max(500, "Description is too long").optional(),
});

interface CreateProjectModalProps {
  workspaceId: string;
}

export function CreateProjectModal({ workspaceId }: CreateProjectModalProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      key: "",
      description: "",
    },
  });

  const projectKey = form.watch("key");

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) =>
      createProject({ ...data, workspaceId }),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Project created successfully", {
          description: "Your new project is ready to use.",
        });
        queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
        setOpen(false);
        form.reset();
      }
    },
    onError: () => {
      toast.error("Failed to create project. Please try again.");
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    mutation.mutate(data);
  }

  function handleNameChange(value: string) {
    if (!form.getValues("key")) {
      const generatedKey = value
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .slice(0, 10);
      form.setValue("key", generatedKey);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FolderKanban className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Create New Project</DialogTitle>
              <DialogDescription className="text-sm">
                Organize and track your work with issues, boards, and docs.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Website Redesign, Mobile App"
                      className="h-11"
                      onChange={(e) => {
                        field.onChange(e);
                        handleNameChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Key</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        placeholder="e.g. WEB, APP"
                        maxLength={10}
                        className="h-11 font-mono uppercase"
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                      {projectKey && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Badge variant="secondary" className="font-mono text-xs">
                            {projectKey}-123
                          </Badge>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs">
                    Used as prefix for issue IDs. Only uppercase letters allowed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description
                    <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="What is this project about?"
                      className="resize-none min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending} className="min-w-[140px]">
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Project
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
