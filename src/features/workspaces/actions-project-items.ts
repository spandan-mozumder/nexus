"use server";

import { getProjectBoards } from "@/features/boards/actions";
import { getProjectDocuments } from "@/features/documents/actions";
import { getProjectCanvases } from "@/features/whiteboards/actions";
import { getProjectIssues } from "@/features/projects/actions";

export async function getProjectItems(projectId: string) {
  const [boardsResult, documentsResult, canvasesResult, issuesResult] =
    await Promise.all([
      getProjectBoards(projectId),
      getProjectDocuments(projectId),
      getProjectCanvases(projectId),
      getProjectIssues(projectId),
    ]);

  return {
    boards: boardsResult.success ? boardsResult.data : [],
    documents: documentsResult.success ? documentsResult.data : [],
    canvases: canvasesResult.success ? canvasesResult.data : [],
    issues: issuesResult.success ? issuesResult.data : [],
  };
}
