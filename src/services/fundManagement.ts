import { PublicKey, Connection, Transaction, Keypair } from '@solana/web3.js';
import { telegramAuthService } from './telegramAuth';
import SolanaFundsService from './solanaFunds';
import { AnchorProvider, Wallet } from '@coral-xyz/anchor';

export interface FundCreationRequest {
  name: string;
  description: string;
  strategy: string;
  minContribution: number;
  maxMembers: number;
  managementFee: number;
  performanceFee: number;
  creator: PublicKey;
  creatorKeypair: Keypair; // Needed for signing transactions
  telegramOption: 'create_new' | 'use_existing';
  existingGroupId?: string;
  inviteLink?: string;
}

export interface FundCreationResult {
  fundId: string;
  onChainAddress: string;
  telegramGroupId: string;
  telegramInviteLink: string;
  transactionSignature: string;
}

class FundManagementService {
  private connection: Connection;
  private botApiUrl: string;
  private solanaService: SolanaFundsService | null = null;
  private programId: PublicKey;

  constructor() {
    this.connection = new Connection(import.meta.env?.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com');
    this.botApiUrl = `https://api.telegram.org/bot${import.meta.env?.VITE_TELEGRAM_BOT_TOKEN}`;
    // Default program ID - in production this would be the deployed program
    this.programId = new PublicKey('11111111111111111111111111111111');
  }

  private initializeSolanaService(wallet: any): SolanaFundsService {
    if (!this.solanaService) {
      this.solanaService = new SolanaFundsService(this.connection, wallet, this.programId);
    }
    return this.solanaService;
  }

  /**
   * Complete fund creation workflow
   */
  async createFund(request: FundCreationRequest): Promise<FundCreationResult> {
    try {
      console.log('Starting fund creation process...', request);

      // Step 1: Validate user authentication
      if (!telegramAuthService.isAuthenticated()) {
        throw new Error('User must be authenticated with Telegram');
      }

      // Step 2: Handle Telegram group creation/joining
      let telegramGroupId: string;
      let inviteLink: string;

      if (request.telegramOption === 'create_new') {
        const groupResult = await this.createTelegramGroup(request);
        telegramGroupId = groupResult.groupId;
        inviteLink = groupResult.inviteLink;
      } else if (request.telegramOption === 'use_existing' && request.existingGroupId) {
        const joinResult = await this.joinExistingGroup(request.existingGroupId, request.inviteLink);
        telegramGroupId = joinResult.groupId;
        inviteLink = joinResult.inviteLink;
      } else {
        throw new Error('Invalid Telegram group option');
      }

      // Step 3: Create on-chain fund program
      const onChainResult = await this.createOnChainFund(request, telegramGroupId);

      // Step 4: Configure Telegram group with fund details
      await this.configureTelegramGroup(telegramGroupId, {
        fundId: onChainResult.fundId,
        fundAddress: onChainResult.address,
        creator: request.creator,
        fundDetails: request
      });

      // Step 5: Set up bot commands and webhooks
      await this.setupBotCommands(telegramGroupId, onChainResult.fundId);

      return {
        fundId: onChainResult.fundId,
        onChainAddress: onChainResult.address,
        telegramGroupId,
        telegramInviteLink: inviteLink,
        transactionSignature: onChainResult.signature
      };

    } catch (error) {
      console.error('Fund creation failed:', error);
      throw error;
    }
  }

  /**
   * Create new Telegram group for the fund
   */
  private async createTelegramGroup(request: FundCreationRequest): Promise<{groupId: string, inviteLink: string}> {
    try {
      // 1. Create the group
      const createResponse = await fetch(`${this.botApiUrl}/createGroup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${request.name} - Trading Fund`,
          description: request.description
        })
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create Telegram group');
      }

      const groupData = await createResponse.json();
      const groupId = groupData.result.id;

      // 2. Set group photo and description
      await this.setupGroupAppearance(groupId, request);

      // 3. Create invite link
      const inviteResponse = await fetch(`${this.botApiUrl}/createChatInviteLink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: groupId,
          name: `Join ${request.name}`,
          member_limit: request.maxMembers
        })
      });

      const inviteData = await inviteResponse.json();
      const inviteLink = inviteData.result.invite_link;

      return { groupId: groupId.toString(), inviteLink };

    } catch (error) {
      console.error('Failed to create Telegram group:', error);
      throw new Error('Could not create Telegram group. Please try again.');
    }
  }

  /**
   * Join existing Telegram group
   */
  private async joinExistingGroup(groupId: string, inviteLink?: string): Promise<{groupId: string, inviteLink: string}> {
    try {
      // If invite link provided, join via link
      if (inviteLink) {
        // Extract invite hash from link
        const inviteHash = inviteLink.split('/').pop();

        const joinResponse = await fetch(`${this.botApiUrl}/joinChatByInviteLink`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invite_link: inviteLink
          })
        });

        if (!joinResponse.ok) {
          throw new Error('Bot could not join the group');
        }
      }

      // Verify bot has admin rights
      const adminResponse = await fetch(`${this.botApiUrl}/getChatMember`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: groupId,
          user_id: process.env.VITE_TELEGRAM_BOT_ID
        })
      });

      const adminData = await adminResponse.json();
      if (!adminData.result.status.includes('administrator')) {
        throw new Error('Bot needs admin rights in the group');
      }

      return {
        groupId,
        inviteLink: inviteLink || await this.createGroupInviteLink(groupId)
      };

    } catch (error) {
      console.error('Failed to join existing group:', error);
      throw new Error('Could not join existing group. Ensure bot has admin rights.');
    }
  }

  /**
   * Create on-chain Solana program for fund
   */
  private async createOnChainFund(request: FundCreationRequest, telegramGroupId: string): Promise<{fundId: string, address: string, signature: string}> {
    try {
      // Create a mock wallet for the creator
      const wallet = {
        publicKey: request.creator,
        signTransaction: async (tx: Transaction) => {
          tx.partialSign(request.creatorKeypair);
          return tx;
        },
        signAllTransactions: async (txs: Transaction[]) => {
          return txs.map(tx => {
            tx.partialSign(request.creatorKeypair);
            return tx;
          });
        }
      };

      // Initialize Solana service
      const solanaService = this.initializeSolanaService(wallet);

      // Create the fund on-chain
      const result = await solanaService.createFund(
        request.name,
        request.description,
        request.strategy,
        telegramGroupId,
        request.minContribution,
        request.maxMembers,
        request.managementFee,
        request.performanceFee,
        request.creatorKeypair
      );

      const fundId = result.fundAddress.toString();

      console.log('Created on-chain fund:', {
        fundId,
        address: result.fundAddress.toString(),
        creator: request.creator.toString(),
        telegramGroupId,
        signature: result.signature
      });

      return {
        fundId,
        address: result.fundAddress.toString(),
        signature: result.signature
      };

    } catch (error) {
      console.error('Failed to create on-chain fund:', error);
      throw new Error(`Blockchain transaction failed: ${error.message}`);
    }
  }

  /**
   * Configure Telegram group with fund-specific settings
   */
  private async configureTelegramGroup(groupId: string, config: any): Promise<void> {
    try {
      // Set group description with fund details
      await fetch(`${this.botApiUrl}/setChatDescription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: groupId,
          description: `🚀 ${config.fundDetails.name}

📊 Strategy: ${config.fundDetails.strategy}
💰 Min Contribution: ${config.fundDetails.minContribution} SOL
👥 Max Members: ${config.fundDetails.maxMembers}
⚡ Management Fee: ${config.fundDetails.managementFee}%
🎯 Performance Fee: ${config.fundDetails.performanceFee}%

🔗 Fund Address: ${config.fundAddress}
🆔 Fund ID: ${config.fundId}

Use /help to see available commands.`
        })
      });

      // Send welcome message
      await this.sendWelcomeMessage(groupId, config);

    } catch (error) {
      console.error('Failed to configure Telegram group:', error);
    }
  }

  /**
   * Set up bot commands for the group
   */
  private async setupBotCommands(groupId: string, fundId: string): Promise<void> {
    try {
      // Set bot commands
      await fetch(`${this.botApiUrl}/setMyCommands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commands: [
            { command: 'help', description: 'Show available commands' },
            { command: 'status', description: 'Check fund status and performance' },
            { command: 'contribute', description: 'Add funds to the trading pool' },
            { command: 'withdraw', description: 'Withdraw your contribution' },
            { command: 'vote', description: 'Create or participate in governance votes' },
            { command: 'trades', description: 'View recent trading activity' },
            { command: 'leaderboard', description: 'View top contributors' }
          ],
          scope: {
            type: 'chat',
            chat_id: groupId
          }
        })
      });

    } catch (error) {
      console.error('Failed to setup bot commands:', error);
    }
  }

  /**
   * Send welcome message to new group
   */
  private async sendWelcomeMessage(groupId: string, config: any): Promise<void> {
    const welcomeMessage = `🎉 Welcome to ${config.fundDetails.name}!

This is your exclusive trading fund group. Here's what you can do:

💰 **Contribute**: Use /contribute to add SOL to the fund
📊 **Track Performance**: Use /status for real-time updates
🗳️ **Participate in Governance**: Use /vote for community decisions
📈 **View Trades**: Use /trades to see trading activity

⚡ The bot will automatically notify you of:
• New trades and their performance
• Governance proposals requiring your vote
• Fund milestones and achievements
• Important announcements

Let's start building wealth together! 🚀`;

    await fetch(`${this.botApiUrl}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: groupId,
        text: welcomeMessage,
        parse_mode: 'Markdown'
      })
    });
  }

  /**
   * Helper methods
   */
  private async setupGroupAppearance(groupId: string, request: FundCreationRequest): Promise<void> {
    // Set group photo, title formatting, etc.
  }

  private async createGroupInviteLink(groupId: string): Promise<string> {
    const response = await fetch(`${this.botApiUrl}/exportChatInviteLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: groupId })
    });

    const data = await response.json();
    return data.result;
  }

  /**
   * Fund joining workflow
   */
  async joinFund(fundId: string, contributionAmount: number, userWallet: PublicKey): Promise<string> {
    try {
      // 1. Validate fund exists and has capacity
      // 2. Process SOL contribution on-chain
      // 3. Add user to Telegram group
      // 4. Update fund state

      console.log(`User ${userWallet.toString()} joining fund ${fundId} with ${contributionAmount} SOL`);

      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      return `join_tx_${Date.now()}`;
    } catch (error) {
      console.error('Failed to join fund:', error);
      throw error;
    }
  }
}

export const fundManagementService = new FundManagementService();
export default fundManagementService;