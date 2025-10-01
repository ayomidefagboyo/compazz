import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Trade {
  id: string;
  trade_type: 'long' | 'short';
  asset: string;
  entry_price: number;
  exit_price: number | null;
  amount: number;
  leverage: number;
  pnl: number | null;
  status: 'open' | 'closed' | 'liquidated';
  opened_at: string;
  closed_at: string | null;
}

interface TradesListProps {
  poolId: string;
}

export function TradesList({ poolId }: TradesListProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrades();
  }, [poolId]);

  const fetchTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('pool_id', poolId)
        .order('opened_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTrades(data || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-5 h-5 text-accent" />;
      case 'closed':
        return <CheckCircle className="w-5 h-5 text-accent" />;
      case 'liquidated':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
    }
  };

  if (loading) {
    return (
      <div className="card p-12 text-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-light text-lg font-light">Loading trades...</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-8 py-6 border-b border-border">
        <h2 className="text-2xl font-light text-white">Recent Trades</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-gray">
            <tr>
              <th className="px-8 py-6 text-left text-sm font-light text-light uppercase tracking-wider">
                Status
              </th>
              <th className="px-8 py-6 text-left text-sm font-light text-light uppercase tracking-wider">
                Type
              </th>
              <th className="px-8 py-6 text-left text-sm font-light text-light uppercase tracking-wider">
                Asset
              </th>
              <th className="px-8 py-6 text-right text-sm font-light text-light uppercase tracking-wider">
                Entry
              </th>
              <th className="px-8 py-6 text-right text-sm font-light text-light uppercase tracking-wider">
                Exit
              </th>
              <th className="px-8 py-6 text-right text-sm font-light text-light uppercase tracking-wider">
                Size
              </th>
              <th className="px-8 py-6 text-right text-sm font-light text-light uppercase tracking-wider">
                Leverage
              </th>
              <th className="px-8 py-6 text-right text-sm font-light text-light uppercase tracking-wider">
                P&L
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {trades.map((trade) => (
              <tr key={trade.id} className="hover:bg-dark-gray/50 transition-colors">
                <td className="px-8 py-6 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(trade.status)}
                    <span className="text-sm text-light capitalize font-light">{trade.status}</span>
                  </div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    {trade.trade_type === 'long' ? (
                      <TrendingUp className="w-5 h-5 text-accent" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                    <span
                      className={`text-lg font-light ${
                        trade.trade_type === 'long' ? 'text-accent' : 'text-red-400'
                      }`}
                    >
                      {trade.trade_type.toUpperCase()}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <span className="text-lg font-light text-white">{trade.asset}</span>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-right">
                  <span className="text-lg text-white font-light">${trade.entry_price.toFixed(2)}</span>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-right">
                  <span className="text-lg text-white font-light">
                    {trade.exit_price ? `$${trade.exit_price.toFixed(2)}` : '-'}
                  </span>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-right">
                  <span className="text-lg text-white font-light">{trade.amount.toFixed(4)} SOL</span>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-right">
                  <span className="text-lg font-light text-white">{trade.leverage}x</span>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-right">
                  {trade.pnl !== null ? (
                    <span
                      className={`text-lg font-light ${
                        trade.pnl >= 0 ? 'text-accent' : 'text-red-400'
                      }`}
                    >
                      {trade.pnl >= 0 ? '+' : ''}
                      {trade.pnl.toFixed(4)} SOL
                    </span>
                  ) : (
                    <span className="text-lg text-medium font-light">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {trades.length === 0 && (
        <div className="px-8 py-16 text-center">
          <p className="text-light text-lg font-light">No trades yet</p>
        </div>
      )}
    </div>
  );
}
