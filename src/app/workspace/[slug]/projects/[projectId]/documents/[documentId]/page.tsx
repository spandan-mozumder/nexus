import { protectRoute } from "@/lib/auth-guard";
import { getDocumentById } from "@/features/documents/actions";

interface DocumentPageProps {
  params: Promise<{
    slug: string;
    projectId: string;
    documentId: string;
  }>;
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  await protectRoute();

  const { slug, projectId, documentId } = await params;
  const result = await getDocumentById(documentId);

  if (result.error || !result.data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Document not found</p>
      </div>
    );
  }

  const document = result.data;

  return (
    <div className="flex-1 h-full">
      <div className="p-6">
        <h1 className="text-3xl font-bold">
          {document.title || "Untitled Document"}
        </h1>
      </div>
      {}
    </div>
  );
}
