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
      backgroundColor: '#05030a', 
      backgroundImage: 'radial-gradient(circle at 50% 20%, #1a0b2e 0%, #05030a 70%), linear-gradient(135deg, rgba(236,72,153,0.08) 0%, rgba(34,211,238,0.08) 100%)',
      color: '#f3f4f6', 
      minHeight: '100vh', 
      padding: '1.5rem', 
      fontFamily: 'sans-serif' 
    }}>
      {/* Outer Holographic Collector's Slab Frame */}
      <div style={{ 
        maxWidth: '640px', 
        margin: '0 auto', 
        background: 'linear-gradient(135deg, #27272a 0%, #09090b 50%, #18181b 100%)',
        padding: '6px', 
        borderRadius: '24px', 
        boxShadow: '0 25px 60px rgba(0,0,0,0.9), inset 0 0 15px rgba(236, 72, 153, 0.3), inset 0 0 2px 2px rgba(255,255,255,0.2)' 
      }}>
        
        {/* Inner Card Container */}
        <div style={{ 
          backgroundColor: '#0a0910', 
          borderRadius: '20px', 
          padding: '1.5rem', 
          border: '1px solid rgba(255, 255, 255, 0.12)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          
          {/* Holographic Header Tag */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            paddingBottom: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', color: '#c084fc', fontWeight: 'bold' }}>
                GODSOURCEGLOBAL LLC
              </div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffffff', margin: '2px 0 0 0', textShadow: '0 2px 10px rgba(236,72,153,0.4)' }}>
                GSG <span style={{ background: 'linear-gradient(90deg, #ec4899, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>COLLECTOR'S VAULT</span>
              </h1>
            </div>
            <button style={{ 
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', 
              color: '#ffffff', 
              padding: '0.5rem 1rem', 
              borderRadius: '8px', 
              fontSize: '0.75rem',
              fontWeight: 'bold', 
              border: '1px solid rgba(255,255,255,0.2)', 
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
            }}>
              Connect Wallet
            </button>
          </div>

          {/* Social Identity Module */}
          <div style={{ marginBottom: '1.25rem' }}>
            <SocialAuth onAuthenticate={(handle) => setSocialHandle(handle)} />
          </div>

          {/* Multi-Vertical Holographic Selector Tabs */}
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
                    : 'rgba(24, 24, 27, 0.8)',
                  color: activeTab === tab ? '#000000' : '#22d3ee',
                  border: activeTab === tab ? '1px solid #fde047' : '1px solid rgba(34, 211, 238, 0.3)',
                  boxShadow: activeTab === tab ? '0 0 15px rgba(251, 191, 36, 0.5)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.replace(/([A-Z])/g, ' $1').trim()}
              </button>
            ))}
          </div>

          {/* Active Protocol Frame (Hyper-Graphic Slab Card) */}
          <div style={{ 
            background: 'linear-gradient(145deg, rgba(24,24,27,0.9) 0%, rgba(9,9,11,0.95) 100%)', 
            border: '1px solid rgba(236, 72, 153, 0.4)', 
            borderRadius: '16px', 
            padding: '1.25rem', 
            boxShadow: 'inset 0 0 20px rgba(236, 72, 153, 0.08), 0 10px 30px rgba(0,0,0,0.5)' 
          }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#ec4899', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{activeTab}</span> <span style={{ color: '#ffffff', fontWeight: '300' }}>Protocol Core</span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '1.25rem', lineHeight: '1.4' }}>
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
                  color: '#e4e4e7', 
                  backgroundColor: '#09090b', 
                  border: '1px solid rgba(251, 191, 36, 0.4)', 
                  borderRadius: '10px', 
                  padding: '0.5rem' 
                }}
              />
            </div>

            {/* Neon Action Button */}
            <button 
              onClick={handleAnchorProof}
              style={{ 
                width: '100%', 
                padding: '0.85rem', 
                background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)', 
                color: '#05030a', 
                fontWeight: '900', 
                borderRadius: '12px', 
                border: 'none', 
                cursor: 'pointer', 
                fontSize: '0.9rem', 
                boxShadow: '0 0 20px rgba(34, 211, 238, 0.4)',
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
                backgroundColor: '#05030a', 
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
            borderTop: '1px solid rgba(255,255,255,0.08)', 
            textAlign: 'center', 
            color: '#71717a', 
            fontSize: '0.7rem', 
            fontFamily: 'monospace' 
          }}>
            <p style={{ margin: '0 0 2px 0' }}>GODSOURCEGLOBAL LLC &copy; 2026 Collector's Series</p>
            <p style={{ margin: 0, color: '#c084fc' }}>Founder, CEO & Lead Systems Architect</p>
          </div>

        </div>
      </div>
    </div>
  );
}
