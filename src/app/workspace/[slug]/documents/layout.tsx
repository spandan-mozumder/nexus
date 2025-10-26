import { protectRoute } from "@/lib/auth-guard";
import { getWorkspaceDocuments } from "@/features/documents/actions";
import { DocumentTree } from "@/features/documents/components/document-tree";

interface DocumentsLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function DocumentsLayout({
  children,
  params,
}: DocumentsLayoutProps) {
  await protectRoute();

  const { slug } = await params;

  const result = await getWorkspaceDocuments(slug);

  if (result.error || !result.data || !result.workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">
          {result.error || "Failed to load documents"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {}
      <div className="w-64 border-r bg-muted/30 flex-shrink-0">
        <DocumentTree
          documents={result.data}
          workspaceId={result.workspaceId}
        />
      </div>

      {}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
