import React, { useState } from 'react';

export default function SocialAuth({ onAuthenticate }) {
  const [handle, setHandle] = useState(null);

  const handleTwitterLogin = () => {
    const mockHandle = "@GodSourceGlobal"; 
    setHandle(mockHandle);
    onAuthenticate(mockHandle);
  };

  return (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white mb-6">
      <h3 className="text-lg font-semibold mb-2">Handle & Wallet Identity</h3>
      {handle ? (
        <div className="flex items-center justify-between">
          <span className="text-green-400 font-mono">Linked: {handle}</span>
          <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded">Verified</span>
        </div>
      ) : (
        <button 
          onClick={handleTwitterLogin}
          className="w-full py-2 bg-black hover:bg-zinc-800 border border-zinc-700 rounded-lg font-medium transition"
        >
          Sign in with X to Link Handle
        </button>
      )}
    </div>
  );
}
