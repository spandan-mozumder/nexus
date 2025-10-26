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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "../actions";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  key: z
    .string()
    .min(2, "Key must be at least 2 characters")
    .max(10, "Key must be at most 10 characters")
    .regex(/^[A-Z]+$/, "Key must contain only uppercase letters"),
  description: z.string().optional(),
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

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) =>
      createProject({ ...data, workspaceId }),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Project created successfully");
        queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
        setOpen(false);
        form.reset();
      }
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
        <Button>Create Project</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a new project to organize and track your issues
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="My Project"
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
                    <Input
                      {...field}
                      placeholder="PROJ"
                      maxLength={10}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Used for issue keys (e.g., {field.value || "PROJ"}-123)
                  </p>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your project..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Project
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
