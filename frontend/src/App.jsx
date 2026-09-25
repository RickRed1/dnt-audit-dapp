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
    // Main background: Deep Navy Blue
    <div className="min-h-screen bg-[#0a1029] text-[#e5e7eb] p-4 sm:p-8 font-sans">
      <div className="max-w-xl mx-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8 border-b-2 border-[#fbbf24] pb-4">
          <h1 className="text-3xl font-extrabold text-[#fbbf24] tracking-tight">
            DNT <span className='text-[#22d3ee]'>MAGA</span><sup>2</sup> Audit Vault
          </h1>
          <button className="px-5 py-2.5 bg-[#1d4ed8] hover:bg-[#fbbf24] hover:text-[#0a1029] rounded-lg text-sm font-bold text-white transition shadow-lg">
            Connect Wallet
          </button>
        </header>

        {/* Social Identity */}
        <div className="mb-8">
          <SocialAuth onAuthenticate={(handle) => setSocialHandle(handle)} />
        </div>

        {/* Service Selection Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {verticals.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 rounded-lg text-xs font-bold tracking-wider uppercase transition ${
                activeTab === tab 
                  // Active state: Gold Background, Dark Text
                  ? 'bg-[#fbbf24] text-[#0a1029] shadow-lg shadow-[#fbbf24]/30' 
                  // Inactive state: Deep Navy, Cyan Text, Gold Border
                  : 'bg-[#0f172a] text-[#22d3ee] border border-[#fbbf24]/50 hover:bg-[#1d4ed8]/20 hover:text-[#fbbf24]'
              }`}
            >
              {tab.replace(/([A-Z])/g, ' $1').trim()}
            </button>
          ))}
        </div>

        {/* Active Protocol Panel */}
        <div className="p-6 bg-[#111827] border-2 border-[#fbbf24] rounded-2xl shadow-2xl shadow-[#fbbf24]/10">
          <h2 className="text-2xl font-bold mb-2 text-[#22d3ee] capitalize tracking-wide">
            {activeTab} <span className='text-white'>Anchoring Protocol</span>
          </h2>
          <p className="text-sm text-[#d1d5db] mb-6">
            Generate a cryptographically secure SHA-256 proof of your document and anchor it to the Polygon blockchain.
          </p>

          {/* File Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#fbbf24] mb-2">Select Compliance Document:</label>
            <div className="relative">
              <input 
                type="file" 
                onChange={handleFileChange}
                className="block w-full text-sm text-[#e5e7eb] file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-[#fbbf24] file:text-[#0a1029] hover:file:bg-white cursor-pointer bg-[#0a1029] rounded-lg border border-[#fbbf24]/30"
              />
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleAnchorProof}
            className="w-full py-4 bg-[#22d3ee] hover:bg-white text-[#0a1029] font-extrabold rounded-xl transition shadow-2xl shadow-[#22d3ee]/40 text-lg"
          >
            Anchor {activeTab} Proof On-Chain
          </button>

          {/* Status Panel */}
          {statusMessage && (
            <div className="mt-6 p-4 bg-[#0a1029] border border-[#22d3ee] rounded-lg text-xs font-mono text-[#22d3ee] break-words shadow-inner">
              [STATUS] {statusMessage}
            </div>
          )}
        </div>

        {/* Footer Credit */}
        <div className="mt-12 pt-6 border-t-2 border-[#1d4ed8]/30 text-center text-[#525b76] text-xs font-mono">
          <p>Secure Audit Vault &copy; 2024 DNT MAGA2 Protocol.</p>
          <p>Operated by Comptroller / Chief Financial Officer</p>
        </div>

      </div>
    </div>
  );
}
