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
  const [activeTab, setActiveTab] = useState('Notary');
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

  const verticals = ['Notary', 'SignAndSeal', 'Taxes', 'Insurance', 'BailBonds', 'XHandleCoin'];
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

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setSignedPdfUrl(null);
  };

  const handleSignAndSealPdf = async () => {
    if (!selectedFile || !signerName) {
      setStatusMessage('Please provide both a document and your signer name.');
      return;
    }
    try {
      setStatusMessage('Signing PDF & Routing Fee...');
      const buf = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buf);
      const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      const page = pdfDoc.getPages()[pdfDoc.getPages().length - 1];
      page.drawText('SIGNED BY: ' + signerName + ' (/@' + xHandle + ' | ' + netConfig.chainName + ')', { x: 50, y: 60, size: 10, font, color: rgb(0.85, 0.1, 0.1) });
      const bytes = await pdfDoc.save();
      setSignedPdfUrl(URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })));
      
      const hashBuf = await crypto.subtle.digest('SHA-256', bytes);
      const hashHex = '0x' + Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      if (!signer) {
        setStatusMessage('Signed for @' + xHandle + ' (' + netConfig.chainName + ' Sim)');
        return;
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const valueToSend = ethers.parseEther(tipAmount || '0');
      const tx = await contract.anchorProof(hashHex, 'SignAndSeal:' + netConfig.nativeCurrency.symbol, { value: valueToSend });
      await tx.wait();
      setStatusMessage(`Success! Sealed and fee routed on ${netConfig.chainName} for @${xHandle}`);
    } catch (err) { setStatusMessage('Error: ' + err.message); }
  };

  const handleAnchorProof = async () => {
    if (!selectedFile) { setStatusMessage('Select a file first.'); return; }
    try {
      const buf = await selectedFile.arrayBuffer();
      const hashBuf = await crypto.subtle.digest('SHA-256', buf);
      const hashHex = '0x' + Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
      if (!signer) { setStatusMessage('Proof Hash for @' + xHandle + ' (' + netConfig.chainName + ' Sim)'); return; }
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const valueToSend = ethers.parseEther(tipAmount || '0');
      const tx = await contract.anchorProof(hashHex, activeTab + ':' + xHandle, { value: valueToSend });
      await tx.wait();
      setStatusMessage(`Proof anchored on ${netConfig.chainName} for @${xHandle}!`);
    } catch (err) { setStatusMessage('Error: ' + err.message); }
  };

  return (
    <div style={{ backgroundColor: '#0b1d3a', color: '#ffffff', minHeight: '100vh', padding: '1rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Header / Commemorative Banner */}
        <div style={{ textAlign: 'center', padding: '0.5rem 0', borderBottom: '2px solid #ffffff' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#dc2626', letterSpacing: '0.15em' }}>1776 - 2026</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffffff', letterSpacing: '0.1em' }}>GODSOURCEGLOBAL VAULT</div>
        </div>

        {/* Dynamic Identity Card */}
        <div style={{ background: '#071326', padding: '1rem', borderRadius: '12px', border: '2px solid #ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#dc2626', letterSpacing: '0.05em' }}>VERIFIED X HANDLE</div>
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
              <div onClick={() => setIsEditingHandle(true)} style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 'bold', marginTop: '0.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                @{xHandle} <span style={{ fontSize: '0.55rem', color: '#d1d5db' }}>(Click to change)</span>
              </div>
            )}
          </div>
          <div style={{ background: '#dc2626', color: '#ffffff', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold' }}>SECURE</div>
        </div>

        {/* Main Vault Panel */}
        <div style={{ background: '#071326', padding: '1.5rem', borderRadius: '16px', border: '2px solid #dc2626' }}>
          
          {/* Network Selector Toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '1rem' }}>
            <button onClick={() => setSelectedNetwork('ethereum')} style={{ padding: '0.4rem', fontSize: '0.65rem', fontWeight: 'bold', background: selectedNetwork === 'ethereum' ? '#ffffff' : '#0b1d3a', color: selectedNetwork === 'ethereum' ? '#0b1d3a' : '#ffffff', border: '1px solid #ffffff', borderRadius: '6px' }}>
              Ethereum
            </button>
            <button onClick={() => setSelectedNetwork('polygon')} style={{ padding: '0.4rem', fontSize: '0.65rem', fontWeight: 'bold', background: selectedNetwork === 'polygon' ? '#dc2626' : '#0b1d3a', color: '#ffffff', border: '1px solid #dc2626', borderRadius: '6px' }}>
              Polygon
            </button>
            <button onClick={() => setSelectedNetwork('apechain')} style={{ padding: '0.4rem', fontSize: '0.65rem', fontWeight: 'bold', background: selectedNetwork === 'apechain' ? '#ffffff' : '#0b1d3a', color: selectedNetwork === 'apechain' ? '#0b1d3a' : '#ffffff', border: '1px solid #ffffff', borderRadius: '6px' }}>
              ApeChain
            </button>
          </div>

          <button onClick={handleConnectWallet} style={{ width: '100%', padding: '0.6rem', background: '#dc2626', color: '#ffffff', border: '2px solid #ffffff', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem' }}>
            {walletAddress ? `Connected (${netConfig.chainName})` : `Connect ${netConfig.chainName} Wallet`}
          </button>

          <div style={{ margin: '1rem 0' }}>
            <label style={{ fontSize: '0.7rem', color: '#d1d5db', display: 'block', marginBottom: '0.3rem' }}>Protocol Fee / Tip ({netConfig.nativeCurrency.symbol}):</label>
            <input type="text" value={tipAmount} onChange={e => setTipAmount(e.target.value)} style={{ width: '100%', padding: '0.4rem', background: '#0b1d3a', color: '#ffffff', border: '1px solid #ffffff', borderRadius: '6px', fontSize: '0.8rem' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', margin: '1rem 0' }}>
            {verticals.map(v => (
              <button key={v} onClick={() => setActiveTab(v)} style={{ padding: '0.4rem', fontSize: '0.65rem', fontWeight: 'bold', background: activeTab === v ? '#dc2626' : '#0b1d3a', color: '#ffffff', border: '1px solid #ffffff', borderRadius: '6px' }}>
                {v}
              </button>
            ))}
          </div>

          {activeTab === 'SignAndSeal' && (
            <div>
              <input type="text" placeholder="Signer Legal Name" value={signerName} onChange={e => setSignerName(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', background: '#0b1d3a', color: '#ffffff', border: '1px solid #ffffff', borderRadius: '6px' }} />
              <input type="file" accept="application/pdf" onChange={handleFileChange} style={{ width: '100%', marginBottom: '0.5rem', color: '#ffffff', fontSize: '0.8rem' }} />
              <button onClick={handleSignAndSealPdf} style={{ width: '100%', padding: '0.6rem', background: '#dc2626', color: '#ffffff', fontWeight: 'bold', borderRadius: '6px', border: '2px solid #ffffff' }}>Sign & Seal PDF</button>
              {signedPdfUrl && <a href={signedPdfUrl} download="Signed.pdf" style={{ display: 'block', textAlign: 'center', marginTop: '0.5rem', color: '#ffffff', fontWeight: 'bold', textDecoration: 'underline' }}>Download Signed PDF</a>}
            </div>
          )}

          {activeTab !== 'SignAndSeal' && (
            <div>
              <input type="file" onChange={handleFileChange} style={{ width: '100%', marginBottom: '0.5rem', color: '#ffffff', fontSize: '0.8rem' }} />
              <button onClick={handleAnchorProof} style={{ width: '100%', padding: '0.6rem', background: '#ffffff', color: '#0b1d3a', fontWeight: 'bold', borderRadius: '6px', border: '2px solid #dc2626' }}>Anchor Proof On-Chain</button>
            </div>
          )}

          {statusMessage && (
            <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#0b1d3a', color: '#ffffff', fontSize: '0.7rem', fontFamily: 'monospace', wordBreak: 'break-all', border: '1px solid #dc2626' }}>
              {statusMessage}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
