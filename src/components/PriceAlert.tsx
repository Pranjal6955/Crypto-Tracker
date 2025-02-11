import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { PriceAlert as PriceAlertType } from '../types/crypto';
import { formatCurrency } from '../utils/formatters';

interface PriceAlertProps {
  coinId: string;
  coinName: string;
  currentPrice: number;
  currency: string;
  onSetAlert: (alert: Omit<PriceAlertType, 'id' | 'createdAt'>) => void;
  isDark: boolean;
}

export const PriceAlert: React.FC<PriceAlertProps> = ({ 
  coinId, 
  coinName,
  currentPrice, 
  currency,
  onSetAlert,
  isDark
}) => {
  const [showForm, setShowForm] = useState(false);
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [isAbove, setIsAbove] = useState<boolean>(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPrice) return;

    onSetAlert({
      coinId,
      targetPrice: parseFloat(targetPrice),
      isAbove
    });
    setTargetPrice('');
    setShowForm(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowForm(!showForm)}
        className={`p-2 rounded-full transition-colors ${
          isDark 
            ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
        }`}
        title="Set price alert"
      >
        <Bell size={20} />
      </button>

      {showForm && (
        <div className={`absolute right-0 top-full mt-2 p-4 rounded-lg shadow-lg z-10 w-72 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Set Alert for {coinName}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className={`p-1 rounded-full ${
                isDark 
                  ? 'hover:bg-gray-700 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X size={16} />
            </button>
          </div>
          <div className={`mb-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Current price: {formatCurrency(currentPrice, currency)}
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <select
                value={isAbove ? 'above' : 'below'}
                onChange={(e) => setIsAbove(e.target.value === 'above')}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-white text-gray-900 border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="above">Price goes above</option>
                <option value="below">Price goes below</option>
              </select>
            </div>
            <div>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder={`Target price in ${currency}`}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                    : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                step="0.000001"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Set Alert
            </button>
          </form>
        </div>
      )}
    </div>
  );
};