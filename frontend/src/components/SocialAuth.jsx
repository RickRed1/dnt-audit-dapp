import React, { useState } from 'react';

export default function SocialAuth({ onAuthenticate }) {
  const [inputHandle, setInputHandle] = useState('');
  const [verifiedHandle, setVerifiedHandle] = useState(null);

  const handleVerify = (e) => {
    e.preventDefault();
    if (!inputHandle) return;
    const cleanHandle = inputHandle.startsWith('@') ? inputHandle : `@${inputHandle}`;
    setVerifiedHandle(cleanHandle);
    onAuthenticate(cleanHandle);
  };

  const handleReset = () => {
    setVerifiedHandle(null);
    setInputHandle('');
    onAuthenticate(null);
  };

  return (
    <div style={{ 
      background: 'rgba(9, 21, 45, 0.8)', 
      border: '1px solid rgba(251, 191, 36, 0.4)', 
      borderRadius: '12px', 
      padding: '0.85rem',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#fbbf24', fontWeight: '800', marginBottom: '0.4rem' }}>
        Identity & Vault Link
      </div>

      {verifiedHandle ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#22d3ee', fontWeight: 'bold' }}>
            {verifiedHandle}
          </span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.6rem', background: '#059669', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
              VERIFIED
            </span>
            <button 
              onClick={handleReset}
              style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', fontSize: '0.6rem', padding: '0.2rem 0.4rem', borderRadius: '4px', cursor: 'pointer' }}
            >
              Disconnect
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleVerify} style={{ display: 'flex', gap: '6px' }}>
          <input 
            type="text" 
            placeholder="Enter X Handle (e.g. @username)"
            value={inputHandle}
            onChange={(e) => setInputHandle(e.target.value)}
            style={{ 
              flex: 1, 
              fontSize: '0.7rem', 
              color: '#e2e8f0', 
              backgroundColor: '#040814', 
              border: '1px solid rgba(34, 211, 238, 0.4)', 
              borderRadius: '6px', 
              padding: '0.4rem 0.6rem' 
            }}
          />
          <button 
            type="submit"
            style={{ 
              background: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)', 
              color: '#040814', 
              fontWeight: 'bold', 
              border: 'none', 
              borderRadius: '6px', 
              padding: '0.4rem 0.75rem', 
              fontSize: '0.65rem',
              cursor: 'pointer'
            }}
          >
            Link X
          </button>
        </form>
      )}
    </div>
  );
}
