import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTradingPools, usePoolMembership } from '../hooks/useTradingPools';
import { useLeaderboard, useAchievements } from '../hooks/useLeaderboard';
import { useGovernance } from '../hooks/useGovernance';
import { useSolanaTransactions } from '../hooks/useSolanaTransactions';
import { PoolCard } from '../components/PoolCard';
import { DepositModal } from '../components/DepositModal';
import { LeaderboardTable } from '../components/LeaderboardTable';
import { AchievementCard } from '../components/AchievementCard';

export function PoolsPage() {
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
      {/* Pools Section */}
      <div className="w-full px-6 lg:px-8 pt-32 pb-20">
        {poolsLoading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-light">Loading pools...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pools.map((pool) => (
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

        {pools.length === 0 && !poolsLoading && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-charcoal border border-border rounded-2xl flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-light" />
            </div>
            <h3 className="text-2xl font-light text-white mb-4">No Pools Available</h3>
            <p className="text-lg text-light font-light">Check back later for new trading opportunities.</p>
          </div>
        )}
      </div>

      {/* My Pools Section - Only show if connected and has memberships */}
      {isConnected && memberships.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20 border-t border-border">
          <div className="mb-12">
            <h2 className="text-4xl font-light text-white mb-4 tracking-tight">My Pools</h2>
            <p className="text-lg text-light font-light">Your active trading positions</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {memberships.map((membership) => (
              <div
                key={membership.id}
                className="card p-8"
              >
                <h3 className="text-2xl font-light text-white mb-6">
                  {membership.trading_pools?.name}
                </h3>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <p className="text-sm text-light mb-2 font-light">Your Deposit</p>
                    <p className="text-2xl font-light text-accent">
                      {membership.deposited_amount} SOL
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-light mb-2 font-light">Current Value</p>
                    <p className="text-2xl font-light text-white">
                      {membership.current_share_value} SOL
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-light mb-2 font-light">Voting Power</p>
                    <p className="text-2xl font-light text-accent">
                      {membership.voting_power}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPoolId(membership.pool_id)}
                  className="w-full px-6 py-4 btn-secondary text-lg font-light"
                >
                  View Trades & Governance
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pool Details - Only show if a pool is selected */}
      {isConnected && selectedPoolId && (
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20 border-t border-border">
          <div className="mb-12">
            <h2 className="text-4xl font-light text-white mb-4 tracking-tight">Pool Details</h2>
            <p className="text-lg text-light font-light">Trading activity and governance</p>
          </div>

          <div className="space-y-12">
            <div>
              <h3 className="text-3xl font-light text-white mb-8">
                Governance Proposals
              </h3>
              <div className="grid lg:grid-cols-2 gap-8">
                {proposals.map((proposal) => (
                  <div key={proposal.id} className="card p-8">
                    <h4 className="text-xl font-light text-white mb-4">{proposal.title}</h4>
                    <p className="text-light font-light mb-6">{proposal.description}</p>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleVote(proposal.id, 'for')}
                        className="flex-1 px-4 py-2 bg-accent/10 text-accent text-sm font-light rounded-lg border border-accent/20"
                      >
                        Vote For
                      </button>
                      <button
                        onClick={() => handleVote(proposal.id, 'against')}
                        className="flex-1 px-4 py-2 bg-red-500/10 text-red-400 text-sm font-light rounded-lg border border-red-500/20"
                      >
                        Vote Against
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {proposals.length === 0 && (
                <div className="card p-16 text-center">
                  <p className="text-light text-lg font-light">
                    No active proposals. Members can create proposals to govern the pool.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <DepositModal
        isOpen={depositModal.isOpen}
        onClose={() =>
          setDepositModal({ isOpen: false, poolId: '', poolName: '', minDeposit: 0 })
        }
        onDeposit={handleDeposit}
        poolName={depositModal.poolName}
        minDeposit={depositModal.minDeposit}
      />

    </div>
  );
}
