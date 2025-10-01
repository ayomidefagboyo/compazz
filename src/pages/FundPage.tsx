import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTelegram } from '../contexts/TelegramContext';
import {
  ArrowLeft,
  MessageCircle,
  Shield,
  Vote,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Loader2
} from 'lucide-react';

// Mock fund data - in production this would come from blockchain/API
const mockFundData = {
  'tg1': {
    id: 'tg1',
    name: 'Solana Whales Club',
    description: 'Elite traders copying whale movements and alpha calls from verified Solana whale wallets. Our strategy focuses on identifying and following the top 1% of profitable wallets in the ecosystem.',
    telegramGroup: '@solana_whales_official',
    totalAUM: 2340000,
    members: 145,
    maxMembers: 200,
    return30d: 67.2,
    return7d: 12.8,
    returnTotal: 234.5,
    minContribution: 50,
    managementFee: 2.0,
    performanceFee: 20.0,
    strategy: 'Whale Tracking',
    riskLevel: 'High',
    verified: true,
    avatar: 'https://via.placeholder.com/60x60/3b82f6/ffffff?text=🐋',
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
    chartData: [
      { date: '2024-01-01', value: 100 },
      { date: '2024-02-01', value: 112 },
      { date: '2024-03-01', value: 128 },
      { date: '2024-04-01', value: 145 },
      { date: '2024-05-01', value: 156 },
      { date: '2024-06-01', value: 189 },
      { date: '2024-07-01', value: 198 },
      { date: '2024-08-01', value: 234 },
      { date: '2024-09-01', value: 267 },
      { date: '2024-10-01', value: 334 }
    ],
    recentTrades: [
      { token: 'RAY', action: 'BUY', amount: 15000, profit: 15.2, timestamp: Date.now() - 7200000 },
      { token: 'JUP', action: 'SELL', amount: 8000, profit: -3.1, timestamp: Date.now() - 14400000 },
      { token: 'BONK', action: 'BUY', amount: 25000, profit: 45.7, timestamp: Date.now() - 21600000 },
      { token: 'SOL', action: 'BUY', amount: 5000, profit: 12.3, timestamp: Date.now() - 28800000 }
    ],
    activeVotes: [
      {
        id: 'vote1',
        proposal: 'Buy 100 SOL of BONK?',
        votesFor: 12,
        votesAgainst: 3,
        timeLeft: 4 * 60 * 60 * 1000,
        description: 'BONK has shown strong momentum and whale accumulation patterns. This allocation would represent 5% of our total fund.'
      }
    ]
  }
};

