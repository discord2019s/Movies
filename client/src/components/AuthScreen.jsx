import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthScreen = ({ setRole, socket }) => {
  const [mode, setMode] = useState('select'); // select, admin-login, viewer
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (password === '1234') {
      // نرسل طلب للسيرفر للتأكد (اختياري لكن أفضل للمزامنة)
      if (socket) {
        socket.emit('authenticate', { role: 'admin', password: '1234' });
      }
      
      setRole('admin');
      localStorage.setItem('dw_role', 'admin');
      navigate('/home');
    } else {
      setError('كلمة المرور خاطئة! حاول مرة أخرى.');
    }
  };

  const handleViewerEnter = () => {
    setRole('viewer');
    localStorage.setItem('dw_role', 'viewer');
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-md w-full border border-gray-700">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-400">Watch Party</h1>
        
        {mode === 'select' && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('admin-login')}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition duration-200"
            >
              👑 Admin (Controller)
            </button>
            <button
              onClick={handleViewerEnter}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition duration-200"
            >
              👁️ Watch Only (Viewer)
            </button>
          </div>
        )}

        {mode === 'admin-login' && (
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none text-white"
                placeholder="Enter password"
                autoFocus
              />
            </div>
            
            {error && (
              <p className="text-red-400 text-sm text-center bg-red-900/30 p-2 rounded">{error}</p>
            )}

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => { setMode('select'); setError(''); }}
                className="flex-1 bg-gray-600 hover:bg-gray-500 py-2 rounded"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-500 font-bold py-2 rounded"
              >
                Login
              </button>
            </div>
          </form>
        )}
        
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Discord Watch Activity</p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;