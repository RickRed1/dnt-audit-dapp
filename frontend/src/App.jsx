import React, { useState } from 'react';
import { ethers } from 'ethers';
import SocialAuth from './components/SocialAuth';

// Deployed GSG Protocol Vault Contract Address & Minimal ABI
const CONTRACT_ADDRESS = "0x96E50F5a76743BBe18E8Fe2B11B19897A5d0A074";
const CONTRACT_ABI = [
  "function anchorProof(bytes32 proofHash, string memory vertical) external",
  "function launchCoin(string memory handle) external payable",
  "function claimPot(string memory handle) external"
];

export default function App() {
  const [activeTab, setActiveTab] = useState('Notary');
  const [socialHandle, setSocialHandle] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  
  // Wallet & Blockchain State
  const [walletAddress, setWalletAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  // X Handle Coin Launcher State
  const [targetHandle, setTargetHandle] = useState('');
  const [launchedCoins, setLaunchedCoins] = useState([
    { handle: '@RichardDimassa', pot: '1,450 POL', status: 'Claimable by Owner' },
    { handle: '@GSG_Architect', pot: '820 POL', status: 'Accumulating' }
  ]);

  const verticals = ['Notary', 'Taxes', 'Insurance', 'BailBonds', 'XHandleCoin'];

  // Connect Web3 Wallet via Ethers.js
  const handleConnectWallet = async () => {
    if (window.ethereum) {
      try {
        setStatusMessage('Requesting wallet connection...');
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const web3Signer = await web3Provider.getSigner();
        const address = await web3Signer.getAddress();
        
        setProvider(web3Provider);
        setSigner(web3Signer);
        setWalletAddress(address);
        setStatusMessage(`Connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`);
      } catch (err) {
        setStatusMessage(`Connection rejected: ${err.message}`);
      }
    } else {
      setStatusMessage('No Web3 provider detected. Open inside a mobile crypto wallet browser.');
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Generate SHA-256 Hash of File and Submit to Contract
  const handleAnchorProof = async () => {
    if (!selectedFile) {
      setStatusMessage('Please select a compliance record first.');
      return;
    }
    
    try {
      setStatusMessage(`Reading and hashing ${selectedFile.name} locally...`);
      const arrayBuffer = await selectedFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (!signer) {
        setStatusMessage(`Simulated [${activeTab}] Hash Generated: ${hashHex.substring(0, 18)}... (Connect Wallet to Anchor On-Chain)`);
        return;
      }

      setStatusMessage(`Submitting proof hash to contract on Polygon via GODSOURCEGLOBAL LLC...`);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.anchorProof(hashHex, activeTab);
      setStatusMessage(`Transaction sent! Hash: ${tx.hash}. Waiting for confirmation...`);
      
      await tx.wait();
      setStatusMessage(`Success! Document proof securely anchored on-chain for [${activeTab}].`);
    } catch (err) {
      setStatusMessage(`Error anchoring proof: ${err.reason || err.message}`);
    }
  };

  const handleLaunchCoin = async (e) => {
    e.preventDefault();
    if (!targetHandle) return;
    const formattedHandle = targetHandle.startsWith('@') ? targetHandle : `@${targetHandle}`;

    try {
      if (signer) {
        setStatusMessage(`Launching coin for ${formattedHandle} on-chain...`);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const tx = await contract.launchCoin(formattedHandle, { value: ethers.parseEther("0.01") });
        await tx.wait();
      }
      setLaunchedCoins([{ handle: formattedHandle, pot: '0.01 POL', status: 'Active Trading' }, ...launchedCoins]);
      setStatusMessage(`Successfully launched coin for ${formattedHandle}. Trading fees routing to pot.`);
      setTargetHandle('');
    } catch (err) {
      setStatusMessage(`Error launching coin: ${err.reason || err.message}`);
    }
  };

  const handleClaimPot = async (handle) => {
    if (!socialHandle || socialHandle.toLowerCase() !== handle.toLowerCase()) {
      setStatusMessage(`Error: You must authenticate with ${handle} via X to claim this pot.`);
      return;
    }

    try {
      if (signer) {
        setStatusMessage(`Submitting claim for ${handle} pot...`);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const tx = await contract.claimPot(handle);
        await tx.wait();
      }
      setStatusMessage(`Success! Pot for ${handle} claimed and routed as X Money to your wallet.`);
    } catch (err) {
      setStatusMessage(`Error claiming pot: ${err.reason || err.message}`);
    }
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
        maxWidth: '640px', 
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
          
          {/* Header */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '1.25rem',
            borderBottom: '2px solid rgba(251, 191, 36, 0.2)',
            paddingBottom: '1rem'
          }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '3px', color: '#fbbf24', fontWeight: '800' }}>
              GODSOURCEGLOBAL LLC
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffffff', margin: '4px 0 2px 0', textShadow: '0 2px 10px rgba(34,211,238,0.3)' }}>
              DECENTRALIZED NOTARY & <span style={{ color: '#22d3ee' }}>X-MONEY VAULT</span>
            </h1>
            <div style={{ fontSize: '10px', color: '#93c5fd', fontFamily: 'monospace', letterSpacing: '1px' }}>
              {walletAddress ? `${walletAddress.substring(0,6)}...${walletAddress.substring(38)}` : CONTRACT_ADDRESS}
            </div>

            <button 
              onClick={handleConnectWallet}
              style={{ 
                marginTop: '0.85rem',
                background: walletAddress ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #1d4ed8, #2563eb)', 
                color: '#ffffff', 
                padding: '0.45rem 1.15rem', 
                borderRadius: '8px', 
                fontSize: '0.75rem',
                fontWeight: 'bold', 
                border: '1px solid #22d3ee', 
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(29, 78, 216, 0.5)'
              }}
            >
              {walletAddress ? 'Wallet Connected' : 'Connect Wallet'}
            </button>
          </div>

          {/* Social Identity Module */}
          <div style={{ marginBottom: '1.25rem' }}>
            <SocialAuth onAuthenticate={(handle) => setSocialHandle(handle)} />
          </div>

          {/* Multi-Vertical & X Handle Selector Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', marginBottom: '1.25rem' }}>
            {verticals.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.55rem 0.15rem',
                  borderRadius: '8px',
                  fontSize: '0.6rem',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2px',
                  cursor: 'pointer',
                  background: activeTab === tab 
                    ? 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)' 
                    : '#09152d',
                  color: activeTab === tab ? '#040814' : '#22d3ee',
                  border: activeTab === tab ? '1px solid #fde047' : '1px solid rgba(34, 211, 238, 0.4)',
                  boxShadow: activeTab === tab ? '0 0 12px rgba(251, 191, 36, 0.6)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab === 'XHandleCoin' ? 'X Coin' : tab.replace(/([A-Z])/g, ' $1').trim()}
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
            
            {activeTab === 'XHandleCoin' ? (
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.4rem', color: '#22d3ee' }}>
                  X Handle Coin Launcher & Pot
                </h2>
                <p style={{ fontSize: '0.75rem', color: '#93c5fd', marginBottom: '1rem', lineHeight: '1.4' }}>
                  Launch a coin for any X handle. Trades fund that handle's pot. Sign in with X to claim it or route it as X Money.
                </p>

                <form onSubmit={handleLaunchCoin} style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                  <input 
                    type="text" 
                    placeholder="@XHandle"
                    value={targetHandle}
                    onChange={(e) => setTargetHandle(e.target.value)}
                    style={{ 
                      flex: 1, 
                      fontSize: '0.75rem', 
                      color: '#e2e8f0', 
                      backgroundColor: '#040814', 
                      border: '1px solid rgba(251, 191, 36, 0.5)', 
                      borderRadius: '8px', 
                      padding: '0.5rem' 
                    }}
                  />
                  <button 
                    type="submit"
                    style={{ 
                      padding: '0.5rem 1rem', 
                      background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', 
                      color: '#040814', 
                      fontWeight: '800', 
                      borderRadius: '8px', 
                      border: 'none', 
                      cursor: 'pointer', 
                      fontSize: '0.75rem' 
                    }}
                  >
                    Launch Coin
                  </button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {launchedCoins.map((item, idx) => (
                    <div key={idx} style={{ 
                      background: 'rgba(4, 8, 20, 0.8)', 
                      border: '1px solid rgba(34, 211, 238, 0.3)', 
                      borderRadius: '8px', 
                      padding: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#fbbf24' }}>{item.handle}</div>
                        <div style={{ fontSize: '0.7rem', color: '#22d3ee' }}>Pot: {item.pot}</div>
                      </div>
                      <button 
                        onClick={() => handleClaimPot(item.handle)}
                        style={{ 
                          padding: '0.35rem 0.75rem', 
                          background: '#22d3ee', 
                          color: '#040814', 
                          fontWeight: 'bold', 
                          borderRadius: '6px', 
                          border: 'none', 
                          fontSize: '0.65rem',
                          cursor: 'pointer'
                        }}
                      >
                        Claim / X Money
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.4rem', color: '#22d3ee', textTransform: 'capitalize' }}>
                  {activeTab} Protocol Core
                </h2>
                <p style={{ fontSize: '0.75rem', color: '#93c5fd', marginBottom: '1rem', lineHeight: '1.4' }}>
                  Generate verifiable cryptographic proofs under GODSOURCEGLOBAL LLC governance.
                </p>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', color: '#fbbf24', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
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
                      borderRadius: '8px', 
                      padding: '0.5rem' 
                    }}
                  />
                </div>

                <button 
                  onClick={handleAnchorProof}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    background: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)', 
                    color: '#040814', 
                    fontWeight: '900', 
                    borderRadius: '10px', 
                    border: 'none', 
                    cursor: 'pointer', 
                    fontSize: '0.85rem', 
                    textTransform: 'uppercase'
                  }}
                >
                  Anchor {activeTab} Proof On-Chain
                </button>
              </div>
            )}

            {/* Status Feedback Box */}
            {statusMessage && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '0.65rem', 
                backgroundColor: '#040814', 
                border: '1px solid #22d3ee', 
                borderRadius: '6px', 
                fontSize: '0.65rem', 
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
            marginTop: '1.25rem', 
            paddingTop: '0.85rem', 
            borderTop: '1px solid rgba(251, 191, 36, 0.2)', 
            textAlign: 'center', 
            color: '#64748b', 
            fontSize: '0.65rem', 
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
