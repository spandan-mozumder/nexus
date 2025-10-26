import { Hash } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <div className="text-center">
        <Hash className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Welcome to Messages</h3>
        <p className="text-sm">
          Select a channel or start a conversation to begin
        </p>
      </div>
    </div>
  );
}
