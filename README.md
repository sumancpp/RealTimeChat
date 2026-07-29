# 💬 BaatCheet — Next-Gen AI Powered Real-Time Chat & Collaboration Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![NodeJS](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js)](https://nodejs.org/)
[![ExpressJS](https://img.shields.io/badge/Server-Express.js-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/RealTime-Socket.IO-010101?logo=socketdotio)](https://socket.io/)
[![WebRTC](https://img.shields.io/badge/Calling-WebRTC-333333?logo=webrtc)](https://webrtc.org/)
[![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini_2.5-4285F4?logo=google)](https://ai.google.dev/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple?logo=pwa)](https://web.dev/progressive-web-apps/)

**BaatCheet** is a feature-rich, high-performance, real-time web messaging and collaboration platform built with the MERN stack (MongoDB, Express, React, Node.js), Socket.IO, and Google Gemini 2.5 AI. 

Beyond standard instant messaging, BaatCheet packs an extraordinary suite of interactive capabilities — including **self-destructing Ghost Ink messages**, **WhatsApp-style 24-hour Status stories**, **WebRTC video calls with 1-click screen sharing**, **a 2-player mini-game duel hub**, **an Audio FX Voice Studio**, **real-time collaborative whiteboards**, **Group Incognito mode**, **cinematic chat story replays**, and a **complete Google Gemini AI suite**.

---

## 🌟 Mind-Blowing Features & How To Use

### 🤖 1. Google Gemini 2.5 AI Intelligence Suite
BaatCheet integrates real-time AI capabilities directly into your chat experience:
- **✨ AI Chat Summarizer**: Get an instant 3-bullet recap of long conversations. Click the Sparkles (`✨`) icon in the chat header, open the 3-dot (`⋮`) menu → `AI Features Hub`, or type `@summarize`.
- **💡 AI Smart Reply Chips**: Contextual 1-tap quick replies suggested dynamically using Gemini API.
- **🌐 AI Live Language Translator**: Instant live translation into 10+ languages (Spanish, Hindi, French, German, Japanese, Mandarin, etc.). Click `🌐 AI Live Translator` or send `@translate <lang>`.
- **📊 AI Chat Sentiment & Vibe Meter**: Live analysis of conversation emotion (Positive, Neutral, Spicy) with mood insights.
- **💻 AI Code Reviewer & Debugger**: Paste code snippets for instant syntax check, bug detection, and optimization advice. Access via `🤖 AI Features Hub` → `AI Code Reviewer`.
- **🗣️ AI Voice Transcriber**: Speech-to-text transcription for received voice notes.
- **🎵 AI Mood Music Curation**: Sentiment-aware YouTube music recommendations sent via `@music` or the Music icon.
- **🔥 AI Roast Mode**: Contextual humorous AI burns triggered via `@roast` or the Flame icon.
- **📈 Live AI Usage Metrics**: Real-time server-side tracking of AI token consumption, API calls, latency, and success metrics (`GET /api/user/ai-metrics`).

---

### 👻 2. Ghost Ink Mode (Self-Destructing Messages)
- **Description**: Send secret messages that disintegrate 5 seconds after the recipient opens them. Shows a real-time **`Ghost SMS is seen ⏳ 5s`** status badge to both sender and recipient before permanently purging the message from MongoDB.
- **How to Use**:
  1. Open the 3-dot (`⋮`) menu in any 1-on-1 chat and select **Ghost Ink Mode (ON)**.
  2. Alternatively, type `@ghost your message` in the chat input and press send.
  3. When the recipient taps **"Tap to Reveal Ghost Message"**, both users see the live 5-second countdown timer before the text blurs out and permanently deletes.

---

### 👁️ 3. View-Once Media Disappear
- **Description**: Send photos or videos that recipients can open only once. Once viewed, the media locks and self-destructs forever (WhatsApp-style View Once).
- **How to Use**: Select an image/video file to attach in chat → click the **① (View-Once)** button before sending.

---

### 🎙️ 4. Voice Studio & Audio FX Modifier
- **Description**: Record custom voice notes with real-time Web Audio API sound effects and pitch modification filters.
- **Available Effects**:
  - 🎤 **Normal**: Original voice recording.
  - 🐿️ **Chipmunk**: High-pitch sped-up voice.
  - 🧟 **Monster**: Deep bass pitched voice with low-pass filtering.
  - 🤖 **Robot**: Metallic sci-fi robotic voice filter.
  - 📻 **1940s Radio**: Retro bandpass vintage radio effect.
  - 🌌 **Space Echo**: Cosmic reverb and delay effect.
- **How to Use**: Tap the Mic icon → record your audio → choose a voice preset → preview with waveform → send!

---

### ⚔️ 5. Mini-Game Duel Hub (Table Tennis, Tic-Tac-Toe, Rock-Paper-Scissors)
- **Description**: Play real-time 2-player interactive mini-games directly inside your chat with permission prompt dialogs.
- **How to Use**:
  1. Open the 3-dot (`⋮`) menu in any 1-on-1 chat and click **Play Mini-Game Duel**.
  2. Choose your game:
     - 🏓 **Table Tennis**: 2D paddle physics duel with live score tracking.
     - ❌⭕ **Tic-Tac-Toe**: 3x3 turn-based strategy grid with win detection.
     - ✊✋✌️ **Rock Paper Scissors**: Fast-paced best-of-3 weapon showdown.
  3. Opponent gets an instant prompt modal (`Accept & Play 🎮` / `Decline`). Upon acceptance, the game overlay opens live on both screens via Socket.IO.

---

### 📞 6. WebRTC Audio/Video Calls & 1-Click Screen Sharing
- **Description**: Peer-to-peer high-definition audio and video calling powered by WebRTC signaling, complete with 1-click Screen Sharing (`getDisplayMedia`) and call duration timers.
- **How to Use**:
  1. Open any chat and click the Phone (📞) or Video (📹) icon to initiate a call.
  2. During a video call, click the Screen Share (🖥️) button to stream your desktop live.
  3. Full call history logs are stored in the database (`GET /api/call/history`).

---

### ⭕ 7. WhatsApp-Style 24-Hour Status Stories
- **Description**: Share disappearing text, photo, and video status updates with custom background gradients, titles, and viewer lists.
- **Features**:
  - Auto-expires after 24 hours.
  - Real-time view counter (`👁️`) showing who viewed your status.
  - Built-in "BaatCheet Official" onboarding tips stories.
- **How to Use**: Navigate to the **Status** tab in the sidebar → tap **My Status (+)** to upload or write.

---

### 🎨 8. Real-Time Collaborative Shared Whiteboard
- **Description**: Multi-user shared canvas allowing group members to draw, erase, customize stroke width and color, and brainstorm together in real time over Socket.IO.
- **How to Use**: Tap the Palette (🎨) icon in the top header bar of any Group Chat.

---

### 🕶️ 9. Group Incognito Mode & Advanced Admin Controls
- **Description**: Send anonymous messages in group chats where your identity and avatar are masked as **Secret Member** with a fedora & sunglasses avatar.
- **Admin Controls**:
  - Create groups with custom cover images and descriptions.
  - Add/remove members, promote co-admins, transfer group ownership, or leave/delete groups.
- **How to Use Incognito**: Click the **Fedora Hat & Sunglasses** icon in the group chat input bar to toggle Incognito Mode ON/OFF.

---

### ⏪ 10. Cinematic Chat Story Replay
- **Description**: Plays back your last 48 hours of chat messages as an animated, cinematic story reel with progress bars.
- **How to Use**: Open the 3-dot (`⋮`) menu in any 1-on-1 chat and select **Play Chat Story**.

---

### 🎨 11. Custom Chat Theming Engine
- **Description**: Personalize individual chats with vibrant dynamic wallpaper themes (Default Dark, Cyberpunk Neon, Sunset Orange, OLED Midnight, Emerald Forest, Fuchsia Glow).
- **How to Use**: Open 3-dot (`⋮`) menu → **Theme** → select your visual style.

---

### 💬 12. Rich Message Interactions & Reactions
- **Emoji Reactions**: React with any emoji (`❤️`, `🔥`, `👍`, `😂`, `😮`, `😢`) to messages.
- **Edit Sent Messages**: Edit text messages with an `(edited)` badge.
- **Delete Options**: "Delete for me" or "Delete for everyone".
- **Starred & Pinned Messages**: Pin crucial messages to the top of the chat.
- **Real-Time Indicators**: Live "Typing..." status and double tick (`✓✓`) read receipts.
- **Media & File Attachments**: Send images, videos, audio notes, and documents via Cloudinary storage.

---

### 🔒 13. Privacy, Security & User Controls
- **User Blocking System**: Block/Unblock users to restrict messaging and calling (`POST /api/user/block/:id`).
- **Security Question Password Recovery**: Recover lost passwords using personalized security questions (`POST /api/auth/reset-password-question`).
- **JWT & HTTP-Only Cookie Auth**: Secure authentication and session persistence.

---

### 📱 14. Progressive Web App (PWA) Support
- **Description**: Install BaatCheet as a native standalone app on Desktop (Windows, macOS, Linux) and Mobile (Android, iOS).
- **How to Use**: Tap the **"Install BaatCheet App"** prompt banner on first launch.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Tailwind CSS, Redux Toolkit, Framer Motion, Lucide Icons, Canvas API, Web Audio API |
| **Backend** | Node.js, Express.js, Socket.IO, JWT Authentication, Multer |
| **Database** | MongoDB & Mongoose ORM |
| **AI Engine** | Google Gemini 2.5 API (`@google/genai`) |
| **Media & RTC** | Cloudinary API, WebRTC (`getUserMedia`, `getDisplayMedia`) |
| **PWA & Platform**| Web App Manifest, Service Workers, PWA Install Prompt |

---

## 📁 Repository Structure

```
RealTimeChat/
├── Backend/
│   ├── config/             # Cloudinary, database connection & Gemini AI metrics
│   ├── controllers/        # Auth, User, Message, Group, Status, Call controllers
│   ├── middlewares/        # JWT auth middleware & Multer file upload setup
│   ├── models/             # Mongoose schemas (User, Message, Group, Status, Call, Conversation)
│   ├── routes/             # Express API routes (auth, user, message, group, status, call)
│   ├── socket/             # Socket.IO handlers (chat, mini-games, whiteboard, WebRTC signaling)
│   └── index.js            # Express server initialization & socket server listener
├── Frontend/
│   ├── public/             # Static assets, favicon & web manifest
│   └── src/
│       ├── components/     # MessageArea, SideBar, MiniGameHub, TableTennisGame, GhostMessageBubble, StatusSection, CallManager, DrawingCanvas, VoiceStudioModal, InstallPrompt, ChatReplay
│       ├── pages/          # Home, Login, Signup, About, Profile, ForgotPassword
│       ├── redux/          # Redux Toolkit slices (userSlice, messageSlice)
│       ├── customHooks/    # Socket listeners & custom API hooks
│       └── socket.js       # Central Socket.IO client instance
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16.0 or higher)
- **MongoDB** (Local instance or MongoDB Atlas URI)
- **Cloudinary Account** (for image, video & audio file hosting)
- **Google Gemini API Key** (for AI features)

---

### Installation & Local Setup

#### 1. Clone the repository
```bash
git clone https://github.com/sumancpp/RealTimeChat.git
cd RealTimeChat
```

#### 2. Backend Setup
Navigate to `Backend/` and install dependencies:
```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/realtimechat
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173

# Cloudinary Setup
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google Gemini AI Setup
GEMINI_API_KEY=your_google_gemini_api_key
```

Start the backend server:
```bash
npm run dev
```

#### 3. Frontend Setup
Navigate to `Frontend/` and install dependencies:
```bash
cd ../Frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## 📝 License & Author

Distributed under the **MIT License**.

Designed & Developed with ❤️ by **Suman**  
- **Email**: officialsuman666@gmail.com / suumaan@zohomail.in  
- **GitHub**: [@sumancpp](https://github.com/sumancpp)

