# TalkFlow

<p >
  <a href="https://drive.google.com/file/d/1Pr3Xd4fKPD-po6EKxtDRemfqkaHtd2Q-/view?usp=drive_link">
    <img src="https://img.shields.io/badge/Watch%20Demo-Video-8E75B2?style=for-the-badge&logo=youtube&logoColor=white" />
  </a>
</p>

---

## About

**TalkFlow** is a full-stack AI chat app built for mobile.

Users can sign up or log in through an animated flip-card authentication screen and chat with **Google Gemini**.

The app supports multiple chat sessions, allowing users to create, rename, switch between, and delete conversations. AI responses are streamed live as they are generated.

The frontend is built with **React Native and Expo**, while the backend uses **Node.js, Express, and MongoDB**. Google Gemini API powers the AI responses.

---

## Features

### Authentication

* login and sign-up interface
* Smooth 3D card-flip animation
* Gradient-based authentication UI
* Protected API routes

### AI Chat

* Real-time streaming AI responses
* Animated typing indicator
* Copy AI responses to clipboard
* Read AI responses aloud using text-to-speech


### Session Management

* Create new chat sessions
* View previous conversations
* Rename chat sessions
* Switch between conversations
* Delete conversations with confirmation
* Safely cancel active streaming requests

### Account

* Display signed-in user's name and email
* Secure logout functionality
* Cancel active AI streams before logout

---

## Tech Stack
<p align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" />
</p> 

### Frontend

<p>
  <img src="https://img.shields.io/badge/React_Native-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
</p>

| Technology           | Purpose                              |
| -------------------- | ------------------------------------ |
| React Native         | Cross-platform mobile UI             |
| Expo                 | Development and native functionality |
| TypeScript           | Type-safe application code           |
| Expo Router          | File-based navigation                |
| Expo Linear Gradient | Gradient backgrounds and auth UI     |
| Expo Clipboard       | Copy AI responses                    |
| Expo Speech          | Text-to-speech                       |

### Backend

<p>
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" />
</p>

| Technology | Purpose                       |
| ---------- | ----------------------------- |
| Node.js    | Backend runtime               |
| Express.js | REST API                      |
| MongoDB    | Users, sessions, and messages |
| JWT        | Authentication                |

### AI

<p>
  <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat-square&logo=googlegemini&logoColor=white" />
</p>

| Technology        | Purpose                                  |
| ----------------- | ---------------------------------------- |
| Google Gemini API | AI-powered chat responses                |
| Streaming         | Sends responses incrementally to the app |


