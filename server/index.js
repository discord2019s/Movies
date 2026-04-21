cat > server/index.js << 'EOF'
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Store current state
let currentState = { url: '', action: '' };
let adminSocket = null;

wss.on('connection', (ws) => {
  console.log('New client connected');
  
  let clientRole = 'viewer';

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // طلب أدمن جديد: نقبله فوراً إذا كان الباسورد 1234
      if (data.type === 'request_admin' && data.password === '1234') {
        console.log('Admin login attempt with correct password');
        
        // إذا كان هناك أدمن آخر، نفصله بهدوء (أو نتركه حسب رغبتك، هنا سنستبدله)
        if (adminSocket && adminSocket !== ws) {
          console.log('Revoking previous admin session');
          adminSocket.send(JSON.stringify({ type: 'role_revoked' }));
          // لا نفصله فوراً لنتجنب الأخطاء، لكن ننقل الصلاحية للجديد
        }

        adminSocket = ws;
        clientRole = 'admin';
        ws.send(JSON.stringify({ type: 'admin_granted' }));
        console.log('New Admin Granted');
        return;
      }

      // إذا كان المرسل هو الأدمن الحالي، انشر أفعاله للمشاهدين
      if (ws === adminSocket) {
        if (data.type === 'action') {
          currentState = data.payload;
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'sync', payload: currentState }));
            }
          });
        }
      }
    } catch (e) {
      console.error('Error parsing message:', e);
    }
  });

  ws.on('close', () => {
    if (ws === adminSocket) {
      console.log('Admin disconnected');
      adminSocket = null;
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
EOF