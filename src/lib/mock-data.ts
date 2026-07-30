import type { ChatUser, Message } from "@/services/api";

export const MOCK_CURRENT_USER = { id: "me", name: "You", email: "you@chatapp.dev" };

export const MOCK_USERS: ChatUser[] = [
  { id: "u1", name: "Alice Johnson", email: "alice@example.com", online: true, unread: 2, lastMessage: "See you soon!" },
  { id: "u2", name: "Bob Smith", email: "bob@example.com", online: true, unread: 0, lastMessage: "Sounds good." },
  { id: "u3", name: "Carla Diaz", email: "carla@example.com", online: false, unread: 5, lastMessage: "Sent the file." },
  { id: "u4", name: "David Kim", email: "david@example.com", online: false, unread: 0, lastMessage: "Talk tomorrow." },
  { id: "u5", name: "Eve Martin", email: "eve@example.com", online: true, unread: 1, lastMessage: "🎉" },
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  u1: [
    { id: "m1", conversationId: "u1", senderId: "u1", senderName: "Alice", content: "Hey! How are you?", createdAt: new Date(Date.now() - 3600_000).toISOString() },
    { id: "m2", conversationId: "u1", senderId: "me", content: "Doing great, working on ChatApp 🚀", createdAt: new Date(Date.now() - 3500_000).toISOString() },
    { id: "m3", conversationId: "u1", senderId: "u1", senderName: "Alice", content: "Awesome! Can't wait to try it.", createdAt: new Date(Date.now() - 60_000).toISOString() },
  ],
  u2: [
    { id: "m4", conversationId: "u2", senderId: "u2", senderName: "Bob", content: "Ready for the meeting?", createdAt: new Date(Date.now() - 7200_000).toISOString() },
  ],
  u3: [],
  u4: [],
  u5: [],
};
