const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// Serve static files from client build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Store connected clients
const clients = new Set();
let adminClient = null;
let currentState = {
  role: null,
  currentPage: 'home',
  url: null,
  iframeSrc: null,
  clicks: [],
  scroll: { x: 0, y: 0 },
  videoState: null
};

// Broadcast state to all viewers
function broadcastState() {
  const message = JSON.stringify({
    type: 'state_update',
    payload: currentState
  });
  
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client !== adminClient) {
      client.send(message);
    }
  });
  
  // Also send to admin if exists
  if (adminClient && adminClient.readyState === WebSocket.OPEN) {
    adminClient.send(message);
  }
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New client connected');
  
  // Send current state to new client
  ws.send(JSON.stringify({
    type: 'state_update',
    payload: currentState
  }));
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'set_role':
          if (data.role === 'admin' && data.password === '1234') {
            // Remove previous admin if exists and different from current
            if (adminClient && adminClient !== ws && adminClient.readyState === WebSocket.OPEN) {
              adminClient.send(JSON.stringify({ type: 'role_revoked', reason: 'New admin connected' }));
              // Close the old admin connection
              setTimeout(() => {
                if (adminClient && adminClient.readyState === WebSocket.OPEN) {
                  adminClient.close();
                }
              }, 100);
            }
            adminClient = ws;
            currentState.role = 'admin';
            currentState.currentPage = 'home';
            currentState.iframeSrc = null;
            broadcastState();
            ws.send(JSON.stringify({ type: 'role_accepted', role: 'admin' }));
            console.log('Admin authenticated successfully');
          } else if (data.role === 'viewer') {
            clients.add(ws);
            ws.send(JSON.stringify({ type: 'role_accepted', role: 'viewer' }));
            console.log('Viewer connected');
          } else if (data.role === 'admin' && data.password !== '1234') {
            ws.send(JSON.stringify({ type: 'auth_failed', message: 'Invalid password' }));
          }
          break;
          
        case 'action':
          // Only admin can send actions
          if (ws === adminClient) {
            currentState = { ...currentState, ...data.payload };
            broadcastState();
          }
          break;
          
        case 'navigate':
          if (ws === adminClient) {
            currentState.currentPage = data.page;
            currentState.iframeSrc = data.url;
            broadcastState();
          }
          break;
          
        case 'video_control':
          if (ws === adminClient) {
            currentState.videoState = data.state;
            broadcastState();
          }
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
  
  ws.on('close', () => {
    if (ws === adminClient) {
      adminClient = null;
      currentState.role = null;
      currentState.currentPage = 'home';
      currentState.iframeSrc = null;
      broadcastState();
      console.log('Admin disconnected');
    } else {
      clients.delete(ws);
      console.log('Viewer disconnected');
    }
  });
});

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
  console.log(`Admin password: 1234`);
});