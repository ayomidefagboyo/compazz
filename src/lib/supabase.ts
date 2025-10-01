import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          wallet_address: string;
          username: string;
          total_points: number;
          level: number;
          total_volume_traded: number;
          created_at: string;
          last_active_at: string;
        };
        Insert: {
          id: string;
          wallet_address: string;
          username: string;
          total_points?: number;
          level?: number;
          total_volume_traded?: number;
          created_at?: string;
          last_active_at?: string;
        };
        Update: {
          id?: string;
          wallet_address?: string;
          username?: string;
          total_points?: number;
          level?: number;
          total_volume_traded?: number;
          created_at?: string;
          last_active_at?: string;
        };
      };
      trading_pools: {
        Row: {
          id: string;
          name: string;
          description: string;
          total_deposited: number;
          current_value: number;
          member_count: number;
          min_deposit: number;
          performance_percentage: number;
          created_by: string | null;
          created_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          total_deposited?: number;
          current_value?: number;
          member_count?: number;
          min_deposit?: number;
          performance_percentage?: number;
          created_by?: string | null;
          created_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          total_deposited?: number;
          current_value?: number;
          member_count?: number;
          min_deposit?: number;
          performance_percentage?: number;
          created_by?: string | null;
          created_at?: string;
          is_active?: boolean;
        };
      };
      pool_members: {
        Row: {
          id: string;
          pool_id: string;
          user_id: string;
          deposited_amount: number;
          current_share_value: number;
          voting_power: number;
          joined_at: string;
          last_deposit_at: string;
        };
      };
      trades: {
        Row: {
          id: string;
          pool_id: string;
          executed_by_agent: string | null;
          trade_type: 'long' | 'short';
          asset: string;
          entry_price: number;
          exit_price: number | null;
          amount: number;
          leverage: number;
          pnl: number | null;
          status: 'open' | 'closed' | 'liquidated';
          opened_at: string;
          closed_at: string | null;
        };
      };
      ai_agents: {
        Row: {
          id: string;
          name: string;
          description: string;
          pool_id: string | null;
          strategy_type: string;
          total_trades: number;
          win_rate: number;
          total_pnl: number;
          is_active: boolean;
          created_at: string;
          last_trade_at: string | null;
        };
      };
      governance_proposals: {
        Row: {
          id: string;
          pool_id: string;
          proposed_by: string;
          title: string;
          description: string;
          proposal_type: 'strategy_change' | 'agent_config' | 'pool_setting';
          votes_for: number;
          votes_against: number;
          status: 'active' | 'passed' | 'rejected' | 'executed';
          created_at: string;
          voting_ends_at: string;
          executed_at: string | null;
        };
      };
      achievements: {
        Row: {
          id: string;
          name: string;
          description: string;
          points_reward: number;
          icon: string;
          requirement_type: string;
          requirement_value: number;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          earned_at: string;
        };
      };
      leaderboard_entries: {
        Row: {
          user_id: string;
          rank: number;
          total_pnl: number;
          win_rate: number;
          streak: number;
          updated_at: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          pool_id: string | null;
          tx_signature: string;
          tx_type: 'deposit' | 'withdraw' | 'reward';
          amount: number;
          status: 'pending' | 'confirmed' | 'failed';
          created_at: string;
          confirmed_at: string | null;
        };
      };
    };
  };
};
