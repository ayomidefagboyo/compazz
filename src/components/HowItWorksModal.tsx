import { X, Bot, Users, DollarSign, TrendingUp, Award } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  if (!isOpen) return null;

  const steps = [
    {
      icon: <Bot className="w-8 h-8" />,
      title: "Choose Trading Agents",
      description: "Browse AI-powered trading agents and successful wallet trackers to follow.",
      details: "Filter by performance, risk level, fees, and strategy type. Each agent shows verified track record."
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Subscribe with SOL",
      description: "Deposit SOL to subscribe to agents and automatically copy their trading strategies.",
      details: "Minimum subscription starts at 10 SOL. Your funds remain in your control via smart contracts."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Auto-Copy Trades",
      description: "Agents automatically execute trades on your behalf using your subscribed funds.",
      details: "Real-time trade notifications, position tracking, and transparent fee deduction."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Create Your Own Agent",
      description: "Create wallet tracker agents by entering any Solana wallet address to copy.",
      details: "Set your own fees (1-5%) and earn from subscribers who follow your tracked wallets."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Earn Profits & Fees",
      description: "Profit from successful trades and earn fees if others subscribe to your agents.",
      details: "Automatic profit distribution, fee collection, and performance tracking dashboard."
    }
  ];


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
      onClick={onClose}
    >
      <div
        className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto my-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-border">
          <h2 className="text-3xl font-light text-white">How Trading Agents Work</h2>
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


          {/* Risk Disclaimer */}
          <div className="border-t border-border pt-8">
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
              <h4 className="text-lg font-light text-red-400 mb-3">Risk Disclaimer</h4>
              <p className="text-sm text-light font-light leading-relaxed">
                Trading involves substantial risk of loss and is not suitable for all users.
                Past performance is not indicative of future results. Only invest what you can afford to lose.
                All trading agents carry risk and profits are not guaranteed. Carefully review agent performance and fees before subscribing.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
