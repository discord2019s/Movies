import { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

export default function IframeMirror({ url, onBack }) {
  const { role, sendDomEvent } = useWebSocket();
  const iframeRef = useRef(null);
  const isAdmin = role === 'admin';
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const eventQueue = useRef([]);
  const isProcessing = useRef(false);

  // Inject mirroring script into iframe
  const injectMirrorScript = () => {
    if (!iframeRef.current) return;
    
    try {
      const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
      if (!iframeDoc) return;
      
      const script = iframeDoc.createElement('script');
      script.innerHTML = `
        (function() {
          console.log('🔍 Mirror script loaded');
          
          // Send DOM snapshot to parent
          function sendSnapshot() {
            const snapshot = {
              html: document.documentElement.outerHTML,
              url: window.location.href,
              scrollX: window.scrollX,
              scrollY: window.scrollY
            };
            window.parent.postMessage({ type: 'dom_snapshot', snapshot: snapshot }, '*');
          }
          
          // Send events to parent
          function sendEvent(eventType, target, value) {
            window.parent.postMessage({
              type: 'dom_event',
              eventType: eventType,
              target: target.tagName,
              value: value,
              scrollX: window.scrollX,
              scrollY: window.scrollY,
              url: window.location.href
            }, '*');
          }
          
          // Watch all clicks
          document.addEventListener('click', function(e) {
            sendEvent('click', e.target, e.target.innerText || e.target.value);
          }, true);
          
          // Watch all input changes
          document.addEventListener('input', function(e) {
            sendEvent('input', e.target, e.target.value);
          }, true);
          
          // Watch scroll events
          let scrollTimeout;
          window.addEventListener('scroll', function() {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function() {
              sendEvent('scroll', window, { x: window.scrollX, y: window.scrollY });
            }, 50);
          });
          
          // Watch URL changes (for SPAs)
          let lastUrl = window.location.href;
          new MutationObserver(function() {
            if (window.location.href !== lastUrl) {
              lastUrl = window.location.href;
              sendEvent('navigate', window, lastUrl);
              sendSnapshot();
            }
          }).observe(document, { subtree: true, childList: true });
          
          // Send initial snapshot
          setTimeout(sendSnapshot, 1000);
        })();
      `;
      
      iframeDoc.head.appendChild(script);
      setIframeLoaded(true);
    } catch (error) {
      console.error('Cannot inject script (cross-origin):', error);
    }
  };

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'dom_event' && isAdmin) {
        sendDomEvent(event.data);
      } else if (event.data.type === 'dom_snapshot' && isAdmin) {
        // Snapshot sent automatically
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isAdmin, sendDomEvent]);

  // Apply events to viewer iframe
  useEffect(() => {
    if (!isAdmin && iframeLoaded && iframeRef.current) {
      // For viewers - apply synced events
      const applyEvent = (eventData) => {
        try {
          const iframeWindow = iframeRef.current.contentWindow;
          if (!iframeWindow) return;
          
          switch (eventData.eventType) {
            case 'click':
              // Simulate click
              const element = iframeWindow.document.elementFromPoint(
                eventData.clientX || 100, 
                eventData.clientY || 100
              );
              if (element) {
                element.click();
              }
              break;
            case 'scroll':
              iframeWindow.scrollTo(eventData.scrollX, eventData.scrollY);
              break;
            case 'navigate':
              if (eventData.url && iframeWindow.location.href !== eventData.url) {
                iframeWindow.location.href = eventData.url;
              }
              break;
          }
        } catch (error) {
          console.error('Cannot apply event:', error);
        }
      };
      
      // Listen for events from server
      const ws = window.wsConnection;
      if (ws) {
        ws.addEventListener('message', (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'event') {
            applyEvent(data.payload);
          }
        });
      }
    }
  }, [isAdmin, iframeLoaded]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {isAdmin && (
        <button className="back-button" onClick={onBack}>
          ← Back to Home
        </button>
      )}
      
      <div className="sync-indicator" style={{ 
        background: isAdmin ? 'rgba(88, 101, 242, 0.8)' : 'rgba(0, 255, 0, 0.8)'
      }}>
        {isAdmin ? '🎥 Broadcasting Live' : '📺 Watching Live'}
      </div>
      
      <iframe
        ref={iframeRef}
        src={url}
        className="iframe-container"
        title="Content Viewer"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        onLoad={injectMirrorScript}
        style={{
          pointerEvents: isAdmin ? 'auto' : 'none',
          width: '100%',
          height: 'calc(100vh - 80px)',
          border: 'none'
        }}
      />
      
      {!isAdmin && (
        <div className="viewer-overlay">
          <div className="viewer-badge">
            👁️ Live Sync - Watching Admin's Screen
          </div>
        </div>
      )}
    </div>
  );
}