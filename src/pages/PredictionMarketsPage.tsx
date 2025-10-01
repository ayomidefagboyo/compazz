import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { TrendingUp, Play, Users, DollarSign, Zap, Eye, MessageCircle, ExternalLink, Clock } from 'lucide-react';

// Mock data for pump.fun live streams with predictions
const mockLiveStreams = [
  {
    id: '1',
    streamer: 'CryptoKing',
    title: 'Will $BONK hit $0.001 during this stream?',
    tokenSymbol: 'BONK',
    tokenPrice: 0.0000123,
    viewers: 1247,
    duration: '2h 45m',
    thumbnail: 'https://via.placeholder.com/400x225/00ff88/000000?text=BONK+STREAM',
    category: 'Meme Coins',
    predictions: [
      { outcome: 'Yes - Hits $0.001', odds: 3.2, volume: 2450 },
      { outcome: 'No - Stays Below', odds: 1.4, volume: 5670 }
    ],
    totalVolume: 8120,
    endTime: Date.now() + 2 * 60 * 60 * 1000, // 2 hours from now
    isLive: true
  },
  {
    id: '2',
    streamer: 'PumpMaster',
    title: 'New token launch - Will it 10x in first hour?',
    tokenSymbol: 'NEW',
    tokenPrice: 0.00001,
    viewers: 892,
    duration: '1h 12m',
    thumbnail: 'https://via.placeholder.com/400x225/ff6b35/000000?text=NEW+TOKEN',
    category: 'Token Launch',
    predictions: [
      { outcome: 'Yes - 10x pump', odds: 8.5, volume: 1230 },
      { outcome: 'No - Under 5x', odds: 1.1, volume: 3890 }
    ],
    totalVolume: 5120,
    endTime: Date.now() + 1 * 60 * 60 * 1000, // 1 hour from now
    isLive: true
  },
  {
    id: '3',
    streamer: 'SolanaWizard',
    title: 'Trading live - Will I make $1000 profit today?',
    tokenSymbol: 'Multiple',
    tokenPrice: null,
    viewers: 634,
    duration: '45m',
    thumbnail: 'https://via.placeholder.com/400x225/9945ff/000000?text=TRADING+LIVE',
    category: 'Trading',
    predictions: [
      { outcome: 'Yes - $1000+ profit', odds: 2.8, volume: 890 },
      { outcome: 'No - Less than $1000', odds: 1.5, volume: 1560 }
    ],
    totalVolume: 2450,
    endTime: Date.now() + 8 * 60 * 60 * 1000, // 8 hours from now
    isLive: true
  }
];

export function PredictionMarketsPage() {
  const { isConnected } = useAuth();
  const [streams, setStreams] = useState(mockLiveStreams);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Streams', count: streams.length },
    { id: 'Meme Coins', name: 'Meme Coins', count: streams.filter(s => s.category === 'Meme Coins').length },
    { id: 'Token Launch', name: 'New Launches', count: streams.filter(s => s.category === 'Token Launch').length },
    { id: 'Trading', name: 'Live Trading', count: streams.filter(s => s.category === 'Trading').length },
  ];

  const filteredStreams = selectedCategory === 'all'
    ? streams
    : streams.filter(stream => stream.category === selectedCategory);

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

    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="w-full px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-accent" />
            </div>
            <h1 className="text-4xl font-light text-white tracking-tight">Live Stream Predictions</h1>
          </div>
          <p className="text-lg text-light font-light max-w-2xl mx-auto">
            Watch pump.fun streams and predict outcomes in real-time. From token launches to trading sessions,
            make predictions and win rewards based on live events.
          </p>
          <div className="mt-6 flex items-center justify-center space-x-8 text-sm text-light">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <span>{streams.filter(s => s.isLive).length} Live Now</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>{streams.reduce((sum, s) => sum + s.viewers, 0).toLocaleString()} Viewers</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>{formatVolume(streams.reduce((sum, s) => sum + s.totalVolume, 0))} Volume</span>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-accent text-black'
                    : 'bg-dark-gray text-light hover:bg-medium-gray hover:text-white'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Live Streams Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredStreams.map((stream) => (
            <div key={stream.id} className="card overflow-hidden group hover:scale-105 transition-transform duration-300">
              {/* Stream Thumbnail */}
              <div className="relative">
                <img
                  src={stream.thumbnail}
                  alt={stream.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                {/* Live Badge */}
                {stream.isLive && (
                  <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>LIVE</span>
                  </div>
                )}

                {/* View Stream Button */}
                <div className="absolute top-4 right-4">
                  <button className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>

                {/* Stream Info Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between text-white text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{stream.viewers.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{stream.duration}</span>
                      </div>
                    </div>
                    <span className="bg-accent text-black px-2 py-1 rounded text-xs font-medium">
                      {stream.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Stream Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-white">@{stream.streamer}</h3>
                    {stream.tokenPrice && (
                      <div className="text-accent text-sm font-medium">
                        ${stream.tokenSymbol} ${stream.tokenPrice.toFixed(6)}
                      </div>
                    )}
                  </div>
                  <p className="text-light font-light text-sm leading-relaxed">{stream.title}</p>
                </div>

                {/* Prediction Options */}
                <div className="mb-4">
                  <div className="text-sm text-light font-medium mb-3">Make Prediction</div>
                  <div className="space-y-2">
                    {stream.predictions.map((prediction, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-dark-gray rounded-lg hover:bg-medium-gray transition-colors">
                        <div>
                          <div className="text-white font-medium text-sm">{prediction.outcome}</div>
                          <div className="text-xs text-light">{formatVolume(prediction.volume)} volume</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-accent font-medium">{prediction.odds}x</div>
                          <button
                            disabled={!isConnected}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                              isConnected
                                ? 'bg-accent text-black hover:bg-accent/80'
                                : 'bg-medium-gray text-light cursor-not-allowed opacity-50'
                            }`}
                          >
                            {isConnected ? 'Predict' : 'Connect'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stream Stats */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-light">
                      Total Volume: <span className="text-white font-medium">{formatVolume(stream.totalVolume)}</span>
                    </div>
                    <div className="text-accent font-medium">
                      {getTimeRemaining(stream.endTime)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Stream CTA */}
        {isConnected && (
          <div className="mt-16 text-center">
            <div className="card p-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Play className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-light text-white">Start Your Stream</h3>
              </div>
              <p className="text-light font-light mb-6">
                Ready to stream on pump.fun? Create predictions for your audience and earn from the volume.
              </p>
              <button className="px-8 py-4 btn-primary text-lg font-medium rounded-xl">
                Connect to pump.fun
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredStreams.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-dark-gray rounded-full flex items-center justify-center mx-auto mb-6">
              <Play className="w-8 h-8 text-light" />
            </div>
            <h3 className="text-xl font-light text-white mb-2">No live streams found</h3>
            <p className="text-light font-light">Check back later or try a different category.</p>
          </div>
        )}
      </div>
    </div>
  );
}