# 🎬 Discord Watch Party - Real-Time Shared Watching Platform

A web application designed for Discord Activities that allows multiple users to watch content together in real-time with one admin controlling everything.

## 📋 Features

### Authentication System
- **Admin Login**: Password-protected access (password: `1234`)
- **Viewer Mode**: No password required, watch-only access

### Admin Features
- Full control over the interface
- Navigate between websites
- Browse and select movies/shows
- All actions broadcast live to viewers
- Play/pause/sync video playback

### Viewer Features
- Watch-only mode (no interaction allowed)
- Real-time synchronization with admin

- See exactly what admin sees instantly
- Ultra-low latency updates

### Supported Platforms
- WeCima (https://wecima.rent/)
- ArabSeed (https://web.cimale3k.space/movies-list)
- iMallek (https://asd.pics/home7/)

## 🏗️ Project Structure

```
discord-watch-party/
├── server/
│   └── index.js          # WebSocket + Express server
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthScreen.jsx
│   │   │   ├── HomeScreen.jsx
│   │   │   └── WatchScreen.jsx
│   │   ├── hooks/
│   │   │   └── useWebSocket.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   └── vite.config.js
├── package.json
├── .env
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Navigate to project directory**
```bash
cd discord-watch-party
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development servers**
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3000`
- Frontend dev server on `http://localhost:5173`

4. **Build for production**
```bash
npm run build
npm start
```

## 🔗 Discord Activity Integration

### Step 1: Deploy Your Application

Deploy to a hosting service that supports HTTPS:
- **Vercel** (Recommended)
- **Railway**
- **Heroku**
- **Render**

### Step 2: Create Discord Activity

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Navigate to "Activity" section
4. Configure your activity:
   - **Name**: Watch Party
   - **URL**: Your deployed HTTPS URL
   - **Type**: Embedded Web Application

### Step 3: Configure Activity Settings

```json
{
  "name": "Watch Party",
  "url": "https://your-deployed-app.com",
  "type": "ACTIVITY_TYPE_EMBEDDED_APP"
}
```

### Step 4: Add to Your Server

1. Generate OAuth2 URL with `applications.commands` scope
2. Share the invite link with your server
3. Launch the activity from any voice channel

## 💡 How It Works

### Real-Time Synchronization

1. **WebSocket Connection**: All clients connect to the same WebSocket server
2. **State Management**: Server maintains global state
3. **Broadcast System**: Admin actions are broadcast to all viewers instantly
4. **iframe Embedding**: External websites loaded in sandboxed iframes

### Architecture Flow

```
Admin Browser → WebSocket Server → Viewer Browsers
     ↓                ↓                  ↓
  Actions         State Update      Render Sync
```

## 🛠️ Technical Details

### Technologies Used
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Real-time**: WebSocket (ws library)
- **Styling**: Custom CSS with glassmorphism

### Security Considerations
- Admin password authentication
- Sandboxed iframe environment
- Role-based access control
- WebSocket message validation

## ⚠️ Important Notes

### iframe Limitations
Some websites may block embedding via `X-Frame-Options` or CSP headers. The supported sites (WeCima, ArabSeed, iMallek) should work, but:

- Some content may not load in iframe
- Cross-origin restrictions may apply
- Video players might have their own DRM

### Browser Compatibility
- Chrome/Edge (Recommended)
- Firefox
- Safari (limited testing)

## 🎮 Usage Guide

### For Admin:
1. Open the app in Discord Activity or browser
2. Click "Admin Login"
3. Enter password: `1234`
4. Select a platform (WeCima, ArabSeed, or iMallek)
5. Browse and play content
6. Everything you do is synced to viewers

### For Viewers:
1. Open the app in Discord Activity or browser
2. Click "Watching Mode"
3. Wait for admin to select content
4. Enjoy watching in perfect sync!

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
PORT=3000
NODE_ENV=production
```

### WebSocket URL

The app automatically detects the WebSocket URL:
- Development: `ws://localhost:3000`
- Production: `wss://your-domain.com`

## 📝 Future Enhancements

- [ ] Chat system for viewers
- [ ] Queue system for content requests
- [ ] Multiple admin support
- [ ] Screen sharing fallback
- [ ] Better video player sync
- [ ] Activity indicator for viewers
- [ ] Reconnection handling
- [ ] Mobile responsive design

## 🐛 Troubleshooting

### Common Issues

**iframe not loading:**
- Check if the target site allows embedding
- Verify HTTPS/HTTP mixed content

**WebSocket connection failed:**
- Ensure server is running
- Check firewall settings
- Verify correct port

**Viewers not syncing:**
- Refresh viewer pages
- Check WebSocket connection status
- Ensure admin is authenticated

## 📄 License

MIT License - Feel free to modify and distribute!

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

---

**Built with ❤️ for Discord Communities**
