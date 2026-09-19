<div align="center">

<img src="https://img.shields.io/badge/SocialHub-Connect%20With%20The%20World-0095f6?style=for-the-badge&logoColor=white" alt="SocialHub Banner" />

# 🌐 SocialHub

### A Full-Stack Social Media Platform

*Inspired by Instagram & Facebook — Built from scratch*

<br/>

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Visit%20Now-0095f6?style=for-the-badge)](https://social-hub-beta-three.vercel.app)
[![Backend API](https://img.shields.io/badge/🔗%20Backend%20API-vercel-6366f1?style=for-the-badge)](https://social-hub-3j23.onrender.com/api/health)

<br/>

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?style=flat-square&logo=socketdotio)
![Redux](https://img.shields.io/badge/Redux-Toolkit-764ABC?style=flat-square&logo=redux)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?style=flat-square&logo=cloudinary)

</div>

---

## 📸 Screenshots

<div align="center">

| Feed Page | Profile Page |
|:---------:|:------------:|
| ![Feed](https://placehold.co/600x380/0095f6/ffffff?text=Feed+Page) | ![Profile](https://placehold.co/600x380/6366f1/ffffff?text=Profile+Page) |

| Real-time Chat | Notifications |
|:--------------:|:-------------:|
| ![Chat](https://placehold.co/600x380/10b981/ffffff?text=Chat+Page) | ![Notifications](https://placehold.co/600x380/f59e0b/ffffff?text=Notifications) |

</div>

---

## ✨ Features

### 👤 Authentication & Security
- 🔐 JWT Authentication with **Access Token + Refresh Token** rotation
- 🍪 HTTP-only cookies for secure token storage
- 🛡️ Rate limiting on sensitive routes (brute force protection)
- 🔒 Password hashing with bcryptjs (12 rounds)
- ✅ Zod + Joi validation on both client and server

### 📱 Social Features
- 📸 **Create Posts** — images & videos with multi-file carousel support
- ❤️ **Like / Unlike** posts and comments with optimistic UI updates
- 💬 **Comments** with nested replies (2-level threading)
- 🔖 **Bookmarks** — save posts to view later
- 👥 **Follow / Unfollow** users with real-time follower count
- 🔍 **Search** users by username or full name
- 💡 **Suggestions** — discover new people to follow

### 📖 Stories
- ⏰ **24-hour stories** with automatic expiry via MongoDB TTL index
- 👁️ **Story viewers** list — see who viewed your story
- 🎬 Supports both images and videos
- 📝 Text overlay on stories
- 🔵 Unviewed story ring (gradient) vs viewed ring (grey)

### 💬 Real-time Chat
- ⚡ **Instant messaging** powered by Socket.io
- ✍️ **Typing indicators** with animated dots
- ✅ **Read receipts** — double blue checkmarks when seen
- 🖼️ **Media sharing** — send images and videos in chat
- 🗑️ **Delete messages** — soft delete with placeholder text
- 📅 **Date separators** between messages
- 🔔 Unread message count badge per conversation

### 🔔 Notifications
- 🔴 **Real-time notifications** via Socket.io
- 👍 Like, 💬 Comment, 👥 Follow, 📩 Message alerts
- ✅ Mark single or all notifications as read
- 🗑️ Delete individual or all notifications
- 🔢 Live unread count badge on sidebar

### 🎨 UI / UX
- 🌙 **Dark / Light mode** toggle with CSS variables
- 📱 **Fully responsive** — mobile, tablet, desktop
- ⚡ **Optimistic UI** — instant feedback before server response
- 🖼️ **Skeleton loaders** for every loading state
- ♾️ **Infinite scroll** on feed
- 🎭 Smooth animations and transitions
- 📋 **Drag & drop** file upload for posts

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|:----------:|:-------:|:-------:|
| React | 18 | UI Library |
| Vite | 5 | Build Tool |
| Redux Toolkit | Latest | Global State |
| RTK Query | Latest | API Caching |
| React Router | v6 | Client Routing |
| Socket.io-client | Latest | Real-time |
| React Hook Form | Latest | Form Handling |
| Zod | Latest | Validation |
| Axios | Latest | HTTP Client |
| Framer Motion | Latest | Animations |
| Lucide React | Latest | Icons |
| React Hot Toast | Latest | Notifications |
| date-fns | Latest | Date Formatting |
| React Dropzone | Latest | File Upload |
| Custom CSS Modules | — | Scoped Styling |

### Backend
| Technology | Version | Purpose |
|:----------:|:-------:|:-------:|
| Node.js | 22 | Runtime |
| Express.js | Latest | Web Framework |
| MongoDB | Atlas | Database |
| Mongoose | Latest | ODM |
| Socket.io | Latest | WebSockets |
| JWT | Latest | Authentication |
| bcryptjs | Latest | Password Hashing |
| Cloudinary | Latest | Media Storage |
| Multer | Latest | File Uploads |
| Joi | Latest | Validation |
| Helmet | Latest | Security Headers |
| Morgan | Latest | HTTP Logger |
| express-rate-limit | Latest | Rate Limiting |

---

## 🏗️ Architecture

```
social-hub/
├── 📁 client/                    # React Frontend (Vite)
│   └── src/
│       ├── 📁 features/          # Feature-based modules
│       │   ├── auth/             # Login, Register, JWT
│       │   ├── posts/            # Feed, PostCard, CreatePost
│       │   ├── stories/          # StoryBar, StoryViewer
│       │   ├── users/            # Profile, Follow
│       │   ├── chat/             # Conversations, Messages
│       │   └── notifications/    # Real-time alerts
│       ├── 📁 pages/             # Route-level components
│       ├── 📁 components/        # Shared UI components
│       ├── 📁 hooks/             # Custom React hooks
│       ├── 📁 services/          # Axios + Socket.io
│       ├── 📁 store/             # Redux store
│       ├── 📁 context/           # Theme context
│       ├── 📁 styles/            # CSS variables + global
│       └── 📁 utils/             # Helpers + validators
│
└── 📁 server/                    # Node.js Backend
    └── src/
        ├── 📁 models/            # 7 Mongoose schemas
        ├── 📁 routes/            # Express route definitions
        ├── 📁 controllers/       # Request handlers
        ├── 📁 services/          # Business logic
        ├── 📁 middlewares/       # Auth, validation, upload
        ├── 📁 sockets/           # Socket.io handlers
        ├── 📁 validators/        # Joi schemas
        ├── 📁 config/            # DB, Cloudinary, Env
        └── 📁 utils/             # ApiError, ApiResponse
```

---

## 🔌 API Endpoints

<details>
<summary><b>🔐 Auth Routes</b> — <code>/api/auth</code></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | ❌ | Create new account |
| `POST` | `/login` | ❌ | Login with email or username |
| `POST` | `/logout` | ✅ | Logout and clear cookies |
| `POST` | `/refresh-token` | ❌ | Get new access token |
| `POST` | `/change-password` | ✅ | Update password |
| `GET` | `/me` | ✅ | Get current user |

</details>

<details>
<summary><b>👤 User Routes</b> — <code>/api/users</code></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/search` | ✅ | Search users |
| `GET` | `/suggestions` | ✅ | Get follow suggestions |
| `GET` | `/:username` | ✅ | Get user profile |
| `PUT` | `/update-profile` | ✅ | Update profile info |
| `PUT` | `/update-avatar` | ✅ | Update avatar image |
| `PUT` | `/update-cover` | ✅ | Update cover image |
| `POST` | `/follow/:userId` | ✅ | Follow a user |
| `POST` | `/unfollow/:userId` | ✅ | Unfollow a user |
| `GET` | `/:userId/followers` | ✅ | Get followers list |
| `GET` | `/:userId/following` | ✅ | Get following list |

</details>

<details>
<summary><b>📸 Post Routes</b> — <code>/api/posts</code></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/` | ✅ | Create new post |
| `GET` | `/feed` | ✅ | Get home feed |
| `GET` | `/bookmarks` | ✅ | Get bookmarked posts |
| `GET` | `/user/:userId` | ✅ | Get user's posts |
| `GET` | `/:postId` | ✅ | Get single post |
| `PUT` | `/:postId` | ✅ | Update post |
| `DELETE` | `/:postId` | ✅ | Delete post |
| `POST` | `/:postId/like` | ✅ | Like a post |
| `POST` | `/:postId/unlike` | ✅ | Unlike a post |
| `GET` | `/:postId/likes` | ✅ | Get post likes |
| `POST` | `/:postId/bookmark` | ✅ | Toggle bookmark |

</details>

<details>
<summary><b>💬 Comment Routes</b> — <code>/api/comments</code></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/:postId` | ✅ | Add comment |
| `GET` | `/:postId` | ✅ | Get post comments |
| `DELETE` | `/:commentId` | ✅ | Delete comment |
| `POST` | `/:commentId/like` | ✅ | Like a comment |
| `POST` | `/:commentId/reply` | ✅ | Reply to comment |
| `GET` | `/:commentId/replies` | ✅ | Get replies |

</details>

<details>
<summary><b>📖 Story Routes</b> — <code>/api/stories</code></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/` | ✅ | Create story |
| `GET` | `/feed` | ✅ | Get story feed |
| `GET` | `/user/:userId` | ✅ | Get user stories |
| `POST` | `/:storyId/view` | ✅ | Mark story as viewed |
| `GET` | `/:storyId/viewers` | ✅ | Get story viewers |
| `DELETE` | `/:storyId` | ✅ | Delete story |

</details>

<details>
<summary><b>💬 Chat Routes</b> — <code>/api/chat</code></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/conversations` | ✅ | Get or create conversation |
| `GET` | `/conversations` | ✅ | Get all conversations |
| `GET` | `/conversations/:id` | ✅ | Get single conversation |
| `DELETE` | `/conversations/:id` | ✅ | Delete conversation |
| `POST` | `/conversations/:id/messages` | ✅ | Send message |
| `GET` | `/conversations/:id/messages` | ✅ | Get messages |
| `PUT` | `/conversations/:id/seen` | ✅ | Mark as seen |
| `DELETE` | `/messages/:messageId` | ✅ | Delete message |

</details>

<details>
<summary><b>🔔 Notification Routes</b> — <code>/api/notifications</code></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | ✅ | Get all notifications |
| `GET` | `/unread-count` | ✅ | Get unread count |
| `PUT` | `/read-all` | ✅ | Mark all as read |
| `DELETE` | `/clear-all` | ✅ | Clear all notifications |
| `PUT` | `/:id/read` | ✅ | Mark single as read |
| `DELETE` | `/:id` | ✅ | Delete notification |

</details>

---

## ⚡ Socket.io Events

<details>
<summary><b>📡 Real-time Events</b></summary>

### Connection
| Event | Direction | Description |
|-------|-----------|-------------|
| `user:online` | Server → All | User came online |
| `user:offline` | Server → All | User went offline |
| `users:online` | Server → Client | List of online users |

### Chat
| Event | Direction | Description |
|-------|-----------|-------------|
| `conversations:join` | Client → Server | Join conversation rooms |
| `message:send` | Client → Server | Send a message |
| `message:new` | Server → Client | Receive a message |
| `message:seen` | Client → Server | Mark messages as seen |
| `message:seen:ack` | Server → Client | Seen acknowledgement |
| `typing:start` | Client → Server | User started typing |
| `typing:stop` | Client → Server | User stopped typing |

### Notifications
| Event | Direction | Description |
|-------|-----------|-------------|
| `notification:new` | Server → Client | New notification received |
| `notifications:viewed` | Client → Server | Notifications opened |

</details>

---

## 🚀 Getting Started

### Prerequisites

```bash
Node.js >= 18
MongoDB Atlas account
Cloudinary account
```

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Sayandip98/socialhub.git
cd socialhub
```

### 2️⃣ Setup Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/socialhub
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

```bash
# Seed the database with sample data
npm run seed

# Start development server
npm run dev
```

### 3️⃣ Setup Frontend

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=SocialHub
```

```bash
npm run dev
```

### 4️⃣ Open the App

```
Frontend  →  http://localhost:5173
Backend   →  http://localhost:5000
Health    →  http://localhost:5000/api/health
```

### 🌱 Seed Accounts

After running `npm run seed` in the server, use any of these accounts:

| Username | Email | Password |
|----------|-------|----------|
| `dev_user` | `dev@test.com` | `password123` |
| `alex_photo` | `alex@test.com` | `password123` |
| `sara_designs` | `sara@test.com` | `password123` |
| `mike_codes` | `mike@test.com` | `password123` |
| `priya_travels` | `priya@test.com` | `password123` |

---

## 🌍 Deployment

### Backend → Render
```
Login and deploy
https://render.com → Sign up / Login → New → Web Service
```
### Connect GitHub
```
Connect GitHub → Select your socialhub repository
```
### Configure Web Service
```
Name            : socialhub-api
Region          : Singapore (closest to India)
Branch          : main
Root Directory  : server
Runtime         : Node
Build Command   : npm install
Start Command   : node src/server.js
Instance Type   : Free
```

Set environment variables in Render dashboard.

### Frontend → Vercel

```bash
# Install Vercel CLI
npm install -g vercel

cd client
vercel --prod
```

Set `VITE_API_URL` and `VITE_SOCKET_URL` in Vercel environment variables.

---

## 🔑 Key Implementation Highlights

### 🔄 Refresh Token Rotation
Every time a refresh token is used a new one is generated and the old one is invalidated. This means stolen tokens become useless after first use.

### ⚡ Optimistic UI
Likes, bookmarks, and messages update the UI **instantly** before server confirmation. If the server fails the UI reverts automatically.

### 🗑️ Auto Story Expiry
Stories use MongoDB's **TTL (Time To Live) index** — the database automatically deletes expired story documents every 60 seconds. No cron job needed.

### 🔌 Socket Rooms
Every user has a **personal room** (their userId) and each conversation has its own room. This allows targeted real-time delivery without broadcasting to everyone.

### 📦 RTK Query Caching
API responses are cached with tags. When a mutation happens (like, follow, post) the relevant tags are **invalidated** and the UI refetches automatically.

### 🛡️ Request Validation
All requests are validated with **Joi** on the server before reaching controllers. Bad data never touches the database.

---

## 📂 Database Schema

```
User          → username, email, password, avatar, bio, followers[], following[], bookmarks[]
Post          → author, caption, media[], likes[], comments[], hashtags[], location
Comment       → post, author, text, likes[], parentComment, replies[]
Story         → author, media, text, viewers[], expiresAt (TTL)
Conversation  → participants[], lastMessage, isGroup
Message       → conversation, sender, text, media, seenBy[], isDeleted
Notification  → receiver, sender, type, post, comment, isRead
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

```bash
# Fork the repository
# Create your feature branch
git checkout -b feature/AmazingFeature

# Commit your changes
git commit -m 'Add some AmazingFeature'

# Push to the branch
git push origin feature/AmazingFeature

# Open a Pull Request
```

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

<div align="center">

**Your Name**

[![GitHub](https://img.shields.io/badge/GitHub-yourusername-181717?style=for-the-badge&logo=github)](https://github.com/yourusername)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-yourprofile-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/yourprofile)
[![Portfolio](https://img.shields.io/badge/Portfolio-yourwebsite.com-0095f6?style=for-the-badge&logo=google-chrome)](https://yourwebsite.com)

</div>

---

<div align="center">

### ⭐ If you found this project helpful, please give it a star!

*Built with ❤️ using React, Node.js, MongoDB and Socket.io*

</div>
