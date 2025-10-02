import { VercelRequest, VercelResponse } from '@vercel/node';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Enhanced bot handler with blockchain integration
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const update = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.VITE_TELEGRAM_BOT_TOKEN || '';

    // Initialize Solana connection (simplified for now)
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

    // Extract message info
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      const userId = update.message.from.id;
      const username = update.message.from.username || update.message.from.first_name;

      console.log(`Received message: ${text} from ${username} in chat ${chatId}`);

      // Handle commands with blockchain integration
      let responseText = '';

      switch (text) {
        case '/start':
          responseText = `🚀 Welcome to Compazz Social Trading Platform!

I'm your trading fund assistant. Here's what I can help you with:

💰 **Fund Management**
• Create and manage social trading funds
• Join existing funds and contribute SOL
• Track fund performance and your contributions

🗳️ **Governance**
• Create trade proposals for community voting
• Vote on investment decisions
• Execute winning proposals automatically

📊 **Analytics**
• View fund statistics and performance
• Check your contribution and voting history
• Monitor platform activity

Type /help to see all available commands or visit https://www.compazz.app to get started!

Ready to start social trading? 🚀`;
          break;

        case '/help':
          responseText = `📋 **Available Commands:**

🏦 **Fund Commands:**
• /status - Check fund status and performance
• /contribute - Add SOL to a fund
• /withdraw - Withdraw your contributions
• /balance - Check your SOL balance
• /leaderboard - View top contributors

🗳️ **Governance Commands:**
• /propose - Create a new trade proposal
• /vote - Vote on active proposals
• /proposals - View all active proposals

📊 **Information Commands:**
• /funds - List all available funds
• /myfunds - Show funds you're a member of
• /history - View your trading history

🌐 **Platform:**
Visit https://www.compazz.app to create and manage funds!

Need help? Type /start for an overview or visit our platform.`;
          break;

        case '/status':
          try {
            // Get blockchain connection status
            const slot = await connection.getSlot();
            const blockTime = await connection.getBlockTime(slot);
            const currentTime = Math.floor(Date.now() / 1000);
            const latency = currentTime - (blockTime || currentTime);

            responseText = `📊 **Live Platform Status:**

🚀 **Compazz Social Trading Platform**
• Status: ✅ LIVE and operational
• Website: https://www.compazz.app
• Smart Contract: ✅ Deployed on Solana Devnet

⛓️ **Blockchain Connection:**
• Network: Solana Devnet
• Current Slot: ${slot.toLocaleString()}
• Connection: ✅ Active (${latency}s latency)

💰 **Platform Fees:**
• Fund Creation: 0.1 SOL
• Transaction Fee: 0.2%
• Success Fee: 1% of profits

🎯 **Ready to Trade:**
Visit https://www.compazz.app to create your first social trading fund!

💡 **Features:**
• Community-driven investment decisions
• Transparent on-chain governance
• Automated fee collection
• Real-time voting and execution`;
          } catch (error) {
            console.error('Error fetching platform stats:', error);
            responseText = `📊 **Platform Status:**

🚀 **Compazz Social Trading Platform**
• Status: ✅ LIVE and operational
• Website: https://www.compazz.app
• Smart Contract: ✅ Deployed on Solana

💰 **Platform Fees:**
• Fund Creation: 0.1 SOL
• Transaction Fee: 0.2%
• Success Fee: 1% of profits

🎯 **Ready to Trade:**
Visit https://www.compazz.app to create your first social trading fund!`;
          }
          break;

        case '/funds':
          responseText = `🏦 **Available Trading Funds:**

🚀 **Create Your First Fund:**
Visit https://www.compazz.app to start your own social trading fund.

💡 **Benefits of creating a fund:**
• Earn management fees from members
• Build a trading community
• Share investment strategies
• Collect platform fees automatically
• Democratic governance with community voting

🎯 **How it works:**
1. Create a fund with your strategy
2. Set minimum contribution and member limits
3. Invite members via Telegram
4. Community votes on trade proposals
5. Winning trades execute automatically
6. Profits distributed proportionally

🌐 **Get Started**: https://www.compazz.app

💰 **Revenue Model:**
• Platform Fee: 0.1 SOL per fund
• Transaction Fee: 0.2% of deposits/withdrawals
• Success Fee: 1% of fund profits`;
          break;

        case '/balance':
          responseText = `💰 **Check Your SOL Balance:**

To check your balance and manage funds:

1️⃣ **Connect Wallet**: Visit https://www.compazz.app
2️⃣ **Link Solana Wallet**: Connect your wallet to the platform
3️⃣ **View Dashboard**: See your balance and fund contributions
4️⃣ **Track Performance**: Monitor your portfolio growth

📊 **What you'll see:**
• Total SOL balance
• Fund contributions
• Pending withdrawals
• Profit/loss summary

🔗 **Get Started**: https://www.compazz.app

💡 **Tip**: You need a Solana wallet (like Phantom) to participate in trading funds.`;
          break;

        case '/contribute':
          responseText = `💰 **Ready to Contribute to a Fund?**

To contribute SOL to a trading fund:

1️⃣ **Visit Platform**: Go to https://www.compazz.app
2️⃣ **Connect Wallet**: Link your Solana wallet (Phantom, Solflare, etc.)
3️⃣ **Browse Funds**: Use /funds command or website to find funds
4️⃣ **Select Fund**: Choose a fund that matches your strategy
5️⃣ **Contribute**: Enter amount and confirm transaction

💡 **Important Notes:**
• 0.2% transaction fee applies to all contributions
• Minimum contribution varies by fund
• Your SOL joins the community pool for collective trading

🔐 **Security**: All transactions are secured by Solana blockchain

Ready to start? Visit https://www.compazz.app`;
          break;

        case '/withdraw':
          responseText = `💸 **Withdraw Your Contributions:**

To withdraw SOL from a trading fund:

1️⃣ **Visit Platform**: Go to https://www.compazz.app
2️⃣ **Connect Wallet**: Link your Solana wallet
3️⃣ **My Funds**: Navigate to your fund memberships
4️⃣ **Select Fund**: Choose fund to withdraw from
5️⃣ **Withdraw**: Enter amount and confirm transaction

⚠️ **Important:**
• You can only withdraw your proportional share
• Withdrawals may be subject to fund rules
• Active proposals might restrict withdrawals
• No withdrawal fees for standard exits

🔐 **Secure Process**: All withdrawals are blockchain-verified

Manage your funds: https://www.compazz.app`;
          break;

        case '/propose':
          responseText = `📝 **Create a Trade Proposal:**

To propose a trade to your fund community:

1️⃣ **Fund Membership**: You must be a fund member to propose trades
2️⃣ **Visit Platform**: Go to https://www.compazz.app
3️⃣ **Select Fund**: Navigate to your fund's dashboard
4️⃣ **Create Proposal**: Use the "New Proposal" button
5️⃣ **Add Details**:
   • Trade action (Buy/Sell/Swap/Hold)
   • Token/Asset details
   • Amount to trade
   • Reasoning for the trade
6️⃣ **Set Voting**: Choose voting duration (typically 24-72 hours)
7️⃣ **Submit**: Proposal goes live for community voting

🗳️ **Democracy**: Community votes decide trade execution

Create your proposal: https://www.compazz.app`;
          break;

        case '/vote':
          responseText = `🗳️ **Vote on Trade Proposals:**

To participate in fund governance:

1️⃣ **Fund Membership**: Join a fund first (/contribute)
2️⃣ **Active Proposals**: Check your fund's current proposals
3️⃣ **Review Details**: Read proposal reasoning and trade details
4️⃣ **Cast Vote**: Choose 👍 (For) or 👎 (Against)
5️⃣ **Wait for Results**: Majority decision wins

📊 **Your Vote Counts:**
• One vote per member per proposal
• Voting power may be based on contribution size
• Results are transparent and automated

🎯 **Democracy in Action**: Your vote shapes fund strategy!

Vote now: https://www.compazz.app`;
          break;

        case '/proposals':
          responseText = `📋 **Active Trade Proposals:**

To view all current proposals:

1️⃣ **Visit Platform**: Go to https://www.compazz.app
2️⃣ **Fund Dashboard**: Navigate to your fund
3️⃣ **Proposals Tab**: See all active and past proposals
4️⃣ **Vote**: Participate in open proposals
5️⃣ **Track Results**: Monitor voting progress

📊 **Proposal Information:**
• Trade details and reasoning
• Current vote count
• Time remaining
• Execution status

🚀 **Stay Engaged**: Regular voting improves fund performance

Check proposals: https://www.compazz.app`;
          break;

        case '/myfunds':
          responseText = `👤 **Your Fund Memberships:**

To view funds you're a member of:

1️⃣ **Visit Platform**: Go to https://www.compazz.app
2️⃣ **Connect Wallet**: Link your Solana wallet
3️⃣ **Dashboard**: Your memberships will be displayed
4️⃣ **Fund Details**: Click each fund to see:
   • Your contribution amount
   • Current fund performance
   • Your profit/loss
   • Voting history
   • Pending proposals

📊 **Track Performance**: Monitor your investments across all funds

🎯 **Pro Tip**: Diversify across multiple funds to spread risk

View your portfolio: https://www.compazz.app`;
          break;

        case '/leaderboard':
          responseText = `🏆 **Top Contributors & Performers:**

View the leaderboard:

1️⃣ **Visit Platform**: Go to https://www.compazz.app
2️⃣ **Leaderboard Section**: See top performers
3️⃣ **Categories**:
   • 💰 Highest contributors
   • 📈 Best performing funds
   • 🗳️ Most active voters
   • 🚀 Top fund creators

🏅 **Recognition**: Top contributors get special recognition

💡 **Compete**: Climb the ranks through smart trading and active participation

See rankings: https://www.compazz.app`;
          break;

        case '/history':
          responseText = `📈 **Your Trading History:**

To view your complete trading history:

1️⃣ **Visit Platform**: Go to https://www.compazz.app
2️⃣ **Connect Wallet**: Link your Solana wallet
3️⃣ **History Tab**: View all your activities:
   • Fund contributions
   • Withdrawal transactions
   • Votes cast on proposals
   • Profit/loss over time
   • Fee payments

📊 **Detailed Analytics**: Track your performance trends

💰 **Tax Records**: Export for tax reporting purposes

View history: https://www.compazz.app`;
          break;

        default:
          responseText = `👋 Hi ${username}!

I'm the Compazz trading bot. I help manage social trading funds where communities make investment decisions together.

🚀 **Quick Start:**
• Type /help for all commands
• Use /funds to see available trading funds
• Use /status to check live platform statistics
• Visit https://www.compazz.app to get started

🎯 **Popular Commands:**
• /contribute - Join a fund with SOL
• /vote - Participate in trade decisions
• /balance - Check your portfolio

Ready to start social trading? Let's go! 💰`;
          break;
      }

      // Send response back to Telegram
      if (responseText) {
        const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

        await fetch(telegramApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: responseText,
            parse_mode: 'Markdown'
          }),
        });
      }
    }

    // Send success response
    res.status(200).json({
      ok: true,
      message: 'Webhook processed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Webhook error:', error);

    // Send error response
    res.status(500).json({
      ok: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}