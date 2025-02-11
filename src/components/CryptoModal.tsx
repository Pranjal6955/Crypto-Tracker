import React from 'react';
import { X } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { CryptoData } from '../types/crypto';
import { formatCurrency } from '../utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CryptoModalProps {
  crypto: CryptoData;
  currency: string;
  onClose: () => void;
  chartData: {
    labels: string[];
    prices: number[];
  };
  isDark: boolean;
}

export const CryptoModal: React.FC<CryptoModalProps> = ({ 
  crypto, 
  currency, 
  onClose, 
  chartData,
  isDark 
}) => {
  const isPositive = crypto.price_change_percentage_24h >= 0;
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: `${crypto.name} Price`,
        data: chartData.prices,
        borderColor: isPositive ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)',
        backgroundColor: isPositive 
          ? 'rgba(16, 185, 129, 0.1)' 
          : 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            return formatCurrency(context.raw, currency);
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: isDark ? '#9CA3AF' : '#4B5563'
        }
      },
      y: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: isDark ? '#9CA3AF' : '#4B5563',
          callback: function(value: any) {
            return formatCurrency(value, currency);
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`${
        isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      } rounded-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <img src={crypto.image} alt={crypto.name} className="w-16 h-16" />
            <div>
              <h2 className="text-3xl font-bold">{crypto.name}</h2>
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-lg`}>
                {crypto.symbol.toUpperCase()}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className={`p-2 rounded-full transition-colors ${
              isDark 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="text-4xl font-bold mb-2">
              {formatCurrency(crypto.current_price, currency)}
            </div>
            <div className={`text-xl ${isPositive ? 'text-green-500' : 'text-red-500'} font-medium`}>
              {crypto.price_change_percentage_24h.toFixed(2)}% (24h)
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Market Cap</span>
              <div className="font-semibold text-lg">
                {formatCurrency(crypto.market_cap, currency)}
              </div>
            </div>
            <div>
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>24h Volume</span>
              <div className="font-semibold text-lg">
                {formatCurrency(crypto.total_volume, currency)}
              </div>
            </div>
          </div>
        </div>

        <div className="h-[400px] mb-8">
          <Line data={data} options={options} />
        </div>

        {crypto.description?.en && (
          <div>
            <h3 className="text-xl font-bold mb-4">About {crypto.name}</h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              {crypto.description.en.split('. ').slice(0, 3).join('. ') + '.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};