import React, { useState, useEffect, useRef, memo } from 'react';
import { Menu, X, Volume2, VolumeX, Twitter, MessageCircle } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';

interface LayoutProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  children: React.ReactNode;
}

const Layout = memo(({ currentPage, setCurrentPage, children }: LayoutProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isPlaying, toggleAudio } = useAudio();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col bg-gray-900 text-white ${isMenuOpen ? 'overflow-hidden' : ''}`}>
      <div 
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-in-out ${
          isScrolled ? 'h-16' : 'h-20'
        }`}
        style={{
          background: isMenuOpen 
            ? 'rgba(17, 24, 39, 0.98)' 
            : 'rgba(13, 17, 23, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <button 
            onClick={() => setCurrentPage('home')}
            className={`font-bold transition-all duration-300 ease-in-out ${
              isScrolled ? 'text-xl' : 'text-2xl md:text-3xl'
            } text-yellow-400 hover:text-yellow-300`}
          >
            Money Loving Monkeys
          </button>
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={toggleAudio}
              className="w-8 h-8 rounded-full bg-gray-800/90 hover:bg-gray-700/90 transition-colors duration-300 flex items-center justify-center"
              aria-label={isPlaying ? 'Mute audio' : 'Unmute audio'}
            >
              {isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <nav className="hidden md:block">
              <div className="relative flex gap-2 p-1 bg-gray-800/90 rounded-lg">
                <div 
                  className="absolute inset-y-1 w-[calc(50%-0.25rem)] bg-yellow-400 rounded transition-transform duration-300 ease-out"
                  style={{
                    transform: `translateX(${currentPage === 'home' ? '0' : '100%'})`,
                    marginLeft: currentPage === 'home' ? '0' : '0.5rem'
                  }}
                />
                <button 
                  onClick={() => setCurrentPage('home')}
                  className={`px-4 py-2 rounded z-10 relative transition-colors duration-300 w-24 text-center ${
                    currentPage === 'home' 
                      ? 'text-gray-900 font-semibold' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Home
                </button>
                <button 
                  onClick={() => setCurrentPage('miner')}
                  className={`px-4 py-2 rounded z-10 relative transition-colors duration-300 w-24 text-center ${
                    currentPage === 'miner' 
                      ? 'text-gray-900 font-semibold' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Miner
                </button>
              </div>
            </nav>
            <button
              className="md:hidden w-10 h-10 rounded-lg bg-yellow-400 text-gray-900 flex items-center justify-center hover:bg-yellow-500 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">Toggle menu</span>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md" />
          <div ref={menuRef} className="fixed inset-x-0 top-0 min-h-screen bg-transparent pt-20 px-4">
            <nav className="space-y-2">
              <button
                onClick={() => {
                  setCurrentPage('home');
                  setIsMenuOpen(false);
                }}
                className={`w-full py-4 px-6 text-left text-lg transition-colors rounded-lg ${
                  currentPage === 'home'
                    ? 'bg-yellow-400 text-gray-900 font-semibold'
                    : 'bg-gray-800/90 text-gray-300'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => {
                  setCurrentPage('miner');
                  setIsMenuOpen(false);
                }}
                className={`w-full py-4 px-6 text-left text-lg transition-colors rounded-lg ${
                  currentPage === 'miner'
                    ? 'bg-yellow-400 text-gray-900 font-semibold'
                    : 'bg-gray-800/90 text-gray-300'
                }`}
              >
                Miner
              </button>
            </nav>
          </div>
        </div>
      )}

      <div className="flex-grow pt-16">
        {children}
      </div>

      <footer className="bg-gray-800 py-8">
        <div className="container mx-auto px-4 flex justify-center space-x-8">
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
            <Twitter className="w-8 h-8" />
          </a>
          <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </a>
          <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 transition-colors">
            <MessageCircle className="w-8 h-8" />
          </a>
        </div>
      </footer>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;