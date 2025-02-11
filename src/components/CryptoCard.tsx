import React from 'react';
import { TrendingUp, TrendingDown, Bell, Bookmark } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { CryptoData } from '../types/crypto';
import { formatCurrency } from '../utils/formatters';
import { PriceAlert } from './PriceAlert';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
);

interface CryptoCardProps {
  crypto: CryptoData;
  currency: string;
  onClick: () => void;
  isDark: boolean;
  onSetAlert: (alert: any) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

export const CryptoCard: React.FC<CryptoCardProps> = ({ 
  crypto, 
  currency, 
  onClick, 
  isDark,
  onSetAlert,
  isBookmarked,
  onToggleBookmark
}) => {
  const isPositive = crypto.price_change_percentage_24h >= 0;
  const sparklineData = crypto.sparkline_in_7d?.price || [];
  const labels = Array.from({ length: sparklineData.length }, (_, i) => '');

  const chartData = {
    labels,
    datasets: [
      {
        data: sparklineData,
        borderColor: isPositive ? '#10B981' : '#EF4444',
        borderWidth: 1.5,
        tension: 0.4,
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click when clicking on alert or bookmark buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onClick();
  };

  return (
    <div
      onClick={handleCardClick}
      className={`${
        isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
      } rounded-xl shadow-lg p-6 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src={crypto.image} alt={crypto.name} className="w-10 h-10" />
          <div>
            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {crypto.name}
            </h3>
            <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
              {crypto.symbol.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PriceAlert
            coinId={crypto.id}
            coinName={crypto.name}
            currentPrice={crypto.current_price}
            currency={currency}
            onSetAlert={onSetAlert}
            isDark={isDark}
          />
          <button
            onClick={onToggleBookmark}
            className={`p-2 rounded-full transition-colors ${
              isDark 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
            } ${isBookmarked ? 'text-blue-500 hover:text-blue-600' : ''}`}
            title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
          >
            <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className={`text-right ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
        <div className="font-bold text-lg">
          {formatCurrency(crypto.current_price, currency)}
        </div>
        <div className={`flex items-center gap-1 justify-end ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span className="text-sm font-medium">
            {crypto.price_change_percentage_24h.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="h-16">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};