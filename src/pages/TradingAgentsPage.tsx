import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTradingAgents } from '../services/solanaIntegration';
import { useTelegram } from '../contexts/TelegramContext';
import { Bot, Users, DollarSign, Plus, Shield, MessageCircle, Vote, ArrowUpRight } from 'lucide-react';

// Mock trading agents data
const mockTradingAgents = [
  {
    id: '1',
    name: 'SOL Alpha Hunter',
    type: 'Platform Agent',
    creator: 'CompazzAI',
    description: 'AI-powered agent that hunts for alpha opportunities in the Solana ecosystem',
    aum: 245000,
    subscribers: 1247,
    return30d: 34.5,
    fee: 2.5,
    riskScore: 'Medium',
    verified: true,
    avatar: 'https://via.placeholder.com/50x50/10b981/ffffff?text=SA',
    recentTrades: [
      { token: 'JUP', action: 'BUY', amount: 1000, timestamp: Date.now() - 3600000 },
      { token: 'BONK', action: 'SELL', amount: 500, timestamp: Date.now() - 7200000 }
    ]
  },
  {
    id: '2',
    name: 'DeFi Yield Master',
    type: 'Yield Agent',
    creator: 'YieldGuru',
    description: 'Automated yield farming and staking strategies across Solana DeFi protocols',
    aum: 180000,
    subscribers: 892,
    return30d: 12.8,
    fee: 1.5,
    riskScore: 'Low',
    verified: true,
    avatar: 'https://via.placeholder.com/50x50/3b82f6/ffffff?text=DY',
    recentTrades: [
      { token: 'USDC', action: 'STAKE', amount: 2000, timestamp: Date.now() - 1800000 },
      { token: 'SOL', action: 'LP', amount: 800, timestamp: Date.now() - 5400000 }
    ]
  },
  {
    id: '3',
    name: 'Meme Coin Degen',
    type: 'Meme Agent',
    creator: 'PumpHunter',
    description: 'High-risk, high-reward meme coin trading with early pump detection',
    aum: 95000,
    subscribers: 634,
    return30d: 156.2,
    fee: 5.0,
    riskScore: 'High',
    verified: false,
    avatar: 'https://via.placeholder.com/50x50/ef4444/ffffff?text=MC',
    recentTrades: [
      { token: 'PEPE2', action: 'BUY', amount: 300, timestamp: Date.now() - 900000 },
      { token: 'DOGE', action: 'SELL', amount: 150, timestamp: Date.now() - 2700000 }
    ]
  },
  {
    id: '4',
    name: 'Whale Tracker Pro',
    type: 'Wallet Tracker',
    creator: 'Anonymous',
    description: 'Mirrors trades from top Solana whale wallet: 7xKXt...9mGH',
    aum: 320000,
    subscribers: 2156,
    return30d: 28.7,
    fee: 3.0,
    riskScore: 'Medium',
    verified: true,
    avatar: 'https://via.placeholder.com/50x50/8b5cf6/ffffff?text=WT',
    recentTrades: [
      { token: 'RAY', action: 'BUY', amount: 5000, timestamp: Date.now() - 1200000 },
      { token: 'ORCA', action: 'SELL', amount: 2000, timestamp: Date.now() - 3600000 }
    ]
  }
];

