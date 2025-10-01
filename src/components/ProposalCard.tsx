import { ThumbsUp, ThumbsDown, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { Proposal } from '../hooks/useGovernance';

interface ProposalCardProps {
  proposal: Proposal;
  onVote: (proposalId: string, voteType: 'for' | 'against') => void;
  canVote: boolean;
}

export function ProposalCard({ proposal, onVote, canVote }: ProposalCardProps) {
  const totalVotes = proposal.votes_for + proposal.votes_against;
  const forPercentage = totalVotes > 0 ? (proposal.votes_for / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (proposal.votes_against / totalVotes) * 100 : 0;

  const isActive = proposal.status === 'active';
  const votingEnded = new Date(proposal.voting_ends_at) < new Date();

  const getStatusBadge = () => {
    switch (proposal.status) {
      case 'active':
        return (
          <span className="flex items-center space-x-2 px-4 py-2 bg-accent/10 text-accent text-sm font-light rounded-full border border-accent/20">
            <Clock className="w-4 h-4" />
            <span>Active</span>
          </span>
        );
      case 'passed':
        return (
          <span className="flex items-center space-x-2 px-4 py-2 bg-accent/10 text-accent text-sm font-light rounded-full border border-accent/20">
            <CheckCircle className="w-4 h-4" />
            <span>Passed</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 text-red-400 text-sm font-light rounded-full border border-red-500/20">
            <XCircle className="w-4 h-4" />
            <span>Rejected</span>
          </span>
        );
      case 'executed':
        return (
          <span className="flex items-center space-x-2 px-4 py-2 bg-accent/10 text-accent text-sm font-light rounded-full border border-accent/20">
            <CheckCircle className="w-4 h-4" />
            <span>Executed</span>
          </span>
        );
    }
  };

  return (
    <div className="card p-8">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-2xl font-light text-white mb-4">{proposal.title}</h3>
          <p className="text-lg text-light mb-6 font-light leading-relaxed">{proposal.description}</p>
          <div className="flex items-center space-x-3">
            {getStatusBadge()}
            <span className="px-4 py-2 bg-dark-gray text-white text-sm font-light rounded-full border border-border">
              {proposal.proposal_type.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6 mb-8">
        <div>
          <div className="flex items-center justify-between text-sm text-light mb-3 font-light">
            <span>For</span>
            <span>{proposal.votes_for} votes ({forPercentage.toFixed(1)}%)</span>
          </div>
          <div className="h-3 bg-dark-gray rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${forPercentage}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm text-light mb-3 font-light">
            <span>Against</span>
            <span>{proposal.votes_against} votes ({againstPercentage.toFixed(1)}%)</span>
          </div>
          <div className="h-3 bg-dark-gray rounded-full overflow-hidden">
            <div
              className="h-full bg-red-400 transition-all duration-300"
              style={{ width: `${againstPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {isActive && !votingEnded && canVote && (
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => onVote(proposal.id, 'for')}
            className="flex-1 flex items-center justify-center space-x-3 px-6 py-4 bg-accent/10 hover:bg-accent/20 text-accent text-lg font-light rounded-xl transition-all border border-accent/20"
          >
            <ThumbsUp className="w-5 h-5" />
            <span>Vote For</span>
          </button>
          <button
            onClick={() => onVote(proposal.id, 'against')}
            className="flex-1 flex items-center justify-center space-x-3 px-6 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-lg font-light rounded-xl transition-all border border-red-500/20"
          >
            <ThumbsDown className="w-5 h-5" />
            <span>Vote Against</span>
          </button>
        </div>
      )}

      <div className="pt-6 border-t border-border text-sm text-medium font-light">
        Voting ends: {new Date(proposal.voting_ends_at).toLocaleDateString()}
      </div>
    </div>
  );
}
