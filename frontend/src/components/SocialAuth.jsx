import React, { useState } from 'react';

export default function SocialAuth({ onAuthenticate }) {
  const [handle, setHandle] = useState(null);

  const handleTwitterLogin = () => {
    const mockHandle = "@RichardDimassa";
    setHandle(mockHandle);
    onAuthenticate(mockHandle);
  };

  return (
    <div style={{ padding: '1rem', backgroundColor: '#0a1029', border: '1px solid rgba(29, 78, 216, 0.5)', borderRadius: '0.75rem', color: '#e5e7eb', boxShadow: '0 10px 25px rgba(29, 78, 216, 0.2)' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#fbbf24', marginTop: 0 }}>Handle & Wallet Identity</h3>
      {handle ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#22d3ee', fontFamily: 'monospace' }}>Linked: {handle}</span>
          <span style={{ fontSize: '0.75rem', color: '#0a1029', backgroundColor: '#22d3ee', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontWeight: 'bold' }}>Verified</span>
        </div>
      ) : (
        <button 
          onClick={handleTwitterLogin}
          style={{ width: '100%', padding: '0.5rem', backgroundColor: '#111827', border: '1px solid #fbbf24', borderRadius: '0.5rem', fontWeight: '500', color: '#fbbf24', cursor: 'pointer' }}
        >
          Sign in with X to Link Handle
        </button>
      )}
    </div>
  );
}
