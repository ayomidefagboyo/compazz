import { Users, TrendingUp, Coins } from 'lucide-react';
import type { TradingPool } from '../hooks/useTradingPools';

interface PoolCardProps {
  pool: TradingPool;
  onJoin: (poolId: string) => void;
  isMember: boolean;
  isConnected: boolean;
}

export function PoolCard({ pool, onJoin, isMember, isConnected }: PoolCardProps) {
  const performanceColor = pool.performance_percentage >= 0 ? 'text-accent' : 'text-red-400';

  return (
    <div className="card p-8">
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <h3 className="text-2xl font-light text-white mb-3">{pool.name}</h3>
          <p className="text-light font-light leading-relaxed">{pool.description}</p>
        </div>
        {isMember && (
          <span className="px-4 py-2 bg-accent/10 text-accent text-sm font-light rounded-full border border-accent/20">
            Member
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-dark-gray rounded-xl p-6">
          <div className="flex items-center space-x-3 text-light text-sm mb-3 font-light">
            <Coins className="w-4 h-4" />
            <span>Total Value</span>
          </div>
          <p className="text-3xl font-light text-white">{pool.current_value.toFixed(2)} SOL</p>
        </div>

        <div className="bg-dark-gray rounded-xl p-6">
          <div className="flex items-center space-x-3 text-light text-sm mb-3 font-light">
            <TrendingUp className="w-4 h-4" />
            <span>Performance</span>
          </div>
          <p className={`text-3xl font-light ${performanceColor}`}>
            {pool.performance_percentage >= 0 ? '+' : ''}
            {pool.performance_percentage.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-border">
        <div className="flex items-center space-x-3 text-light text-lg font-light">
          <Users className="w-5 h-5" />
          <span>{pool.member_count} members</span>
        </div>

        {!isMember && (
          <button
            onClick={() => onJoin(pool.id)}
            disabled={!isConnected}
            className={`px-8 py-4 text-lg font-light rounded-xl ${
              isConnected 
                ? 'btn-primary' 
                : 'bg-medium-gray text-light cursor-not-allowed opacity-50'
            }`}
          >
            {isConnected ? 'Join Pool' : 'Connect Wallet to Join'}
          </button>
        )}
      </div>

      <div className="mt-6 text-sm text-medium font-light">
        Min. deposit: {pool.min_deposit} SOL
      </div>
    </div>
  );
}
