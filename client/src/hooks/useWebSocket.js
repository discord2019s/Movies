import { useState, useEffect } from 'react';

const WS_URL = window.location.hostname === 'localhost' 
  ? 'ws://localhost:3000' 
  : `wss://${window.location.host}`;

export function useWebSocket() {
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);
  const [role, setRole] = useState(null);
  const [currentState, setCurrentState] = useState({
    currentPage: 'home',
    iframeSrc: null,
  });
  const [liveEvents, setLiveEvents] = useState([]);

  useEffect(() => {
    const websocket = new WebSocket(WS_URL);

    websocket.onopen = () => {
      console.log('Connected to server');
      setConnected(true);
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'state_update') {
          setCurrentState(data.payload);
          if (data.payload.role) {
            setRole(data.payload.role);
          }
        } else if (data.type === 'role_accepted') {
          setRole(data.role);
        } else if (data.type === 'role_revoked') {
          setRole(null);
          alert('Your admin role has been revoked');
          window.location.reload();
        } else if (data.type === 'auth_failed') {
          alert('Invalid password!');
        } else if (data.type === 'live_event') {
          // Store live events for viewers
          setLiveEvents(prev => [...prev, data.payload]);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    websocket.onclose = () => {
      console.log('Disconnected');
      setConnected(false);
      setWs(null);
    };

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, []);

  const authenticate = (roleType, password = null) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'set_role',
        role: roleType,
        password: password
      }));
    }
  };

  const navigate = (page, url = null) => {
    if (ws && ws.readyState === WebSocket.OPEN && role === 'admin') {
      ws.send(JSON.stringify({
        type: 'navigate',
        page: page,
        url: url
      }));
    }
  };

  // NEW: Send live events from admin
  const sendLiveEvent = (eventData) => {
    if (ws && ws.readyState === WebSocket.OPEN && role === 'admin') {
      ws.send(JSON.stringify({
        type: 'live_event',
        payload: eventData
      }));
    }
  };

  return {
    connected,
    role,
    currentState,
    liveEvents,
    authenticate,
    navigate,
    sendLiveEvent,
  };
}