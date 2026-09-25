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
    setStatusMessage(`Anchoring ${selectedFile.name} under [${activeTab}] for ${socialHandle || 'Anonymous'}...`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-sans">
      <div className="max-w-xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">DNT Compliance Vault</h1>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition">
            Connect Wallet
          </button>
        </header>

        <SocialAuth onAuthenticate={(handle) => setSocialHandle(handle)} />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {verticals.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition ${
                activeTab === tab 
                  ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' 
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
            >
              {tab.replace(/([A-Z])/g, ' $1').trim()}
            </button>
          ))}
        </div>

        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
          <h2 className="text-lg font-semibold mb-2 capitalize">{activeTab} Anchoring Protocol</h2>
          <p className="text-xs text-zinc-400 mb-6">
            Generate zero-knowledge and SHA-256 integrity proofs locally before anchoring state records to Polygon.
          </p>

          <div className="mb-6">
            <label className="block text-xs font-medium text-zinc-300 mb-2">Select Compliance Document / Record:</label>
            <input 
              type="file" 
              onChange={handleFileChange}
              className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
            />
          </div>

          <button 
            onClick={handleAnchorProof}
            className="w-full py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition shadow-lg shadow-green-500/10"
          >
            Anchor {activeTab} Proof On-Chain
          </button>

          {statusMessage && (
            <div className="mt-4 p-3 bg-black border border-zinc-800 rounded-lg text-xs font-mono text-green-400">
              {statusMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
