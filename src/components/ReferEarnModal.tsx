import { useState } from 'react';
import { X, Gift, Users, DollarSign, Copy, Check, Share2, Twitter, MessageCircle } from 'lucide-react';

interface ReferEarnModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReferEarnModal({ isOpen, onClose }: ReferEarnModalProps) {
  const [copied, setCopied] = useState(false);

  // Mock referral data
  const referralCode = 'COMPAZZ2024';
  const referralLink = `https://compazz.io/ref/${referralCode}`;
  const earnings = {
    totalEarned: 156.78,
    referrals: 23,
    weeklyEarnings: 45.20,
    pendingRewards: 12.50
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link');
    }
  };

  const handleShare = (platform: string) => {
    const text = `🤖 Join me on Compazz - AI trading agents that copy successful traders automatically! Subscribe to top performers and earn passive income! ${referralLink}`;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      default:
        handleCopyLink();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-charcoal border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center">
              <Gift className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-light text-white">Refer & Earn</h2>
              <p className="text-sm text-light">Earn 20% of your referrals' agent subscription fees</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-light hover:text-white transition-colors p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Earnings Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-dark-gray p-4 rounded-xl">
              <div className="text-2xl font-light text-accent">${earnings.totalEarned}</div>
              <div className="text-sm text-light">Total Earned</div>
            </div>
            <div className="bg-dark-gray p-4 rounded-xl">
              <div className="text-2xl font-light text-white">{earnings.referrals}</div>
              <div className="text-sm text-light">Referrals</div>
            </div>
            <div className="bg-dark-gray p-4 rounded-xl">
              <div className="text-2xl font-light text-accent">${earnings.weeklyEarnings}</div>
              <div className="text-sm text-light">This Week</div>
            </div>
            <div className="bg-dark-gray p-4 rounded-xl">
              <div className="text-2xl font-light text-white">${earnings.pendingRewards}</div>
              <div className="text-sm text-light">Pending</div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-dark-gray p-6 rounded-xl">
            <h3 className="text-lg font-light text-white mb-4">How It Works</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-accent font-medium">1</span>
                </div>
                <div>
                  <div className="text-white font-medium">Share Your Link</div>
                  <div className="text-sm text-light">Invite friends to join Compazz using your unique referral link</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-accent font-medium">2</span>
                </div>
                <div>
                  <div className="text-white font-medium">They Subscribe to Agents</div>
                  <div className="text-sm text-light">When your friends subscribe to trading agents, you earn from their fees</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-accent font-medium">3</span>
                </div>
                <div>
                  <div className="text-white font-medium">Earn 20% Forever</div>
                  <div className="text-sm text-light">Get 20% of all their agent subscription fees as long as they keep using Compazz</div>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Link */}
          <div className="bg-dark-gray p-6 rounded-xl">
            <h3 className="text-lg font-light text-white mb-4">Your Referral Link</h3>
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-1 bg-black border border-border rounded-lg px-4 py-3">
                <div className="text-sm text-light font-mono break-all">{referralLink}</div>
              </div>
              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-2 px-4 py-3 bg-accent text-black rounded-lg hover:bg-accent/80 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="font-medium">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Share Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Twitter className="w-4 h-4" />
                <span>Share on Twitter</span>
              </button>
              <button
                onClick={() => handleShare('telegram')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Share on Telegram</span>
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="flex items-center space-x-2 px-4 py-2 bg-medium-gray text-white rounded-lg hover:bg-light-gray transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>More Options</span>
              </button>
            </div>
          </div>


          {/* Terms */}
          <div className="text-xs text-light leading-relaxed">
            <p>
              Referral rewards are paid out weekly in SOL. Minimum payout is $10.
              Rewards are calculated based on 20% of agent subscription fees from your referrals.
              Self-referrals and fraudulent activity will result in account suspension.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}