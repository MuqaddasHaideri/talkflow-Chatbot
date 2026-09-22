import { Message, Session } from "./chatTypes";

export const nowLabel = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

export const uid = () =>
  Math.random().toString(36).slice(2, 11);

export const shortenTitle = (text: string) => {
  const clean = text.trim();

  return clean.length > 30
    ? `${clean.slice(0, 30)}…`
    : clean || "New Chat";
};

export const normalizeSession = (raw) => ({
  id: raw._id || raw.id,
  title: raw.title || "New Chat",
  messages: raw.messages || [],
  updatedAt: raw.updatedAt || new Date().toISOString(),
});

export const normalizeMessage = (
  message: any
): Message => {
  const rawRole =
    message?.role ??
    message?.sender ??
    message?.type ??
    "";

  const normalizedRole = String(rawRole).toLowerCase().trim();

  const role: "user" | "ai" =
    normalizedRole === "user" ||
    normalizedRole === "human"
      ? "user"
      : "ai";

  return {
    id: String(
      message?._id ||
      message?.id ||
      uid()
    ),

    role,

    text:
      message?.text ??
      message?.content ??
      message?.message ??
      "",

    time: message?.createdAt
      ? new Date(
          message.createdAt
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : nowLabel(),
  };
};