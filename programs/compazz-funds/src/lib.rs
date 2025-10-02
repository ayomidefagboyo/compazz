use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("11111111111111111111111111111111");

#[program]
pub mod compazz_funds {
    use super::*;

    /// Initialize a new trading fund
    pub fn create_fund(
        ctx: Context<CreateFund>,
        name: String,
        description: String,
        strategy: String,
        telegram_group_id: String,
        min_contribution: u64,
        max_members: u32,
        management_fee: u16, // basis points (100 = 1%)
        performance_fee: u16, // basis points
    ) -> Result<()> {
        let fund = &mut ctx.accounts.fund;
        let clock = Clock::get()?;

        // Platform fee: 0.1 SOL for fund creation
        const PLATFORM_FEE: u64 = 100_000_000; // 0.1 SOL in lamports

        // Transfer platform fee to platform treasury
        let fee_transfer = anchor_lang::system_program::Transfer {
            from: ctx.accounts.authority.to_account_info(),
            to: ctx.accounts.platform_treasury.to_account_info(),
        };

        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                fee_transfer,
            ),
            PLATFORM_FEE,
        )?;

        fund.authority = ctx.accounts.authority.key();
        fund.name = name.clone();
        fund.description = description;
        fund.strategy = strategy;
        fund.telegram_group_id = telegram_group_id.clone();
        fund.min_contribution = min_contribution;
        fund.max_members = max_members;
        fund.management_fee = management_fee;
        fund.performance_fee = performance_fee;
        fund.total_deposits = 0;
        fund.member_count = 0;
        fund.proposal_count = 0;
        fund.created_at = clock.unix_timestamp;
        fund.is_active = true;
        fund.bump = *ctx.bumps.get("fund").unwrap();

        emit!(FundCreated {
            fund: fund.key(),
            authority: fund.authority,
            name: fund.name.clone(),
            telegram_group_id: fund.telegram_group_id.clone(),
            platform_fee: PLATFORM_FEE,
        });

        Ok(())
    }

    /// Join a fund by depositing SOL
    pub fn join_fund(
        ctx: Context<JoinFund>,
        amount: u64,
        telegram_user_id: u64,
    ) -> Result<()> {
        let fund = &mut ctx.accounts.fund;
        let member = &mut ctx.accounts.member;

        require!(fund.is_active, ErrorCode::FundInactive);
        require!(amount >= fund.min_contribution, ErrorCode::InsufficientContribution);
        require!(fund.member_count < fund.max_members, ErrorCode::FundFull);

        // Calculate platform transaction fee (0.2%)
        let transaction_fee = amount * 20 / 10000; // 0.2% = 20/10000
        let net_amount = amount - transaction_fee;

        // Transfer platform fee to treasury
        if transaction_fee > 0 {
            let fee_transfer = anchor_lang::system_program::Transfer {
                from: ctx.accounts.member_authority.to_account_info(),
                to: ctx.accounts.platform_treasury.to_account_info(),
            };

            anchor_lang::system_program::transfer(
                CpiContext::new(
                    ctx.accounts.system_program.to_account_info(),
                    fee_transfer,
                ),
                transaction_fee,
            )?;
        }

        // Transfer remaining SOL to fund vault
        let transfer_instruction = anchor_lang::system_program::Transfer {
            from: ctx.accounts.member_authority.to_account_info(),
            to: ctx.accounts.fund_vault.to_account_info(),
        };

        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                transfer_instruction,
            ),
            net_amount,
        )?;

        // Update member account
        if member.contribution == 0 {
            fund.member_count += 1;
        }

        member.fund = fund.key();
        member.authority = ctx.accounts.member_authority.key();
        member.contribution += net_amount; // Track net contribution after fees
        member.telegram_user_id = telegram_user_id;
        member.joined_at = Clock::get()?.unix_timestamp;
        member.bump = *ctx.bumps.get("member").unwrap();

        // Update fund totals
        fund.total_deposits += net_amount;

        emit!(MemberJoined {
            fund: fund.key(),
            member: ctx.accounts.member_authority.key(),
            amount: net_amount,
            platform_fee: transaction_fee,
            telegram_user_id,
        });

        Ok(())
    }

    /// Create a trade proposal
    pub fn create_trade_proposal(
        ctx: Context<CreateTradeProposal>,
        action: TradeAction,
        amount: String,
        token: String,
        reasoning: String,
        voting_duration: i64, // seconds
    ) -> Result<()> {
        let fund = &mut ctx.accounts.fund;
        let proposal = &mut ctx.accounts.proposal;
        let member = &ctx.accounts.member;
        let clock = Clock::get()?;

        require!(fund.is_active, ErrorCode::FundInactive);
        require!(member.contribution > 0, ErrorCode::NotAMember);

        fund.proposal_count += 1;

        proposal.fund = fund.key();
        proposal.proposer = ctx.accounts.proposer.key();
        proposal.telegram_user_id = member.telegram_user_id;
        proposal.proposal_id = fund.proposal_count;
        proposal.action = action;
        proposal.amount = amount;
        proposal.token = token;
        proposal.reasoning = reasoning;
        proposal.votes_for = 0;
        proposal.votes_against = 0;
        proposal.total_votes = 0;
        proposal.created_at = clock.unix_timestamp;
        proposal.voting_ends_at = clock.unix_timestamp + voting_duration;
        proposal.executed = false;
        proposal.passed = false;
        proposal.bump = *ctx.bumps.get("proposal").unwrap();

        emit!(TradeProposalCreated {
            fund: fund.key(),
            proposal: proposal.key(),
            proposer: proposal.proposer,
            proposal_id: proposal.proposal_id,
            action: action.clone(),
            amount: proposal.amount.clone(),
            token: proposal.token.clone(),
        });

        Ok(())
    }

    /// Vote on a trade proposal
    pub fn vote_on_proposal(
        ctx: Context<VoteOnProposal>,
        vote: bool,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let vote_account = &mut ctx.accounts.vote;
        let member = &ctx.accounts.member;
        let clock = Clock::get()?;

        require!(member.contribution > 0, ErrorCode::NotAMember);
        require!(clock.unix_timestamp < proposal.voting_ends_at, ErrorCode::VotingEnded);
        require!(!proposal.executed, ErrorCode::ProposalAlreadyExecuted);

        // Initialize or update vote
        if vote_account.voted_at == 0 {
            proposal.total_votes += 1;
            vote_account.proposal = proposal.key();
            vote_account.voter = ctx.accounts.voter.key();
            vote_account.telegram_user_id = member.telegram_user_id;
            vote_account.bump = *ctx.bumps.get("vote").unwrap();
        } else {
            // Update existing vote - remove old vote count
            if vote_account.vote {
                proposal.votes_for -= 1;
            } else {
                proposal.votes_against -= 1;
            }
        }

        // Add new vote
        vote_account.vote = vote;
        vote_account.voted_at = clock.unix_timestamp;

        if vote {
            proposal.votes_for += 1;
        } else {
            proposal.votes_against += 1;
        }

        emit!(VoteCast {
            proposal: proposal.key(),
            voter: ctx.accounts.voter.key(),
            vote,
            votes_for: proposal.votes_for,
            votes_against: proposal.votes_against,
        });

        Ok(())
    }

    /// Execute a trade proposal if it passed
    pub fn execute_proposal(
        ctx: Context<ExecuteProposal>,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let fund = &ctx.accounts.fund;
        let clock = Clock::get()?;

        require!(!proposal.executed, ErrorCode::ProposalAlreadyExecuted);
        require!(clock.unix_timestamp >= proposal.voting_ends_at, ErrorCode::VotingStillActive);

        // Check if proposal passed (simple majority)
        let passed = proposal.votes_for > proposal.votes_against && proposal.total_votes >= 3;
        proposal.passed = passed;
        proposal.executed = true;

        if passed {
            // In production, this would trigger actual trade execution
            // For now, we just emit an event
            emit!(ProposalExecuted {
                fund: fund.key(),
                proposal: proposal.key(),
                action: proposal.action.clone(),
                amount: proposal.amount.clone(),
                token: proposal.token.clone(),
                votes_for: proposal.votes_for,
                votes_against: proposal.votes_against,
            });
        } else {
            emit!(ProposalRejected {
                fund: fund.key(),
                proposal: proposal.key(),
                votes_for: proposal.votes_for,
                votes_against: proposal.votes_against,
            });
        }

        Ok(())
    }

    /// Collect success fee (1% of profits)
    pub fn collect_success_fee(
        ctx: Context<CollectSuccessFee>,
        profit_amount: u64,
    ) -> Result<()> {
        // Calculate 1% success fee
        let success_fee = profit_amount / 100; // 1%

        if success_fee > 0 {
            // Transfer success fee from fund vault to platform treasury
            **ctx.accounts.fund_vault.to_account_info().try_borrow_mut_lamports()? -= success_fee;
            **ctx.accounts.platform_treasury.to_account_info().try_borrow_mut_lamports()? += success_fee;

            emit!(SuccessFeeCollected {
                fund: ctx.accounts.fund.key(),
                profit_amount,
                fee_amount: success_fee,
            });
        }

        Ok(())
    }

    /// Withdraw funds (if allowed)
    pub fn withdraw_funds(
        ctx: Context<WithdrawFunds>,
        amount: u64,
    ) -> Result<()> {
        let fund = &ctx.accounts.fund;
        let member = &mut ctx.accounts.member;

        require!(amount <= member.contribution, ErrorCode::InsufficientBalance);

        // Transfer SOL back to member
        **ctx.accounts.fund_vault.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.member_authority.to_account_info().try_borrow_mut_lamports()? += amount;

        member.contribution -= amount;

        emit!(FundsWithdrawn {
            fund: fund.key(),
            member: member.authority,
            amount,
        });

        Ok(())
    }
}

