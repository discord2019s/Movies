import { useState, useEffect } from 'react';
import AuthScreen from './components/AuthScreen';
import HomeScreen from './components/HomeScreen';
import WatchScreen from './components/WatchScreen';
import { useWebSocket } from './hooks/useWebSocket';

function App() {
  const { role, currentState, connected } = useWebSocket();
  const [authenticated, setAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  // Sync page changes from server
  useEffect(() => {
    if (currentState.currentPage === 'watch' && currentState.iframeSrc) {
      setCurrentPage('watch');
    } else if (currentState.currentPage === 'home') {
      setCurrentPage('home');
    }
  }, [currentState.currentPage, currentState.iframeSrc]);

  const handleAuthComplete = () => {
    setAuthenticated(true);
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  if (!connected) {
    return <div className="loading">Connecting to server...</div>;
  }

  if (!authenticated || !role) {
    return <AuthScreen onAuthComplete={handleAuthComplete} />;
  }

  return (
    <>
      {currentPage === 'home' && <HomeScreen />}
      {currentPage === 'watch' && (
        <WatchScreen onBack={handleBackToHome} />
      )}
    </>
  );
}

export default App;
