import { createFileRoute } from "@tanstack/react-router";
import { RegisterPage } from "@/pages/Register";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your ChatApp account" },
      { name: "description", content: "Register for ChatApp to start chatting in real time." },
      { property: "og:title", content: "Create your ChatApp account" },
      { property: "og:description", content: "Register for ChatApp to start chatting in real time." },
    ],
  }),
  component: RegisterPage,
});