// Mock social trading funds data
const mockSocialFunds = [
  {
    id: 'tg1',
    name: 'Solana Whales Club',
    description: 'Elite traders copying whale movements and alpha calls',
    telegramGroup: '@solana_whales_official',
    totalAUM: 2340000,
    members: 145,
    maxMembers: 200,
    return30d: 67.2,
    return7d: 12.8,
    minContribution: 50,
    managementFee: 2.0,
    performanceFee: 20.0,
    strategy: 'Whale Tracking',
    riskLevel: 'High',
    verified: true,
    avatar: 'https://via.placeholder.com/60x60/3b82f6/ffffff?text=🐋',
    recentTrades: [
      { token: 'RAY', action: 'BUY', amount: 15000, profit: 15.2, timestamp: Date.now() - 7200000 },
      { token: 'JUP', action: 'SELL', amount: 8000, profit: -3.1, timestamp: Date.now() - 14400000 }
    ],
    activeVotes: [
      { proposal: 'Buy 100 SOL of BONK?', votesFor: 12, votesAgainst: 3, timeLeft: 4 * 60 * 60 * 1000 }
    ],
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000 // 90 days ago
  },
  {
    id: 'tg2',
    name: 'Degen Traders United',
    description: 'High-risk meme coin hunting with community alpha sharing',
    telegramGroup: '@degen_traders_united',
    totalAUM: 156000,
    members: 23,
    maxMembers: 50,
    return30d: 156.7,
    return7d: 45.3,
    minContribution: 10,
    managementFee: 1.5,
    performanceFee: 25.0,
    strategy: 'Meme Hunting',
    riskLevel: 'Very High',
    verified: false,
    avatar: 'https://via.placeholder.com/60x60/ef4444/ffffff?text=🚀',
    recentTrades: [
      { token: 'PEPE2', action: 'BUY', amount: 3000, profit: 234.5, timestamp: Date.now() - 3600000 },
      { token: 'DOGE', action: 'SELL', amount: 1500, profit: 87.2, timestamp: Date.now() - 10800000 }
    ],
    activeVotes: [
      { proposal: 'Set stop-loss at -10%?', votesFor: 8, votesAgainst: 2, timeLeft: 24 * 60 * 60 * 1000 }
    ],
    createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000 // 45 days ago
  },
  {
    id: 'tg3',
    name: 'DeFi Yield Collective',
    description: 'Conservative yield farming and staking strategies',
    telegramGroup: '@defi_yield_collective',
    totalAUM: 890000,
    members: 67,
    maxMembers: 100,
    return30d: 18.4,
    return7d: 3.2,
    minContribution: 25,
    managementFee: 1.0,
    performanceFee: 15.0,
    strategy: 'Yield Farming',
    riskLevel: 'Low',
    verified: true,
    avatar: 'https://via.placeholder.com/60x60/10b981/ffffff?text=💰',
    recentTrades: [
      { token: 'USDC', action: 'STAKE', amount: 50000, profit: 8.7, timestamp: Date.now() - 21600000 },
      { token: 'SOL', action: 'LP', amount: 25000, profit: 12.3, timestamp: Date.now() - 32400000 }
    ],
    activeVotes: [
      { proposal: 'Move 30% to new Orca pool?', votesFor: 15, votesAgainst: 8, timeLeft: 6 * 60 * 60 * 1000 }
    ],
    createdAt: Date.now() - 120 * 24 * 60 * 60 * 1000 // 120 days ago
  }
];

