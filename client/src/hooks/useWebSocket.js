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

  useEffect(() => {
    const websocket = new WebSocket(WS_URL);
    
    // Store for global access
    window.wsConnection = websocket;

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
          alert(data.reason || 'Your admin role has been revoked');
          window.location.reload();
        } else if (data.type === 'auth_failed') {
          alert(data.message || 'Invalid password!');
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    websocket.onclose = () => {
      console.log('Disconnected from server');
      setConnected(false);
      setWs(null);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
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

  // New: Send DOM events from admin to server
  const sendDomEvent = (eventData) => {
    if (ws && ws.readyState === WebSocket.OPEN && role === 'admin') {
      ws.send(JSON.stringify({
        type: 'dom_event',
        eventType: eventData.eventType,
        target: eventData.target,
        value: eventData.value,
        scrollX: eventData.scrollX,
        scrollY: eventData.scrollY,
        url: eventData.url
      }));
    }
  };

  return {
    connected,
    role,
    currentState,
    authenticate,
    navigate,
    sendDomEvent,
  };
}