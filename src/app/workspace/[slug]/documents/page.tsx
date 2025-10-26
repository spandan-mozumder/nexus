import { protectRoute } from "@/lib/auth-guard";
import { getWorkspaceDocuments } from "@/features/documents/actions";
import { DocumentsList } from "@/features/documents/components/documents-list";

interface DocumentsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DocumentsPage({ params }: DocumentsPageProps) {
  await protectRoute();

  const { slug } = await params;

  const result = await getWorkspaceDocuments(slug);

  if (result.error || !result.workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">
          {result.error || "Failed to load documents"}
        </p>
      </div>
    );
  }

  return (
    <DocumentsList
      documents={result.data || []}
      workspaceId={result.workspaceId}
      workspaceSlug={slug}
    />
  );
}
