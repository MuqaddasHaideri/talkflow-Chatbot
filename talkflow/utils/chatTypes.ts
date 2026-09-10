export interface Message {
    id: string;
    role: "user" | "ai";
    text: string;
    time: string;
  }
  
  export interface Session {
    id: string;
    title: string;
    messages: Message[];
  }