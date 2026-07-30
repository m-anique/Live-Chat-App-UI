import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type ChatUser = AuthUser & {
  online?: boolean;
  unread?: number;
  lastMessage?: string;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  content: string;
  createdAt: string;
  attachment?: { name: string; url: string; type: string } | null;
};

// Raw shapes as they actually come back from the backend (Mongo uses _id, not id).
type BackendUser = {
  _id: string;
  name: string;
  email: string;
  isOnline?: boolean;
  lastSeen?: string;
};

export const authApi = {
  register: (payload: { name: string; email: string; password: string }) =>
    api.post<{ token: string; user: AuthUser }>("/auth/register", payload).then((r) => r.data),
  login: (payload: { email: string; password: string }) =>
    api.post<{ token: string; user: AuthUser }>("/auth/login", payload).then((r) => r.data),
};

export const usersApi = {
  list: () =>
    api
      .get<{ users: BackendUser[] }>("/users")
      .then((r) =>
        // Backend responds with { users: [...] }, not a bare array — and each
        // user has `_id`, not `id`. Unwrap and map both here so the rest of
        // the app can just use ChatUser.id like normal.
        (r.data.users || []).map(
          (u): ChatUser => ({
            id: u._id,
            name: u.name,
            email: u.email,
            online: u.isOnline,
            unread: 0,
            lastMessage: "",
          }),
        ),
      ),
};

export const messagesApi = {
  list: (conversationId: string) =>
    api
      .get<{ messages?: any[] } | any[]>(`/messages/${conversationId}`)
      .then((r) => {
        // Handle both possible shapes: a bare array, or { messages: [...] }.
        const raw = Array.isArray(r.data) ? r.data : r.data.messages || [];
        return raw.map(
          (m): Message => ({
            id: m._id,
            conversationId,
            senderId: typeof m.sender === "object" ? m.sender._id : m.sender,
            senderName: typeof m.sender === "object" ? m.sender.name : undefined,
            content: m.text,
            createdAt: m.createdAt,
            attachment: m.fileUrl ? { name: "", url: m.fileUrl, type: "" } : null,
          }),
        );
      }),
};
