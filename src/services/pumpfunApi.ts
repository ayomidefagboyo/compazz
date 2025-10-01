// PumpPortal WebSocket API Integration
// Documentation: https://pumpportal.fun/data-api/real-time/

interface PumpFunTrade {
  signature: string;
  mint: string;
  trader: string;
  txType: 'buy' | 'sell';
  tokenAmount: number;
  solAmount: number;
  timestamp: number;
  marketCapSol: number;
  bondingCurveKey: string;
}

interface PumpFunNewToken {
  signature: string;
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  creator: string;
  timestamp: number;
  marketCapSol: number;
}

class PumpFunWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      this.ws = new WebSocket('wss://pumpportal.fun/api/data');

      this.ws.onopen = () => {
        console.log('Connected to PumpPortal WebSocket');
        this.reconnectAttempts = 0;

        // Subscribe to new token events
        this.subscribeNewTokens();

        // Subscribe to trades for specific tokens (example)
        // this.subscribeTokenTrades(['TokenAddressHere']);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Disconnected from PumpPortal WebSocket');
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);

      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private handleMessage(data: any) {
    // Handle new token creation
    if (data.mint && data.name && data.symbol) {
      const newToken: PumpFunNewToken = {
        signature: data.signature,
        mint: data.mint,
        name: data.name,
        symbol: data.symbol,
        description: data.description || '',
        image: data.image || '',
        creator: data.creator,
        timestamp: data.timestamp,
        marketCapSol: data.marketCapSol
      };
      this.onNewToken(newToken);
    }

    // Handle trade events
    if (data.txType) {
      const trade: PumpFunTrade = {
        signature: data.signature,
        mint: data.mint,
        trader: data.trader,
        txType: data.txType,
        tokenAmount: data.tokenAmount,
        solAmount: data.solAmount,
        timestamp: data.timestamp,
        marketCapSol: data.marketCapSol,
        bondingCurveKey: data.bondingCurveKey
      };
      this.onTrade(trade);
    }
  }

  // Subscribe to new token creation events
  public subscribeNewTokens() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        method: 'subscribeNewToken'
      }));
    }
  }

  // Subscribe to trades for specific tokens
  public subscribeTokenTrades(tokenAddresses: string[]) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        method: 'subscribeTokenTrade',
        keys: tokenAddresses
      }));
    }
  }

  // Subscribe to trades by specific accounts
  public subscribeAccountTrades(accountAddresses: string[]) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        method: 'subscribeAccountTrade',
        keys: accountAddresses
      }));
    }
  }

  // Event handlers (to be overridden)
  public onNewToken(token: PumpFunNewToken) {
    console.log('New token created:', token);
    // Override this method to handle new tokens
  }

  public onTrade(trade: PumpFunTrade) {
    console.log('New trade:', trade);
    // Override this method to handle trades
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export { PumpFunWebSocket, type PumpFunTrade, type PumpFunNewToken };