export function TradingAgentsPage() {
  const navigate = useNavigate();
  const { isConnected } = useAuth();
  const { subscribeToAgent, createWalletTrackerAgent } = useTradingAgents();
  const {
    isAuthenticated: isTelegramAuthenticated,
    loginWithTelegram,
    createCollective: createTelegramCollective,
    joinCollective: joinTelegramCollective,
    openTelegramGroup,
    isLoading: telegramLoading
  } = useTelegram();
  const [agents] = useState(mockTradingAgents);
  const [funds] = useState(mockSocialFunds);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [showCreateFund, setShowCreateFund] = useState(false);

  const categories = [
    { id: 'all', name: 'All', count: agents.length + funds.length },
    { id: 'social_funds', name: 'Social Funds', count: funds.length },
    { id: 'Platform Agent', name: 'Platform Agents', count: agents.filter(a => a.type === 'Platform Agent').length },
    { id: 'Wallet Tracker', name: 'Wallet Trackers', count: agents.filter(a => a.type === 'Wallet Tracker').length },
    { id: 'Yield Agent', name: 'Yield Agents', count: agents.filter(a => a.type === 'Yield Agent').length },
    { id: 'Meme Agent', name: 'Meme Agents', count: agents.filter(a => a.type === 'Meme Agent').length },
  ];

  const filteredAgents = selectedCategory === 'all' || selectedCategory === 'social_funds'
    ? (selectedCategory === 'social_funds' ? [] : agents)
    : agents.filter(agent => agent.type === selectedCategory);

  const filteredFunds = selectedCategory === 'all' || selectedCategory === 'social_funds'
    ? funds
    : [];

  const formatAUM = (aum: number) => {
    if (aum >= 1000000) return `$${(aum / 1000000).toFixed(1)}M`;
    if (aum >= 1000) return `$${(aum / 1000).toFixed(0)}K`;
    return `$${aum.toFixed(0)}`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'High': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getReturnColor = (returnValue: number) => {
    return returnValue >= 0 ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="w-full px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="mb-12 text-center mt-8">
          <h1 className="text-4xl font-light text-white mb-4">
            Trading <span className="text-accent">Agents</span>
          </h1>
          <div className="flex items-center justify-center space-x-8 text-sm text-light">
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-accent" />
              <span>{agents.length} Individual Agents</span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4 text-accent" />
              <span>{funds.length} Social Funds</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>{(agents.reduce((sum, a) => sum + a.subscribers, 0) + funds.reduce((sum, f) => sum + f.members, 0)).toLocaleString()} Total Members</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>{formatAUM(agents.reduce((sum, a) => sum + a.aum, 0) + funds.reduce((sum, f) => sum + f.totalAUM, 0))} Total AUM</span>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-charcoal text-accent border-2 border-accent font-bold'
                    : 'bg-charcoal text-light hover:bg-dark-gray hover:text-white border-2 border-transparent'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Create CTA */}
        <div className="mb-8 text-center space-x-4">
          <button
            onClick={() => setShowCreateAgent(true)}
            className="bg-accent text-black px-6 py-3 rounded-xl font-medium hover:bg-accent/80 transition-colors inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Agent</span>
          </button>
          <button
            onClick={() => setShowCreateFund(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Create Social Fund</span>
          </button>
        </div>

        {/* Social Funds Grid */}
        {filteredFunds.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-light text-white mb-6 flex items-center space-x-2">
              <MessageCircle className="w-6 h-6 text-accent" />
              <span>Social Funds</span>
            </h2>
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredFunds.map((fund) => {
                const getTimeRemaining = (timeLeft: number) => {
                  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                  if (hours > 0) return `${hours}h ${minutes}m`;
                  return `${minutes}m`;
                };

                return (
                  <div
                    key={fund.id}
                    className="card overflow-hidden group hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                    onClick={() => {
                      navigate(`/fund/${fund.id}`);
                    }}
                  >
                    <div className="p-6">
                      {/* Fund Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <img src={fund.avatar} alt={fund.name} className="w-14 h-14 rounded-full" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-medium text-white">{fund.name}</h3>
                              {fund.verified && <Shield className="w-4 h-4 text-accent" />}
                            </div>
                            <div className="text-sm text-light">{fund.telegramGroup}</div>
                          </div>
                        </div>
                        <span className="bg-blue-600/20 text-blue-400 text-xs px-2 py-1 rounded-full font-medium">
                          Fund
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-light text-sm mb-4 leading-relaxed">{fund.description}</p>

                      {/* Performance & Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-dark-gray rounded-lg p-3">
                          <div className="text-xs text-light mb-1">30D Return</div>
                          <div className="text-lg font-bold text-green-400">
                            +{fund.return30d}%
                          </div>
                        </div>
                        <div className="bg-dark-gray rounded-lg p-3">
                          <div className="text-xs text-light mb-1">Total AUM</div>
                          <div className="text-lg font-bold text-white">{formatAUM(fund.totalAUM)}</div>
                        </div>
                      </div>

                      {/* Members & Details */}
                      <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                        <div>
                          <div className="text-xs text-light">Members</div>
                          <div className="text-sm font-medium text-white">{fund.members}/{fund.maxMembers}</div>
                        </div>
                        <div>
                          <div className="text-xs text-light">Min Entry</div>
                          <div className="text-sm font-medium text-white">{fund.minContribution} SOL</div>
                        </div>
                        <div>
                          <div className="text-xs text-light">Strategy</div>
                          <div className="text-sm font-medium text-white">{fund.strategy}</div>
                        </div>
                      </div>

                      {/* Buy Index Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click navigation
                          if (fund.members >= fund.maxMembers) {
                            return; // Do nothing if fund is full
                          }
                          // Always navigate to fund page - let the fund page handle wallet connection
                          navigate(`/fund/${fund.id}?action=buy`);
                        }}
                        disabled={fund.members >= fund.maxMembers}
                        className={`w-full py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                          fund.members >= fund.maxMembers
                            ? 'bg-medium-gray text-light cursor-not-allowed opacity-50'
                            : 'bg-accent text-black hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20 cursor-pointer transform hover:scale-[1.02]'
                        }`}
                        style={fund.members < fund.maxMembers ? { backgroundColor: '#00ff88' } : undefined}
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>
                          {fund.members >= fund.maxMembers
                            ? 'Fund Full'
                            : 'Buy Index'
                          }
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Individual Trading Agents Grid */}
        {filteredAgents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-light text-white mb-6 flex items-center space-x-2">
              <Bot className="w-6 h-6 text-accent" />
              <span>Individual Agents</span>
            </h2>
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <div key={agent.id} className="card overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
              <div className="p-6">
                {/* Agent Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img src={agent.avatar} alt={agent.name} className="w-12 h-12 rounded-full" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-white">{agent.name}</h3>
                        {agent.verified && <Shield className="w-4 h-4 text-accent" />}
                      </div>
                      <div className="text-sm text-light">by {agent.creator}</div>
                    </div>
                  </div>
                  <span className="bg-charcoal text-accent text-xs px-2 py-1 rounded-full font-medium">
                    {agent.type}
                  </span>
                </div>

                {/* Description */}
                <p className="text-light text-sm mb-4 leading-relaxed">{agent.description}</p>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-dark-gray rounded-lg p-3">
                    <div className="text-xs text-light mb-1">30D Return</div>
                    <div className={`text-lg font-bold ${getReturnColor(agent.return30d)}`}>
                      +{agent.return30d}%
                    </div>
                  </div>
                  <div className="bg-dark-gray rounded-lg p-3">
                    <div className="text-xs text-light mb-1">AUM</div>
                    <div className="text-lg font-bold text-white">{formatAUM(agent.aum)}</div>
                  </div>
                </div>

                {/* Agent Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div>
                    <div className="text-xs text-light">Subscribers</div>
                    <div className="text-sm font-medium text-white">{agent.subscribers.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-light">Fee</div>
                    <div className="text-sm font-medium text-white">{agent.fee}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-light">Risk</div>
                    <div className={`text-sm font-medium ${getRiskColor(agent.riskScore)}`}>{agent.riskScore}</div>
                  </div>
                </div>

                {/* Recent Trades */}
                <div className="mb-4">
                  <div className="text-xs text-light mb-2">Recent Trades</div>
                  <div className="space-y-1">
                    {agent.recentTrades.slice(0, 2).map((trade, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-light">
                          {trade.action} {trade.token}
                        </span>
                        <span className="text-white">${trade.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subscribe Button */}
                <button
                  onClick={() => {
                    if (isConnected) {
                      subscribeToAgent(agent.id, 100); // Subscribe with 100 SOL
                    }
                  }}
                  disabled={!isConnected}
                  className={`w-full py-3 rounded-lg font-medium transition-all ${
                    isConnected
                      ? 'bg-accent text-black hover:bg-accent/80'
                      : 'bg-medium-gray text-light cursor-not-allowed opacity-50'
                  }`}
                >
                  {isConnected ? 'Subscribe' : 'Connect Wallet'}
                </button>
              </div>
            </div>
          ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredAgents.length === 0 && filteredFunds.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-dark-gray rounded-full flex items-center justify-center mx-auto mb-6">
              <Bot className="w-8 h-8 text-light" />
            </div>
            <h3 className="text-xl font-light text-white mb-2">No trading options found</h3>
            <p className="text-light font-light">Try a different category or create your own agent or fund.</p>
          </div>
        )}

        {/* Modals */}
        <>
          {/* Create Agent Modal */}
          {showCreateAgent && (
            <CreateAgentModal
              isOpen={showCreateAgent}
              onClose={() => setShowCreateAgent(false)}
              onCreateAgent={createWalletTrackerAgent}
            />
          )}

          {/* Create Fund Modal */}
          {showCreateFund && (
            <CreateFundModal
              isOpen={showCreateFund}
              onClose={() => setShowCreateFund(false)}
              onCreateFund={async (name, description, strategy, minContribution, maxMembers, managementFee, performanceFee, telegramOption, existingGroupId, groupInviteLink) => {
                if (!isTelegramAuthenticated) {
                  await loginWithTelegram();
                }

                // Import the new fund management service
                const { fundManagementService } = await import('../services/fundManagement');

                // Create fund using the new service
                const result = await fundManagementService.createFund({
                  name,
                  description,
                  strategy,
                  minContribution,
                  maxMembers,
                  managementFee,
                  performanceFee,
                  creator: new (await import('@solana/web3.js')).PublicKey('11111111111111111111111111111111'), // Mock creator
                  telegramOption,
                  existingGroupId,
                  inviteLink: groupInviteLink
                });

                return result.fundId;
              }}
            />
          )}
        </>
      </div>
    </div>
  );
}

// Create Agent Modal Component
function CreateAgentModal({
  isOpen,
  onClose,
  onCreateAgent
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreateAgent: (walletAddress: string, name: string, description: string, fee: number) => Promise<string>;
}) {
  const [walletAddress, setWalletAddress] = useState('');
  const [agentName, setAgentName] = useState('');
  const [description, setDescription] = useState('');
  const [feePercentage, setFeePercentage] = useState(2.5);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!walletAddress || !agentName || !description) return;

    setIsCreating(true);
    try {
      await onCreateAgent(walletAddress, agentName, description, feePercentage);
      onClose();
      // Reset form
      setWalletAddress('');
      setAgentName('');
      setDescription('');
      setFeePercentage(2.5);
    } catch (error) {
      console.error('Failed to create agent:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-charcoal border border-border rounded-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-xl font-light text-white">Create Wallet Tracker Agent</h3>
          <button onClick={onClose} className="text-light hover:text-white transition-colors">
            <Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-light mb-2">Wallet Address to Track</label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="7xKXtTu6vKLfqKGqHr9mGHpPznn..."
              className="w-full bg-dark-gray border border-border rounded-lg px-4 py-3 text-white placeholder-light focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-light mb-2">Agent Name</label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Whale Tracker Pro"
              className="w-full bg-dark-gray border border-border rounded-lg px-4 py-3 text-white placeholder-light focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-light mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tracks and copies trades from a successful Solana whale wallet..."
              className="w-full bg-dark-gray border border-border rounded-lg px-4 py-3 text-white placeholder-light focus:outline-none focus:border-accent"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-light mb-2">Fee Percentage</label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={feePercentage}
                onChange={(e) => setFeePercentage(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-accent font-medium">{feePercentage}%</span>
            </div>
            <p className="text-xs text-light mt-1">Fee charged to subscribers (1-5%)</p>
          </div>

          <div className="bg-dark-gray p-4 rounded-lg">
            <p className="text-xs text-light">
              <strong>How it works:</strong> Your agent will automatically copy all trades from the wallet you specify.
              Subscribers' funds will mirror the tracked wallet's trades proportionally.
              You earn {feePercentage}% from subscriber profits.
            </p>
          </div>

          <button
            onClick={handleCreate}
            disabled={!walletAddress || !agentName || !description || isCreating}
            className="w-full bg-accent text-black py-3 rounded-lg font-medium hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating Agent...' : 'Create Agent'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Create Fund Modal Component
function CreateFundModal({
  isOpen,
  onClose,
  onCreateFund
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreateFund: (name: string, description: string, strategy: string, minContribution: number, maxMembers: number, managementFee: number, performanceFee: number, telegramOption: 'create_new' | 'use_existing', existingGroupId?: string, groupInviteLink?: string) => Promise<string>;
}) {
  const [fundName, setFundName] = useState('');
  const [description, setDescription] = useState('');
  const [strategy, setStrategy] = useState('Whale Tracking');
  const [minContribution, setMinContribution] = useState(10);
  const [maxMembers, setMaxMembers] = useState(50);
  const [managementFee, setManagementFee] = useState(2.0);
  const [performanceFee, setPerformanceFee] = useState(20.0);
  const [isCreating, setIsCreating] = useState(false);
  const [telegramOption, setTelegramOption] = useState<'create_new' | 'use_existing'>('create_new');
  const [existingGroupId, setExistingGroupId] = useState('');
  const [groupInviteLink, setGroupInviteLink] = useState('');

  const handleCreate = async () => {
    if (!fundName || !description) return;

    setIsCreating(true);
    try {
      await onCreateFund(
        fundName,
        description,
        strategy,
        minContribution,
        maxMembers,
        managementFee,
        performanceFee,
        telegramOption,
        existingGroupId || undefined,
        groupInviteLink || undefined
      );
      onClose();
      // Reset form
      setFundName('');
      setDescription('');
      setStrategy('Whale Tracking');
      setMinContribution(10);
      setMaxMembers(50);
      setManagementFee(2.0);
      setPerformanceFee(20.0);
      setTelegramOption('create_new');
      setExistingGroupId('');
      setGroupInviteLink('');
    } catch (error) {
      console.error('Failed to create fund:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-charcoal border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600/10 border border-blue-600/20 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-xl font-light text-white">Create Social Fund</h3>
          </div>
          <button onClick={onClose} className="text-light hover:text-white transition-colors">
            <Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-light mb-2">Fund Name</label>
              <input
                type="text"
                value={fundName}
                onChange={(e) => setFundName(e.target.value)}
                placeholder="Degen Traders United"
                className="w-full bg-dark-gray border border-border rounded-lg px-4 py-3 text-white placeholder-light focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-light mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="High-risk meme coin hunting with community alpha sharing..."
                className="w-full bg-dark-gray border border-border rounded-lg px-4 py-3 text-white placeholder-light focus:outline-none focus:border-accent"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-light mb-2">Trading Strategy</label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full bg-dark-gray border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
              >
                <option value="Whale Tracking">Whale Tracking</option>
                <option value="Meme Hunting">Meme Hunting</option>
                <option value="Yield Farming">Yield Farming</option>
                <option value="DeFi Alpha">DeFi Alpha</option>
                <option value="Arbitrage">Arbitrage</option>
                <option value="Mixed Strategy">Mixed Strategy</option>
              </select>
            </div>
          </div>

          {/* Fund Settings */}
          <div className="border-t border-border pt-6">
            <h4 className="text-lg font-medium text-white mb-4">Fund Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-light mb-2">Min Contribution (SOL)</label>
                <input
                  type="number"
                  value={minContribution}
                  onChange={(e) => setMinContribution(parseFloat(e.target.value))}
                  min="1"
                  max="1000"
                  className="w-full bg-dark-gray border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light mb-2">Max Members</label>
                <input
                  type="number"
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(parseInt(e.target.value))}
                  min="5"
                  max="500"
                  className="w-full bg-dark-gray border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          {/* Fee Structure */}
          <div className="border-t border-border pt-6">
            <h4 className="text-lg font-medium text-white mb-4">Fee Structure</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light mb-2">Management Fee (Annual)</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={managementFee}
                    onChange={(e) => setManagementFee(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-accent font-medium w-12">{managementFee}%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-light mb-2">Performance Fee</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={performanceFee}
                    onChange={(e) => setPerformanceFee(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-accent font-medium w-12">{performanceFee}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Telegram Group Configuration */}
          <div className="border-t border-border pt-6">
            <h4 className="text-lg font-medium text-white mb-4 flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              <span>Telegram Group Setup</span>
            </h4>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="telegramOption"
                    value="create_new"
                    checked={telegramOption === 'create_new'}
                    onChange={(e) => setTelegramOption(e.target.value as 'create_new' | 'use_existing')}
                    className="text-accent"
                  />
                  <div>
                    <div className="text-white font-medium">Create New Group</div>
                    <div className="text-sm text-light">Bot will create a new Telegram group for your fund</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="telegramOption"
                    value="use_existing"
                    checked={telegramOption === 'use_existing'}
                    onChange={(e) => setTelegramOption(e.target.value as 'create_new' | 'use_existing')}
                    className="text-accent"
                  />
                  <div>
                    <div className="text-white font-medium">Use Existing Group</div>
                    <div className="text-sm text-light">Add bot to your existing Telegram group</div>
                  </div>
                </label>
              </div>

              {telegramOption === 'use_existing' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-light mb-2">Group ID or Username</label>
                    <input
                      type="text"
                      value={existingGroupId}
                      onChange={(e) => setExistingGroupId(e.target.value)}
                      placeholder="@your_group or group ID"
                      className="w-full bg-dark-gray border border-border rounded-lg px-4 py-3 text-white placeholder-light focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-light mb-2">Invite Link (Optional)</label>
                    <input
                      type="url"
                      value={groupInviteLink}
                      onChange={(e) => setGroupInviteLink(e.target.value)}
                      placeholder="https://t.me/+abc123"
                      className="w-full bg-dark-gray border border-border rounded-lg px-4 py-3 text-white placeholder-light focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="bg-orange-600/10 border border-orange-600/20 rounded-lg p-3">
                    <p className="text-xs text-orange-400">
                      <strong>Important:</strong> Make sure to add @CompazzBot as an admin to your group before creating the fund.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* How it Works */}
          <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
            <h5 className="text-blue-400 font-medium mb-2">How Social Funds Work</h5>
            <ul className="text-xs text-light space-y-1">
              <li>• Creates a private Telegram group with your fund bot</li>
              <li>• Members join group and contribute SOL to shared fund</li>
              <li>• Group votes democratically on all trading decisions</li>
              <li>• Profits are distributed proportionally to contributions</li>
              <li>• You earn {managementFee}% management + {performanceFee}% performance fees</li>
            </ul>
          </div>

          <button
            onClick={handleCreate}
            disabled={!fundName || !description || isCreating}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating Fund...' : 'Create Social Fund'}
          </button>
        </div>
      </div>
    </div>
  );
}