import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Paperclip, Send, Smile } from "lucide-react";

const EMOJIS = ["😀", "😂", "😍", "😎", "🤔", "👍", "🙏", "🎉", "🔥", "❤️", "😢", "😮", "👏", "✨", "🚀", "💯"];

export type OutgoingAttachment = { name: string; url: string; type: string } | null;

export function MessageInput({
  onSend,
  onTyping,
}: {
  onSend: (text: string, attachment: OutgoingAttachment) => void;
  onTyping: () => void;
}) {
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<OutgoingAttachment>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !attachment) return;
    onSend(text.trim(), attachment);
    setText("");
    setAttachment(null);
  };

const [uploading, setUploading] = useState(false);

const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setUploading(true);
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setAttachment({
      name: file.name,
      url: res.data.fileUrl,
      type: file.type,
    });
  } catch (err) {
    console.error("Upload failed:", err);
  } finally {
    setUploading(false);
  }
};

  return (
    <form onSubmit={handleSubmit} className="border-t bg-card p-3 flex flex-col gap-2">
      {attachment && (
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
          <Paperclip className="h-4 w-4" />
          <span className="truncate flex-1">{attachment.name}</span>
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setAttachment(null)}
          >
            Remove
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" size="icon" variant="ghost">
              <Smile className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="grid grid-cols-8 gap-1">
              {EMOJIS.map((e) => (
                <button
                  type="button"
                  key={e}
                  className="text-xl hover:bg-muted rounded p-1"
                  onClick={() => setText((t) => t + e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Button type="button" size="icon" variant="ghost" onClick={() => fileRef.current?.click()}>
          <Paperclip className="h-5 w-5" />
        </Button>
        <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
        <Input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onTyping();
          }}
          placeholder="Type a message…"
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!text.trim() && !attachment}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
