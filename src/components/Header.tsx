import { useState } from 'react';
import { DynamicWidget } from '../contexts/DynamicContext';
import { useAuth } from '../hooks/useAuth';
import { Wallet, Info } from 'lucide-react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { HowItWorksModal } from './HowItWorksModal';
import { OnChainInfo } from './OnChainInfo';

export function Header() {
  const { user, primaryWallet, handleLogOut, setShowAuthFlow } = useDynamicContext();
  const { isConnected } = useAuth();
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showOnChainInfo, setShowOnChainInfo] = useState(false);

  const isLoggedIn = !!user || !!primaryWallet;

  const handleConnectClick = () => {
    setShowAuthFlow(true);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-border">
      <div className="w-full px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src="/compazz-logo.png"
                alt="Compazz Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-light text-white tracking-tight">Compazz</h1>
              <p className="text-sm text-light">Live Stream Predictions</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowOnChainInfo(true)}
              className="hidden md:flex items-center space-x-2 text-light hover:text-white transition-colors text-sm font-light"
            >
              <Info className="w-4 h-4" />
              <span>Stats</span>
            </button>

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

      <OnChainInfo
        isOpen={showOnChainInfo}
        onClose={() => setShowOnChainInfo(false)}
      />
    </header>
  );
}
