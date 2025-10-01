// Kick.com API Integration Service
// Documentation: https://github.com/KickEngineering/KickDevDocs

interface KickStream {
  id: string;
  slug: string;
  title: string;
  category: {
    name: string;
    slug: string;
  };
  user: {
    username: string;
    profile_pic: string;
    verified: boolean;
  };
  viewer_count: number;
  is_live: boolean;
  duration: number;
  language: string;
  thumbnail: string;
  tags: string[];
}

interface KickChatMessage {
  id: string;
  chatroom_id: string;
  content: string;
  created_at: string;
  sender: {
    id: string;
    username: string;
    slug: string;
    identity: {
      color: string;
      badges: Array<{
        type: string;
        text: string;
      }>;
    };
  };
}

interface KickWebhookEvent {
  event: 'stream.online' | 'stream.offline' | 'chat.message' | 'follow' | 'subscription';
  data: any;
  timestamp: string;
}

class KickApiService {
  private baseUrl = 'https://kick.com/api/v2';
  private wsUrl = 'wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679';
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  // OAuth 2.1 with PKCE Authentication
  async authenticate(authCode: string, codeVerifier: string) {
    try {
      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: authCode,
          code_verifier: codeVerifier,
        }),
      });

      const data = await response.json();
      this.accessToken = data.access_token;
      return data;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  }

  // Get live streams by category
  async getLiveStreams(category?: string, limit = 20): Promise<KickStream[]> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(category && { category }),
      });

      const response = await fetch(`${this.baseUrl}/streams/livestreams?${params}`, {
        headers: this.getHeaders(),
      });

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Failed to fetch live streams:', error);
      return [];
    }
  }

  // Get specific stream details
  async getStream(channelSlug: string): Promise<KickStream | null> {
    try {
      const response = await fetch(`${this.baseUrl}/channels/${channelSlug}`, {
        headers: this.getHeaders(),
      });

      const data = await response.json();
      return data.livestream || null;
    } catch (error) {
      console.error('Failed to fetch stream:', error);
      return null;
    }
  }

  // Get channel details
  async getChannel(channelSlug: string) {
    try {
      const response = await fetch(`${this.baseUrl}/channels/${channelSlug}`, {
        headers: this.getHeaders(),
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch channel:', error);
      return null;
    }
  }

  // WebSocket connection for real-time chat
  connectToChat(chatroomId: string, onMessage: (message: KickChatMessage) => void) {
    const ws = new WebSocket(`${this.wsUrl}?protocol=7&client=js&version=7.0.3&flash=false`);

    ws.onopen = () => {
      console.log('Connected to Kick chat WebSocket');

      // Subscribe to chatroom
      ws.send(JSON.stringify({
        event: 'pusher:subscribe',
        data: {
          auth: '',
          channel: `chatrooms.${chatroomId}.v2`
        }
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.event === 'App\\Events\\ChatMessageEvent') {
          const messageData = JSON.parse(data.data);
          onMessage(messageData);
        }
      } catch (error) {
        console.error('Error parsing chat message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('Chat WebSocket error:', error);
    };

    return ws;
  }

  // Send chat message (requires authentication)
  async sendChatMessage(chatroomId: string, content: string) {
    if (!this.accessToken) {
      throw new Error('Authentication required to send chat messages');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chatrooms/${chatroomId}/messages`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          content,
          type: 'message',
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to send chat message:', error);
      throw error;
    }
  }

  // Setup webhook for stream events
  async createWebhook(url: string, events: string[]) {
    if (!this.accessToken) {
      throw new Error('Authentication required to create webhooks');
    }

    try {
      const response = await fetch(`${this.baseUrl}/webhooks`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          url,
          events,
          is_active: true,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to create webhook:', error);
      throw error;
    }
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Compazz/1.0',
    };
  }
}

// Real-time stream monitoring for predictions
class KickPredictionMonitor {
  private kickApi: KickApiService;
  private activeStreams: Map<string, WebSocket> = new Map();

  constructor(kickApi: KickApiService) {
    this.kickApi = kickApi;
  }

  // Monitor stream for prediction events
  async monitorStreamForPredictions(
    channelSlug: string,
    onPredictionEvent: (event: any) => void
  ) {
    const stream = await this.kickApi.getStream(channelSlug);
    if (!stream) return;

    // Connect to chat for real-time engagement
    const chatWs = this.kickApi.connectToChat(stream.id, (message) => {
      // Analyze chat for prediction triggers
      this.analyzeChatForPredictions(message, onPredictionEvent);
    });

    this.activeStreams.set(channelSlug, chatWs);

    // Monitor viewer count changes
    this.monitorViewerCount(channelSlug, onPredictionEvent);
  }

  private analyzeChatForPredictions(message: KickChatMessage, callback: (event: any) => void) {
    const content = message.content.toLowerCase();

    // Prediction triggers based on chat patterns
    if (content.includes('!prediction') || content.includes('!bet')) {
      callback({
        type: 'chat_prediction_trigger',
        message: message.content,
        user: message.sender.username,
        timestamp: message.created_at,
      });
    }

    // Sentiment analysis for prediction insights
    if (content.includes('win') || content.includes('lose') || content.includes('gg')) {
      callback({
        type: 'sentiment_indicator',
        sentiment: this.analyzeSentiment(content),
        user: message.sender.username,
        timestamp: message.created_at,
      });
    }
  }

  private async monitorViewerCount(channelSlug: string, callback: (event: any) => void) {
    let lastViewerCount = 0;

    setInterval(async () => {
      const stream = await this.kickApi.getStream(channelSlug);
      if (stream && stream.viewer_count !== lastViewerCount) {
        callback({
          type: 'viewer_count_change',
          from: lastViewerCount,
          to: stream.viewer_count,
          change: stream.viewer_count - lastViewerCount,
          timestamp: new Date().toISOString(),
        });
        lastViewerCount = stream.viewer_count;
      }
    }, 30000); // Check every 30 seconds
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['win', 'good', 'great', 'awesome', 'nice', 'gg', 'ez'];
    const negativeWords = ['lose', 'bad', 'terrible', 'rip', 'fail', 'noob'];

    const positive = positiveWords.some(word => text.includes(word));
    const negative = negativeWords.some(word => text.includes(word));

    if (positive && !negative) return 'positive';
    if (negative && !positive) return 'negative';
    return 'neutral';
  }

  stopMonitoring(channelSlug: string) {
    const ws = this.activeStreams.get(channelSlug);
    if (ws) {
      ws.close();
      this.activeStreams.delete(channelSlug);
    }
  }
}

export { KickApiService, KickPredictionMonitor, type KickStream, type KickChatMessage };