import React, { useState } from 'react';

export default function SocialAuth({ onAuthenticate }) {
  const [handle, setHandle] = useState(null);

  const handleTwitterLogin = () => {
    const mockHandle = "@RichardDimassa";
    setHandle(mockHandle);
    onAuthenticate(mockHandle);
  };

  return (
    <div style={{ 
      padding: '0.85rem 1rem', 
      background: 'linear-gradient(135deg, rgba(24,24,27,0.9) 0%, rgba(9,9,11,0.9) 100%)', 
      border: '1px solid rgba(192, 132, 252, 0.3)', 
      borderRadius: '12px', 
      color: '#e4e4e7',
      boxShadow: 'inset 0 0 10px rgba(192, 132, 252, 0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Identity Vault Link
        </span>
        {handle ? (
          <span style={{ fontSize: '0.65rem', color: '#05030a', backgroundColor: '#22d3ee', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
            VERIFIED
          </span>
        ) : null}
      </div>

      <div style={{ marginTop: '0.5rem' }}>
        {handle ? (
          <div style={{ fontSize: '0.8rem', color: '#22d3ee', fontFamily: 'monospace', fontWeight: 'bold' }}>
            {handle}
          </div>
        ) : (
          <button 
            onClick={handleTwitterLogin}
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              backgroundColor: '#18181b', 
              border: '1px solid rgba(255,255,255,0.2)', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              fontSize: '0.75rem',
              color: '#f43f5e', 
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
            }}
          >
            Authenticate X / Twitter Handle
          </button>
        )}
      </div>
    </div>
  );
}
