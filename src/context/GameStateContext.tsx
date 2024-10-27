import React, { createContext, useContext, useState, useEffect } from 'react';

interface GameState {
  level: number;
  experience: number;
  maxExperience: number;
  stakedAmount: string;
  rewardAmount: string;
  timeLeft: number;
  referralCode: string;
  referredBy: string | null;
  totalReferrals: number;
  referralEarnings: number;
  lastRewardUpdate: number;
}

const generateReferralCode = () => `MLM${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

const defaultGameState: GameState = {
  level: 1,
  experience: 0,
  maxExperience: 100,
  stakedAmount: '0',
  rewardAmount: '0',
  timeLeft: 0,
  referralCode: generateReferralCode(),
  referredBy: null,
  totalReferrals: 0,
  referralEarnings: 0,
  lastRewardUpdate: Date.now(),
};

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export function GameStateProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedState = localStorage.getItem('gameState');
    return savedState ? JSON.parse(savedState) : defaultGameState;
  });

  // Clear existing data
  useEffect(() => {
    localStorage.removeItem('gameState');
    localStorage.removeItem('claimed_mlm_wallets');
    setGameState(defaultGameState);
  }, []);

  // Update rewards in the actual state less frequently
  useEffect(() => {
    const interval = setInterval(() => {
      if (parseFloat(gameState.stakedAmount) > 0) {
        const now = Date.now();
        const hoursSinceLastUpdate = (now - gameState.lastRewardUpdate) / (1000 * 60 * 60);
        const baseAPR = 150;
        const currentAPR = baseAPR * (1 + (gameState.level * 0.2));
        const dailyRate = currentAPR / 365 / 100;
        const newReward = parseFloat(gameState.stakedAmount) * dailyRate * hoursSinceLastUpdate;
        
        setGameState(prev => ({
          ...prev,
          rewardAmount: (parseFloat(prev.rewardAmount) + newReward).toFixed(6),
          lastRewardUpdate: now
        }));
      }
    }, 60000); // Update state every minute

    return () => clearInterval(interval);
  }, [gameState.stakedAmount, gameState.level, gameState.lastRewardUpdate]);

  useEffect(() => {
    localStorage.setItem('gameState', JSON.stringify(gameState));
  }, [gameState]);

  const updateGameState = (updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  const resetGameState = () => {
    localStorage.removeItem('gameState');
    localStorage.removeItem('claimed_mlm_wallets');
    setGameState({
      ...defaultGameState,
      referralCode: generateReferralCode(),
    });
  };

  return (
    <GameStateContext.Provider value={{ gameState, updateGameState, resetGameState }}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}