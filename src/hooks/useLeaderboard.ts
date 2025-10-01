import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface LeaderboardEntry {
  user_id: string;
  rank: number;
  total_pnl: number;
  win_rate: number;
  streak: number;
  updated_at: string;
  users?: {
    username: string;
    wallet_address: string;
    level: number;
  };
}

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard_entries')
        .select(`
          *,
          users (
            username,
            wallet_address,
            level
          )
        `)
        .order('rank', { ascending: true })
        .limit(50);

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    entries,
    loading,
    refetch: fetchLeaderboard,
  };
}

export function useAchievements(userId: string | null) {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, [userId]);

  const fetchAchievements = async () => {
    try {
      const { data: allAchievements, error } = await supabase
        .from('achievements')
        .select('*')
        .order('points_reward', { ascending: false });

      if (error) throw error;
      setAchievements(allAchievements || []);

      if (userId) {
        const { data: earned, error: earnedError } = await supabase
          .from('user_achievements')
          .select(`
            *,
            achievements (*)
          `)
          .eq('user_id', userId);

        if (earnedError) throw earnedError;
        setUserAchievements(earned || []);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasAchievement = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  return {
    achievements,
    userAchievements,
    hasAchievement,
    loading,
    refetch: fetchAchievements,
  };
}
