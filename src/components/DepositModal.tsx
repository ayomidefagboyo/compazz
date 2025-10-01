import { useState } from 'react';
import { X, Loader, Coins } from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: number) => Promise<void>;
  poolName: string;
  minDeposit: number;
}

export function DepositModal({
  isOpen,
  onClose,
  onDeposit,
  poolName,
  minDeposit,
}: DepositModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);

    if (isNaN(depositAmount) || depositAmount < minDeposit) {
      setError(`Minimum deposit is ${minDeposit} SOL`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onDeposit(depositAmount);
      setAmount('');
      onClose();
    } catch (err) {
      setError('Deposit failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
      <div className="card max-w-lg w-full">
        <div className="flex items-center justify-between px-8 py-6 border-b border-border">
          <h2 className="text-2xl font-light text-white">Deposit to Pool</h2>
          <button
            onClick={onClose}
            className="text-light hover:text-white transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div>
            <p className="text-lg text-light mb-6 font-light">
              Depositing to <span className="text-white font-light">{poolName}</span>
            </p>

            <div className="mb-6">
              <label className="block text-sm font-light text-light mb-4">
                Amount (SOL)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Min. ${minDeposit} SOL`}
                  className="w-full px-6 py-4 input text-lg font-light"
                  step="0.1"
                  min={minDeposit}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Coins className="w-6 h-6 text-light" />
                </div>
              </div>
            </div>

            <div className="bg-accent/5 border border-accent/20 rounded-xl p-6">
              <p className="text-sm text-light font-light leading-relaxed">
                Your deposit will be added to the trading pool and you'll receive voting power
                based on your contribution.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
              <p className="text-sm text-red-400 font-light">{error}</p>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 px-8 py-4 btn-secondary text-lg font-light rounded-xl"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleDeposit}
              className="flex-1 px-8 py-4 btn-primary text-lg font-light rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Deposit</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
