import { useEffect, useRef } from 'react';

export default function ViewerSync({ iframeRef, isLive }) {
  const lastEventTime = useRef(Date.now());

  useEffect(() => {
    if (!isLive) return;

    const handleServerEvents = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'event' && iframeRef.current) {
          const iframeWindow = iframeRef.current.contentWindow;
          if (!iframeWindow) return;

          const payload = data.payload;
          lastEventTime.current = Date.now();

          switch (payload.eventType) {
            case 'click':
              // Replay click at same position
              const element = iframeWindow.document.elementFromPoint(100, 100);
              if (element && element.click) {
                element.click();
              }
              break;
              
            case 'scroll':
              iframeWindow.scrollTo(payload.scrollX || 0, payload.scrollY || 0);
              break;
              
            case 'input':
              const inputElement = iframeWindow.document.activeElement;
              if (inputElement && inputElement.value !== undefined) {
                inputElement.value = payload.value;
                inputElement.dispatchEvent(new Event('input', { bubbles: true }));
              }
              break;
              
            case 'navigate':
              if (payload.url && iframeWindow.location.href !== payload.url) {
                iframeWindow.location.href = payload.url;
              }
              break;
          }
        }
      } catch (error) {
        console.error('Error processing sync event:', error);
      }
    };

    window.addEventListener('message', handleServerEvents);
    return () => window.removeEventListener('message', handleServerEvents);
  }, [isLive, iframeRef]);

  return null;
}