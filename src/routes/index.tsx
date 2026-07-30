import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/pages/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ChatApp — Dashboard" },
      { name: "description", content: "Your real-time conversations, groups, and messages." },
      { property: "og:title", content: "ChatApp — Dashboard" },
      { property: "og:description", content: "Your real-time conversations, groups, and messages." },
    ],
  }),
  component: DashboardPage,
});
