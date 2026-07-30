import { useEffect, useRef } from "react";
import type { Message, ChatUser } from "@/services/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { MessageInput, type OutgoingAttachment } from "./MessageInput";

export function ChatWindow({
  peer,
  messages,
  currentUserId,
  typing,
  loading,
  onSend,
  onTyping,
  onBack,
}: {
  peer: ChatUser | null;
  messages: Message[];
  currentUserId: string;
  typing: boolean;
  loading: boolean;
  onSend: (text: string, attachment: OutgoingAttachment) => void;
  onTyping: () => void;
  onBack?: () => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  if (!peer) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Welcome to ChatApp</h2>
          <p className="text-sm text-muted-foreground mt-1">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background min-w-0">
      <header className="border-b bg-card px-4 py-3 flex items-center gap-3">
        {onBack && (
          <Button size="icon" variant="ghost" onClick={onBack} className="md:hidden">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="relative">
          <Avatar>
            <AvatarFallback>{peer.name[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <span
            className={cn(
              "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card",
              peer.online ? "bg-green-500" : "bg-gray-400",
            )}
          />
        </div>
        <div>
          <p className="font-semibold text-sm">{peer.name}</p>
          <p className="text-xs text-muted-foreground">{peer.online ? "Online" : "Offline"}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center text-sm text-muted-foreground py-8">Loading messages…</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            No messages yet — say hi 👋
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble key={m.id} message={m} isOwn={m.senderId === currentUserId} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {typing && <TypingIndicator name={peer.name} />}
      <MessageInput onSend={onSend} onTyping={onTyping} />
    </div>
  );
}
