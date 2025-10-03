import { DynamicWidget } from '../contexts/DynamicContext';
import { useAuth } from '../hooks/useAuth';
import { Wallet, Info, HelpCircle, Gift } from 'lucide-react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

interface HeaderProps {
  onShowHowItWorks: () => void;
  onShowReferEarn: () => void;
  onShowOnChainInfo: () => void;
}

export function Header({ onShowHowItWorks, onShowReferEarn, onShowOnChainInfo }: HeaderProps) {
  const dynamicContext = useDynamicContext();
  const { user, primaryWallet, handleLogOut, setShowAuthFlow } = dynamicContext;
  const { isConnected } = useAuth();

  const isLoggedIn = !!user || !!primaryWallet;

  const handleConnectClick = () => {
    if (!setShowAuthFlow) {
      console.error('Wallet connection is not available. Please refresh the page and try again.');
      return;
    }

    try {
      setShowAuthFlow(true);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-border">
      <div className="w-full px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 flex items-center justify-center">
              <img
                src="/compazz-logo.png"
                alt="Compazz Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-light text-white tracking-tight">Compazz</h1>
            </div>
          </button>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={onShowHowItWorks}
              className="flex items-center space-x-2 text-light hover:text-white transition-colors text-sm font-light"
            >
              <HelpCircle className="w-4 h-4" />
              <span>How it Works</span>
            </button>
            <button
              onClick={onShowReferEarn}
              className="flex items-center space-x-2 text-light hover:text-white transition-colors text-sm font-light"
            >
              <Gift className="w-4 h-4" />
              <span>Refer & Earn</span>
            </button>
            <button
              onClick={onShowOnChainInfo}
              className="flex items-center space-x-2 text-light hover:text-white transition-colors text-sm font-light"
            >
              <Info className="w-4 h-4" />
              <span>Stats</span>
            </button>
          </nav>

          {/* Mobile Navigation */}
          <nav className="md:hidden flex items-center space-x-4">
            <button
              onClick={onShowHowItWorks}
              className="text-light hover:text-white transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={onShowReferEarn}
              className="text-light hover:text-white transition-colors"
            >
              <Gift className="w-4 h-4" />
            </button>
            <button
              onClick={onShowOnChainInfo}
              className="text-light hover:text-white transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            {isLoggedIn || isConnected ? (
              <div className="flex items-center space-x-4">
                <DynamicWidget />
                <button
                  onClick={handleLogOut}
                  className="flex items-center space-x-2 px-4 py-2 btn-secondary text-sm font-light rounded-xl"
                >
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectClick}
                className="flex items-center space-x-2 md:space-x-3 px-4 md:px-6 py-2 md:py-3 bg-white text-black text-sm md:text-lg font-medium rounded-xl hover:bg-gray-100 transition-all border border-white/20 shadow-lg"
              >
                <Wallet className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="sm:hidden">Connect</span>
              </button>
            )}
          </div>
        </div>
      </div>

    </header>
  );
}
