import IframeMirror from './IframeMirror';
import { useWebSocket } from '../hooks/useWebSocket';

export default function WatchScreen({ onBack }) {
  const { currentState } = useWebSocket();

  if (!currentState.iframeSrc) {
    return <div className="loading">Loading content...</div>;
  }

  return <IframeMirror url={currentState.iframeSrc} onBack={onBack} />;
}