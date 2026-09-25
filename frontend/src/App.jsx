import React, { useState } from 'react';
import { ethers } from 'ethers';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const CONTRACT_ADDRESS = "0x96E50F5a76743BBe18E8Fe2B11B19897A5d0A074";
const CONTRACT_ABI = [
  "function anchorProof(bytes32 proofHash, string memory vertical) external payable"
];

const NETWORKS = {
  ethereum: {
    chainId: '0x1', // 1
    chainName: 'Ethereum Mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://cloudflare-eth.com'],
    blockExplorerUrls: ['https://etherscan.io']
  },
  polygon: {
    chainId: '0x89', // 137
    chainName: 'Polygon Mainnet',
    nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com']
  },
  apechain: {
    chainId: '0x8173', // 33139
    chainName: 'ApeChain',
    nativeCurrency: { name: 'APE', symbol: 'APE', decimals: 18 },
    rpcUrls: ['https://rpc.apechain.com/http'],
    blockExplorerUrls: ['https://apescan.io']
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('Notary');
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
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
      setStatusMessage(`Simulation mode active on ${netConfig.chainName}.`);
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
      page.drawText('SIGNED BY: ' + signerName + ' (/@' + xHandle + ' | ' + netConfig.chainName + ')', { x: 50, y: 60, size: 10, font, color: rgb(0.02, 0.11, 0.24) });
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
      setStatusMessage(`Success! Sealed and tip routed on ${netConfig.chainName} for @${xHandle}`);
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
    <div style={{ backgroundColor: '#040814', color: '#f3f4f6', minHeight: '100vh', padding: '1rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Dynamic Identity & Vault Link Card */}
        <div style={{ background: '#09152d', padding: '1rem', borderRadius: '16px', border: '1px solid #fbbf24', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.70rem', fontWeight: 'bold', color: '#fbbf24', letterSpacing: '0.05em' }}>X HANDLE & VAULT LINK</div>
            {isEditingHandle ? (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                <input 
                  type="text" 
                  value={xHandle} 
                  onChange={e => setXHandle(e.target.value.replace('@',''))} 
                  style={{ background: '#040814', color: '#22d3ee', border: '1px solid #22d3ee', borderRadius: '4px', padding: '0.2rem 0.4rem', fontSize: '0.8rem', width: '120px' }} 
                />
                <button onClick={() => setIsEditingHandle(false)} style={{ background: '#fbbf24', color: '#040814', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.7rem', fontWeight: 'bold' }}>Set</button>
              </div>
            ) : (
              <div onClick={() => setIsEditingHandle(true)} style={{ fontSize: '0.9rem', color: '#22d3ee', fontWeight: 'bold', marginTop: '0.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                @{xHandle} <span style={{ fontSize: '0.6rem', color: '#9ca3af' }}>(Click to change)</span>
              </div>
            )}
          </div>
          <div style={{ background: '#22d3ee', color: '#040814', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold' }}>VERIFIED</div>
        </div>

        {/* Main Vault Panel */}
        <div style={{ background: '#09152d', padding: '1.5rem', borderRadius: '16px', border: '1px solid #22d3ee' }}>
          <h1 style={{ fontSize: '1rem', color: '#fbbf24', textAlign: 'center', marginBottom: '1rem' }}>GODSOURCEGLOBAL LLC VAULT</h1>
          
          {/* Multi-Chain Selector Toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '1rem' }}>
            <button onClick={() => setSelectedNetwork('ethereum')} style={{ padding: '0.4rem', fontSize: '0.65rem', fontWeight: 'bold', background: selectedNetwork === 'ethereum' ? '#627eea' : '#040814', color: selectedNetwork === 'ethereum' ? '#fff' : '#627eea', border: '1px solid #627eea', borderRadius: '6px' }}>
              Ethereum
            </button>
            <button onClick={() => setSelectedNetwork('polygon')} style={{ padding: '0.4rem', fontSize: '0.65rem', fontWeight: 'bold', background: selectedNetwork === 'polygon' ? '#8247e5' : '#040814', color: selectedNetwork === 'polygon' ? '#fff' : '#8247e5', border: '1px solid #8247e5', borderRadius: '6px' }}>
              Polygon
            </button>
            <button onClick={() => setSelectedNetwork('apechain')} style={{ padding: '0.4rem', fontSize: '0.65rem', fontWeight: 'bold', background: selectedNetwork === 'apechain' ? '#fbbf24' : '#040814', color: selectedNetwork === 'apechain' ? '#040814' : '#fbbf24', border: '1px solid #fbbf24', borderRadius: '6px' }}>
              ApeChain
            </button>
          </div>

          <button onClick={handleConnectWallet} style={{ width: '100%', padding: '0.5rem', background: selectedNetwork === 'ethereum' ? '#627eea' : selectedNetwork === 'polygon' ? '#8247e5' : '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
            {walletAddress ? `Connected to ${netConfig.chainName}` : `Connect ${netConfig.chainName} Wallet`}
          </button>

          <div style={{ margin: '1rem 0' }}>
            <label style={{ fontSize: '0.7rem', color: '#9ca3af', display: 'block', marginBottom: '0.3rem' }}>Protocol Tip / Fee ({netConfig.nativeCurrency.symbol}):</label>
            <input type="text" value={tipAmount} onChange={e => setTipAmount(e.target.value)} style={{ width: '100%', padding: '0.4rem', background: '#040814', color: '#fff', border: '1px solid #22d3ee', borderRadius: '6px', fontSize: '0.8rem' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', margin: '1rem 0' }}>
            {verticals.map(v => (
              <button key={v} onClick={() => setActiveTab(v)} style={{ padding: '0.4rem', fontSize: '0.65rem', background: activeTab === v ? '#fbbf24' : '#040814', color: activeTab === v ? '#040814' : '#22d3ee', border: '1px solid #22d3ee', borderRadius: '6px' }}>
                {v}
              </button>
            ))}
          </div>

          {activeTab === 'SignAndSeal' && (
            <div>
              <input type="text" placeholder="Signer Legal Name" value={signerName} onChange={e => setSignerName(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', background: '#040814', color: '#fff', border: '1px solid #fbbf24', borderRadius: '6px' }} />
              <input type="file" accept="application/pdf" onChange={handleFileChange} style={{ width: '100%', marginBottom: '0.5rem' }} />
              <button onClick={handleSignAndSealPdf} style={{ width: '100%', padding: '0.6rem', background: '#fbbf24', color: '#040814', fontWeight: 'bold', borderRadius: '6px', border: 'none' }}>Sign & Seal PDF</button>
              {signedPdfUrl && <a href={signedPdfUrl} download="Signed.pdf" style={{ display: 'block', textAlign: 'center', marginTop: '0.5rem', color: '#10b981', fontWeight: 'bold' }}>Download Signed PDF</a>}
            </div>
          )}

          {activeTab !== 'SignAndSeal' && (
            <div>
              <input type="file" onChange={handleFileChange} style={{ width: '100%', marginBottom: '0.5rem' }} />
              <button onClick={handleAnchorProof} style={{ width: '100%', padding: '0.6rem', background: '#22d3ee', color: '#040814', fontWeight: 'bold', borderRadius: '6px', border: 'none' }}>Anchor Proof On-Chain</button>
            </div>
          )}

          {statusMessage && (
            <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#040814', color: '#22d3ee', fontSize: '0.7rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {statusMessage}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
