"use client";

import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Plus, MoreHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  createList,
  createCard,
  updateCard,
  deleteList,
  moveCard,
} from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { BoardCard } from "./board-card";

interface CardData {
  id: string;
  title: string;
  description: string | null;
  position: number;
  dueDate: Date | null;
  assignees: any[];
}

interface List {
  id: string;
  title: string;
  position: number;
  cards: CardData[];
}

interface BoardData {
  id: string;
  title: string;
  description: string | null;
  backgroundColor: string | null;
  workspaceId: string;
  lists: List[];
}

interface KanbanBoardProps {
  board: BoardData;
}

export function KanbanBoard({ board: initialBoard }: KanbanBoardProps) {
  const router = useRouter();
  const [board, setBoard] = useState(initialBoard);
  const [newListTitle, setNewListTitle] = useState("");
  const [isAddingList, setIsAddingList] = useState(false);
  const [addingCardToList, setAddingCardToList] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");

  const handleCreateList = async () => {
    if (!newListTitle.trim()) return;

    const result = await createList({
      title: newListTitle,
      boardId: board.id,
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("List created");
      setNewListTitle("");
      setIsAddingList(false);
      router.refresh();
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm("Are you sure you want to delete this list?")) return;

    const result = await deleteList({ id: listId });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("List deleted");
      router.refresh();
    }
  };

  const handleCreateCard = async (listId: string) => {
    if (!newCardTitle.trim()) return;

    const result = await createCard({
      title: newCardTitle,
      listId,
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Card created");
      setNewCardTitle("");
      setAddingCardToList(null);
      router.refresh();
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceList = board.lists.find(
      (list) => list.id === source.droppableId,
    );
    const destList = board.lists.find(
      (list) => list.id === destination.droppableId,
    );

    if (!sourceList || !destList) return;

    const newLists = Array.from(board.lists);
    const sourceListIndex = newLists.findIndex(
      (list) => list.id === source.droppableId,
    );
    const destListIndex = newLists.findIndex(
      (list) => list.id === destination.droppableId,
    );

    const sourceCards = Array.from(sourceList.cards);
    const [movedCard] = sourceCards.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceCards.splice(destination.index, 0, movedCard);
      newLists[sourceListIndex] = { ...sourceList, cards: sourceCards };
    } else {
      const destCards = Array.from(destList.cards);
      destCards.splice(destination.index, 0, movedCard);
      newLists[sourceListIndex] = { ...sourceList, cards: sourceCards };
      newLists[destListIndex] = { ...destList, cards: destCards };
    }

    setBoard({ ...board, lists: newLists });

    const moveResult = await moveCard({
      cardId: draggableId,
      destinationListId: destination.droppableId,
      destinationPosition: destination.index,
    });

    if (moveResult.error) {
      toast.error(moveResult.error);

      setBoard(initialBoard);
      router.refresh();
    } else {
      router.refresh();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {}
      <div
        className="p-4 border-b"
        style={{ backgroundColor: board.backgroundColor || "#0079BF" }}
      >
        <h1 className="text-2xl font-bold text-white">{board.title}</h1>
        {board.description && (
          <p className="text-white/80 text-sm mt-1">{board.description}</p>
        )}
      </div>

      {}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 h-full">
            {board.lists.map((list) => (
              <Droppable key={list.id} droppableId={list.id}>
                {(provided, snapshot) => (
                  <div className="flex-shrink-0 w-72">
                    <div
                      className={`bg-muted/50 rounded-lg p-3 h-full flex flex-col ${
                        snapshot.isDraggingOver ? "bg-muted" : ""
                      }`}
                    >
                      {}
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-sm">{list.title}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleDeleteList(list.id)}
                              className="text-destructive"
                            >
                              Delete List
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {}
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex-1 overflow-y-auto space-y-2 min-h-[100px]"
                      >
                        {list.cards.map((card, index) => (
                          <Draggable
                            key={card.id}
                            draggableId={card.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <BoardCard
                                  card={card}
                                  isDragging={snapshot.isDragging}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>

                      {}
                      {addingCardToList === list.id ? (
                        <div className="mt-2 space-y-2">
                          <Input
                            autoFocus
                            placeholder="Enter card title..."
                            value={newCardTitle}
                            onChange={(e) => setNewCardTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleCreateCard(list.id);
                              } else if (e.key === "Escape") {
                                setAddingCardToList(null);
                                setNewCardTitle("");
                              }
                            }}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleCreateCard(list.id)}
                            >
                              Add Card
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setAddingCardToList(null);
                                setNewCardTitle("");
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 w-full justify-start"
                          onClick={() => setAddingCardToList(list.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add a card
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}

            {}
            {isAddingList ? (
              <div className="flex-shrink-0 w-72">
                <div className="bg-muted/50 rounded-lg p-3">
                  <Input
                    autoFocus
                    placeholder="Enter list title..."
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCreateList();
                      } else if (e.key === "Escape") {
                        setIsAddingList(false);
                        setNewListTitle("");
                      }
                    }}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={handleCreateList}>
                      Add List
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsAddingList(false);
                        setNewListTitle("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-shrink-0 w-72">
                <Button
                  variant="ghost"
                  className="w-full bg-white/20 hover:bg-white/30 text-white justify-start"
                  onClick={() => setIsAddingList(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add another list
                </Button>
              </div>
            )}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
