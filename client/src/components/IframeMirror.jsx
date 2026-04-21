import { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

export default function IframeMirror({ url, onBack }) {
  const { role, sendDomEvent } = useWebSocket();
  const iframeRef = useRef(null);
  const isAdmin = role === 'admin';
  const [iframeLoaded, setIframeLoaded] = useState(false);

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
          
          // Send events to parent
          function sendEvent(eventType, target, value, extra = {}) {
            window.parent.postMessage({
              type: 'dom_event',
              eventType: eventType,
              target: target?.tagName || 'unknown',
              value: value,
              scrollX: window.scrollX,
              scrollY: window.scrollY,
              url: window.location.href,
              ...extra
            }, '*');
          }
          
          // Watch all clicks
          document.addEventListener('click', function(e) {
            sendEvent('click', e.target, e.target.innerText || e.target.value, {
              clientX: e.clientX,
              clientY: e.clientY
            });
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
          const observer = new MutationObserver(function() {
            if (window.location.href !== lastUrl) {
              lastUrl = window.location.href;
              sendEvent('navigate', window, lastUrl);
            }
          });
          observer.observe(document.body, { subtree: true, childList: true });
          
          console.log('✅ Mirror script injected successfully');
        })();
      `;
      
      iframeDoc.head.appendChild(script);
      setIframeLoaded(true);
      console.log('✅ Script injected for admin');
    } catch (error) {
      console.error('❌ Cannot inject script (cross-origin):', error);
    }
  };

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'dom_event' && isAdmin) {
        console.log('📡 Sending event to server:', event.data.eventType);
        sendDomEvent(event.data);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isAdmin, sendDomEvent]);

  // Apply events to viewer iframe
  useEffect(() => {
    if (!isAdmin && iframeLoaded && iframeRef.current) {
      const handleServerEvent = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'event' && iframeRef.current) {
            const iframeWindow = iframeRef.current.contentWindow;
            if (!iframeWindow) return;
            
            const payload = data.payload;
            console.log('📺 Viewer received event:', payload.eventType);
            
            switch (payload.eventType) {
              case 'scroll':
                iframeWindow.scrollTo(payload.scrollX || 0, payload.scrollY || 0);
                break;
              case 'navigate':
                if (payload.url && iframeWindow.location.href !== payload.url) {
                  iframeWindow.location.href = payload.url;
                }
                break;
            }
          }
        } catch (error) {
          console.error('Error applying event:', error);
        }
      };
      
      const ws = window.wsConnection;
      if (ws) {
        ws.addEventListener('message', handleServerEvent);
        return () => ws.removeEventListener('message', handleServerEvent);
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
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-popups-to-escape-sandbox"
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