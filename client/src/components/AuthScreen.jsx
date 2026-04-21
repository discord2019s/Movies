import { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

export default function AuthScreen({ onAuthComplete }) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { authenticate, role } = useWebSocket();

  // If role is set successfully, call onAuthComplete
  useEffect(() => {
    if (role === 'admin' || role === 'viewer') {
      onAuthComplete();
    }
  }, [role, onAuthComplete]);

  const handleAdminLogin = () => {
    if (password) {
      setIsLoading(true);
      authenticate('admin', password);
      setTimeout(() => setIsLoading(false), 1000);
    } else {
      setShowPassword(true);
    }
  };

  const handleWatchMode = () => {
    setIsLoading(true);
    authenticate('viewer');
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && password) {
      handleAdminLogin();
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🎬 Watch Party</h1>
        <p>Watch content together in real-time</p>
        
        <div className="auth-buttons">
          {!showPassword ? (
            <>
              <button 
                className="btn btn-primary" 
                onClick={handleAdminLogin}
                disabled={isLoading}
              >
                {isLoading ? '⏳ Connecting...' : '👑 Admin Login'}
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={handleWatchMode}
                disabled={isLoading}
              >
                {isLoading ? '⏳ Connecting...' : '👁️ Watching Mode'}
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
                onKeyPress={handleKeyPress}
                autoFocus
              />
              <button 
                className="btn btn-primary" 
                onClick={handleAdminLogin}
                disabled={isLoading}
              >
                {isLoading ? '⏳ Verifying...' : 'Login as Admin'}
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowPassword(false)}
                disabled={isLoading}
              >
                Back
              </button>
            </>
          )}
        </div>
        
        <div style={{ marginTop: '20px', fontSize: '12px', opacity: 0.6 }}>
          Admin password: 1234
        </div>
      </div>
    </div>
  );
}