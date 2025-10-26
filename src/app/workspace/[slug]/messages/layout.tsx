import { protectRoute } from "@/lib/auth-guard";
import { ChannelList } from "@/features/messages/components/channel-list";

export default async function MessagesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const session = await protectRoute();

  const { slug } = await params;

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <ChannelList workspaceId={slug} currentUserId={session.user.id} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
