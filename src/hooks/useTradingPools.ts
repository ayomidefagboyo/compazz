import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { realTimeDataService, type PoolMetrics } from '../services/realTimeData';

export interface TradingPool {
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
  // Real-time data
  performance24h?: number;
  performance7d?: number;
  performance30d?: number;
  activePositions?: number;
  volume24h?: number;
  fees24h?: number;
  lastUpdate?: number;
}

export function useTradingPools() {
  const [pools, setPools] = useState<TradingPool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPools();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      updateRealTimeData();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchPools = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_pools')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // If no pools in database, show sample pools for demo
      if (!data || data.length === 0) {
        const samplePools: TradingPool[] = [
          {
            id: '1',
            name: 'SOL Perpetuals Pool',
            description: 'High-frequency SOL perpetual futures trading with advanced risk management and AI-driven strategies.',
            total_deposited: 1250.5,
            current_value: 1420.8,
            member_count: 47,
            min_deposit: 5.0,
            performance_percentage: 13.6,
            created_by: 'system',
            created_at: new Date().toISOString(),
            is_active: true
          },
          {
            id: '2',
            name: 'BTC Futures Elite',
            description: 'Exclusive Bitcoin futures pool with institutional-grade trading algorithms and maximum leverage.',
            total_deposited: 2100.0,
            current_value: 1890.5,
            member_count: 23,
            min_deposit: 25.0,
            performance_percentage: -9.9,
            created_by: 'system',
            created_at: new Date().toISOString(),
            is_active: true
          },
          {
            id: '3',
            name: 'Multi-Asset Alpha',
            description: 'Diversified portfolio trading SOL, BTC, ETH perpetuals with dynamic position sizing and risk allocation.',
            total_deposited: 3200.0,
            current_value: 3840.0,
            member_count: 89,
            min_deposit: 10.0,
            performance_percentage: 20.0,
            created_by: 'system',
            created_at: new Date().toISOString(),
            is_active: true
          },
          {
            id: '4',
            name: 'ETH Momentum',
            description: 'Ethereum perpetual futures focused on momentum strategies and trend following algorithms.',
            total_deposited: 850.0,
            current_value: 1020.0,
            member_count: 34,
            min_deposit: 15.0,
            performance_percentage: 20.0,
            created_by: 'system',
            created_at: new Date().toISOString(),
            is_active: true
          },
          {
            id: '5',
            name: 'DeFi Yield Pool',
            description: 'DeFi protocol perpetuals trading with yield farming integration and automated rebalancing.',
            total_deposited: 1800.0,
            current_value: 1980.0,
            member_count: 56,
            min_deposit: 8.0,
            performance_percentage: 10.0,
            created_by: 'system',
            created_at: new Date().toISOString(),
            is_active: true
          },
          {
            id: '6',
            name: 'Volatility Harvest',
            description: 'Volatility trading strategies using options and perpetuals with advanced Greeks management.',
            total_deposited: 950.0,
            current_value: 1045.0,
            member_count: 28,
            min_deposit: 20.0,
            performance_percentage: 10.0,
            created_by: 'system',
            created_at: new Date().toISOString(),
            is_active: true
          }
        ];
        setPools(samplePools);
      } else {
        setPools(data);
      }
      
      // Merge with real-time data
      updateRealTimeData();
    } catch (error) {
      console.error('Error fetching pools:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRealTimeData = () => {
    const realTimePools = realTimeDataService.getPools();
    
    setPools(prevPools => {
      return prevPools.map(pool => {
        const realTimeData = realTimePools.find(rt => rt.id === pool.id);
        if (realTimeData) {
          return {
            ...pool,
            total_deposited: realTimeData.totalValueLocked,
            current_value: realTimeData.totalValueLocked * (1 + realTimeData.performance24h / 100),
            performance_percentage: realTimeData.performance24h,
            performance24h: realTimeData.performance24h,
            performance7d: realTimeData.performance7d,
            performance30d: realTimeData.performance30d,
            activePositions: realTimeData.activePositions,
            volume24h: realTimeData.volume24h,
            fees24h: realTimeData.fees24h,
            lastUpdate: realTimeData.lastUpdate
          };
        }
        return pool;
      });
    });
  };

  const createPool = async (
    name: string,
    description: string,
    minDeposit: number,
    creatorId: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('trading_pools')
        .insert({
          name,
          description,
          min_deposit: minDeposit,
          created_by: creatorId,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchPools();
      return data;
    } catch (error) {
      console.error('Error creating pool:', error);
      throw error;
    }
  };

  return {
    pools,
    loading,
    createPool,
    refetch: fetchPools,
  };
}

export function usePoolMembership(userId: string | null) {
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setMemberships([]);
      setLoading(false);
      return;
    }

    fetchMemberships();
  }, [userId]);

  const fetchMemberships = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('pool_members')
        .select(`
          *,
          trading_pools (*)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      setMemberships(data || []);
    } catch (error) {
      console.error('Error fetching memberships:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinPool = async (poolId: string, depositAmount: number) => {
    if (!userId) throw new Error('User not authenticated');

    try {
      const votingPower = Math.floor(depositAmount * 10);

      const { error } = await supabase.from('pool_members').insert({
        pool_id: poolId,
        user_id: userId,
        deposited_amount: depositAmount,
        current_share_value: depositAmount,
        voting_power: votingPower,
      });

      if (error) throw error;

      const { error: updateError } = await supabase.rpc('increment_member_count', {
        pool_id: poolId,
        deposit_amount: depositAmount,
      });

      await fetchMemberships();
    } catch (error) {
      console.error('Error joining pool:', error);
      throw error;
    }
  };

  return {
    memberships,
    loading,
    joinPool,
    refetch: fetchMemberships,
  };
}
