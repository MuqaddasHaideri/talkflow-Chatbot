import { authUrls } from "./urls";

export const signup = async (username, email, password) => {
  try {
    const response = await fetch(authUrls.signup, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Create an error containing backend error details
      const error = new Error(data.message || `Signup failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Re-throws network errors and HTTP errors for caller handling
    throw error;
  }
};