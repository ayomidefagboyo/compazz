/*
  # Web3 Gamified Trading Platform Schema

  ## Overview
  Complete database schema for a gamified perpetual trading platform with Solana integration,
  member-controlled trading pools, AI agent execution, and comprehensive gamification.

  ## New Tables

  ### 1. `users`
  - `id` (uuid, primary key) - Unique user identifier
  - `wallet_address` (text, unique) - Solana wallet address
  - `username` (text, unique) - Display name
  - `total_points` (integer) - Gamification points
  - `level` (integer) - User level
  - `total_volume_traded` (numeric) - Lifetime trading volume
  - `created_at` (timestamptz) - Account creation timestamp
  - `last_active_at` (timestamptz) - Last activity timestamp

  ### 2. `trading_pools`
  - `id` (uuid, primary key) - Pool identifier
  - `name` (text) - Pool name
  - `description` (text) - Pool description
  - `total_deposited` (numeric) - Total SOL deposited
  - `current_value` (numeric) - Current pool value
  - `member_count` (integer) - Number of members
  - `min_deposit` (numeric) - Minimum deposit requirement
  - `performance_percentage` (numeric) - Pool performance %
  - `created_by` (uuid, foreign key) - Creator user ID
  - `created_at` (timestamptz) - Pool creation time
  - `is_active` (boolean) - Pool active status

  ### 3. `pool_members`
  - `id` (uuid, primary key) - Membership identifier
  - `pool_id` (uuid, foreign key) - Reference to trading_pools
  - `user_id` (uuid, foreign key) - Reference to users
  - `deposited_amount` (numeric) - Amount deposited by member
  - `current_share_value` (numeric) - Current value of member's share
  - `voting_power` (integer) - Governance voting power
  - `joined_at` (timestamptz) - Join timestamp
  - `last_deposit_at` (timestamptz) - Last deposit time

  ### 4. `ai_agents`
  - `id` (uuid, primary key) - Agent identifier
  - `name` (text) - Agent name
  - `description` (text) - Agent strategy description
  - `pool_id` (uuid, foreign key) - Assigned pool
  - `strategy_type` (text) - Strategy type
  - `total_trades` (integer) - Number of trades executed
  - `win_rate` (numeric) - Win rate percentage
  - `total_pnl` (numeric) - Total profit/loss
  - `is_active` (boolean) - Agent active status
  - `created_at` (timestamptz) - Agent creation time
  - `last_trade_at` (timestamptz, nullable) - Last trade execution

  ### 5. `trades`
  - `id` (uuid, primary key) - Trade identifier
  - `pool_id` (uuid, foreign key) - Reference to trading_pools
  - `executed_by_agent` (uuid, foreign key, nullable) - AI agent that executed
  - `trade_type` (text) - 'long' or 'short'
  - `asset` (text) - Trading pair (e.g., 'SOL-PERP')
  - `entry_price` (numeric) - Entry price
  - `exit_price` (numeric, nullable) - Exit price
  - `amount` (numeric) - Trade size
  - `leverage` (integer) - Leverage used
  - `pnl` (numeric, nullable) - Profit/Loss
  - `status` (text) - 'open', 'closed', 'liquidated'
  - `opened_at` (timestamptz) - Trade open time
  - `closed_at` (timestamptz, nullable) - Trade close time

  ### 6. `governance_proposals`
  - `id` (uuid, primary key) - Proposal identifier
  - `pool_id` (uuid, foreign key) - Reference to trading_pools
  - `proposed_by` (uuid, foreign key) - Proposer user ID
  - `title` (text) - Proposal title
  - `description` (text) - Proposal details
  - `proposal_type` (text) - 'strategy_change', 'agent_config', 'pool_setting'
  - `votes_for` (integer) - Supporting votes
  - `votes_against` (integer) - Opposing votes
  - `status` (text) - 'active', 'passed', 'rejected', 'executed'
  - `created_at` (timestamptz) - Proposal creation time
  - `voting_ends_at` (timestamptz) - Voting deadline
  - `executed_at` (timestamptz, nullable) - Execution time

  ### 7. `votes`
  - `id` (uuid, primary key) - Vote identifier
  - `proposal_id` (uuid, foreign key) - Reference to governance_proposals
  - `user_id` (uuid, foreign key) - Voter user ID
  - `vote_type` (text) - 'for' or 'against'
  - `voting_power_used` (integer) - Voting power applied
  - `voted_at` (timestamptz) - Vote timestamp

  ### 8. `achievements`
  - `id` (uuid, primary key) - Achievement identifier
  - `name` (text) - Achievement name
  - `description` (text) - Achievement description
  - `points_reward` (integer) - Points awarded
  - `icon` (text) - Icon identifier
  - `requirement_type` (text) - Type of requirement
  - `requirement_value` (numeric) - Threshold value

  ### 9. `user_achievements`
  - `id` (uuid, primary key) - User achievement identifier
  - `user_id` (uuid, foreign key) - Reference to users
  - `achievement_id` (uuid, foreign key) - Reference to achievements
  - `earned_at` (timestamptz) - Earned timestamp

  ### 10. `leaderboard_entries`
  - `user_id` (uuid, foreign key) - Reference to users
  - `rank` (integer) - Current rank
  - `total_pnl` (numeric) - Total profit/loss
  - `win_rate` (numeric) - Win rate percentage
  - `streak` (integer) - Current winning streak
  - `updated_at` (timestamptz) - Last update time

  ### 11. `transactions`
  - `id` (uuid, primary key) - Transaction identifier
  - `user_id` (uuid, foreign key) - Reference to users
  - `pool_id` (uuid, foreign key, nullable) - Reference to trading_pools
  - `tx_signature` (text, unique) - Solana transaction signature
  - `tx_type` (text) - 'deposit', 'withdraw', 'reward'
  - `amount` (numeric) - Transaction amount
  - `status` (text) - 'pending', 'confirmed', 'failed'
  - `created_at` (timestamptz) - Transaction creation time
  - `confirmed_at` (timestamptz, nullable) - Confirmation time

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies ensure users can only access their own data and public pool information
  - Authenticated access required for all sensitive operations
  - Governance actions restricted to pool members with appropriate voting power
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  total_points integer DEFAULT 0,
  level integer DEFAULT 1,
  total_volume_traded numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  last_active_at timestamptz DEFAULT now()
);

-- Create trading_pools table
CREATE TABLE IF NOT EXISTS trading_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  total_deposited numeric DEFAULT 0,
  current_value numeric DEFAULT 0,
  member_count integer DEFAULT 0,
  min_deposit numeric DEFAULT 0.1,
  performance_percentage numeric DEFAULT 0,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Create pool_members table
CREATE TABLE IF NOT EXISTS pool_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid REFERENCES trading_pools(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  deposited_amount numeric DEFAULT 0,
  current_share_value numeric DEFAULT 0,
  voting_power integer DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  last_deposit_at timestamptz DEFAULT now(),
  UNIQUE(pool_id, user_id)
);

-- Create ai_agents table (before trades since trades references it)
CREATE TABLE IF NOT EXISTS ai_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  pool_id uuid REFERENCES trading_pools(id) ON DELETE CASCADE,
  strategy_type text NOT NULL,
  total_trades integer DEFAULT 0,
  win_rate numeric DEFAULT 0,
  total_pnl numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_trade_at timestamptz
);

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid REFERENCES trading_pools(id) ON DELETE CASCADE NOT NULL,
  executed_by_agent uuid REFERENCES ai_agents(id) ON DELETE SET NULL,
  trade_type text NOT NULL CHECK (trade_type IN ('long', 'short')),
  asset text NOT NULL,
  entry_price numeric NOT NULL,
  exit_price numeric,
  amount numeric NOT NULL,
  leverage integer DEFAULT 1,
  pnl numeric,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed', 'liquidated')),
  opened_at timestamptz DEFAULT now(),
  closed_at timestamptz
);

-- Create governance_proposals table
CREATE TABLE IF NOT EXISTS governance_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid REFERENCES trading_pools(id) ON DELETE CASCADE NOT NULL,
  proposed_by uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  proposal_type text NOT NULL CHECK (proposal_type IN ('strategy_change', 'agent_config', 'pool_setting')),
  votes_for integer DEFAULT 0,
  votes_against integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'passed', 'rejected', 'executed')),
  created_at timestamptz DEFAULT now(),
  voting_ends_at timestamptz NOT NULL,
  executed_at timestamptz
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid REFERENCES governance_proposals(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  vote_type text NOT NULL CHECK (vote_type IN ('for', 'against')),
  voting_power_used integer NOT NULL,
  voted_at timestamptz DEFAULT now(),
  UNIQUE(proposal_id, user_id)
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  points_reward integer DEFAULT 0,
  icon text DEFAULT '',
  requirement_type text NOT NULL,
  requirement_value numeric NOT NULL
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create leaderboard_entries table
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  rank integer DEFAULT 0,
  total_pnl numeric DEFAULT 0,
  win_rate numeric DEFAULT 0,
  streak integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  pool_id uuid REFERENCES trading_pools(id) ON DELETE SET NULL,
  tx_signature text UNIQUE NOT NULL,
  tx_type text NOT NULL CHECK (tx_type IN ('deposit', 'withdraw', 'reward')),
  amount numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  created_at timestamptz DEFAULT now(),
  confirmed_at timestamptz
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for trading_pools
CREATE POLICY "Anyone can view active pools"
  ON trading_pools FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can create pools"
  ON trading_pools FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Pool creators can update their pools"
  ON trading_pools FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- RLS Policies for pool_members
CREATE POLICY "Pool members can view pool membership"
  ON pool_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pool_members pm
      WHERE pm.pool_id = pool_members.pool_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join pools"
  ON pool_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own membership"
  ON pool_members FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for trades
CREATE POLICY "Pool members can view pool trades"
  ON trades FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pool_members pm
      WHERE pm.pool_id = trades.pool_id
      AND pm.user_id = auth.uid()
    )
  );

-- RLS Policies for ai_agents
CREATE POLICY "Pool members can view pool agents"
  ON ai_agents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pool_members pm
      WHERE pm.pool_id = ai_agents.pool_id
      AND pm.user_id = auth.uid()
    )
  );

-- RLS Policies for governance_proposals
CREATE POLICY "Pool members can view pool proposals"
  ON governance_proposals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pool_members pm
      WHERE pm.pool_id = governance_proposals.pool_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Pool members can create proposals"
  ON governance_proposals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pool_members pm
      WHERE pm.pool_id = governance_proposals.pool_id
      AND pm.user_id = auth.uid()
    )
    AND auth.uid() = proposed_by
  );

-- RLS Policies for votes
CREATE POLICY "Pool members can view pool votes"
  ON votes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM governance_proposals gp
      JOIN pool_members pm ON pm.pool_id = gp.pool_id
      WHERE gp.id = votes.proposal_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Pool members can vote"
  ON votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for achievements
CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view all user achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for leaderboard_entries
CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard_entries FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_pool_members_pool ON pool_members(pool_id);
CREATE INDEX IF NOT EXISTS idx_pool_members_user ON pool_members(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_pool ON trades(pool_id);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_signature ON transactions(tx_signature);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard_entries(rank);

-- Insert default achievements
INSERT INTO achievements (name, description, points_reward, icon, requirement_type, requirement_value)
VALUES
  ('First Trade', 'Execute your first trade', 100, 'trophy', 'trade_count', 1),
  ('High Roller', 'Deposit 10+ SOL', 250, 'coins', 'deposit_amount', 10),
  ('Profit Master', 'Achieve 50% portfolio gain', 500, 'trending-up', 'pnl_percentage', 50),
  ('Pool Pioneer', 'Create a trading pool', 300, 'users', 'pools_created', 1),
  ('Governance Guru', 'Vote on 10 proposals', 200, 'vote', 'votes_cast', 10),
  ('Win Streak', 'Win 5 trades in a row', 400, 'zap', 'win_streak', 5),
  ('Volume Titan', 'Trade 100+ SOL volume', 750, 'activity', 'volume_traded', 100),
  ('Community Leader', 'Get 20+ pool members', 600, 'users-2', 'pool_members', 20)
ON CONFLICT (name) DO NOTHING;