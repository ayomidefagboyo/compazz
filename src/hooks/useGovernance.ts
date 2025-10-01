import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Proposal {
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
}

export function useGovernance(poolId: string | null) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!poolId) {
      setProposals([]);
      setLoading(false);
      return;
    }

    fetchProposals();
  }, [poolId]);

  const fetchProposals = async () => {
    if (!poolId) return;

    try {
      const { data, error } = await supabase
        .from('governance_proposals')
        .select('*')
        .eq('pool_id', poolId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals(data || []);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProposal = async (
    title: string,
    description: string,
    proposalType: 'strategy_change' | 'agent_config' | 'pool_setting',
    userId: string
  ) => {
    if (!poolId) throw new Error('Pool ID required');

    try {
      const votingEndsAt = new Date();
      votingEndsAt.setDate(votingEndsAt.getDate() + 7);

      const { data, error } = await supabase
        .from('governance_proposals')
        .insert({
          pool_id: poolId,
          proposed_by: userId,
          title,
          description,
          proposal_type: proposalType,
          voting_ends_at: votingEndsAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      await fetchProposals();
      return data;
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw error;
    }
  };

  const vote = async (
    proposalId: string,
    voteType: 'for' | 'against',
    userId: string,
    votingPower: number
  ) => {
    try {
      const { error } = await supabase
        .from('votes')
        .insert({
          proposal_id: proposalId,
          user_id: userId,
          vote_type: voteType,
          voting_power_used: votingPower,
        });

      if (error) throw error;

      const { data: proposal } = await supabase
        .from('governance_proposals')
        .select('votes_for, votes_against')
        .eq('id', proposalId)
        .single();

      if (proposal) {
        const updates =
          voteType === 'for'
            ? { votes_for: proposal.votes_for + votingPower }
            : { votes_against: proposal.votes_against + votingPower };

        await supabase
          .from('governance_proposals')
          .update(updates)
          .eq('id', proposalId);
      }

      await fetchProposals();
    } catch (error) {
      console.error('Error voting:', error);
      throw error;
    }
  };

  return {
    proposals,
    loading,
    createProposal,
    vote,
    refetch: fetchProposals,
  };
}
