import { API_BASE, endpoints } from "./urls";
import { store } from "../redux/store";

const fetchApi = async (url, options = {}) => {
  try {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 10000);

    // Get token from Redux
    const token = store.getState().auth.token;

    console.log("API:", url);
    console.log("TOKEN:", token);

    const response = await fetch(`${API_BASE}${url}`, {
      ...options,

      headers: {
        "Content-Type": "application/json",

        // Only add Authorization if token exists
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),

        ...(options.headers || {}),
      },

      signal: controller.signal,
    });

    clearTimeout(timeout);

    const contentType =
      response.headers.get("content-type") || "";

    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data ||
          "Request failed"
      );
    }

    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Request timeout");
    }

    throw error instanceof Error
      ? error
      : new Error(error || "Network Error");
  }
};
export const loginUserApi = async (email, password) => {
  return fetchApi(endpoints.login, {
    method: 'POST',
    body: JSON.stringify({ email, password }), 
  });
};

export const signupUserApi = async (username, email, password) => {
  return fetchApi(endpoints.signup, {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
};
/* =========================
   SESSIONS
========================= */

// GET /api/sessions
export const getSessionsApi = async () => {
  return fetchApi(endpoints.sessions, {
    method: "GET",
  });
};

// POST /api/sessions
export const createSessionApi = async (
  title
) => {
  return fetchApi(endpoints.createSession, {
    method: "POST",
    body: JSON.stringify({
      title,
    }),
  });
};

// GET /api/sessions/:id/messages
export const getSessionMessagesApi = async (
  sessionId
) => {
  return fetchApi(
    endpoints.sessionMessages(sessionId),
    {
      method: "GET",
    }
  );
};

// DELETE /api/sessions/:id
export const deleteSessionApi = async (
  sessionId
) => {
  return fetchApi(
    endpoints.deleteSession(sessionId),
    {
      method: "DELETE",
    }
  );
};

/* =========================
   CHAT STREAM
========================= */
export const streamChatMessageApi = async (
  sessionId,
  text // rename from message to text for clarity
) => {
  // Get token from Redux
  const token = store.getState().auth.token;

  console.log("CHAT AUTH TOKEN:", token);

  const response = await fetch(
    `${API_BASE}${endpoints.streamChat(sessionId)}`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },

      body: JSON.stringify({
        text, // Must match req.body.text in backend controller
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => null);

    throw new Error(
      errorData?.error || // Matches backend { error: '...' } response
        errorData?.message ||
        "Failed to send chat message"
    );
  }

  return response;
};