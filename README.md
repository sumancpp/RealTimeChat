# 💬 BaatCheet — Next-Gen AI Powered Real-Time Chat Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![NodeJS](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js)](https://nodejs.org/)
[![ExpressJS](https://img.shields.io/badge/Server-Express.js-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/RealTime-Socket.IO-010101?logo=socketdotio)](https://socket.io/)
[![WebRTC](https://img.shields.io/badge/Calling-WebRTC-333333?logo=webrtc)](https://webrtc.org/)

**BaatCheet** is a feature-rich, high-performance, real-time web messaging platform built with the MERN stack (MongoDB, Express, React, Node.js) and WebSockets. Beyond standard messaging, BaatCheet introduces cutting-edge interactive features including self-destructing Ghost Ink messages, multi-game 2-player duels, group whiteboard collaboration, WebRTC audio/video calling, AI mood music & roast triggers, custom chat theming, and WhatsApp-style status updates.

---

## 🌟 Mind-Blowing Features & How To Use

### 👻 1. Ghost Ink Mode (Self-Destructing Messages)
- **Description**: Send secret messages that automatically disintegrate 5 seconds after the recipient opens them. Shows a real-time **`Ghost SMS is seen ⏳ 5s`** status badge to both sender and recipient before permanently purging the message from MongoDB.
- **How to Use**:
  1. Open the 3-dot (`⋮`) menu in any 1-on-1 chat and select **Ghost Ink Mode (ON)**.
  2. Alternatively, type `@ghost your message` in the text input and press send.
  3. When the recipient taps **"Tap to Reveal Ghost Message"**, both users see the live countdown timer and text blur out before disappearing forever.

### ⚔️ 2. Mini-Game Duel Hub (Table Tennis, Tic-Tac-Toe, Rock Paper Scissors)
- **Description**: Play 2-player interactive real-time mini-games directly inside your chat with permission prompt dialogs.
- **How to Use**:
  1. Open the 3-dot (`⋮`) menu in any 1-on-1 chat and click **Play Mini-Game Duel**.
  2. Select your game of choice:
     - 🏓 **Table Tennis**: Real-time 2D paddle physics duel.
     - ❌⭕ **Tic-Tac-Toe**: 3x3 turn-based strategy grid.
     - ✊✋✌️ **Rock Paper Scissors**: Fast-paced best-of-3 weapon duel.
  3. Your opponent receives an instant permission modal (`Accept & Play 🎮` / `Decline`). Upon acceptance, the game hub opens automatically on both screens.

### 🕶️ 3. Group Incognito Mode
- **Description**: Send anonymous messages in group chats where your avatar and username are masked as **Secret Member**.
- **How to Use**:
  - In any Group Chat input bar, click the **Fedora Hat & Sunglasses (Incognito)** icon to toggle Incognito Mode ON or OFF.

### 🎵 4. AI Mood Music Detector
- **Description**: Analyzes chat sentiment and suggests interactive YouTube Music cards playable right inside the chat window.
- **How to Use**: Click the Music (🎵) icon next to the chat input or type `@music` and send.

### 🔥 5. AI Roast Mode
- **Description**: Generates hilarious, context-aware AI burns to roast your friends.
- **How to Use**: Click the Flame (🔥) icon next to the chat input or type `@roast` and send.

### ⏪ 6. Chat Story Replay
- **Description**: Plays back your last 48 hours of messages as a cinematic, animated story reel.
- **How to Use**: Open the 3-dot (`⋮`) menu in any 1-on-1 chat and click **Play Chat Story**.

### 🎨 7. Real-Time Shared Whiteboard
- **Description**: Collaborative canvas allowing all group members to draw, erase, and brainstorm live.
- **How to Use**: Click the Palette (🎨) icon in the group chat top header bar.

### 📞 8. WebRTC Audio & Video Calls
- **Description**: High-definition peer-to-peer audio and video calling with incoming call ringers and mute/camera controls.
- **How to Use**: Click the Phone (📞) or Camera (📹) icon in the top header of any 1-on-1 chat.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Tailwind CSS, Redux Toolkit, Framer Motion, Lucide Icons, Canvas API |
| **Backend** | Node.js, Express.js, Socket.IO, JWT Authentication, Multer |
| **Database** | MongoDB & Mongoose ORM |
| **Media & RTC**| Cloudinary, WebRTC (PeerJS / Simple-Peer) |

---

## 📁 Repository Structure

```
RealTimeChat/
├── Backend/
│   ├── config/             # Cloudinary & database connection
│   ├── controllers/        # Auth, User, Message, Group, Status controllers
│   ├── middleware/         # JWT authentication middleware
│   ├── models/             # Mongoose schemas (User, Message, Group, Status, Conversation)
│   ├── routes/             # Express API routes
│   └── socket/             # Socket.IO event handlers (chat, games, call signaling)
├── Frontend/
│   ├── public/             # Static assets & favicon
│   └── src/
│       ├── components/     # MessageArea, SideBar, MiniGameHub, TableTennisGame, GhostMessageBubble, StatusSection, CallModal, Whiteboard
│       ├── pages/          # Home, Login, Signup, About, Profile
│       ├── redux/          # Redux slices (userSlice, messageSlice)
│       └── customHooks/    # Socket listeners & API fetch hooks
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16.0 or higher)
- **MongoDB** instance (Local or MongoDB Atlas URI)
- **Cloudinary** account (for media storage)

---

### Installation & Local Setup

#### 1. Clone the repository
```bash
git clone https://github.com/sumancpp/RealTimeChat.git
cd RealTimeChat
```

#### 2. Backend Configuration
Navigate to `Backend/` and install dependencies:
```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend/` root directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/realtimechat
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the backend server:
```bash
npm run dev
```

#### 3. Frontend Configuration
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
- **Email**: suumaan@zohomail.in  
- **GitHub**: [@sumancpp](https://github.com/sumancpp)
