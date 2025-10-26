"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createChannel } from "@/features/messages/actions";
import { getWorkspaceBySlug } from "@/features/workspaces/actions";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(80)
    .regex(
      /^[a-z0-9-]+$/,
      "Name must be lowercase letters, numbers, and hyphens only",
    ),
  description: z.string(),
  isPrivate: z.boolean(),
});

type FormSchema = z.infer<typeof formSchema>;

interface CreateProjectChannelModalProps {
  projectId: string;
  workspaceSlug: string;
}

export function CreateProjectChannelModal({
  projectId,
  workspaceSlug,
}: CreateProjectChannelModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      isPrivate: false,
    },
  });

  async function onSubmit(values: FormSchema) {
    setIsLoading(true);

    try {
      const workspaceResult = await getWorkspaceBySlug(workspaceSlug);
      if (workspaceResult.error || !workspaceResult.workspace) {
        toast.error("Workspace not found");
        return;
      }

      const result = await createChannel({
        name: values.name,
        description: values.description,
        isPrivate: values.isPrivate,
        workspaceId: workspaceResult.workspace.id,
        projectId: projectId,
      });

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.data) {
        toast.success("Channel created successfully!");
        setOpen(false);
        form.reset();
        router.refresh();
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Channel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Create Project Channel
          </DialogTitle>
          <DialogDescription>
            Create a new communication channel for this project
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., feature-discussions" {...field} />
                  </FormControl>
                  <FormMessage />
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
                      placeholder="What is this channel for?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPrivate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Private Channel</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Only invited members can see and join this channel
                    </p>
                  </div>
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Channel"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
