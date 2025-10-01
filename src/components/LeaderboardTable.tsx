import { Trophy, TrendingUp, Award } from 'lucide-react';
import type { LeaderboardEntry } from '../hooks/useLeaderboard';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-accent" />;
    if (rank === 2) return <Trophy className="w-6 h-6 text-light" />;
    if (rank === 3) return <Trophy className="w-6 h-6 text-medium" />;
    return <span className="text-light font-light text-lg">#{rank}</span>;
  };

  return (
    <div className="card overflow-hidden">
      <div className="px-8 py-6 border-b border-border">
        <h2 className="text-2xl font-light text-white flex items-center space-x-3">
          <Award className="w-7 h-7 text-accent" />
          <span>Top Traders</span>
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-gray">
            <tr>
              <th className="px-8 py-6 text-left text-sm font-light text-light uppercase tracking-wider">
                Rank
              </th>
              <th className="px-8 py-6 text-left text-sm font-light text-light uppercase tracking-wider">
                Trader
              </th>
              <th className="px-8 py-6 text-left text-sm font-light text-light uppercase tracking-wider">
                Level
              </th>
              <th className="px-8 py-6 text-right text-sm font-light text-light uppercase tracking-wider">
                Total P&L
              </th>
              <th className="px-8 py-6 text-right text-sm font-light text-light uppercase tracking-wider">
                Win Rate
              </th>
              <th className="px-8 py-6 text-right text-sm font-light text-light uppercase tracking-wider">
                Streak
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((entry) => (
              <tr
                key={entry.user_id}
                className="hover:bg-dark-gray/50 transition-colors"
              >
                <td className="px-8 py-6 whitespace-nowrap">
                  <div className="flex items-center justify-center w-10">
                    {getRankIcon(entry.rank)}
                  </div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <div>
                    <div className="text-lg font-light text-white">
                      {entry.users?.username || 'Unknown'}
                    </div>
                    <div className="text-sm text-light font-light">
                      {entry.users?.wallet_address.slice(0, 8)}...
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <span className="px-4 py-2 bg-charcoal text-white text-sm font-light rounded-full border border-border">
                    Lvl {entry.users?.level || 1}
                  </span>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <TrendingUp
                      className={`w-5 h-5 ${
                        entry.total_pnl >= 0 ? 'text-accent' : 'text-red-400'
                      }`}
                    />
                    <span
                      className={`text-lg font-light ${
                        entry.total_pnl >= 0 ? 'text-accent' : 'text-red-400'
                      }`}
                    >
                      {entry.total_pnl >= 0 ? '+' : ''}
                      {entry.total_pnl.toFixed(2)} SOL
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-right">
                  <span className="text-lg text-white font-light">
                    {entry.win_rate.toFixed(1)}%
                  </span>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-right">
                  <span className="text-lg font-light text-accent">
                    {entry.streak > 0 ? `${entry.streak}` : '-'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {entries.length === 0 && (
        <div className="px-8 py-16 text-center">
          <p className="text-light text-lg font-light">No leaderboard data yet</p>
        </div>
      )}
    </div>
  );
}