// Account Structures
#[account]
pub struct Fund {
    pub authority: Pubkey,           // 32
    pub name: String,                // 4 + 32 = 36
    pub description: String,         // 4 + 200 = 204
    pub strategy: String,            // 4 + 50 = 54
    pub telegram_group_id: String,   // 4 + 50 = 54
    pub min_contribution: u64,       // 8
    pub max_members: u32,            // 4
    pub management_fee: u16,         // 2 (basis points)
    pub performance_fee: u16,        // 2 (basis points)
    pub total_deposits: u64,         // 8
    pub member_count: u32,           // 4
    pub proposal_count: u64,         // 8
    pub created_at: i64,             // 8
    pub is_active: bool,             // 1
    pub bump: u8,                    // 1
}

#[account]
pub struct Member {
    pub fund: Pubkey,               // 32
    pub authority: Pubkey,          // 32
    pub contribution: u64,          // 8
    pub telegram_user_id: u64,      // 8
    pub joined_at: i64,             // 8
    pub bump: u8,                   // 1
}

#[account]
pub struct TradeProposal {
    pub fund: Pubkey,               // 32
    pub proposer: Pubkey,           // 32
    pub telegram_user_id: u64,      // 8
    pub proposal_id: u64,           // 8
    pub action: TradeAction,        // 1 + size
    pub amount: String,             // 4 + 50 = 54
    pub token: String,              // 4 + 20 = 24
    pub reasoning: String,          // 4 + 500 = 504
    pub votes_for: u32,             // 4
    pub votes_against: u32,         // 4
    pub total_votes: u32,           // 4
    pub created_at: i64,            // 8
    pub voting_ends_at: i64,        // 8
    pub executed: bool,             // 1
    pub passed: bool,               // 1
    pub bump: u8,                   // 1
}

