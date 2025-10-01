import { useState } from 'react';
import { TrendingUp, Sparkles, ArrowRight, Users, Award } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTradingPools, usePoolMembership } from '../hooks/useTradingPools';
import { useLeaderboard, useAchievements } from '../hooks/useLeaderboard';
import { useGovernance } from '../hooks/useGovernance';
import { useSolanaTransactions } from '../hooks/useSolanaTransactions';
import { PoolCard } from '../components/PoolCard';
import { DepositModal } from '../components/DepositModal';
import { LeaderboardTable } from '../components/LeaderboardTable';
import { AchievementCard } from '../components/AchievementCard';
import { HowItWorksModal } from '../components/HowItWorksModal';

export function HomePage() {
  const { userId, isConnected, loading: authLoading } = useAuth();
  const { pools, loading: poolsLoading } = useTradingPools();
  const { memberships } = usePoolMembership(userId);
  const { entries: leaderboard } = useLeaderboard();
  const { achievements, hasAchievement } = useAchievements(userId);
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const { proposals, vote } = useGovernance(selectedPoolId);
  const { depositToPool } = useSolanaTransactions();

  const [depositModal, setDepositModal] = useState<{
    isOpen: boolean;
    poolId: string;
    poolName: string;
    minDeposit: number;
  }>({
    isOpen: false,
    poolId: '',
    poolName: '',
    minDeposit: 0,
  });

  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const handleJoinPool = (poolId: string) => {
    if (!isConnected) return;
    
    const pool = pools.find((p) => p.id === poolId);
    if (pool) {
      setDepositModal({
        isOpen: true,
        poolId: pool.id,
        poolName: pool.name,
        minDeposit: pool.min_deposit,
      });
    }
  };

  const handleDeposit = async (amount: number) => {
    try {
      await depositToPool(depositModal.poolId, amount);
      setDepositModal({ isOpen: false, poolId: '', poolName: '', minDeposit: 0 });
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  const handleVote = async (proposalId: string, voteType: 'for' | 'against') => {
    try {
      await vote(proposalId, voteType);
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  const isMember = (poolId: string) => {
    return memberships.some((m) => m.pool_id === poolId);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-light text-lg font-light">Loading Compazz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="text-center py-32">
        <div className="w-24 h-24 bg-charcoal border border-border rounded-2xl flex items-center justify-center mx-auto mb-8">
          <TrendingUp className="w-12 h-12 text-accent" />
        </div>
        <h1 className="text-6xl font-light text-white mb-6 tracking-tight">
          Welcome to Compazz
        </h1>
        <p className="text-xl text-light mb-12 max-w-3xl mx-auto font-light leading-relaxed">
          The premium gamified trading platform on Solana. Join exclusive pools,
          deposit SOL, earn from AI-driven trades, and govern your pool's strategy.
        </p>
        <div className="flex items-center justify-center space-x-8">
          {!isConnected && (
            <div className="flex items-center space-x-3 text-accent text-lg font-medium">
              <Sparkles className="w-5 h-5" />
              <span>Connect your wallet to participate</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          )}
          <button
            onClick={() => setShowHowItWorks(true)}
            className="px-8 py-4 btn-secondary text-lg font-light rounded-xl"
          >
            How It Works
          </button>
        </div>
      </div>

      {/* Featured Pools Preview */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-light text-white mb-4 tracking-tight">Featured Pools</h2>
          <p className="text-lg text-light font-light">Exclusive pools for sophisticated traders</p>
        </div>

        {poolsLoading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-light">Loading pools...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {pools.slice(0, 3).map((pool) => (
              <PoolCard
                key={pool.id}
                pool={pool}
                onJoin={handleJoinPool}
                isMember={isMember(pool.id)}
                isConnected={isConnected}
              />
            ))}
          </div>
        )}

        <div className="text-center">
          <a
            href="#pools"
            className="inline-flex items-center space-x-3 px-8 py-4 btn-primary text-lg font-light rounded-xl"
          >
            <span>View All Pools</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-charcoal border border-border rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-3xl font-light text-white mb-2">1,247</h3>
            <p className="text-light font-light">Active Traders</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-charcoal border border-border rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-3xl font-light text-white mb-2">+24.7%</h3>
            <p className="text-light font-light">Average Returns</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-charcoal border border-border rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-3xl font-light text-white mb-2">$2.4M</h3>
            <p className="text-light font-light">Total Volume</p>
          </div>
        </div>
      </div>

      <DepositModal
        isOpen={depositModal.isOpen}
        onClose={() =>
          setDepositModal({ isOpen: false, poolId: '', poolName: '', minDeposit: 0 })
        }
        onDeposit={handleDeposit}
        poolName={depositModal.poolName}
        minDeposit={depositModal.minDeposit}
      />

      <HowItWorksModal
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
      />
    </div>
  );
}
