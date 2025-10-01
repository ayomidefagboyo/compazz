// Prediction markets service for Solana
import { Connection, PublicKey } from '@solana/web3.js';

export interface PredictionMarket {
  id: string;
  title: string;
  description: string;
  category: 'crypto' | 'sports' | 'politics' | 'weather' | 'economics';
  outcomeType: 'binary' | 'multiple' | 'scalar';
  outcomes: string[];
  endTime: number;
  resolutionTime: number;
  totalVolume: number;
  totalParticipants: number;
  status: 'active' | 'resolved' | 'cancelled';
  creator: string;
  createdAt: number;
  liquidity: number;
  fees: number;
}

export interface MarketPosition {
  marketId: string;
  outcome: string;
  amount: number;
  price: number;
  pnl: number;
  timestamp: number;
}

export interface MarketResolution {
  marketId: string;
  winningOutcome: string;
  resolutionData: any;
  resolvedAt: number;
  resolutionSource: string;
}

class PredictionMarketsService {
  private connection: Connection;
  private markets: Map<string, PredictionMarket> = new Map();
  private positions: Map<string, MarketPosition[]> = new Map();
  private resolutions: Map<string, MarketResolution> = new Map();

  constructor() {
    this.connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    this.initializeMarkets();
  }

  private initializeMarkets() {
    const sampleMarkets: PredictionMarket[] = [
      {
        id: '1',
        title: 'Will SOL reach $150 by end of 2024?',
        description: 'Binary prediction market on Solana price reaching $150 by December 31, 2024',
        category: 'crypto',
        outcomeType: 'binary',
        outcomes: ['Yes', 'No'],
        endTime: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
        resolutionTime: Date.now() + (31 * 24 * 60 * 60 * 1000), // 31 days
        totalVolume: 45000,
        totalParticipants: 234,
        status: 'active',
        creator: 'system',
        createdAt: Date.now() - (7 * 24 * 60 * 60 * 1000), // 7 days ago
        liquidity: 15000,
        fees: 75
      },
      {
        id: '2',
        title: 'Bitcoin ETF Approval in Q1 2024',
        description: 'Will a Bitcoin ETF be approved by the SEC in Q1 2024?',
        category: 'crypto',
        outcomeType: 'binary',
        outcomes: ['Approved', 'Rejected', 'Delayed'],
        endTime: Date.now() + (60 * 24 * 60 * 60 * 1000), // 60 days
        resolutionTime: Date.now() + (61 * 24 * 60 * 60 * 1000), // 61 days
        totalVolume: 78000,
        totalParticipants: 456,
        status: 'active',
        creator: 'system',
        createdAt: Date.now() - (14 * 24 * 60 * 60 * 1000), // 14 days ago
        liquidity: 25000,
        fees: 130
      },
      {
        id: '3',
        title: 'Ethereum Shanghai Upgrade Success',
        description: 'Will the Ethereum Shanghai upgrade be successfully deployed without major issues?',
        category: 'crypto',
        outcomeType: 'binary',
        outcomes: ['Success', 'Failure'],
        endTime: Date.now() + (45 * 24 * 60 * 60 * 1000), // 45 days
        resolutionTime: Date.now() + (46 * 24 * 60 * 60 * 1000), // 46 days
        totalVolume: 32000,
        totalParticipants: 189,
        status: 'active',
        creator: 'system',
        createdAt: Date.now() - (10 * 24 * 60 * 60 * 1000), // 10 days ago
        liquidity: 12000,
        fees: 64
      },
      {
        id: '4',
        title: 'Super Bowl 2024 Winner',
        description: 'Which team will win Super Bowl 2024?',
        category: 'sports',
        outcomeType: 'multiple',
        outcomes: ['Chiefs', 'Bills', '49ers', 'Cowboys', 'Other'],
        endTime: Date.now() + (90 * 24 * 60 * 60 * 1000), // 90 days
        resolutionTime: Date.now() + (91 * 24 * 60 * 60 * 1000), // 91 days
        totalVolume: 125000,
        totalParticipants: 789,
        status: 'active',
        creator: 'system',
        createdAt: Date.now() - (5 * 24 * 60 * 60 * 1000), // 5 days ago
        liquidity: 40000,
        fees: 200
      },
      {
        id: '5',
        title: 'Federal Reserve Rate Cut in 2024',
        description: 'Will the Fed cut interest rates by at least 0.25% in 2024?',
        category: 'economics',
        outcomeType: 'binary',
        outcomes: ['Yes', 'No'],
        endTime: Date.now() + (180 * 24 * 60 * 60 * 1000), // 180 days
        resolutionTime: Date.now() + (181 * 24 * 60 * 60 * 1000), // 181 days
        totalVolume: 95000,
        totalParticipants: 567,
        status: 'active',
        creator: 'system',
        createdAt: Date.now() - (20 * 24 * 60 * 60 * 1000), // 20 days ago
        liquidity: 30000,
        fees: 150
      },
      {
        id: '6',
        title: 'Tesla Stock Price Range Q2 2024',
        description: 'What will be the price range of Tesla stock in Q2 2024?',
        category: 'crypto',
        outcomeType: 'multiple',
        outcomes: ['Under $200', '$200-$250', '$250-$300', 'Over $300'],
        endTime: Date.now() + (120 * 24 * 60 * 60 * 1000), // 120 days
        resolutionTime: Date.now() + (121 * 24 * 60 * 60 * 1000), // 121 days
        totalVolume: 67000,
        totalParticipants: 345,
        status: 'active',
        creator: 'system',
        createdAt: Date.now() - (15 * 24 * 60 * 60 * 1000), // 15 days ago
        liquidity: 22000,
        fees: 110
      }
    ];

    sampleMarkets.forEach(market => {
      this.markets.set(market.id, market);
    });
  }

