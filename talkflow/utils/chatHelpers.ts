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

export const normalizeSession = (
  session: any
): Session => {
  const id =
    session?._id ||
    session?.id ||
    uid();

  return {
    id: String(id),

    title:
      session?.title ||
      session?.name ||
      "New Chat",

    messages: [],
  };
};

export const normalizeMessage = (
  message: any
): Message => {
  const role =
    message?.role === "user"
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
      message?.text ||
      message?.content ||
      message?.message ||
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