#[account]
pub struct Vote {
    pub proposal: Pubkey,           // 32
    pub voter: Pubkey,              // 32
    pub telegram_user_id: u64,      // 8
    pub vote: bool,                 // 1 (true = for, false = against)
    pub voted_at: i64,              // 8
    pub bump: u8,                   // 1
}

// Enums
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum TradeAction {
    Buy,
    Sell,
    Swap,
    Hold,
}

// Context Structs
#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateFund<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 36 + 204 + 54 + 54 + 8 + 4 + 2 + 2 + 8 + 4 + 8 + 8 + 1 + 1,
        seeds = [b"fund", authority.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub fund: Account<'info, Fund>,

    /// CHECK: This is the fund's SOL vault
    #[account(
        mut,
        seeds = [b"vault", fund.key().as_ref()],
        bump
    )]
    pub fund_vault: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: Platform treasury account
    #[account(mut)]
    pub platform_treasury: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinFund<'info> {
    #[account(mut)]
    pub fund: Account<'info, Fund>,

    #[account(
        init_if_needed,
        payer = member_authority,
        space = 8 + 32 + 32 + 8 + 8 + 8 + 1,
        seeds = [b"member", fund.key().as_ref(), member_authority.key().as_ref()],
        bump
    )]
    pub member: Account<'info, Member>,

    /// CHECK: This is the fund's SOL vault
    #[account(
        mut,
        seeds = [b"vault", fund.key().as_ref()],
        bump
    )]
    pub fund_vault: AccountInfo<'info>,

    #[account(mut)]
    pub member_authority: Signer<'info>,

    /// CHECK: Platform treasury account
    #[account(mut)]
    pub platform_treasury: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateTradeProposal<'info> {
    #[account(mut)]
    pub fund: Account<'info, Fund>,

    #[account(
        init,
        payer = proposer,
        space = 8 + 32 + 32 + 8 + 8 + 1 + 54 + 24 + 504 + 4 + 4 + 4 + 8 + 8 + 1 + 1 + 1,
        seeds = [b"proposal", fund.key().as_ref(), &fund.proposal_count.to_le_bytes()],
        bump
    )]
    pub proposal: Account<'info, TradeProposal>,

    #[account(
        seeds = [b"member", fund.key().as_ref(), proposer.key().as_ref()],
        bump = member.bump
    )]
    pub member: Account<'info, Member>,

    #[account(mut)]
    pub proposer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VoteOnProposal<'info> {
    #[account(mut)]
    pub proposal: Account<'info, TradeProposal>,

    #[account(
        init_if_needed,
        payer = voter,
        space = 8 + 32 + 32 + 8 + 1 + 8 + 1,
        seeds = [b"vote", proposal.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote: Account<'info, Vote>,

    #[account(
        seeds = [b"member", proposal.fund.as_ref(), voter.key().as_ref()],
        bump = member.bump
    )]
    pub member: Account<'info, Member>,

    #[account(mut)]
    pub voter: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    pub fund: Account<'info, Fund>,
    #[account(mut)]
    pub proposal: Account<'info, TradeProposal>,
}

