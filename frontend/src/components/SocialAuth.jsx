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
      background: 'linear-gradient(135deg, rgba(11,28,61,0.9) 0%, rgba(4,8,20,0.9) 100%)', 
      border: '1px solid rgba(251, 191, 36, 0.4)', 
      borderRadius: '12px', 
      color: '#f3f4f6',
      boxShadow: 'inset 0 0 15px rgba(251, 191, 36, 0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Identity & Vault Link
        </span>
        {handle ? (
          <span style={{ fontSize: '0.65rem', color: '#040814', backgroundColor: '#22d3ee', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
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
              backgroundColor: '#09152d', 
              border: '1px solid #fbbf24', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              fontSize: '0.75rem',
              color: '#fbbf24', 
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
