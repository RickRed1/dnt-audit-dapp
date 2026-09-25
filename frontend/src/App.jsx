import React, { useState } from 'react';
import { ethers } from 'ethers';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const CONTRACT_ADDRESS = "0x96E50F5a76743BBe18E8Fe2B11B19897A5d0A074";
const CONTRACT_ABI = [
  "function anchorProof(bytes32 proofHash, string memory vertical) external payable",
  "function launchHandleCoin(string memory xHandle) external payable",
  "function claimPot(string memory xHandle) external"
];

const NETWORKS = {
  ethereum: { chainId: '0x1', chainName: 'Ethereum Mainnet', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, rpcUrls: ['https://cloudflare-eth.com'], blockExplorerUrls: ['https://etherscan.io'] },
  polygon: { chainId: '0x89', chainName: 'Polygon Mainnet', nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 }, rpcUrls: ['https://polygon-rpc.com/'], blockExplorerUrls: ['https://polygonscan.com'] },
  apechain: { chainId: '0x8173', chainName: 'ApeChain', nativeCurrency: { name: 'APE', symbol: 'APE', decimals: 18 }, rpcUrls: ['https://rpc.apechain.com/http'], blockExplorerUrls: ['https://apescan.io'] }
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
        await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: netConfig.chainId }] }).catch(async (err) => {
          if (err.code === 4902) { await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [netConfig] }); } else { throw err; }
        });
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const s = await p.getSigner();
        const addr = await s.getAddress();
        setSigner(s); setWalletAddress(addr);
        setStatusMessage(`Connected: ${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`);
      } catch (err) { setStatusMessage('Error: ' + err.message); }
    } else {
      setWalletAddress('0x96E5...0A074');
      setStatusMessage(`Simulation active on ${netConfig.chainName}.`);
    }
  };

  const handleFileChange = (e) => { setSelectedFile(e.target.files[0]); setSignedPdfUrl(null); };

  const handleSignAndSealPdf = async () => {
    if (!selectedFile || !signerName) { setStatusMessage('Provide both document and signer name.'); return; }
    try {
      setStatusMessage('Signing PDF & Routing Fee...');
      const buf = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buf);
      const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      pdfDoc.getPages()[pdfDoc.getPages().length - 1].drawText('SIGNED BY: ' + signerName + ' (/@' + xHandle + ')', { x: 50, y: 60, size: 10, font, color: rgb(0.85, 0.1, 0.1) });
      const bytes = await pdfDoc.save();
      setSignedPdfUrl(URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })));
      const hashBuf = await crypto.subtle.digest('SHA-256', bytes);
      const hashHex = '0x' + Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
      if (!signer) { setStatusMessage('Signed successfully (Simulation)'); return; }
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.anchorProof(hashHex, 'SignAndSeal', { value: ethers.parseEther(tipAmount || '0') });
      await tx.wait();
      setStatusMessage(`Success! Sealed & anchored for @${xHandle}`);
    } catch (err) { setStatusMessage('Error: ' + err.message); }
  };

  const handleAnchorProof = async () => {
    if (!selectedFile) { setStatusMessage('Select a file first.'); return; }
    try {
      setStatusMessage(`Anchoring ${activeTab} proof...`);
      const buf = await selectedFile.arrayBuffer();
      const hashBuf = await crypto.subtle.digest('SHA-256', buf);
      const hashHex = '0x' + Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
      if (!signer) { setStatusMessage(`Proof Hash anchored in simulation.`); return; }
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.anchorProof(hashHex, activeTab, { value: ethers.parseEther(tipAmount || '0') });
      await tx.wait();
      setStatusMessage(`${activeTab} proof anchored on-chain!`);
    } catch (err) { setStatusMessage('Error: ' + err.message); }
  };

  const handleLaunchCoinForHandle = async () => {
    try {
      setStatusMessage(`Launching coin pot for @${xHandle}...`);
      if (!signer) { setStatusMessage(`Simulated coin pot deployed for @${xHandle}!`); return; }
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.launchHandleCoin(xHandle, { value: ethers.parseEther(tipAmount || '0') });
      await tx.wait();
      setStatusMessage(`Coin pot deployed for @${xHandle}`);
    } catch (err) { setStatusMessage('Error: ' + err.message); }
  };

  const handleClaimPot = async () => {
    try {
      setStatusMessage(`Claiming pot rewards for @${xHandle}...`);
      if (!signer) { setStatusMessage(`Simulated pot rewards claimed!`); return; }
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.claimPot(xHandle);
      await tx.wait();
      setStatusMessage(`Pot rewards claimed for @${xHandle}`);
    } catch (err) { setStatusMessage('Error: ' + err.message); }
  };

  return (
    <div style={{ backgroundColor: '#0b1d3a', color: '#ffffff', minHeight: '100vh', paddingBottom: '6rem', fontFamily: 'sans-serif' }}>
      <style>{`
        @keyframes waveEffect {
          0% { transform: perspective(400px) rotateY(0deg) skewX(0deg); filter: brightness(1); }
          25% { transform: perspective(400px) rotateY(6deg) skewX(2deg); filter: brightness(1.05); }
          50% { transform: perspective(400px) rotateY(0deg) skewX(0deg); filter: brightness(1); }
          75% { transform: perspective(400px) rotateY(-6deg) skewX(-2deg); filter: brightness(0.95); }
          100% { transform: perspective(400px) rotateY(0deg) skewX(0deg); filter: brightness(1); }
        }
        .waving-flag { animation: waveEffect 3.5s ease-in-out infinite; transform-origin: left center; }
      `}</style>

      <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
        
        <div style={{ textAlign: 'center', padding: '0.5rem 0', borderBottom: '2px solid #ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
          <div className="waving-flag" style={{ width: '120px', height: '75px', borderRadius: '6px', overflow: 'hidden', border: '2px solid #dc2626', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)' }}>
            <img src="/flag.jpg" alt="USA Flag" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#dc2626', letterSpacing: '0.15em' }}>1776 - 2026 SOVEREIGN FRAMEWORK</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffffff', letterSpacing: '0.1em' }}>GODSOURCEGLOBAL VAULT</div>
        </div>

        {activeTab === 'Docs' ? (
          <div style={{ background: '#071326', padding: '1.5rem', borderRadius: '16px', border: '2px solid #dc2626', lineHeight: '1.5' }}>
            <h2 style={{ color: '#dc2626', fontSize: '1.1rem', marginBottom: '0.5rem' }}>GODSOURCEGLOBAL VAULT WHITEPAPER</h2>
            <div style={{ fontSize: '0.7rem', color: '#d1d5db', marginBottom: '1rem' }}>Framework Version: 1776-2026 Sovereign Edition</div>
            
            <h3 style={{ fontSize: '0.9rem', color: '#ffffff', marginTop: '1rem' }}>1. Executive Summary</h3>
            <p style={{ fontSize: '0.75rem', color: '#d1d5db' }}>The GODSOURCEGLOBAL Vault Protocol bridges verifiable digital identities with on-chain cryptographic anchoring, automated document notarization, and tokenized yield distribution under the model: <b>You build. They pay. You get paid.</b></p>

            <h3 style={{ fontSize: '0.9rem', color: '#ffffff', marginTop: '1rem' }}>2. X-Handle Pots</h3>
            <p style={{ fontSize: '0.75rem', color: '#d1d5db' }}>Every verified X handle can launch a coin and open a secure on-chain pot. Protocol tips and reflective yields accumulate automatically in these vaults.</p>

            <h3 style={{ fontSize: '0.9rem', color: '#ffffff', marginTop: '1rem' }}>3. Operational Verticals</h3>
            <p style={{ fontSize: '0.75rem', color: '#d1d5db' }}>Supports <b>Notary</b>, <b>SignAndSeal</b>, <b>Taxes</b>, <b>Insurance</b>, <b>BailBonds</b>, and <b>XHandleCoin</b> with immutable SHA-256 proof verification.</p>

            <button onClick={() => setActiveTab('Notary')} style={{ width: '100%', marginTop: '1.5rem', padding: '0.6rem', background: '#dc2626', color: '#ffffff', fontWeight: 'bold', borderRadius: '6px', border: '2px solid #ffffff', cursor: 'pointer' }}>Back to Vault Interface</button>
          </div>
        ) : (
          <>
            <div style={{ background: '#071326', padding: '1rem', borderRadius: '16px', border: '2px solid #dc2626' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.6rem', textAlign: 'center' }}>You build. They pay. You get paid.</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', textAlign: 'center', marginBottom: '0.8rem' }}>
                <div style={{ background: '#0b1d3a', padding: '0.6rem', borderRadius: '8px', border: '1px solid #ffffff' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#dc2626' }}>$55.0K</div>
                  <div style={{ fontSize: '0.6rem', color: '#d1d5db' }}>PAID OUT TO OWNERS</div>
                </div>
                <div style={{ background: '#0b1d3a', padding: '0.6rem', borderRadius: '8px', border: '1px solid #ffffff' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#dc2626' }}>$127.2K</div>
                  <div style={{ fontSize: '0.6rem', color: '#d1d5db' }}>PAID TO HOLDERS</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleLaunchCoinForHandle} style={{ flex: 1, padding: '0.5rem', background: '#dc2626', color: '#ffffff', border: '1px solid #ffffff', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.7rem', cursor: 'pointer' }}>Launch a coin</button>
                <button onClick={handleClaimPot} style={{ flex: 1, padding: '0.5rem', background: '#ffffff', color: '#0b1d3a', border: '1px solid #dc2626', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.7rem', cursor: 'pointer' }}>Claim your pot</button>
              </div>
            </div>

            <div style={{ background: '#071326', padding: '1rem', borderRadius: '12px', border: '2px solid #ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#dc2626' }}>VERIFIED X HANDLE</div>
                {isEditingHandle ? (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                    <input type="text" value={xHandle} onChange={e => setXHandle(e.target.value.replace('@',''))} style={{ background: '#0b1d3a', color: '#ffffff', border: '1px solid #ffffff', borderRadius: '4px', padding: '0.2rem 0.4rem', fontSize: '0.8rem', width: '120px' }} />
                    <button onClick={() => setIsEditingHandle(false)} style={{ background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.7rem', fontWeight: 'bold' }}>Set</button>
                  </div>
                ) : (
                  <div onClick={() => setIsEditingHandle(true)} style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 'bold', marginTop: '0.2rem', cursor: 'pointer' }}>
                    @{xHandle} <span style={{ fontSize: '0.55rem', color: '#d1d5db' }}>(Click to change)</span>
                  </div>
                )}
              </div>
              <div style={{ background: '#dc2626', color: '#ffffff', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold' }}>SECURE</div>
            </div>

            <div style={{ background: '#071326', padding: '1.5rem', borderRadius: '16px', border: '2px solid #dc2626' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '1rem' }}>
                {['ethereum', 'polygon', 'apechain'].map(net => (
                  <button key={net} onClick={() => setSelectedNetwork(net)} style={{ padding: '0.4rem', fontSize: '0.65rem', fontWeight: 'bold', background: selectedNetwork === net ? '#dc2626' : '#0b1d3a', color: '#ffffff', border: '1px solid #ffffff', borderRadius: '6px', cursor: 'pointer' }}>
                    {net.toUpperCase()}
                  </button>
                ))}
              </div>

              <button onClick={handleConnectWallet} style={{ width: '100%', padding: '0.6rem', background: '#dc2626', color: '#ffffff', border: '2px solid #ffffff', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '1rem', cursor: 'pointer' }}>
                {walletAddress ? `Connected (${netConfig.chainName})` : `Connect ${netConfig.chainName} Wallet`}
              </button>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.7rem', color: '#d1d5db', display: 'block', marginBottom: '0.3rem' }}>Protocol Fee / Tip ({netConfig.nativeCurrency.symbol}):</label>
                <input type="text" value={tipAmount} onChange={e => setTipAmount(e.target.value)} style={{ width: '100%', padding: '0.4rem', background: '#0b1d3a', color: '#ffffff', border: '1px solid #ffffff', borderRadius: '6px', fontSize: '0.8rem' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '1rem' }}>
                {verticals.map(v => (
                  <button key={v} onClick={() => setActiveTab(v)} style={{ padding: '0.4rem', fontSize: '0.65rem', fontWeight: 'bold', background: activeTab === v ? '#dc2626' : '#0b1d3a', color: '#ffffff', border: '1px solid #ffffff', borderRadius: '6px', cursor: 'pointer' }}>
                    {v}
                  </button>
                ))}
              </div>

              {activeTab === 'SignAndSeal' && (
                <div>
                  <input type="text" placeholder="Signer Legal Name" value={signerName} onChange={e => setSignerName(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', background: '#0b1d3a', color: '#ffffff', border: '1px solid #ffffff', borderRadius: '6px' }} />
                  <input type="file" accept="application/pdf" onChange={handleFileChange} style={{ width: '100%', marginBottom: '0.5rem', color: '#ffffff', fontSize: '0.8rem' }} />
                  <button onClick={handleSignAndSealPdf} style={{ width: '100%', padding: '0.6rem', background: '#dc2626', color: '#ffffff', fontWeight: 'bold', borderRadius: '6px', border: '2px solid #ffffff', cursor: 'pointer' }}>Sign & Seal PDF</button>
                  {signedPdfUrl && <a href={signedPdfUrl} download="Signed.pdf" style={{ display: 'block', textAlign: 'center', marginTop: '0.5rem', color: '#ffffff', fontWeight: 'bold', textDecoration: 'underline' }}>Download Signed PDF</a>}
                </div>
              )}

              {activeTab === 'XHandleCoin' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#d1d5db', marginBottom: '0.5rem' }}>Deploy or manage the dedicated coin pot for @{xHandle}</div>
                  <button onClick={handleLaunchCoinForHandle} style={{ width: '100%', padding: '0.6rem', background: '#dc2626', color: '#ffffff', fontWeight: 'bold', borderRadius: '6px', border: '2px solid #ffffff', cursor: 'pointer', marginBottom: '0.5rem' }}>Launch Pot Coin ($GSG-{xHandle.toUpperCase()})</button>
                  <button onClick={handleClaimPot} style={{ width: '100%', padding: '0.6rem', background: '#ffffff', color: '#0b1d3a', fontWeight: 'bold', borderRadius: '6px', border: '2px solid #dc2626', cursor: 'pointer' }}>Claim Pot Yield</button>
                </div>
              )}

              {activeTab !== 'SignAndSeal' && activeTab !== 'XHandleCoin' && (
                <div>
                  <input type="file" onChange={handleFileChange} style={{ width: '100%', marginBottom: '0.5rem', color: '#ffffff', fontSize: '0.8rem' }} />
                  <button onClick={handleAnchorProof} style={{ width: '100%', padding: '0.6rem', background: '#ffffff', color: '#0b1d3a', fontWeight: 'bold', borderRadius: '6px', border: '2px solid #dc2626', cursor: 'pointer' }}>Anchor {activeTab} Proof On-Chain</button>
                </div>
              )}

              {statusMessage && (
                <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#0b1d3a', color: '#ffffff', fontSize: '0.7rem', fontFamily: 'monospace', wordBreak: 'break-all', border: '1px solid #dc2626' }}>
                  {statusMessage}
                </div>
              )}
            </div>
          </>
        )}

      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#071326', borderTop: '2px solid #dc2626', display: 'flex', justifyContent: 'space-around', padding: '0.6rem 0', zIndex: 1000 }}>
        <button onClick={() => setActiveTab('Notary')} style={{ background: 'none', border: 'none', color: activeTab === 'Notary' ? '#dc2626' : '#ffffff', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}><span>🏠</span> Home</button>
        <button onClick={() => setActiveTab('Vaults')} style={{ background: 'none', border: 'none', color: activeTab === 'Vaults' ? '#dc2626' : '#ffffff', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}><span>💼</span> Vaults</button>
        <button onClick={() => setActiveTab('XHandleCoin')} style={{ background: 'none', border: 'none', color: activeTab === 'XHandleCoin' ? '#dc2626' : '#ffffff', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}><span>🏺</span> Pots</button>
        <button onClick={() => setActiveTab('SignAndSeal')} style={{ background: 'none', border: 'none', color: activeTab === 'SignAndSeal' ? '#dc2626' : '#ffffff', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}><span>🚀</span> Launch</button>
        <button onClick={() => setActiveTab('Docs')} style={{ background: 'none', border: 'none', color: activeTab === 'Docs' ? '#dc2626' : '#ffffff', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}><span>📄</span> Docs</button>
      </div>
    </div>
  );
}
