import React, { useState } from 'react';

export default function App() {
  const [docHash, setDocHash] = useState('');
  const [status, setStatus] = useState('');

  const handleNotarize = (e) => {
    e.preventDefault();
    if (!docHash) return;
    setStatus(`Document Hash ${docHash.slice(0, 10)}... submitted for notarization.`);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Decentralized Notary & Tax Auditing Protocol</h1>
      <p>Immutable, non-custodial document notarization & compliance tracking.</p>
      
      <div style={{ border: '1px solid #ccc', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem' }}>
        <h2>Notarize Document</h2>
        <form onSubmit={handleNotarize}>
          <input
            type="text"
            placeholder="Enter SHA-256 / Keccak Document Hash"
            value={docHash}
            onChange={(e) => setDocHash(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', boxSizing: 'border-box' }}
          />
          <button type="submit" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
            Submit Hash On-Chain
          </button>
        </form>
        {status && <p style={{ color: 'green', marginTop: '1rem' }}>{status}</p>}
      </div>
    </div>
  );
}