export function FundPage() {
  const { fundId } = useParams<{ fundId: string }>();
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action');

  const { isConnected } = useAuth();
  const { isAuthenticated: isTelegramAuthenticated, loginWithTelegram } = useTelegram();

  const [fund, setFund] = useState<any>(null);
  const [contributionAmount, setContributionAmount] = useState<number>(50);
  const [isLoading, setIsLoading] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(action === 'buy');

  useEffect(() => {
    if (fundId && mockFundData[fundId as keyof typeof mockFundData]) {
      setFund(mockFundData[fundId as keyof typeof mockFundData]);
    }
  }, [fundId]);

  const formatAUM = (aum: number) => {
    if (aum >= 1000000) return `$${(aum / 1000000).toFixed(1)}M`;
    if (aum >= 1000) return `$${(aum / 1000).toFixed(0)}K`;
    return `$${aum.toFixed(0)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getTimeRemaining = (timeLeft: number) => {
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleBuyIndex = async () => {
    setIsLoading(true);
    try {
      if (!isConnected) {
        // In a real app, this would trigger wallet connection
        console.log('Please connect your wallet first');
        alert('Please connect your wallet to continue with the purchase.');
        setIsLoading(false);
        return;
      }

      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Buying ${contributionAmount} SOL into fund ${fundId}`);
      setShowBuyModal(false);
    } catch (error) {
      console.error('Failed to buy index:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!fund) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
          <p className="text-light">Loading fund...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="w-full px-6 lg:px-8 py-20">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-light hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Trading Agents</span>
        </button>

        {/* Fund Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center space-x-4">
            <img src={fund.avatar} alt={fund.name} className="w-20 h-20 rounded-full" />
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-light text-white">{fund.name}</h1>
                {fund.verified && <Shield className="w-6 h-6 text-accent" />}
              </div>
              <div className="flex items-center space-x-4 text-sm text-light">
                <span className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{fund.telegramGroup}</span>
                </span>
                <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full">
                  {fund.strategy}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowBuyModal(true)}
            disabled={fund.members >= fund.maxMembers}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
              fund.members >= fund.maxMembers
                ? 'bg-medium-gray text-light cursor-not-allowed opacity-50'
                : 'bg-accent text-black hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20 transform hover:scale-[1.02]'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>
              {fund.members >= fund.maxMembers ? 'Fund Full' : 'Buy Index'}
            </span>
          </button>
        </div>

        {/* Fund Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="text-2xl font-light text-accent mb-1">+{fund.return30d}%</div>
            <div className="text-sm text-light">30D Return</div>
          </div>
          <div className="card p-6">
            <div className="text-2xl font-light text-white mb-1">{formatAUM(fund.totalAUM)}</div>
            <div className="text-sm text-light">Total AUM</div>
          </div>
          <div className="card p-6">
            <div className="text-2xl font-light text-white mb-1">{fund.members}/{fund.maxMembers}</div>
            <div className="text-sm text-light">Members</div>
          </div>
          <div className="card p-6">
            <div className="text-2xl font-light text-white mb-1">{fund.minContribution} SOL</div>
            <div className="text-sm text-light">Min Entry</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Performance Chart */}
            <div className="card p-6">
              <h2 className="text-xl font-light text-white mb-6 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                <span>Performance</span>
              </h2>
              <div className="h-64 bg-dark-gray rounded-lg flex items-center justify-center">
                <p className="text-light">Performance chart would go here</p>
              </div>
            </div>

            {/* Recent Trades */}
            <div className="card p-6">
              <h2 className="text-xl font-light text-white mb-6">Recent Trades</h2>
              <div className="space-y-4">
                {fund.recentTrades.map((trade: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-dark-gray rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-white font-medium">{trade.token}</div>
                      <div className={`text-sm px-2 py-1 rounded ${
                        trade.action === 'BUY' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                      }`}>
                        {trade.action}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white">{formatAUM(trade.amount)}</div>
                      <div className={`text-sm ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.profit >= 0 ? '+' : ''}{trade.profit}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Fund Description */}
            <div className="card p-6">
              <h3 className="text-lg font-light text-white mb-4">About</h3>
              <p className="text-light leading-relaxed">{fund.description}</p>
            </div>

            {/* Active Votes */}
            {fund.activeVotes.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-light text-white mb-4 flex items-center space-x-2">
                  <Vote className="w-4 h-4 text-blue-400" />
                  <span>Active Votes</span>
                </h3>
                {fund.activeVotes.map((vote: any) => (
                  <div key={vote.id} className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-blue-400">Vote #{vote.id}</span>
                      <span className="text-xs text-light">{getTimeRemaining(vote.timeLeft)} left</span>
                    </div>
                    <div className="text-white mb-2">{vote.proposal}</div>
                    <p className="text-sm text-light mb-4">{vote.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-400">👍 {vote.votesFor}</span>
                      <span className="text-red-400">👎 {vote.votesAgainst}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Fund Details */}
            <div className="card p-6">
              <h3 className="text-lg font-light text-white mb-4">Fund Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-light">Management Fee</span>
                  <span className="text-white">{fund.managementFee}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-light">Performance Fee</span>
                  <span className="text-white">{fund.performanceFee}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-light">Risk Level</span>
                  <span className="text-white">{fund.riskLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-light">Created</span>
                  <span className="text-white">{formatDate(fund.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buy Index Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-charcoal border border-border rounded-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-light text-white mb-6">Buy {fund.name} Index</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-light mb-2">Contribution Amount</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(parseFloat(e.target.value))}
                      min={fund.minContribution}
                      className="flex-1 bg-dark-gray border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                    />
                    <span className="text-light">SOL</span>
                  </div>
                  <p className="text-xs text-light mt-1">Minimum: {fund.minContribution} SOL</p>
                </div>

                <div className="bg-dark-gray p-4 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-light">Management Fee (Annual)</span>
                    <span className="text-white">{fund.managementFee}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-light">Performance Fee</span>
                    <span className="text-white">{fund.performanceFee}%</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowBuyModal(false)}
                  className="flex-1 py-3 px-4 bg-charcoal text-white rounded-xl hover:bg-dark-gray border border-border hover:border-light-gray transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBuyIndex}
                  disabled={contributionAmount < fund.minContribution || isLoading}
                  className="flex-1 py-3 px-4 bg-accent text-black rounded-xl hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center space-x-2 font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : !isConnected ? (
                    <>
                      <DollarSign className="w-4 h-4" />
                      <span>Connect Wallet & Buy</span>
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4" />
                      <span>Buy Index</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}