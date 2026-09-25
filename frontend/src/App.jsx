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
      setStatusMessage('Please select a compliance record first.');
      return;
    }
    setStatusMessage(`Anchoring cryptographic proof for ${selectedFile.name} under [${activeTab}] via GODSOURCEGLOBAL LLC...`);
  };

  return (
    <div style={{ 
      backgroundColor: '#040814', 
      backgroundImage: 'radial-gradient(circle at 50% 15%, #0b1c3d 0%, #040814 75%), linear-gradient(135deg, rgba(34,211,238,0.05) 0%, rgba(251,191,36,0.05) 100%)',
      color: '#f3f4f6', 
      minHeight: '100vh', 
      padding: '1.25rem', 
      fontFamily: 'sans-serif' 
    }}>
      {/* Outer Polished Gold & Royal Blue Metallic Slab Frame */}
      <div style={{ 
        maxWidth: '620px', 
        margin: '0 auto', 
        background: 'linear-gradient(135deg, #fbbf24 0%, #1e3a8a 30%, #09152d 70%, #fbbf24 100%)',
        padding: '5px', 
        borderRadius: '24px', 
        boxShadow: '0 25px 60px rgba(0,0,0,0.9), inset 0 0 20px rgba(251, 191, 36, 0.4)' 
      }}>
        
        {/* Inner Card Container */}
        <div style={{ 
          backgroundColor: '#060d21', 
          borderRadius: '20px', 
          padding: '1.5rem', 
          border: '1px solid rgba(251, 191, 36, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          
          {/* Header with Emblem & Title */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '1.5rem',
            borderBottom: '2px solid rgba(251, 191, 36, 0.2)',
            paddingBottom: '1.25rem'
          }}>
            <div style={{ 
              width: '110px', 
              height: '110px', 
              borderRadius: '50%', 
              border: '3px solid #fbbf24', 
              boxShadow: '0 0 25px rgba(34, 211, 238, 0.4), inset 0 0 15px rgba(251, 191, 36, 0.5)',
              overflow: 'hidden',
              marginBottom: '0.85rem',
              backgroundColor: '#020617'
            }}>
              {/* Note: Ensure your emblem image is placed in public/emblem.png or referenced via URL */}
              <img 
                src="emblem.png" 
                alt="GODSOURCEGLOBAL Emblem" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e)=>{e.target.style.display='none';}}
              />
            </div>

            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '3px', color: '#fbbf24', fontWeight: '800' }}>
              GODSOURCEGLOBAL LLC
            </div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#ffffff', margin: '4px 0 2px 0', textShadow: '0 2px 10px rgba(34,211,238,0.3)' }}>
              DECENTRALIZED NOTARY & <span style={{ color: '#22d3ee' }}>AUDIT VAULT</span>
            </h1>
            <div style={{ fontSize: '11px', color: '#93c5fd', fontFamily: 'monospace', letterSpacing: '1px' }}>
              0x96E50F5a76743BBe18E8Fe2B11B19897A5d0A074
            </div>

            <button style={{ 
              marginTop: '1rem',
              background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', 
              color: '#ffffff', 
              padding: '0.5rem 1.25rem', 
              borderRadius: '8px', 
              fontSize: '0.75rem',
              fontWeight: 'bold', 
              border: '1px solid #22d3ee', 
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(29, 78, 216, 0.5)'
            }}>
              Connect Wallet
            </button>
          </div>

          {/* Social Identity Module */}
          <div style={{ marginBottom: '1.25rem' }}>
            <SocialAuth onAuthenticate={(handle) => setSocialHandle(handle)} />
          </div>

          {/* Multi-Vertical Selector Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '1.5rem' }}>
            {verticals.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.65rem 0.25rem',
                  borderRadius: '10px',
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  background: activeTab === tab 
                    ? 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)' 
                    : '#09152d',
                  color: activeTab === tab ? '#040814' : '#22d3ee',
                  border: activeTab === tab ? '1px solid #fde047' : '1px solid rgba(34, 211, 238, 0.4)',
                  boxShadow: activeTab === tab ? '0 0 15px rgba(251, 191, 36, 0.6)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.replace(/([A-Z])/g, ' $1').trim()}
              </button>
            ))}
          </div>

          {/* Active Protocol Panel */}
          <div style={{ 
            background: 'linear-gradient(145deg, rgba(11,28,61,0.9) 0%, rgba(4,8,20,0.95) 100%)', 
            border: '2px solid rgba(251, 191, 36, 0.4)', 
            borderRadius: '16px', 
            padding: '1.25rem', 
            boxShadow: 'inset 0 0 20px rgba(34, 211, 238, 0.08), 0 10px 30px rgba(0,0,0,0.6)' 
          }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#22d3ee', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{activeTab}</span> <span style={{ color: '#ffffff', fontWeight: '300' }}>Protocol Core</span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#93c5fd', marginBottom: '1.25rem', lineHeight: '1.4' }}>
              Generate verifiable zero-knowledge and SHA-256 integrity proofs locally under GODSOURCEGLOBAL LLC governance.
            </p>

            {/* File Input Zone */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#fbbf24', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Target Compliance Document:
              </label>
              <input 
                type="file" 
                onChange={handleFileChange}
                style={{ 
                  width: '100%', 
                  fontSize: '0.75rem', 
                  color: '#e2e8f0', 
                  backgroundColor: '#040814', 
                  border: '1px solid rgba(251, 191, 36, 0.5)', 
                  borderRadius: '10px', 
                  padding: '0.5rem' 
                }}
              />
            </div>

            {/* Action Button */}
            <button 
              onClick={handleAnchorProof}
              style={{ 
                width: '100%', 
                padding: '0.85rem', 
                background: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)', 
                color: '#040814', 
                fontWeight: '900', 
                borderRadius: '12px', 
                border: 'none', 
                cursor: 'pointer', 
                fontSize: '0.9rem', 
                boxShadow: '0 0 20px rgba(34, 211, 238, 0.5)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              Anchor {activeTab} Proof On-Chain
            </button>

            {/* Status Feedback Box */}
            {statusMessage && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '0.75rem', 
                backgroundColor: '#040814', 
                border: '1px solid #22d3ee', 
                borderRadius: '8px', 
                fontSize: '0.7rem', 
                fontFamily: 'monospace', 
                color: '#22d3ee', 
                wordBreak: 'break-all' 
              }}>
                [GSG_STATUS]: {statusMessage}
              </div>
            )}
          </div>

          {/* Corporate Footer */}
          <div style={{ 
            marginTop: '1.5rem', 
            paddingTop: '1rem', 
            borderTop: '1px solid rgba(251, 191, 36, 0.2)', 
            textAlign: 'center', 
            color: '#64748b', 
            fontSize: '0.7rem', 
            fontFamily: 'monospace' 
          }}>
            <p style={{ margin: '0 0 2px 0', color: '#fbbf24' }}>GODSOURCEGLOBAL LLC &copy; 2026</p>
            <p style={{ margin: 0, color: '#22d3ee' }}>Founder, CEO & Lead Systems Architect</p>
          </div>

        </div>
      </div>
    </div>
  );
}
