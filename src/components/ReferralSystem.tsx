import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { useGameState } from '../context/GameStateContext';

export default function ReferralSystem() {
  const { gameState } = useGameState();
  const [isCopied, setIsCopied] = useState(false);
  const referralLink = `https://mlm.app/ref/${gameState.referralCode}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-sm bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-center text-yellow-400">Referral Program</h2>
        <p className="text-gray-300 mb-4 text-center">
          Invite friends to earn 10% of their rewards and <span className="text-green-400">+200 XP</span> bonus!
        </p>
        <div className="flex items-center justify-between bg-gray-700 p-3 rounded-lg mb-4">
          <span className="text-sm font-medium truncate flex-1 mr-2">{referralLink}</span>
          <button
            onClick={copyReferralLink}
            className="px-3 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors flex items-center whitespace-nowrap"
          >
            {isCopied ? 'Copied!' : 'Copy'}
            <Copy className="ml-2 h-4 w-4" />
          </button>
        </div>
        
        {gameState.referredBy && (
          <div className="mt-4 p-3 bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-300">
              Referred by: <span className="text-yellow-400">{gameState.referredBy}</span>
            </p>
          </div>
        )}

        {gameState.totalReferrals > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-300">
              Total Referrals: <span className="text-yellow-400">{gameState.totalReferrals}</span>
            </p>
            <p className="text-sm text-gray-300">
              Earnings from Referrals: <span className="text-yellow-400">{gameState.referralEarnings.toFixed(4)} SOL</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}