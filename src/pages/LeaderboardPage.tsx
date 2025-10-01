import { useLeaderboard, useAchievements } from '../hooks/useLeaderboard';
import { useAuth } from '../hooks/useAuth';
import { LeaderboardTable } from '../components/LeaderboardTable';
import { AchievementCard } from '../components/AchievementCard';
import { Award, Trophy, TrendingUp } from 'lucide-react';

export function LeaderboardPage() {
  const { userId, isConnected } = useAuth();
  const { entries: leaderboard } = useLeaderboard();
  const { achievements, hasAchievement } = useAchievements(userId);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-charcoal border border-border rounded-2xl flex items-center justify-center mx-auto mb-8">
          <Trophy className="w-12 h-12 text-accent" />
        </div>
        <h1 className="text-6xl font-light text-white mb-6 tracking-tight">
          Leaderboard
        </h1>
        <p className="text-xl text-light mb-12 max-w-3xl mx-auto font-light leading-relaxed">
          Top performing traders and their achievements. Compete with the best and climb the ranks.
        </p>
      </div>

      <div className="w-full px-6 lg:px-8 py-20">
        {/* Top 3 Traders */}
        {leaderboard.length > 0 && (
          <div className="mb-20">
            <h2 className="text-4xl font-light text-white mb-8 text-center">Top Performers</h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {leaderboard.slice(0, 3).map((trader, index) => (
                <div
                  key={trader.user_id}
                  className={`card p-8 text-center ${
                    index === 0 ? 'border-accent/50 shadow-lg shadow-accent/10' : ''
                  }`}
                >
                  <div className="flex justify-center mb-6">
                    {index === 0 && <Trophy className="w-12 h-12 text-accent" />}
                    {index === 1 && <Trophy className="w-10 h-10 text-light" />}
                    {index === 2 && <Trophy className="w-8 h-8 text-medium" />}
                  </div>
                  <h3 className="text-2xl font-light text-white mb-2">
                    #{index + 1} {trader.users?.username || 'Anonymous'}
                  </h3>
                  <p className="text-light font-light mb-4">
                    {trader.users?.wallet_address.slice(0, 8)}...
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-light">P&L:</span>
                      <span className={`font-light ${
                        trader.total_pnl >= 0 ? 'text-accent' : 'text-red-400'
                      }`}>
                        {trader.total_pnl >= 0 ? '+' : ''}
                        {trader.total_pnl.toFixed(2)} SOL
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-light">Win Rate:</span>
                      <span className="text-white font-light">
                        {trader.win_rate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-light">Streak:</span>
                      <span className="text-accent font-light">
                        {trader.streak > 0 ? `${trader.streak}` : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Leaderboard Table */}
        <div className="mb-20">
          <h2 className="text-4xl font-light text-white mb-8 text-center">All Traders</h2>
          <LeaderboardTable entries={leaderboard} />
        </div>

        {/* Achievements Section */}
        {isConnected && (
          <div>
            <h2 className="text-4xl font-light text-white mb-8 text-center">Achievements</h2>
            <p className="text-lg text-light font-light text-center mb-12">
              Unlock your trading potential and earn rewards
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {achievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isEarned={hasAchievement(achievement.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-20 pt-20 border-t border-border">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-charcoal border border-border rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-3xl font-light text-white mb-2">1,247</h3>
              <p className="text-light font-light">Active Traders</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-charcoal border border-border rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-3xl font-light text-white mb-2">+24.7%</h3>
              <p className="text-light font-light">Average Returns</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-charcoal border border-border rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-3xl font-light text-white mb-2">$2.4M</h3>
              <p className="text-light font-light">Total Volume</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
