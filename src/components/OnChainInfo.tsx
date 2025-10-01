import { useState } from 'react';
import { X, ExternalLink, Zap, Shield, TrendingUp, Coins } from 'lucide-react';

interface OnChainInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnChainInfo({ isOpen, onClose }: OnChainInfoProps) {
  if (!isOpen) return null;

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Solana Program Integration",
      description: "Each pool is a Solana program with on-chain state management for deposits, withdrawals, and trading positions."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Perpetual Futures Trading",
      description: "Direct integration with Solana-based perpetual exchanges like Drift Protocol, Mango Markets, and Jupiter."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Smart Contract Security",
      description: "Audited smart contracts with multi-signature governance and automated risk management protocols."
    },
    {
      icon: <Coins className="w-6 h-6" />,
      title: "Real-time P&L Tracking",
      description: "On-chain position tracking with real-time P&L updates and automated profit/loss distribution."
    }
  ];

  const technicalDetails = [
    "Pool funds stored in Solana Program Derived Addresses (PDAs)",
    "Integration with Serum DEX for spot trading and arbitrage",
    "Drift Protocol integration for perpetual futures",
    "Jupiter aggregator for optimal trade routing",
    "Pyth Network for real-time price feeds",
    "Automated liquidation protection and risk management",
    "Governance tokens for pool decision making",
    "Cross-program invocations for complex strategies"
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
      onClick={onClose}
    >
      <div
        className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto my-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-border">
          <h2 className="text-3xl font-light text-white">On-Chain Solana Integration</h2>
          <button
            onClick={onClose}
            className="text-light hover:text-white transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-12">
          {/* Overview */}
          <div>
            <h3 className="text-2xl font-light text-white mb-6">How Pools Work On-Chain</h3>
            <p className="text-lg text-light font-light leading-relaxed mb-6">
              Compazz pools are fully on-chain Solana programs that enable sophisticated perpetual and futures trading. 
              Each pool operates as an autonomous trading entity with AI-driven strategies executed through smart contracts.
            </p>
          </div>

          {/* Key Features */}
          <div>
            <h3 className="text-2xl font-light text-white mb-8">Key Features</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="bg-dark-gray rounded-xl p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center text-accent">
                      {feature.icon}
                    </div>
                    <h4 className="text-xl font-light text-white">{feature.title}</h4>
                  </div>
                  <p className="text-light font-light leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Implementation */}
          <div>
            <h3 className="text-2xl font-light text-white mb-6">Technical Implementation</h3>
            <div className="bg-dark-gray rounded-xl p-6">
              <ul className="space-y-3">
                {technicalDetails.map((detail, index) => (
                  <li key={index} className="flex items-center space-x-3 text-light font-light">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Trading Flow */}
          <div>
            <h3 className="text-2xl font-light text-white mb-6">Trading Flow</h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-black font-medium text-sm">1</div>
                <div>
                  <h4 className="text-lg font-light text-white mb-2">Deposit SOL</h4>
                  <p className="text-light font-light">Users deposit SOL into the pool's PDA, receiving pool tokens representing their share.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-black font-medium text-sm">2</div>
                <div>
                  <h4 className="text-lg font-light text-white mb-2">AI Strategy Execution</h4>
                  <p className="text-light font-light">AI algorithms analyze market data and execute trades on perpetual exchanges via smart contracts.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-black font-medium text-sm">3</div>
                <div>
                  <h4 className="text-lg font-light text-white mb-2">Position Management</h4>
                  <p className="text-light font-light">Positions are managed on-chain with automated risk management and liquidation protection.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-black font-medium text-sm">4</div>
                <div>
                  <h4 className="text-lg font-light text-white mb-2">Profit Distribution</h4>
                  <p className="text-light font-light">Profits are automatically distributed to pool members based on their share percentage.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Integration Partners */}
          <div>
            <h3 className="text-2xl font-light text-white mb-6">Solana Ecosystem Integration</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-dark-gray rounded-xl p-6 text-center">
                <h4 className="text-lg font-light text-white mb-2">Drift Protocol</h4>
                <p className="text-light font-light text-sm">Perpetual futures trading</p>
              </div>
              <div className="bg-dark-gray rounded-xl p-6 text-center">
                <h4 className="text-lg font-light text-white mb-2">Jupiter</h4>
                <p className="text-light font-light text-sm">Optimal trade routing</p>
              </div>
              <div className="bg-dark-gray rounded-xl p-6 text-center">
                <h4 className="text-lg font-light text-white mb-2">Pyth Network</h4>
                <p className="text-light font-light text-sm">Real-time price feeds</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 border-t border-border">
          <button
            onClick={onClose}
            className="w-full px-8 py-4 btn-primary text-lg font-light rounded-xl"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
