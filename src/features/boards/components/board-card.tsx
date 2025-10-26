"use client";

import { Card } from "@/components/ui/card";
import { Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface CardData {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  assignees: any[];
}

interface BoardCardProps {
  card: CardData;
  isDragging: boolean;
}

export function BoardCard({ card, isDragging }: BoardCardProps) {
  return (
    <Card
      className={cn(
        "p-3 cursor-pointer hover:shadow-md transition-shadow",
        isDragging && "opacity-50 rotate-2",
      )}
    >
      <h4 className="text-sm font-medium mb-2">{card.title}</h4>

      {card.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {card.description}
        </p>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {card.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(card.dueDate), "MMM d")}</span>
          </div>
        )}

        {card.assignees && card.assignees.length > 0 && (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{card.assignees.length}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
