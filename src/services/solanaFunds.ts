import { Program, AnchorProvider, web3, BN, IdlAccounts } from '@coral-xyz/anchor';
import { PublicKey, Connection, Keypair, SystemProgram } from '@solana/web3.js';
import { CompazzFunds, IDL } from '../types/compazz_funds';

export interface FundData {
  authority: PublicKey;
  name: string;
  description: string;
  strategy: string;
  telegramGroupId: string;
  minContribution: BN;
  maxMembers: number;
  managementFee: number;
  performanceFee: number;
  totalDeposits: BN;
  memberCount: number;
  proposalCount: BN;
  createdAt: BN;
  isActive: boolean;
}

export interface MemberData {
  fund: PublicKey;
  authority: PublicKey;
  contribution: BN;
  telegramUserId: BN;
  joinedAt: BN;
}

export interface ProposalData {
  fund: PublicKey;
  proposer: PublicKey;
  telegramUserId: BN;
  proposalId: BN;
  action: any; // TradeAction enum
  amount: string;
  token: string;
  reasoning: string;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  createdAt: BN;
  votingEndsAt: BN;
  executed: boolean;
  passed: boolean;
}

export interface VoteData {
  proposal: PublicKey;
  voter: PublicKey;
  telegramUserId: BN;
  vote: boolean;
  votedAt: BN;
}

export class SolanaFundsService {
  private program: Program<CompazzFunds>;
  private connection: Connection;
  private provider: AnchorProvider;
  private platformTreasury: PublicKey;

  constructor(connection: Connection, wallet: any, programId: PublicKey, platformTreasury?: PublicKey) {
    this.connection = connection;
    this.provider = new AnchorProvider(connection, wallet, {});
    this.program = new Program(IDL as CompazzFunds, programId, this.provider);
    // Default platform treasury - in production this would be a controlled address
    this.platformTreasury = platformTreasury || new PublicKey("CompazzPlatformTreasury111111111111111111111");
  }

