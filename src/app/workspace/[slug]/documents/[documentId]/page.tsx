import { protectRoute } from "@/lib/auth-guard";
import { getDocumentById } from "@/features/documents/actions";
import { DocumentEditor } from "@/features/documents/components/document-editor";

interface DocumentPageProps {
  params: Promise<{ slug: string; documentId: string }>;
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  await protectRoute();

  const { documentId } = await params;

  const result = await getDocumentById(documentId);

  if (result.error || !result.data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">Document not found</p>
          <p className="text-sm text-muted-foreground">
            {result.error || "The document you're looking for doesn't exist."}
          </p>
        </div>
      </div>
    );
  }

  return <DocumentEditor document={result.data} />;
}
