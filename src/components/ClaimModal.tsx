import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import { X } from 'lucide-react';

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicKey: PublicKey | null;
}

const CLAIMED_WALLETS_KEY = 'claimed_mlm_wallets';

const ClaimModal = ({ isOpen, onClose, publicKey }: ClaimModalProps) => {
  const [isClaiming, setIsClaiming] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasClaimed, setHasClaimed] = React.useState(false);

  React.useEffect(() => {
    if (publicKey) {
      const claimedWallets = JSON.parse(localStorage.getItem(CLAIMED_WALLETS_KEY) || '[]');
      setHasClaimed(claimedWallets.includes(publicKey.toString()));
    }
  }, [publicKey]);

  if (!isOpen) return null;

  const handleClaim = async () => {
    if (!publicKey) return;

    setIsClaiming(true);
    setError(null);

    try {
      // Simulate claiming process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store claimed wallet
      const claimedWallets = JSON.parse(localStorage.getItem(CLAIMED_WALLETS_KEY) || '[]');
      claimedWallets.push(publicKey.toString());
      localStorage.setItem(CLAIMED_WALLETS_KEY, JSON.stringify(claimedWallets));
      
      setHasClaimed(true);
      setTimeout(onClose, 1500); // Close after showing success state
    } catch (err) {
      setError('Failed to claim MLM. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h3 className="text-2xl font-bold text-yellow-400 mb-4">Claim Free MLM</h3>
        
        {!publicKey ? (
          <div className="text-center">
            <p className="text-gray-300 mb-4">Connect your wallet to claim your free MLM tokens!</p>
            <WalletMultiButton className="!bg-yellow-500 hover:!bg-yellow-600 !transition-colors !w-full !justify-center" />
          </div>
        ) : hasClaimed ? (
          <div className="text-center">
            <p className="text-gray-300">You have already claimed your MLM tokens!</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-300 mb-4">
              You can claim 100 MLM tokens for free! These tokens will be used for governance and staking rewards.
            </p>
            <button
              onClick={handleClaim}
              disabled={isClaiming}
              className={`w-full py-3 rounded-lg font-semibold ${
                isClaiming
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-600'
              } transition-colors`}
            >
              {isClaiming ? 'Claiming...' : 'Claim MLM'}
            </button>
            {error && (
              <p className="mt-2 text-red-400 text-sm">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ClaimModal);