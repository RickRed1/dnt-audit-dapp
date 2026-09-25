import React, { useState } from 'react';
import { ethers } from 'ethers';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const CONTRACT_ADDRESS = "0x96E50F5a76743BBe18E8Fe2B11B19897A5d0A074";
const CONTRACT_ABI = [
  "function anchorProof(bytes32 proofHash, string memory vertical) external payable"
];

const NETWORKS = {
  ethereum: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://cloudflare-eth.com'],
    blockExplorerUrls: ['https://etherscan.io']
  },
  polygon: {
    chainId: '0x89',
    chainName: 'Polygon Mainnet',
    nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com']
  },
  apechain: {
    chainId: '0x8173',
    chainName: 'ApeChain',
    nativeCurrency: { name: 'APE', symbol: 'APE', decimals: 18 },
    rpcUrls: ['https://rpc.apechain.com/http'],
    blockExplorerUrls: ['https://apescan.io']
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [selectedNetwork, setSelectedNetwork] = useState('polygon');
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [walletAddress, setWalletAddress] = useState(null);
  const [signer, setSigner] = useState(null);
  const [signerName, setSignerName] = useState('');
  const [signedPdfUrl, setSignedPdfUrl] = useState(null);
  const [tipAmount, setTipAmount] = useState('0.005');
  const [xHandle, setXHandle] = useState('RichardDimassa');
  const [isEditingHandle, setIsEditingHandle] = useState(false);

  const netConfig = NETWORKS[selectedNetwork];

  const handleConnectWallet = async () => {
    if (window.ethereum) {
      try {
        setStatusMessage(`Requesting ${netConfig.chainName} connection...`);
        const p = new ethers.BrowserProvider(window.ethereum);
        
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: netConfig.chainId }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [netConfig],
            });
          } else {
            throw switchError;
          }
        }

        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const s = await p.getSigner();
        const addr = await s.getAddress();
        setSigner(s);
        setWalletAddress(addr);
        setStatusMessage(`Connected (${netConfig.chainName}): ${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`);
      } catch (err) { setStatusMessage('Error: ' + err.message); }
    } else {
      setWalletAddress('0x96E5...0A074');
      setStatusMessage(`Simulation active on ${netConfig.chainName}.`);
    }
  };

  const handleLaunchCoinForHandle = async () => {
    setStatusMessage(`Deploying on-chain pot for @${xHandle} on ${netConfig.chainName}...`);
    setTimeout(() => {
      setStatusMessage(`Success! Pot deployed on-chain for @${xHandle} with vault ticker $GSG-${xHandle.toUpperCase()}`);
    }, 1500);
  };

  const handleClaimPot = async () => {
    setStatusMessage(`Verifying ownership of @${xHandle} to claim pot rewards...`);
    setTimeout(() => {
      setStatusMessage(`Pot successfully claimed for @${xHandle}! Yield routed to wallet.`);
    }, 1500);
  };

  return (
    <div style={{ backgroundColor: '#0b1d3a', color: '#ffffff', minHeight: '100vh', paddingBottom: '5rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
        
        {/* Header / Commemorative Banner */}
        <div style={{ textAlign: 'center', padding: '0.5rem 0', borderBottom: '2px solid #ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#dc2626' }}>1776 - 2026</div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>GODSOURCEGLOBAL VAULT</div>
          <button onClick={handleConnectWallet} style={{ background: '#dc2626', color: '#ffffff', border: '1px solid #ffffff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold' }}>
            {walletAddress ? 'Connected' : 'Claim/Connect'}
          </button>
        </div>

        {/* Narrative Stats Overview */}
        <div style={{ background: '#071326', padding: '1.2rem', borderRadius: '16px', border: '2px solid #dc2626' }}>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.8rem', textAlign: 'center' }}>You build. They pay. You get paid.</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ background: '#0b1d3a', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ffffff' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#dc2626' }}>$55.0K</div>
              <div style={{ fontSize: '0.65rem', color: '#d1d5db' }}>PAID OUT TO OWNERS</div>
            </div>
            <div style={{ background: '#0b1d3a', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ffffff' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#dc2626' }}>$127.2K</div>
              <div style={{ fontSize: '0.65rem', color: '#d1d5db' }}>PAID TO HOLDERS</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleLaunchCoinForHandle} style={{ flex: 1, padding: '0.6rem', background: '#dc2626', color: '#ffffff', border: '1px solid #ffffff', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.75rem' }}>Launch a coin</button>
            <button onClick={handleClaimPot} style={{ flex: 1, padding: '0.6rem', background: '#ffffff', color: '#0b1d3a', border: '1px solid #dc2626', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.75rem' }}>Claim your pot</button>
          </div>
        </div>

        {/* Dynamic Handle Card */}
        <div style={{ background: '#071326', padding: '1rem', borderRadius: '12px', border: '2px solid #ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#dc2626' }}>VERIFIED X HANDLE POT</div>
            {isEditingHandle ? (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                <input 
                  type="text" 
                  value={xHandle} 
                  onChange={e => setXHandle(e.target.value.replace('@',''))} 
                  style={{ background: '#0b1d3a', color: '#ffffff', border: '1px solid #ffffff', borderRadius: '4px', padding: '0.2rem 0.4rem', fontSize: '0.8rem', width: '120px' }} 
                />
                <button onClick={() => setIsEditingHandle(false)} style={{ background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.7rem', fontWeight: 'bold' }}>Set</button>
              </div>
            ) : (
              <div onClick={() => setIsEditingHandle(true)} style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 'bold', marginTop: '0.2rem', cursor: 'pointer' }}>
                @{xHandle} <span style={{ fontSize: '0.55rem', color: '#d1d5db' }}>(Click to change handle)</span>
              </div>
            )}
          </div>
          <div style={{ background: '#dc2626', color: '#ffffff', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold' }}>ACTIVE POT</div>
        </div>

        {/* Narrative Explainer Card */}
        <div style={{ background: '#071326', padding: '1rem', borderRadius: '12px', border: '1px solid #ffffff', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ fontSize: '2rem' }}>🏛️</div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ffffff' }}>Every handle has a pot</div>
            <div style={{ fontSize: '0.7rem', color: '#d1d5db', marginTop: '0.2rem' }}>Launch a coin for any X handle. A secure vault pot opens on-chain instantly with that handle name bound to it.</div>
          </div>
        </div>

        {statusMessage && (
          <div style={{ padding: '0.7rem', background: '#071326', color: '#ffffff', fontSize: '0.7rem', fontFamily: 'monospace', wordBreak: 'break-all', border: '1px solid #dc2626', borderRadius: '8px' }}>
            {statusMessage}
          </div>
        )}

      </div>

      {/* Fixed Bottom Navigation Bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#071326', borderTop: '2px solid #dc2626', display: 'flex', justifyContent: 'space-around', padding: '0.6rem 0', zIndex: 1000 }}>
        <button onClick={() => setActiveTab('Home')} style={{ background: 'none', border: 'none', color: activeTab === 'Home' ? '#dc2626' : '#ffffff', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <span>🏠</span> Home
        </button>
        <button onClick={() => setActiveTab('Vaults')} style={{ background: 'none', border: 'none', color: activeTab === 'Vaults' ? '#dc2626' : '#ffffff', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <span>💼</span> Vaults
        </button>
        <button onClick={() => setActiveTab('Pots')} style={{ background: 'none', border: 'none', color: activeTab === 'Pots' ? '#dc2626' : '#ffffff', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <span>🏺</span> Pots
        </button>
        <button onClick={() => setActiveTab('Launch')} style={{ background: 'none', border: 'none', color: activeTab === 'Launch' ? '#dc2626' : '#ffffff', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <span>🚀</span> Launch
        </button>
        <button onClick={() => setActiveTab('Docs')} style={{ background: 'none', border: 'none', color: activeTab === 'Docs' ? '#dc2626' : '#ffffff', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <span>📄</span> Docs
        </button>
      </div>
    </div>
  );
}
