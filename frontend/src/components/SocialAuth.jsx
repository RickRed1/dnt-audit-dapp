import React, { useState } from 'react';

export default function SocialAuth({ onAuthenticate }) {
  const [handle, setHandle] = useState(null);

  const handleTwitterLogin = () => {
    const mockHandle = "@RichardDimassa"; // Updated with your name from logo
    setHandle(mockHandle);
    onAuthenticate(mockHandle);
  };

  return (
    <div className="p-4 bg-[#0a1029] border border-[#1d4ed8]/50 rounded-xl text-[#e5e7eb] shadow-2xl shadow-[#1d4ed8]/20">
      <h3 className="text-lg font-semibold mb-2 text-[#fbbf24]">Handle & Wallet Identity</h3>
      {handle ? (
        <div className="flex items-center justify-between">
          <span className="text-[#22d3ee] font-mono">Linked: {handle}</span>
          <span className="text-xs text-[#0a1029] bg-[#22d3ee] px-2 py-1 rounded">Verified</span>
        </div>
      ) : (
        <button 
          onClick={handleTwitterLogin}
          className="w-full py-2 bg-[#111827] hover:bg-[#1d4ed8]/20 border border-[#fbbf24] rounded-lg font-medium transition text-[#fbbf24]"
        >
          Sign in with X to Link Handle
        </button>
      )}
    </div>
  );
}
