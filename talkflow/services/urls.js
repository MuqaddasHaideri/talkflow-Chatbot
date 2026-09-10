export const API_BASE = 'http://192.168.0.106:5000/api';


export const endpoints = {
  login: "/auth/login",
  signup: "/auth/signup",

  sessions: "/sessions",
  createSession: "/sessions",
  sessionMessages: (sessionId) => `/sessions/${sessionId}/messages`,
  deleteSession: (sessionId) => `/sessions/${sessionId}`,

  streamChat: (sessionId) => `/chat/${sessionId}/stream`,

}