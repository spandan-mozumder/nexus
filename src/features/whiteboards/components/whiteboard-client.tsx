"use client";

import React from "react";
import { CollaborativeWhiteboard } from "./collaborative-whiteboard";

interface WhiteboardClientProps {
  canvasId: string;
  canvasTitle: string;
  projectId: string;
  workspaceSlug: string;
  userId: string;
  userName: string;
}

export function WhiteboardClient({
  canvasId,
  canvasTitle,
  projectId,
  workspaceSlug,
  userId,
  userName,
}: WhiteboardClientProps) {
  return (
    <CollaborativeWhiteboard
      canvasId={canvasId}
      userId={userId}
      userName={userName}
      projectId={projectId}
      workspaceSlug={workspaceSlug}
    />
  );
}
