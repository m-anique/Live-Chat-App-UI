import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { LogOut, Moon, Search, Sun, Users } from "lucide-react";
import type { ChatUser } from "@/services/api";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

export function Sidebar({
  users,
  activeId,
  onSelect,
  onNewGroup,
}: {
  users: ChatUser[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewGroup: () => void;
}) {
  const [q, setQ] = useState("");
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();

  const filtered = useMemo(
    () => users.filter((u) => u.name.toLowerCase().includes(q.toLowerCase())),
    [users, q],
  );

  return (
    <aside className="flex flex-col h-full bg-card border-r">
      <div className="p-4 border-b flex items-center gap-2">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{user?.name ?? "You"}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email ?? "guest"}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-3 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="icon" onClick={onNewGroup} aria-label="New group">
          <Users className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((u) => (
          <button
            key={u.id}
            onClick={() => onSelect(u.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left",
              activeId === u.id && "bg-muted",
            )}
          >
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{u.name[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card",
                  u.online ? "bg-green-500" : "bg-gray-400",
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm truncate">{u.name}</p>
                {u.unread ? (
                  <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                    {u.unread}
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground truncate">{u.lastMessage ?? "No messages yet"}</p>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground p-6">No users found</p>
        )}
      </div>
    </aside>
  );
}
