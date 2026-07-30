import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/pages/Login";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — ChatApp" },
      { name: "description", content: "Sign in to your ChatApp account to start messaging." },
      { property: "og:title", content: "Sign in — ChatApp" },
      { property: "og:description", content: "Sign in to your ChatApp account to start messaging." },
    ],
  }),
  component: LoginPage,
});
