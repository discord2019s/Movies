cat > client/src/components/AuthScreen.jsx << 'EOF'
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthScreen = ({ setRole, socket }) => {
  const [mode, setMode] = useState('select');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    
    // التحقق المباشر من الباسورد فقط
    if (password === '1234') {
      console.log("Admin Login Success");
      setRole('admin');
      localStorage.setItem('dw_role', 'admin');
      
      // إرسال إشعار للسيرفر فقط للمعلومة (بدون انتظار رد)
      if(socket) socket.emit('request_admin', { password: '1234' });
      
      navigate('/home');
    } else {
      setError('كلمة المرور خطأ!');
    }
  };

  const handleViewerEnter = () => {
    setRole('viewer');
    localStorage.setItem('dw_role', 'viewer');
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-400">Watch Party</h2>
        
        {mode === 'select' ? (
          <div className="space-y-4">
            <button onClick={() => setMode('admin')} className="w-full bg-red-600 py-3 rounded font-bold hover:bg-red-700">Admin Mode</button>
            <button onClick={handleViewerEnter} className="w-full bg-gray-600 py-3 rounded font-bold hover:bg-gray-500">Viewer Mode</button>
          </div>
        ) : (
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Password (1234)" 
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
              autoFocus
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={() => setMode('select')} className="flex-1 py-2 bg-gray-600 rounded">Back</button>
              <button type="submit" className="flex-1 py-2 bg-green-600 rounded font-bold">Login</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;
EOF