  // Create a new prediction market
  public async createMarket(
    title: string,
    description: string,
    category: PredictionMarket['category'],
    outcomeType: PredictionMarket['outcomeType'],
    outcomes: string[],
    endTime: number,
    creator: string
  ): Promise<string> {
    try {
      const marketId = `market_${Date.now()}`;
      const market: PredictionMarket = {
        id: marketId,
        title,
        description,
        category,
        outcomeType,
        outcomes,
        endTime,
        resolutionTime: endTime + (24 * 60 * 60 * 1000), // 1 day after end
        totalVolume: 0,
        totalParticipants: 0,
        status: 'active',
        creator,
        createdAt: Date.now(),
        liquidity: 0,
        fees: 0
      };

      this.markets.set(marketId, market);
      console.log(`Created prediction market: ${title}`);
      return marketId;
    } catch (error) {
      console.error('Error creating market:', error);
      throw error;
    }
  }

  // Place a bet on a prediction market
  public async placeBet(
    marketId: string,
    outcome: string,
    amount: number,
    user: string
  ): Promise<string> {
    try {
      const market = this.markets.get(marketId);
      if (!market) throw new Error('Market not found');

      if (market.status !== 'active') {
        throw new Error('Market is not active');
      }

      if (Date.now() > market.endTime) {
        throw new Error('Market has ended');
      }

      if (!market.outcomes.includes(outcome)) {
        throw new Error('Invalid outcome');
      }

      // Calculate price based on current liquidity
      const price = this.calculatePrice(marketId, outcome);
      
      // Create position
      const position: MarketPosition = {
        marketId,
        outcome,
        amount,
        price,
        pnl: 0,
        timestamp: Date.now()
      };

      // Store position
      const positions = this.positions.get(marketId) || [];
      positions.push(position);
      this.positions.set(marketId, positions);

      // Update market volume
      market.totalVolume += amount;
      market.totalParticipants += 1;
      market.liquidity += amount * 0.1; // 10% goes to liquidity
      market.fees += amount * 0.02; // 2% fee
      this.markets.set(marketId, market);

      console.log(`Placed bet: ${amount} SOL on ${outcome} in market ${marketId}`);
      return `bet_${Date.now()}`;
    } catch (error) {
      console.error('Error placing bet:', error);
      throw error;
    }
  }

  // Calculate current price for an outcome
  private calculatePrice(marketId: string, outcome: string): number {
    const positions = this.positions.get(marketId) || [];
    const outcomePositions = positions.filter(p => p.outcome === outcome);
    
    if (outcomePositions.length === 0) {
      return 0.5; // Default 50% probability
    }

    // Simple price calculation based on total volume
    const totalVolume = outcomePositions.reduce((sum, p) => sum + p.amount, 0);
    const market = this.markets.get(marketId);
    if (!market) return 0.5;

    const totalMarketVolume = market.totalVolume;
    return Math.min(0.95, Math.max(0.05, totalVolume / totalMarketVolume));
  }

  // Resolve a prediction market
  public async resolveMarket(
    marketId: string,
    winningOutcome: string,
    resolutionData: any,
    resolutionSource: string
  ): Promise<void> {
    try {
      const market = this.markets.get(marketId);
      if (!market) throw new Error('Market not found');

      if (market.status !== 'active') {
        throw new Error('Market is not active');
      }

      // Update market status
      market.status = 'resolved';
      this.markets.set(marketId, market);

      // Create resolution record
      const resolution: MarketResolution = {
        marketId,
        winningOutcome,
        resolutionData,
        resolvedAt: Date.now(),
        resolutionSource
      };
      this.resolutions.set(marketId, resolution);

      // Calculate PnL for all positions
      const positions = this.positions.get(marketId) || [];
      positions.forEach(position => {
        if (position.outcome === winningOutcome) {
          // Winning position: PnL = amount * (1 - price) / price
          position.pnl = position.amount * (1 - position.price) / position.price;
        } else {
          // Losing position: PnL = -amount
          position.pnl = -position.amount;
        }
      });
      this.positions.set(marketId, positions);

      console.log(`Resolved market ${marketId}: ${winningOutcome} won`);
    } catch (error) {
      console.error('Error resolving market:', error);
      throw error;
    }
  }

  // Get all active markets
  public getActiveMarkets(): PredictionMarket[] {
    return Array.from(this.markets.values()).filter(m => m.status === 'active');
  }

  // Get markets by category
  public getMarketsByCategory(category: PredictionMarket['category']): PredictionMarket[] {
    return Array.from(this.markets.values()).filter(m => m.category === category);
  }

  // Get market by ID
  public getMarket(marketId: string): PredictionMarket | undefined {
    return this.markets.get(marketId);
  }

  // Get positions for a market
  public getMarketPositions(marketId: string): MarketPosition[] {
    return this.positions.get(marketId) || [];
  }

  // Get user positions
  public getUserPositions(user: string): MarketPosition[] {
    const allPositions: MarketPosition[] = [];
    for (const positions of this.positions.values()) {
      allPositions.push(...positions);
    }
    return allPositions; // In real implementation, filter by user
  }

  // Get market resolution
  public getMarketResolution(marketId: string): MarketResolution | undefined {
    return this.resolutions.get(marketId);
  }
}

// Export singleton instance
export const predictionMarketsService = new PredictionMarketsService();

// Export types
export type { PredictionMarket, MarketPosition, MarketResolution };
