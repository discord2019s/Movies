import { useWebSocket } from '../hooks/useWebSocket';

const SITES = [
  { 
    id: 'wecima', 
    name: 'WeCima', 
    url: 'https://wecima.rent/',
    description: 'Movies & TV Shows'
  },
  { 
    id: 'arabseed', 
    name: 'ArabSeed', 
    url: 'https://web.cimale3k.space/movies-list',
    description: 'Arabic Content Hub'
  },
  { 
    id: 'imallek', 
    name: 'iMallek', 
    url: 'https://asd.pics/home7/',
    description: 'Streaming Platform'
  },
];

export default function HomeScreen() {
  const { role, navigate, currentState } = useWebSocket();

  const handleSiteSelect = (site) => {
    if (role === 'admin') {
      navigate('watch', site.url);
    }
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>🎬 Choose Your Platform</h1>
        <p>Select a website to start watching together</p>
        {role && (
          <div className="role-indicator">
            {role === 'admin' ? '👑 Admin Mode' : '👁️ Viewer Mode'}
          </div>
        )}
      </div>

      <div className="sites-grid">
        {SITES.map((site) => (
          <div 
            key={site.id} 
            className="site-card"
            onClick={() => handleSiteSelect(site)}
          >
            <h2>{site.name}</h2>
            <p>{site.description}</p>
          </div>
        ))}
      </div>

      {role !== 'admin' && (
        <div className="viewer-overlay">
          <div className="viewer-badge">
            👁️ You are in watch-only mode
          </div>
        </div>
      )}
    </div>
  );
}
