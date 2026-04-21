import { useWebSocket } from '../hooks/useWebSocket';

export default function WatchScreen({ onBack }) {
  const { role, currentState } = useWebSocket();

  // For admin, iframe is interactive; for viewers, it's read-only
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
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          style={{
            pointerEvents: isAdmin ? 'auto' : 'none',
            userSelect: isAdmin ? 'auto' : 'none',
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
