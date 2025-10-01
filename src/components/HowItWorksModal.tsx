import { X, Users, TrendingUp, Coins, Vote, Award, Share2 } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  if (!isOpen) return null;

  const steps = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Join a Pool",
      description: "Connect your wallet and join exclusive trading pools with other sophisticated traders.",
      details: "Choose from curated pools based on your risk tolerance and trading preferences."
    },
    {
      icon: <Coins className="w-8 h-8" />,
      title: "Deposit SOL",
      description: "Deposit SOL into your chosen pool to start earning from AI-driven trades.",
      details: "Your deposit determines your voting power and share of the pool's profits."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "AI Trading",
      description: "Our advanced AI algorithms execute trades on your behalf using the pool's funds.",
      details: "24/7 automated trading with sophisticated risk management and market analysis."
    },
    {
      icon: <Vote className="w-8 h-8" />,
      title: "Govern & Vote",
      description: "Participate in pool governance by voting on trading strategies and proposals.",
      details: "Your voting power is proportional to your deposit amount in the pool."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Earn Rewards",
      description: "Earn your share of profits and unlock achievements as you grow your portfolio.",
      details: "Track your performance on the leaderboard and compete with other traders."
    }
  ];

  const referralBenefits = [
    "Earn 5% of your referrals' trading fees",
    "Get exclusive access to premium pools",
    "Unlock special achievement badges",
    "Priority support and early feature access"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
      <div className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-8 py-6 border-b border-border">
          <h2 className="text-3xl font-light text-white">How Compazz Works</h2>
          <button
            onClick={onClose}
            className="text-light hover:text-white transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-12">
          {/* Main Steps */}
          <div>
            <h3 className="text-2xl font-light text-white mb-8">Getting Started</h3>
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start space-x-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center text-accent">
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h4 className="text-xl font-light text-white">{step.title}</h4>
                      <span className="px-3 py-1 bg-accent/10 text-accent text-sm font-light rounded-full border border-accent/20">
                        Step {index + 1}
                      </span>
                    </div>
                    <p className="text-lg text-light font-light mb-2">{step.description}</p>
                    <p className="text-sm text-medium font-light">{step.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Referral System */}
          <div className="border-t border-border pt-8">
            <div className="flex items-center space-x-3 mb-6">
              <Share2 className="w-6 h-6 text-accent" />
              <h3 className="text-2xl font-light text-white">Referral Program</h3>
            </div>
            <p className="text-lg text-light font-light mb-6">
              Invite friends and earn rewards when they join Compazz and start trading.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-dark-gray rounded-xl p-6">
                <h4 className="text-lg font-light text-white mb-4">Your Benefits</h4>
                <ul className="space-y-3">
                  {referralBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-center space-x-3 text-light font-light">
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-dark-gray rounded-xl p-6">
                <h4 className="text-lg font-light text-white mb-4">Referral Code</h4>
                <div className="bg-charcoal border border-border rounded-lg p-4 mb-4">
                  <code className="text-accent font-mono text-lg">COMPAZZ2024</code>
                </div>
                <button className="w-full px-4 py-3 btn-primary text-lg font-light rounded-xl">
                  Copy Referral Link
                </button>
              </div>
            </div>
          </div>

          {/* Risk Disclaimer */}
          <div className="border-t border-border pt-8">
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
              <h4 className="text-lg font-light text-red-400 mb-3">Risk Disclaimer</h4>
              <p className="text-sm text-light font-light leading-relaxed">
                Trading involves substantial risk of loss and is not suitable for all investors. 
                Past performance is not indicative of future results. Only invest what you can afford to lose.
                Compazz uses AI-driven trading strategies, but all trading involves risk of loss.
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 border-t border-border">
          <button
            onClick={onClose}
            className="w-full px-8 py-4 btn-primary text-lg font-light rounded-xl"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
