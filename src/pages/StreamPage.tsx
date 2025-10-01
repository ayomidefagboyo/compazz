import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Eye, Users, MessageCircle, DollarSign, Clock, TrendingUp, Zap, AlertCircle, Send } from 'lucide-react';

// Mock stream data - in real app this would come from API
const getStreamData = (streamId: string) => {
  const streams = {
    '1': {
      id: '1',
      streamer: 'CryptoKing',
      title: 'Will $BONK hit $0.001 during this stream?',
      tokenSymbol: 'BONK',
      tokenPrice: 0.0000123,
      viewers: 1247,
      duration: '2h 45m',
      category: 'Meme Coins',
      predictions: [
        { id: 1, outcome: 'Yes - Hits $0.001', odds: 3.2, volume: 2450, percentage: 30, myBet: 0.1, color: 'bg-green-600' },
        { id: 2, outcome: 'No - Stays Below', odds: 1.4, volume: 5670, percentage: 70, myBet: 0, color: 'bg-red-600' }
      ],
      totalVolume: 8120,
      endTime: Date.now() + 2 * 60 * 60 * 1000,
      isLive: true
    },
    '2': {
      id: '2',
      streamer: 'PumpMaster',
      title: 'New token launch - Will it 10x in first hour?',
      tokenSymbol: 'NEW',
      tokenPrice: 0.00001,
      viewers: 892,
      duration: '1h 12m',
      category: 'Token Launch',
      predictions: [
        { id: 1, outcome: 'Yes - 10x pump', odds: 8.5, volume: 1230, percentage: 24, myBet: 0, color: 'bg-green-600' },
        { id: 2, outcome: 'No - Under 5x', odds: 1.1, volume: 3890, percentage: 76, myBet: 0, color: 'bg-red-600' }
      ],
      totalVolume: 5120,
      endTime: Date.now() + 1 * 60 * 60 * 1000,
      isLive: true
    },
    '3': {
      id: '3',
      streamer: 'SolanaWizard',
      title: 'Trading live - Will I make $1000 profit today?',
      tokenSymbol: 'Multiple',
      tokenPrice: null,
      viewers: 634,
      duration: '45m',
      category: 'Trading',
      predictions: [
        { id: 1, outcome: 'Yes - $1000+ profit', odds: 2.8, volume: 890, percentage: 36, myBet: 0, color: 'bg-green-600' },
        { id: 2, outcome: 'No - Less than $1000', odds: 1.5, volume: 1560, percentage: 64, myBet: 0, color: 'bg-red-600' }
      ],
      totalVolume: 2450,
      endTime: Date.now() + 8 * 60 * 60 * 1000,
      isLive: true
    },
    '4': {
      id: '4',
      streamer: 'SportsGuru',
      title: 'NFL Predictions - Who wins Chiefs vs Bills?',
      tokenSymbol: null,
      tokenPrice: null,
      viewers: 2156,
      duration: '3h 20m',
      category: 'Sports',
      predictions: [
        { id: 1, outcome: 'Chiefs Win', odds: 2.1, volume: 4560, percentage: 40, myBet: 0, color: 'bg-green-600' },
        { id: 2, outcome: 'Bills Win', odds: 1.8, volume: 6780, percentage: 60, myBet: 0, color: 'bg-red-600' }
      ],
      totalVolume: 11340,
      endTime: Date.now() + 3 * 60 * 60 * 1000,
      isLive: true
    },
    '5': {
      id: '5',
      streamer: 'EsportsKing',
      title: 'CS2 Major - Will team score over 16 rounds?',
      tokenSymbol: null,
      tokenPrice: null,
      viewers: 1834,
      duration: '1h 55m',
      category: 'Sports',
      predictions: [
        { id: 1, outcome: 'Over 16 rounds', odds: 1.9, volume: 2340, percentage: 55, myBet: 0, color: 'bg-green-600' },
        { id: 2, outcome: 'Under 16 rounds', odds: 2.2, volume: 1890, percentage: 45, myBet: 0, color: 'bg-red-600' }
      ],
      totalVolume: 4230,
      endTime: Date.now() + 2 * 60 * 60 * 1000,
      isLive: true
    }
  };

  return streams[streamId as keyof typeof streams] || streams['1'];
};

