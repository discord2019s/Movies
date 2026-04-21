import { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

export default function AuthScreen({ onAuthComplete }) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const { authenticate } = useWebSocket();

  const handleAdminLogin = () => {
    if (password) {
      authenticate('admin', password);
    } else {
      setShowPassword(true);
    }
  };

  const handleWatchMode = () => {
    authenticate('viewer');
    onAuthComplete();
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🎬 Watch Party</h1>
        <p>Watch content together in real-time</p>
        
        <div className="auth-buttons">
          {!showPassword ? (
            <>
              <button className="btn btn-primary" onClick={handleAdminLogin}>
                👑 Admin Login
              </button>
              <button className="btn btn-secondary" onClick={handleWatchMode}>
                👁️ Watching Mode
              </button>
            </>
          ) : (
            <>
              <input
                type="password"
                className="password-input"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <button className="btn btn-primary" onClick={handleAdminLogin}>
                Login as Admin
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowPassword(false)}
              >
                Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
