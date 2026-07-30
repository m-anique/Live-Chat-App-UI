export function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="px-4 py-1 text-xs text-muted-foreground flex items-center gap-2">
      <span>{name} is typing</span>
      <span className="flex gap-0.5">
        <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" />
      </span>
    </div>
  );
}
