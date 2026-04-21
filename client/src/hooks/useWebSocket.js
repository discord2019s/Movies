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
          // Clear any stored role on successful auth
          if (data.role === 'admin') {
            localStorage.setItem('watchPartyRole', 'admin');
          } else {
            localStorage.setItem('watchPartyRole', 'viewer');
          }
        } else if (data.type === 'role_revoked') {
          setRole(null);
          localStorage.removeItem('watchPartyRole');
          // Show message to user
          const message = data.reason || 'Your admin role has been revoked by a new admin';
          alert(message);
          // Reload the page to reset state
          window.location.reload();
        } else if (data.type === 'auth_failed') {
          alert(data.message || 'Invalid password!');
          setRole(null);
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

  const sendAction = (actionData) => {
    if (ws && ws.readyState === WebSocket.OPEN && role === 'admin') {
      ws.send(JSON.stringify({
        type: 'action',
        payload: actionData
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

  const sendVideoControl = (state) => {
    if (ws && ws.readyState === WebSocket.OPEN && role === 'admin') {
      ws.send(JSON.stringify({
        type: 'video_control',
        state: state
      }));
    }
  };

  return {
    connected,
    role,
    currentState,
    authenticate,
    sendAction,
    navigate,
    sendVideoControl,
  };
}