  /**
   * Create a new trading fund on-chain
   */
  async createFund(
    name: string,
    description: string,
    strategy: string,
    telegramGroupId: string,
    minContribution: number,
    maxMembers: number,
    managementFee: number,
    performanceFee: number,
    authority: Keypair
  ): Promise<{ fundAddress: PublicKey; signature: string }> {
    const [fundPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('fund'), authority.publicKey.toBuffer(), Buffer.from(name)],
      this.program.programId
    );

    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), fundPda.toBuffer()],
      this.program.programId
    );

    const tx = await this.program.methods
      .createFund(
        name,
        description,
        strategy,
        telegramGroupId,
        new BN(minContribution * web3.LAMPORTS_PER_SOL),
        maxMembers,
        managementFee * 100, // Convert to basis points
        performanceFee * 100
      )
      .accounts({
        fund: fundPda,
        fundVault: vaultPda,
        authority: authority.publicKey,
        platformTreasury: this.platformTreasury,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    return {
      fundAddress: fundPda,
      signature: tx
    };
  }

  /**
   * Join a fund by depositing SOL
   */
  async joinFund(
    fundAddress: PublicKey,
    amount: number, // in SOL
    telegramUserId: number,
    memberAuthority: Keypair
  ): Promise<string> {
    const [memberPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('member'), fundAddress.toBuffer(), memberAuthority.publicKey.toBuffer()],
      this.program.programId
    );

    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), fundAddress.toBuffer()],
      this.program.programId
    );

    const tx = await this.program.methods
      .joinFund(
        new BN(amount * web3.LAMPORTS_PER_SOL),
        new BN(telegramUserId)
      )
      .accounts({
        fund: fundAddress,
        member: memberPda,
        fundVault: vaultPda,
        memberAuthority: memberAuthority.publicKey,
        platformTreasury: this.platformTreasury,
        systemProgram: SystemProgram.programId,
      })
      .signers([memberAuthority])
      .rpc();

    return tx;
  }

  /**
   * Create a trade proposal
   */
  async createTradeProposal(
    fundAddress: PublicKey,
    action: 'Buy' | 'Sell' | 'Swap' | 'Hold',
    amount: string,
    token: string,
    reasoning: string,
    votingDurationHours: number,
    proposer: Keypair
  ): Promise<{ proposalAddress: PublicKey; signature: string }> {
    const fund = await this.getFund(fundAddress);

    const [proposalPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('proposal'),
        fundAddress.toBuffer(),
        fund.proposalCount.toBuffer('le', 8)
      ],
      this.program.programId
    );

    const [memberPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('member'), fundAddress.toBuffer(), proposer.publicKey.toBuffer()],
      this.program.programId
    );

    const tradeAction = { [action.toLowerCase()]: {} };

    const tx = await this.program.methods
      .createTradeProposal(
        tradeAction,
        amount,
        token,
        reasoning,
        new BN(votingDurationHours * 3600) // Convert hours to seconds
      )
      .accounts({
        fund: fundAddress,
        proposal: proposalPda,
        member: memberPda,
        proposer: proposer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([proposer])
      .rpc();

    return {
      proposalAddress: proposalPda,
      signature: tx
    };
  }

  /**
   * Vote on a trade proposal
   */
  async voteOnProposal(
    proposalAddress: PublicKey,
    vote: boolean, // true = for, false = against
    voter: Keypair
  ): Promise<string> {
    const proposal = await this.getProposal(proposalAddress);

    const [votePda] = PublicKey.findProgramAddressSync(
      [Buffer.from('vote'), proposalAddress.toBuffer(), voter.publicKey.toBuffer()],
      this.program.programId
    );

    const [memberPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('member'), proposal.fund.toBuffer(), voter.publicKey.toBuffer()],
      this.program.programId
    );

    const tx = await this.program.methods
      .voteOnProposal(vote)
      .accounts({
        proposal: proposalAddress,
        vote: votePda,
        member: memberPda,
        voter: voter.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([voter])
      .rpc();

    return tx;
  }

  /**
   * Execute a trade proposal (if voting ended and passed)
   */
  async executeProposal(proposalAddress: PublicKey): Promise<string> {
    const proposal = await this.getProposal(proposalAddress);

    const tx = await this.program.methods
      .executeProposal()
      .accounts({
        fund: proposal.fund,
        proposal: proposalAddress,
      })
      .rpc();

    return tx;
  }

  /**
   * Collect success fee from a fund (1% of profits)
   */
  async collectSuccessFee(
    fundAddress: PublicKey,
    profitAmount: number // in SOL
  ): Promise<string> {
    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), fundAddress.toBuffer()],
      this.program.programId
    );

    const tx = await this.program.methods
      .collectSuccessFee(new BN(profitAmount * web3.LAMPORTS_PER_SOL))
      .accounts({
        fund: fundAddress,
        fundVault: vaultPda,
        platformTreasury: this.platformTreasury,
      })
      .rpc();

    return tx;
  }

  /**
   * Withdraw funds from a fund
   */
  async withdrawFunds(
    fundAddress: PublicKey,
    amount: number, // in SOL
    memberAuthority: Keypair
  ): Promise<string> {
    const [memberPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('member'), fundAddress.toBuffer(), memberAuthority.publicKey.toBuffer()],
      this.program.programId
    );

    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), fundAddress.toBuffer()],
      this.program.programId
    );

    const tx = await this.program.methods
      .withdrawFunds(new BN(amount * web3.LAMPORTS_PER_SOL))
      .accounts({
        fund: fundAddress,
        member: memberPda,
        fundVault: vaultPda,
        memberAuthority: memberAuthority.publicKey,
      })
      .signers([memberAuthority])
      .rpc();

    return tx;
  }

  /**
   * Get fund data
   */
  async getFund(fundAddress: PublicKey): Promise<FundData> {
    const account = await this.program.account.fund.fetch(fundAddress);
    return account as any;
  }

  /**
   * Get member data
   */
  async getMember(fundAddress: PublicKey, memberAuthority: PublicKey): Promise<MemberData> {
    const [memberPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('member'), fundAddress.toBuffer(), memberAuthority.toBuffer()],
      this.program.programId
    );

    const account = await this.program.account.member.fetch(memberPda);
    return account as any;
  }

  /**
   * Get proposal data
   */
  async getProposal(proposalAddress: PublicKey): Promise<ProposalData> {
    const account = await this.program.account.tradeProposal.fetch(proposalAddress);
    return account as any;
  }

  /**
   * Get vote data
   */
  async getVote(proposalAddress: PublicKey, voterAuthority: PublicKey): Promise<VoteData | null> {
    try {
      const [votePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('vote'), proposalAddress.toBuffer(), voterAuthority.toBuffer()],
        this.program.programId
      );

      const account = await this.program.account.vote.fetch(votePda);
      return account as any;
    } catch {
      return null; // Vote doesn't exist
    }
  }

  /**
   * Get all funds
   */
  async getAllFunds(): Promise<Array<{ address: PublicKey; data: FundData }>> {
    const accounts = await this.program.account.fund.all();
    return accounts.map(acc => ({
      address: acc.publicKey,
      data: acc.account as any
    }));
  }

  /**
   * Get all proposals for a fund
   */
  async getFundProposals(fundAddress: PublicKey): Promise<Array<{ address: PublicKey; data: ProposalData }>> {
    const accounts = await this.program.account.tradeProposal.all([
      {
        memcmp: {
          offset: 8, // Skip discriminator
          bytes: fundAddress.toBase58(),
        },
      },
    ]);

    return accounts.map(acc => ({
      address: acc.publicKey,
      data: acc.account as any
    }));
  }

  /**
   * Listen to fund events
   */
  onFundCreated(callback: (event: any) => void): number {
    return this.program.addEventListener('FundCreated', callback);
  }

  onMemberJoined(callback: (event: any) => void): number {
    return this.program.addEventListener('MemberJoined', callback);
  }

  onTradeProposalCreated(callback: (event: any) => void): number {
    return this.program.addEventListener('TradeProposalCreated', callback);
  }

  onVoteCast(callback: (event: any) => void): number {
    return this.program.addEventListener('VoteCast', callback);
  }

  onProposalExecuted(callback: (event: any) => void): number {
    return this.program.addEventListener('ProposalExecuted', callback);
  }

  removeEventListener(listenerId: number): void {
    this.program.removeEventListener(listenerId);
  }
}


export default SolanaFundsService;