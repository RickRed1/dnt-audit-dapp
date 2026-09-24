import React, { useState } from 'react';
import { BrowserProvider, Contract } from 'ethers';

// Contract ABI placeholder for AuditRegistry
const CONTRACT_ABI = [
  "function notarizeDocument(bytes32 _docHash) external",
  "function notarizedDocuments(bytes32) external view returns (bytes32 docHash, uint256 timestamp, address submitter)"
];

// Replace with your deployed contract address post-deployment
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

export default function App() {
  const [account, setAccount] = useState('');
  const [docHash, setDocHash] = useState('');
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Connect Web3 Wallet (MetaMask, Rabby, Coinbase Wallet)
  const connectWallet = async () => {
    if (!window.ethereum) {
      setStatus('Please install a Web3 wallet like MetaMask.');
      return;
    }
    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      setStatus(`Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
    } catch (err) {
      setStatus(`Wallet connection failed: ${err.message}`);
    }
  };

  // Compute SHA-256 Hash locally using Web Crypto API
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    setDocHash(hashHex);
    setLoading(false);
  };

  // Send Hash On-Chain
  const handleNotarize = async (e) => {
    e.preventDefault();
    if (!docHash) {
      setStatus('Please select or upload a document first.');
      return;
    }
    if (!account) {
      setStatus('Please connect your Web3 wallet first.');
      return;
    }

    try {
      setLoading(true);
      setStatus('Initiating on-chain transaction...');
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.notarizeDocument(docHash);
      setStatus(`Transaction submitted: ${tx.hash}`);
      await tx.wait();
      setStatus(`Document successfully notarized on-chain!`);
    } catch (err) {
      setStatus(`Notarization failed: ${err.reason || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto', color: '#1a1a1a' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>DNT Audit Protocol</h2>
        <button 
          onClick={connectWallet}
          style={{ padding: '0.6rem 1.2rem', backgroundColor: account ? '#2e7d32' : '#1976d2', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
        </button>
      </header>

      <main style={{ border: '1px solid #e0e0e0', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: 0 }}>On-Chain Document Notarization</h3>
        <p style={{ color: '#666', fontSize: '0.95rem' }}>Upload any document to generate a privacy-preserving SHA-256 hash locally before anchoring it on-chain.</p>
        
        <form onSubmit={handleNotarize} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Select Document:</label>
            <input type="file" onChange={handleFileChange} style={{ display: 'block', width: '100%' }} />
          </div>

          {fileName && (
            <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', wordBreak: 'break-all' }}>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>Document Hash (SHA-256):</div>
              <code style={{ fontSize: '0.9rem', color: '#000', fontWeight: 'bold' }}>{docHash}</code>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !docHash}
            style={{ 
              padding: '0.8rem 1.5rem', 
              backgroundColor: loading || !docHash ? '#ccc' : '#111', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: loading || !docHash ? 'not-allowed' : 'pointer',
              fontWeight: '600'
            }}
          >
            {loading ? 'Processing...' : 'Anchor Proof On-Chain'}
          </button>
        </form>

        {status && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#e3f2fd', color: '#0d47a1', borderRadius: '6px', fontSize: '0.9rem' }}>
            {status}
          </div>
        )}
      </main>
    </div>
  );
}