const generateChatMessages = (streamId: string) => [
  { id: 1, user: 'trader123', message: 'This is gonna moon! 🚀', timestamp: '2:34' },
  { id: 2, user: 'bonkfan', message: 'Looking bullish!', timestamp: '2:33' },
  { id: 3, user: 'skeptic', message: 'Hmm not so sure about this one', timestamp: '2:32' },
  { id: 4, user: 'whale99', message: 'Just made a big prediction', timestamp: '2:31' },
  { id: 5, user: 'hodler', message: 'Price action looking good', timestamp: '2:30' }
];

export function StreamPage() {
  const { streamId } = useParams<{ streamId: string }>();
  const navigate = useNavigate();
  const { isConnected } = useAuth();

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<number | null>(null);
  const [predictionAmount, setPredictionAmount] = useState<string>('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState(() => generateChatMessages(streamId || '1'));

  const stream = getStreamData(streamId || '1');

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(1)}K`;
    return `$${volume.toFixed(0)}`;
  };

  const getTimeRemaining = (endTime: number) => {
    const now = Date.now();
    const diff = endTime - now;
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m left`;
  };

  const handlePlacePrediction = () => {
    if (!isConnected) return;
    if (!selectedPrediction || !predictionAmount) return;

    // Here you would integrate with Solana smart contracts
    console.log(`Placing prediction: ${predictionAmount} SOL on prediction ${selectedPrediction}`);

    // Reset form
    setSelectedPrediction(null);
    setPredictionAmount('');
  };

  const handleSendMessage = () => {
    if (!isConnected || !chatMessage.trim()) return;

    const newMessage = {
      id: chatMessages.length + 1,
      user: 'You',
      message: chatMessage.trim(),
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: false
      })
    };

    setChatMessages(prev => [newMessage, ...prev]);
    setChatMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="w-full">
        {/* Header with back button */}
        <div className="flex items-center p-4 border-b border-border">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-light hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Streams</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 p-6">
          {/* Main Stream Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="relative bg-charcoal rounded-xl overflow-hidden">
              {/* Mock Video Player */}
              <div className="aspect-video bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center relative">
                <div className="text-center">
                  <Play className="w-16 h-16 text-white/80 mx-auto mb-4" />
                  <p className="text-white/80">Live Stream Player</p>
                  <p className="text-sm text-white/60">@{stream.streamer}</p>
                </div>

                {/* Live Badge */}
                <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>LIVE</span>
                </div>

                {/* Player Controls */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="text-white hover:text-accent transition-colors"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white hover:text-accent transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </button>
                  </div>
                  <div className="flex items-center space-x-4 text-white text-sm">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{stream.viewers.toLocaleString()}</span>
                    </div>
                    <button className="hover:text-accent transition-colors">
                      <Maximize className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stream Info */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-light text-white mb-2">{stream.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-light">
                    <span>@{stream.streamer}</span>
                    <span>•</span>
                    <span>{stream.category}</span>
                    <span>•</span>
                    <span>Live for {stream.duration}</span>
                  </div>
                </div>
                {stream.tokenPrice && (
                  <div className="text-right">
                    <div className="text-accent text-lg font-medium">
                      ${stream.tokenSymbol} ${stream.tokenPrice.toFixed(6)}
                    </div>
                    <div className="text-sm text-light">Current Price</div>
                  </div>
                )}
              </div>

              {/* Stream Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-dark-gray rounded-lg">
                <div className="text-center">
                  <div className="text-xl font-medium text-white">{stream.viewers.toLocaleString()}</div>
                  <div className="text-sm text-light">Viewers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-medium text-accent">{formatVolume(stream.totalVolume)}</div>
                  <div className="text-sm text-light">Total Volume</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-medium text-white">{getTimeRemaining(stream.endTime)}</div>
                  <div className="text-sm text-light">Time Left</div>
                </div>
              </div>
            </div>

            {/* Recent Predictions */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Recent Predictions</span>
              </h3>

              <div className="space-y-3">
                {[
                  { user: 'whale99', amount: '5.0 SOL', prediction: 'Yes', time: '2m ago' },
                  { user: 'trader123', amount: '1.5 SOL', prediction: 'No', time: '5m ago' },
                  { user: 'bonkfan', amount: '0.8 SOL', prediction: 'Yes', time: '7m ago' },
                  { user: 'skeptic', amount: '2.1 SOL', prediction: 'No', time: '12m ago' }
                ].map((prediction, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-accent font-medium">{prediction.user}</span>
                      <span className="text-light ml-2">{prediction.time}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">{prediction.amount}</div>
                      <div className={`text-xs ${prediction.prediction === 'Yes' ? 'text-green-400' : 'text-red-400'}`}>
                        {prediction.prediction}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Live Predictions */}
            <div className="card p-6">
              <h2 className="text-xl font-light text-white mb-6 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-accent" />
                <span>Make Your Prediction</span>
              </h2>

              {/* Prediction Options */}
              <div className="space-y-4 mb-6">
                {stream.predictions.map((prediction) => (
                  <div key={prediction.id} className="relative">
                    <button
                      onClick={() => setSelectedPrediction(prediction.id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all ${
                        selectedPrediction === prediction.id
                          ? 'border-accent bg-accent/10'
                          : 'border-border bg-dark-gray hover:border-accent/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{prediction.outcome}</span>
                        <div className="flex items-center space-x-3">
                          <span className="text-accent font-bold">{prediction.odds}x</span>
                          <span className="text-sm text-light">{formatVolume(prediction.volume)}</span>
                        </div>
                      </div>

                      {/* Volume Bar */}
                      <div className="w-full bg-black rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${prediction.color} transition-all duration-300`}
                          style={{ width: `${prediction.percentage}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-xs text-light mt-1">
                        <span>{prediction.percentage}% of volume</span>
                        {prediction.myBet > 0 && <span>Your prediction: {prediction.myBet} SOL</span>}
                      </div>
                    </button>
                  </div>
                ))}
              </div>

              {/* Prediction Amount Input */}
              {selectedPrediction && (
                <div className="space-y-4 p-4 bg-dark-gray rounded-lg">
                  <div>
                    <label className="block text-sm text-light mb-2">Prediction Amount (SOL)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={predictionAmount}
                      onChange={(e) => setPredictionAmount(e.target.value)}
                      placeholder="0.01"
                      className="w-full input px-4 py-3 text-lg"
                    />
                  </div>

                  {predictionAmount && (
                    <div className="text-sm text-light">
                      Potential return: <span className="text-accent font-medium">
                        {(parseFloat(predictionAmount) * stream.predictions.find(p => p.id === selectedPrediction)!.odds).toFixed(3)} SOL
                      </span>
                    </div>
                  )}

                  <button
                    onClick={handlePlacePrediction}
                    disabled={!isConnected || !predictionAmount}
                    className={`w-full px-6 py-3 rounded-lg font-medium transition-all ${
                      isConnected && predictionAmount
                        ? 'bg-accent text-black hover:bg-accent/80'
                        : 'bg-medium-gray text-light cursor-not-allowed'
                    }`}
                  >
                    {!isConnected ? 'Connect Wallet to Predict' : 'Place Prediction'}
                  </button>
                </div>
              )}

              {/* Warning */}
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-200">
                  <strong>Risk Warning:</strong> Prediction markets involve risk of loss. Only predict what you can afford to lose.
                </div>
              </div>
            </div>

            {/* Live Chat */}
            <div className="card h-96 flex flex-col">
              <div className="p-4 border-b border-border">
                <h3 className="text-lg font-medium text-white flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Live Chat</span>
                  <span className="text-sm text-light">({stream.viewers})</span>
                </h3>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="text-sm">
                    <span className={`font-medium ${msg.user === 'You' ? 'text-white' : 'text-accent'}`}>
                      {msg.user}
                    </span>
                    <span className="text-light text-xs ml-2">{msg.timestamp}</span>
                    <div className="text-white">{msg.message}</div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              {isConnected && (
                <div className="p-4 border-t border-border">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 input px-3 py-2 text-sm"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatMessage.trim()}
                      className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center space-x-1 ${
                        chatMessage.trim()
                          ? 'bg-accent text-black hover:bg-accent/80'
                          : 'bg-medium-gray text-light cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}