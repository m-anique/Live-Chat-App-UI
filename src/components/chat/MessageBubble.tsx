import { cn } from "@/lib/utils";
import { Download, FileIcon } from "lucide-react";
import type { Message } from "@/services/api";

export function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <div className={cn("flex flex-col mb-3", isOwn ? "items-end" : "items-start")}>
      {!isOwn && message.senderName && (
        <span className="text-xs text-muted-foreground mb-1 ml-2">{message.senderName}</span>
      )}
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2 shadow-sm break-words",
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm",
        )}
      >
        {message.attachment && (
          <a
            href={message.attachment.url}
            download={message.attachment.name}
            className={cn(
              "flex items-center gap-2 mb-2 p-2 rounded-lg",
              isOwn ? "bg-primary-foreground/10" : "bg-background/60",
            )}
          >
            {message.attachment.type?.startsWith("image/") ? (
              <img
                src={message.attachment.url}
                alt={message.attachment.name}
                className="max-h-48 rounded-md object-cover"
              />
            ) : (
              <>
                <FileIcon className="h-5 w-5 shrink-0" />
                <span className="text-sm truncate flex-1">{message.attachment.name}</span>
                <Download className="h-4 w-4" />
              </>
            )}
          </a>
        )}
        {message.content && <p className="text-sm whitespace-pre-wrap">{message.content}</p>}
      </div>
      <span className="text-[10px] text-muted-foreground mt-1 mx-2">{time}</span>
    </div>
  );
}
