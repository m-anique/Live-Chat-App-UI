import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { GroupModal } from "@/components/chat/GroupModal";
import { messagesApi, usersApi, type ChatUser, type Message } from "@/services/api";
import { toast } from "sonner";
import { MOCK_MESSAGES, MOCK_USERS } from "@/lib/mock-data";
import type { OutgoingAttachment } from "@/components/chat/MessageInput";
import { cn } from "@/lib/utils";

// Shape of a message object as sent BACK from the backend (socket/index.js).
// Note: backend uses `text`/`fileUrl`/`sender`/`receiver`/`group`, NOT
// `content`/`conversationId`/`senderId` like our local frontend Message type.
type BackendMessage = {
  _id: string;
  text: string;
  fileUrl?: string;
  sender: { _id: string; name: string; avatar?: string } | string;
  receiver?: string | null;
  group?: string | null;
  createdAt: string;
};

export function DashboardPage() {
  const { user, token } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [users, setUsers] = useState<ChatUser[]>(MOCK_USERS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messagesByConv, setMessagesByConv] = useState<Record<string, Message[]>>(MOCK_MESSAGES);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingConv, setTypingConv] = useState<string | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [groupOpen, setGroupOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate({ to: "/login" });
    }
  }, [token, navigate]);

  // Load users from API (falls back to mock on failure)
  useEffect(() => {
    if (!token) return;
    usersApi
      .list()
      .then((data) => data.length && setUsers(data))
      .catch(() => {
        /* keep mock data */
      });
  }, [token]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeId || !token) return;
    setLoadingMessages(true);
    messagesApi
      .list(activeId)
      .then((data) => setMessagesByConv((prev) => ({ ...prev, [activeId]: data })))
      .catch(() => {
        /* keep mock */
      })
      .finally(() => setLoadingMessages(false));
  }, [activeId, token]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !user) return;

    const onReceive = (backendMsg: BackendMessage) => {
      // Backend sends { text, fileUrl, sender, receiver, group, createdAt, _id }.
      // We translate it into the local Message shape { id, conversationId, senderId, senderName, content, attachment, createdAt }.
      const senderId =
        typeof backendMsg.sender === "object" ? backendMsg.sender._id : backendMsg.sender;
      const senderName =
        typeof backendMsg.sender === "object" ? backendMsg.sender.name : "Unknown";

      // Skip our own messages — they were already added instantly (optimistically)
      // in handleSend below. The backend echoes our own message back to us so that
      // OTHER open tabs/devices of ours can sync, but this single tab already has it.
      if (senderId === user.id) return;

      // For a 1-to-1 chat, the "conversation" is keyed by the OTHER person's id
      // (whichever of sender/receiver isn't us). For a group chat, it's the groupId.
      const conversationId = backendMsg.group
        ? backendMsg.group
        : senderId === user.id
          ? backendMsg.receiver ?? ""
          : senderId;

      if (!conversationId) return;

      const msg: Message = {
        id: backendMsg._id,
        conversationId,
        senderId,
        senderName,
        content: backendMsg.text,
        createdAt: backendMsg.createdAt,
        attachment: backendMsg.fileUrl ? { url: backendMsg.fileUrl } : undefined,
      };

      setMessagesByConv((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] ?? []), msg],
      }));

      if (conversationId !== activeId) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === conversationId ? { ...u, unread: (u.unread ?? 0) + 1, lastMessage: msg.content } : u,
          ),
        );
      }
    };

    const onTyping = (data: { userId: string; groupId: string | null }) => {
      const conv = data.groupId ?? data.userId;
      setTypingConv(conv);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => setTypingConv(null), 2000);
    };

    const onStatus = (data: { userId: string; isOnline: boolean }) => {
      setUsers((prev) => prev.map((u) => (u.id === data.userId ? { ...u, online: data.isOnline } : u)));
    };

    socket.on("receive_message", onReceive);
    socket.on("typing", onTyping);
    socket.on("user_status", onStatus);
    return () => {
      socket.off("receive_message", onReceive);
      socket.off("typing", onTyping);
      socket.off("user_status", onStatus);
    };
  }, [socket, activeId, user]);

  const activePeer = useMemo(() => users.find((u) => u.id === activeId) ?? null, [users, activeId]);
  const activeMessages = activeId ? messagesByConv[activeId] ?? [] : [];

  const handleSelect = useCallback((id: string) => {
    setActiveId(id);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, unread: 0 } : u)));
  }, []);

  const handleSend = useCallback(
    (text: string, attachment?: OutgoingAttachment) => {
      if (!activeId || !user) return;

      // Optimistically show the message in our own UI immediately.
      const localMsg: Message = {
        id: `local-${Date.now()}`,
        conversationId: activeId,
        senderId: user.id,
        senderName: user.name,
        content: text,
        createdAt: new Date().toISOString(),
        attachment,
      };
      setMessagesByConv((prev) => ({
        ...prev,
        [activeId]: [...(prev[activeId] ?? []), localMsg],
      }));

      // Send to backend using the field names the backend actually expects:
      // { text, receiverId, fileUrl } — NOT { content, conversationId, senderId }.
      socket?.emit(
        "send_message",
        {
          text,
          receiverId: activeId,
          fileUrl: attachment?.url || "",
        },
        (response: { success: boolean; error?: string }) => {
          if (!response?.success) {
            console.error("Message send failed:", response?.error);
            toast.error(response?.error || "Failed to send message");
          }
        },
      );
    },
    [activeId, user, socket],
  );

  const handleTyping = useCallback(() => {
    if (!activeId || !user) return;
    // Backend's typing handler expects { receiverId } or { groupId }, not { conversationId, from }.
    socket?.emit("typing", { receiverId: activeId });
  }, [activeId, user, socket]);

  const handleCreateGroup = useCallback(
    (name: string, memberIds: string[]) => {
      const groupId = `g-${Date.now()}`;
      const group: ChatUser = {
        id: groupId,
        name,
        email: `${memberIds.length + 1} members`,
        online: true,
        unread: 0,
        lastMessage: "Group created",
      };
      setUsers((prev) => [group, ...prev]);
      setMessagesByConv((prev) => ({ ...prev, [groupId]: [] }));
      setActiveId(groupId);
      toast.success(`Group "${name}" created`);
    },
    [],
  );

  const showChatOnMobile = !!activeId;

  return (
    <div className="h-screen w-full flex bg-background">
      <div
        className={cn(
          "w-full md:w-80 md:shrink-0 md:block",
          showChatOnMobile ? "hidden md:block" : "block",
        )}
      >
        <Sidebar
          users={users}
          activeId={activeId}
          onSelect={handleSelect}
          onNewGroup={() => setGroupOpen(true)}
        />
      </div>
      <div className={cn("flex-1 flex", showChatOnMobile ? "flex" : "hidden md:flex")}>
        <ChatWindow
          peer={activePeer}
          messages={activeMessages}
          currentUserId={user?.id ?? "me"}
          typing={typingConv === activeId}
          loading={loadingMessages}
          onSend={handleSend}
          onTyping={handleTyping}
          onBack={() => setActiveId(null)}
        />
      </div>
      <GroupModal
        open={groupOpen}
        onOpenChange={setGroupOpen}
        users={users}
        onCreate={handleCreateGroup}
      />
    </div>
  );
}
