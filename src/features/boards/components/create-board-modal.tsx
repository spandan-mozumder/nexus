"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Button } from "@/components/ui/button";
import { createBoard } from "../actions";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional(),
  backgroundColor: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateBoardModalProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BACKGROUND_COLORS = [
  { name: "Blue", value: "#0079BF" },
  { name: "Green", value: "#519839" },
  { name: "Orange", value: "#D29034" },
  { name: "Red", value: "#B04632" },
  { name: "Purple", value: "#89609E" },
  { name: "Pink", value: "#CD5A91" },
  { name: "Lime", value: "#4BBF6B" },
  { name: "Sky", value: "#00AECC" },
];

export function CreateBoardModal({
  workspaceId,
  open,
  onOpenChange,
}: CreateBoardModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      backgroundColor: BACKGROUND_COLORS[0].value,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const result = await createBoard({
        ...data,
        workspaceId,
      });

      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        toast.success("Board created successfully!");
        form.reset();
        onOpenChange(false);
        router.push(`/workspace/${workspaceId}/boards/${result.data.id}`);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Board</DialogTitle>
          <DialogDescription>
            Create a new board to organize your tasks
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Board Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Product Roadmap"
                      {...field}
                      disabled={isSubmitting}
                    />
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
                      placeholder="What is this board about?"
                      {...field}
                      disabled={isSubmitting}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="backgroundColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Background Color</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-4 gap-2">
                      {BACKGROUND_COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => field.onChange(color.value)}
                          className={`h-12 rounded-md transition-all hover:scale-105 ${
                            field.value === color.value
                              ? "ring-2 ring-primary ring-offset-2"
                              : ""
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Board"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
