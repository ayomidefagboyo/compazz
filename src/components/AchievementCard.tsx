import * as Icons from 'lucide-react';
import { Video as LucideIcon } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  points_reward: number;
  icon: string;
  requirement_type: string;
  requirement_value: number;
}

interface AchievementCardProps {
  achievement: Achievement;
  isEarned: boolean;
}

export function AchievementCard({ achievement, isEarned }: AchievementCardProps) {
  const IconComponent = (Icons[achievement.icon as keyof typeof Icons] as LucideIcon) || Icons.Award;

  return (
    <div
      className={`card p-6 transition-all ${
        isEarned
          ? 'border-accent/50 shadow-lg shadow-accent/10'
          : 'opacity-60'
      }`}
    >
      <div className="flex items-start space-x-6">
        <div
          className={`p-4 rounded-xl ${
            isEarned
              ? 'bg-accent'
              : 'bg-dark-gray border border-border'
          }`}
        >
          <IconComponent className="w-7 h-7 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-light text-white truncate">
              {achievement.name}
            </h3>
            {isEarned && (
              <span className="ml-3 px-3 py-1 bg-accent/10 text-accent text-sm font-light rounded-full border border-accent/20">
                Earned
              </span>
            )}
          </div>
          <p className="text-sm text-light mb-4 font-light leading-relaxed line-clamp-2">
            {achievement.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-accent font-light">
              +{achievement.points_reward} pts
            </span>
            {!isEarned && (
              <span className="text-sm text-medium font-light">
                Goal: {achievement.requirement_value}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
