import React, { useState } from 'react';
import SocialAuth from './components/SocialAuth';

export default function App() {
  const [activeTab, setActiveTab] = useState('Notary');
  const [socialHandle, setSocialHandle] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const verticals = ['Notary', 'Taxes', 'Insurance', 'BailBonds'];

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleAnchorProof = () => {
    if (!selectedFile) {
      setStatusMessage('Please select a document first.');
      return;
    }
    setStatusMessage(`Anchoring ${selectedFile.name} proof for ${socialHandle || 'User'}...`);
  };

  return (
    <div style={{ backgroundColor: '#0a1029', color: '#e5e7eb', minHeight: '100vh', padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid #fbbf24', paddingBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fbbf24', margin: 0 }}>
            DNT <span style={{ color: '#22d3ee' }}>MAGA</span>² Audit Vault
          </h1>
          <button style={{ backgroundColor: '#1d4ed8', color: '#ffffff', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
            Connect Wallet
          </button>
        </header>

        {/* Social Identity */}
        <div style={{ marginBottom: '1.5rem' }}>
          <SocialAuth onAuthenticate={(handle) => setSocialHandle(handle)} />
        </div>

        {/* Service Selection Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {verticals.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.75rem 0.5rem',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                cursor: 'pointer',
                backgroundColor: activeTab === tab ? '#fbbf24' : '#0f172a',
                color: activeTab === tab ? '#0a1029' : '#22d3ee',
                border: activeTab === tab ? 'none' : '1px solid rgba(251, 191, 36, 0.5)',
                boxShadow: activeTab === tab ? '0 10px 15px -3px rgba(251, 191, 36, 0.3)' : 'none'
              }}
            >
              {tab.replace(/([A-Z])/g, ' $1').trim()}
            </button>
          ))}
        </div>

        {/* Active Protocol Panel */}
        <div style={{ backgroundColor: '#111827', border: '2px solid #fbbf24', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(251, 191, 36, 0.1)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#22d3ee', textTransform: 'capitalize' }}>
            {activeTab} <span style={{ color: '#ffffff' }}>Anchoring Protocol</span>
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#d1d5db', marginBottom: '1.5rem' }}>
            Generate a cryptographically secure SHA-256 proof of your document and anchor it to the Polygon blockchain.
          </p>

          {/* File Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#fbbf24', marginBottom: '0.5rem' }}>Select Compliance Document:</label>
            <input 
              type="file" 
              onChange={handleFileChange}
              style={{ width: '100%', fontSize: '0.875rem', color: '#e5e7eb', backgroundColor: '#0a1029', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '0.5rem', padding: '0.5rem' }}
            />
          </div>

          {/* Action Button */}
          <button 
            onClick={handleAnchorProof}
            style={{ width: '100%', padding: '1rem', backgroundColor: '#22d3ee', color: '#0a1029', fontWeight: '800', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 10px 25px rgba(34, 211, 238, 0.4)' }}
          >
            Anchor {activeTab} Proof On-Chain
          </button>

          {/* Status Panel */}
          {statusMessage && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#0a1029', border: '1px solid #22d3ee', borderRadius: '0.5rem', fontSize: '0.75rem', fontFamily: 'monospace', color: '#22d3ee', wordBreak: 'break-all' }}>
              [STATUS] {statusMessage}
            </div>
          )}
        </div>

        {/* Footer Credit */}
        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '2px solid rgba(29, 78, 216, 0.3)', textAlign: 'center', color: '#525b76', fontSize: '0.75rem', fontFamily: 'monospace' }}>
          <p>Secure Audit Vault &copy; 2026 DNT MAGA² Protocol.</p>
          <p>Operated by Comptroller / Chief Financial Officer</p>
        </div>

      </div>
    </div>
  );
}
