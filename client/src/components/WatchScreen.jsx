import { useWebSocket } from '../hooks/useWebSocket';

export default function WatchScreen({ onBack }) {
  const { role, currentState } = useWebSocket();
  const isAdmin = role === 'admin';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {isAdmin && (
        <button className="back-button" onClick={onBack}>
          ← Back to Home
        </button>
      )}

      <div className="sync-indicator">
        {isAdmin ? '🔴 Broadcasting' : '🟢 Synced'}
      </div>

      {currentState.iframeSrc ? (
        <iframe
          src={currentState.iframeSrc}
          className="iframe-container"
          title="Content Viewer"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          style={{
            pointerEvents: isAdmin ? 'auto' : 'none',
            width: '100%',
            height: 'calc(100vh - 80px)',
            border: 'none'
          }}
        />
      ) : (
        <div className="loading">Loading content...</div>
      )}

      {!isAdmin && (
        <div className="viewer-overlay">
          <div className="viewer-badge">
            👁️ Watching Admin's Screen
          </div>
        </div>
      )}
    </div>
  );
}