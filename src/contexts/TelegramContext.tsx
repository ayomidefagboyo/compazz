import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { telegramAuthService, TelegramUser, TelegramCollectiveData } from '../services/telegramAuth';
import { PublicKey } from '@solana/web3.js';
import { useAuth } from '../hooks/useAuth';

interface TelegramContextType {
  // Authentication state
  isAuthenticated: boolean;
  telegramUser: TelegramUser | null;
  isLoading: boolean;
  error: string | null;

  // Authentication methods
  loginWithTelegram: () => Promise<void>;
  logout: () => void;

  // Collective methods
  createCollective: (
    name: string,
    description: string,
    strategy: string,
    minContribution: number,
    maxMembers: number,
    managementFee: number,
    performanceFee: number
  ) => Promise<string>;

  joinCollective: (collectiveId: string, contributionAmount: number) => Promise<string>;
  getUserCollectives: () => Promise<TelegramCollectiveData[]>;
  openTelegramGroup: (groupUsername: string) => void;

  // Vote methods
  createVote: (groupId: string, question: string, options: string[]) => Promise<string>;
  sendGroupMessage: (groupId: string, message: string) => Promise<boolean>;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

interface TelegramProviderProps {
  children: ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { walletAddress } = useAuth();

  // Initialize Telegram Web App on mount
  useEffect(() => {
    const initTelegram = () => {
      try {
        // Try to initialize Telegram Web App
        const initialized = telegramAuthService.initTelegramWebApp();

        if (initialized) {
          // Get user if already authenticated
          const user = telegramAuthService.getTelegramUser();
          if (user) {
            setTelegramUser(user);
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        console.error('Failed to initialize Telegram:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize Telegram');
      }
    };

    // Load Telegram Web App script if not already loaded
    if (typeof window !== 'undefined' && !(window as any).Telegram) {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-web-app.js';
      script.async = true;
      script.onload = initTelegram;
      document.head.appendChild(script);
    } else {
      initTelegram();
    }
  }, []);

  const loginWithTelegram = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if we're in Telegram Web App environment
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        const user = telegramAuthService.getTelegramUser();
        if (user) {
          setTelegramUser(user);
          setIsAuthenticated(true);
          return;
        }
      }

      // For web authentication, simulate the login process
      // In production, this would redirect to Telegram OAuth or open a popup
      const mockUser: TelegramUser = {
        id: Math.floor(Math.random() * 1000000000),
        first_name: 'Demo',
        last_name: 'User',
        username: `user${Math.floor(Math.random() * 10000)}`,
        auth_date: Math.floor(Date.now() / 1000),
        hash: 'demo_hash_' + Math.random().toString(36).substr(2, 16)
      };

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setTelegramUser(mockUser);
      setIsAuthenticated(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to login with Telegram';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setTelegramUser(null);
    setIsAuthenticated(false);
    setError(null);

    // Close Telegram Web App if we're in that environment
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      (window as any).Telegram.WebApp.close();
    }
  };

  const createCollective = async (
    name: string,
    description: string,
    strategy: string,
    minContribution: number,
    maxMembers: number,
    managementFee: number,
    performanceFee: number
  ): Promise<string> => {
    if (!isAuthenticated || !walletAddress) {
      throw new Error('Must be authenticated with both Telegram and wallet');
    }

    setIsLoading(true);
    setError(null);

    try {
      const collectiveId = await telegramAuthService.createTelegramCollective(
        name,
        description,
        strategy,
        minContribution,
        maxMembers,
        managementFee,
        performanceFee,
        new PublicKey(walletAddress)
      );

      return collectiveId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create collective';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const joinCollective = async (collectiveId: string, contributionAmount: number): Promise<string> => {
    if (!isAuthenticated || !walletAddress) {
      throw new Error('Must be authenticated with both Telegram and wallet');
    }

    setIsLoading(true);
    setError(null);

    try {
      const txId = await telegramAuthService.joinTelegramCollective(
        collectiveId,
        contributionAmount,
        new PublicKey(walletAddress)
      );

      return txId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join collective';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserCollectives = async (): Promise<TelegramCollectiveData[]> => {
    if (!walletAddress) {
      return [];
    }

    try {
      return await telegramAuthService.getUserCollectives(new PublicKey(walletAddress));
    } catch (err) {
      console.error('Failed to get user collectives:', err);
      return [];
    }
  };

  const openTelegramGroup = (groupUsername: string): void => {
    telegramAuthService.openTelegramGroup(groupUsername);
  };

  const createVote = async (groupId: string, question: string, options: string[]): Promise<string> => {
    if (!isAuthenticated) {
      throw new Error('Must be authenticated with Telegram');
    }

    try {
      return await telegramAuthService.createGroupVote(groupId, question, options);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create vote';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const sendGroupMessage = async (groupId: string, message: string): Promise<boolean> => {
    if (!isAuthenticated) {
      throw new Error('Must be authenticated with Telegram');
    }

    try {
      return await telegramAuthService.sendGroupMessage(groupId, message);
    } catch (err) {
      console.error('Failed to send group message:', err);
      return false;
    }
  };

  const value: TelegramContextType = {
    // State
    isAuthenticated,
    telegramUser,
    isLoading,
    error,

    // Methods
    loginWithTelegram,
    logout,
    createCollective,
    joinCollective,
    getUserCollectives,
    openTelegramGroup,
    createVote,
    sendGroupMessage
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram(): TelegramContextType {
  const context = useContext(TelegramContext);
  if (context === undefined) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
}

export type { TelegramUser, TelegramCollectiveData };