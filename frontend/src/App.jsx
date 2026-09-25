import React, { useState } from 'react';
import { ethers } from 'ethers';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const CONTRACT_ADDRESS = "0x96E50F5a76743BBe18E8Fe2B11B19897A5d0A074";
const CONTRACT_ABI = [
  "function anchorProof(bytes32 proofHash, string memory vertical) external"
];

export default function App() {
  const [activeTab, setActiveTab] = useState('Notary');
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [walletAddress, setWalletAddress] = useState(null);
  const [signer, setSigner] = useState(null);
  const [signerName, setSignerName] = useState('');
  const [signedPdfUrl, setSignedPdfUrl] = useState(null);

  const verticals = ['Notary', 'SignAndSeal', 'Taxes', 'Insurance', 'BailBonds', 'XHandleCoin'];

  const handleConnectWallet = async () => {
    if (window.ethereum) {
      try {
        setStatusMessage('Requesting wallet connection...');
        const p = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const s = await p.getSigner();
        const addr = await s.getAddress();
        setSigner(s);
        setWalletAddress(addr);
        setStatusMessage('Connected: ' + addr.substring(0, 6) + '...' + addr.substring(addr.length - 4));
      } catch (err) { setStatusMessage('Error: ' + err.message); }
    } else {
      setWalletAddress('0x96E5...0A074 (Simulation)');
      setStatusMessage('Simulation mode active.');
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setSignedPdfUrl(null);
  };

  const handleSignAndSealPdf = async () => {
      setStatusMessage('Please provide both a document and your signer name.');
      return;
    }
    try {
      setStatusMessage('Signing PDF...');
      const buf = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buf);
      const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      const page = pdfDoc.getPages()[pdfDoc.getPages().length - 1];
      page.drawText('DIGITALLY SIGNED & SEALED BY: ' + signerName, { x: 50, y: 60, size: 10, font, color: rgb(0.02, 0.11, 0.24) });
      page.drawText('GODSOURCEGLOBAL LLC | ' + new Date().toUTCString(), { x: 50, y: 45, size: 8, font, color: rgb(0.13, 0.55, 0.75) });
      const bytes = await pdfDoc.save();
      setSignedPdfUrl(URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })));
      
      const hashBuf = await crypto.subtle.digest('SHA-256', bytes);
      const hashHex = '0x' + Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
      
        setStatusMessage('Signed successfully (Simulation Hash: ' + hashHex.substring(0, 18) + '...)');
        return;
      }
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.anchorProof(hashHex, 'SignAndSeal');
      await tx.wait();
      setStatusMessage('Success! Document sealed and anchored on-chain.');
    } catch (err) { setStatusMessage('Error: ' + err.message); }
  };

  const handleAnchorProof = async () => {
    try {
      const buf = await selectedFile.arrayBuffer();
      const hashBuf = await crypto.subtle.digest('SHA-256', buf);
      const hashHex = '0x' + Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.anchorProof(hashHex, activeTab);
      await tx.wait();
      setStatusMessage('Anchored successfully on Polygon!');
    } catch (err) { setStatusMessage('Error: ' + err.message); }
  };

  return (
    <div style={{ backgroundColor: '#040814', color: '#f3f4f6', minHeight: '100vh', padding: '1rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#09152d', padding: '1.5rem', borderRadius: '16px', border: '1px solid #fbbf24' }}>
        <h1 style={{ fontSize: '1rem', color: '#fbbf24', textAlign: 'center' }}>GODSOURCEGLOBAL LLC VAULT</h1>
        <button onClick={handleConnectWallet} style={{ width: '100%', padding: '0.5rem', marginTop: '1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
          {walletAddress ? 'Connected' : 'Connect Wallet'}
        </button>
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
        {statusMessage && <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#040814', color: '#22d3ee', fontSize: '0.7rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>{statusMessage}</div>}
      </div>
    </div>
  );
}
