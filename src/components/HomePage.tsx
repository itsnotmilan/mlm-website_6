import React from 'react';
import { Twitter } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import ClaimModal from './ClaimModal';

const HomePage = () => {
  const [followers, setFollowers] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState({ days: 15, hours: 0, minutes: 0, seconds: 0 });
  const [isClaimModalOpen, setIsClaimModalOpen] = React.useState(false);
  const { publicKey } = useWallet();

  React.useEffect(() => {
    const targetDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });

      if (difference < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setFollowers(prev => Math.min(prev + Math.floor(Math.random() * 10), 5000));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const partners = React.useMemo(() => Array(5).fill(null).map((_, i) => (
    <div key={i} className="w-32 h-32 md:w-40 md:h-40 bg-gray-500 flex-shrink-0 rounded-lg" />
  )), []);

  return (
    <main className="flex-grow pt-20 md:pt-24 animate-fadeIn">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col items-center mb-8 md:mb-12">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 md:mb-8 text-center text-yellow-400">
            Art Reveal:
          </h2>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div key={unit} className="text-center">
                <div className="bg-yellow-400 text-gray-900 text-2xl md:text-4xl font-bold p-3 md:p-4 rounded-lg">
                  {value.toString().padStart(2, '0')}
                </div>
                <div className="text-sm md:text-base mt-2 capitalize">{unit}</div>
              </div>
            ))}
          </div>
          
          <div className="text-center mb-8">
            <p className="text-2xl md:text-4xl mb-4">or</p>
            <div className="inline-flex items-center space-x-3 bg-gray-800 rounded-full px-6 py-3">
              <Twitter className="w-6 h-6 text-blue-400" />
              <span className="text-xl md:text-2xl font-bold">
                {followers.toLocaleString()}/5,000
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 md:p-8 mb-12">
          <div className="prose prose-invert max-w-none">
            <p className="text-lg md:text-xl mb-4">
              Welcome to Money Loving Monkeys, the most bananas NFT project in the crypto jungle! 
              Our collection features 10,000 unique, algorithmically generated primates with a passion for finance.
            </p>
            <p className="text-lg md:text-xl mb-6">
              Each Money Loving Monkey is your ticket to exclusive benefits in our ecosystem, 
              from our banana-backed DeFi platform to DAO voting rights.
            </p>
          </div>
          
          <button 
            onClick={() => setIsClaimModalOpen(true)}
            className="w-48 h-48 mx-auto block bg-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
          />
          
          <p className="text-lg md:text-xl mt-6 text-center text-gray-300">
            Get ready for our big reveal and join our community. 
            In the jungle of NFTs, it's not just about monkey business – it's about monkey finance!
          </p>
        </div>

        <div className="mb-12">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">Our partners:</h3>
          <div className="relative h-32 md:h-40 overflow-hidden rounded-lg">
            <div className="flex space-x-4 animate-scroll">
              {partners}
              {partners}
            </div>
          </div>
        </div>
      </div>

      <ClaimModal 
        isOpen={isClaimModalOpen} 
        onClose={() => setIsClaimModalOpen(false)}
        publicKey={publicKey}
      />
    </main>
  );
};

export default React.memo(HomePage);