#[derive(Accounts)]
pub struct CollectSuccessFee<'info> {
    pub fund: Account<'info, Fund>,

    /// CHECK: This is the fund's SOL vault
    #[account(
        mut,
        seeds = [b"vault", fund.key().as_ref()],
        bump
    )]
    pub fund_vault: AccountInfo<'info>,

    /// CHECK: Platform treasury account
    #[account(mut)]
    pub platform_treasury: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct WithdrawFunds<'info> {
    pub fund: Account<'info, Fund>,

    #[account(
        mut,
        seeds = [b"member", fund.key().as_ref(), member_authority.key().as_ref()],
        bump = member.bump
    )]
    pub member: Account<'info, Member>,

    /// CHECK: This is the fund's SOL vault
    #[account(
        mut,
        seeds = [b"vault", fund.key().as_ref()],
        bump
    )]
    pub fund_vault: AccountInfo<'info>,

    #[account(mut)]
    pub member_authority: Signer<'info>,
}

// Events
#[event]
pub struct FundCreated {
    pub fund: Pubkey,
    pub authority: Pubkey,
    pub name: String,
    pub telegram_group_id: String,
    pub platform_fee: u64,
}

#[event]
pub struct MemberJoined {
    pub fund: Pubkey,
    pub member: Pubkey,
    pub amount: u64,
    pub platform_fee: u64,
    pub telegram_user_id: u64,
}

#[event]
pub struct TradeProposalCreated {
    pub fund: Pubkey,
    pub proposal: Pubkey,
    pub proposer: Pubkey,
    pub proposal_id: u64,
    pub action: TradeAction,
    pub amount: String,
    pub token: String,
}

#[event]
pub struct VoteCast {
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub vote: bool,
    pub votes_for: u32,
    pub votes_against: u32,
}

#[event]
pub struct ProposalExecuted {
    pub fund: Pubkey,
    pub proposal: Pubkey,
    pub action: TradeAction,
    pub amount: String,
    pub token: String,
    pub votes_for: u32,
    pub votes_against: u32,
}

#[event]
pub struct ProposalRejected {
    pub fund: Pubkey,
    pub proposal: Pubkey,
    pub votes_for: u32,
    pub votes_against: u32,
}

#[event]
pub struct FundsWithdrawn {
    pub fund: Pubkey,
    pub member: Pubkey,
    pub amount: u64,
}

#[event]
pub struct SuccessFeeCollected {
    pub fund: Pubkey,
    pub profit_amount: u64,
    pub fee_amount: u64,
}

// Error Codes
#[error_code]
pub enum ErrorCode {
    #[msg("Fund is not active")]
    FundInactive,
    #[msg("Contribution amount is below minimum")]
    InsufficientContribution,
    #[msg("Fund has reached maximum members")]
    FundFull,
    #[msg("User is not a member of this fund")]
    NotAMember,
    #[msg("Voting period has ended")]
    VotingEnded,
    #[msg("Voting is still active")]
    VotingStillActive,
    #[msg("Proposal has already been executed")]
    ProposalAlreadyExecuted,
    #[msg("Insufficient balance")]
    InsufficientBalance,
}