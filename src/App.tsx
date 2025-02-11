import React, { useState, useEffect } from 'react';
import { Search, Moon, Sun, BookmarkIcon } from 'lucide-react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CryptoCard } from './components/CryptoCard';
import { CryptoModal } from './components/CryptoModal';
import { CryptoData, Currency, PriceAlert as PriceAlertType } from './types/crypto';
import { formatCurrency } from './utils/formatters';

const queryClient = new QueryClient();

function CryptoTracker() {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [alerts, setAlerts] = useState<PriceAlertType[]>(() => {
    const saved = localStorage.getItem('priceAlerts');
    return saved ? JSON.parse(saved) : [];
  });
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('bookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('priceAlerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const { data: cryptos = [], isLoading } = useQuery({
    queryKey: ['cryptos', currency],
    queryFn: async () => {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency.toLowerCase()}&order=market_cap_desc&per_page=20&sparkline=true&price_change_percentage=24h`
      );
      return response.data;
    },
    refetchInterval: 30000
  });

  const { data: selectedCryptoDetails } = useQuery({
    queryKey: ['crypto', selectedCrypto?.id],
    queryFn: async () => {
      if (!selectedCrypto) return null;
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${selectedCrypto.id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`
      );
      return response.data;
    },
    enabled: !!selectedCrypto,
    refetchOnWindowFocus: true // Refetch when switching coins
  });

  const { data: chartData = { labels: [], prices: [] } } = useQuery({
    queryKey: ['chart', selectedCrypto?.id],
    queryFn: async () => {
      if (!selectedCrypto) return { labels: [], prices: [] };
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${selectedCrypto.id}/market_chart?vs_currency=${currency.toLowerCase()}&days=7`
      );
      const labels = response.data.prices.map((price: [number, number]) => 
        new Date(price[0]).toLocaleDateString()
      );
      const prices = response.data.prices.map((price: [number, number]) => price[1]);
      return { labels, prices };
    },
    enabled: !!selectedCrypto,
    refetchOnWindowFocus: true // Refetch when switching coins
  });

  const handleSetAlert = (alert: Omit<PriceAlertType, 'id' | 'createdAt'>) => {
    const newAlert = {
      ...alert,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    setAlerts([...alerts, newAlert]);
  };

  const handleToggleBookmark = (coinId: string) => {
    setBookmarks(prev => 
      prev.includes(coinId)
        ? prev.filter(id => id !== coinId)
        : [...prev, coinId]
    );
  };

  const filteredCryptos = cryptos.filter((crypto: CryptoData) => {
    const matchesSearch = crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    return showBookmarked ? matchesSearch && bookmarks.includes(crypto.id) : matchesSearch;
  });

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className={`${
          isDark ? 'bg-gray-800' : 'bg-white'
        } rounded-xl shadow-lg p-4 md:p-6 mb-8`}>
          <div className="flex flex-col gap-4 md:gap-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <h1 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Crypto Price Tracker
                </h1>
                <button
                  onClick={() => setIsDark(!isDark)}
                  className={`p-2 rounded-lg ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  } transition-colors`}
                >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} size={20} />
                  <input
                    type="text"
                    placeholder="Search cryptocurrencies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full md:w-64 pl-10 pr-4 py-2 rounded-lg ${
                      isDark 
                        ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600' 
                        : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300'
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className={`px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-white text-gray-900 border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="INR">INR</option>
                </select>
                <button
                  onClick={() => setShowBookmarked(!showBookmarked)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    showBookmarked
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } transition-colors`}
                >
                  <BookmarkIcon size={20} />
                  <span className="hidden md:inline">
                    {showBookmarked ? 'Show All' : 'Bookmarked'}
                  </span>
                </button>
              </div>
            </div>

            {alerts.length > 0 && (
              <div className="space-y-2 p-4 rounded-lg bg-opacity-50 bg-blue-500/10">
                <h2 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Active Price Alerts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {alerts.map((alert) => {
                    const crypto = cryptos.find((c: CryptoData) => c.id === alert.coinId);
                    return crypto && (
                      <div key={alert.id} className={`flex items-center justify-between p-3 rounded-lg ${
                        isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                      }`}>
                        <div className="flex items-center gap-2">
                          <img src={crypto.image} alt={crypto.name} className="w-6 h-6" />
                          <span>{crypto.name}</span>
                        </div>
                        <span className={alert.isAbove ? 'text-green-500' : 'text-red-500'}>
                          {alert.isAbove ? '↑' : '↓'} {formatCurrency(alert.targetPrice, currency)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading cryptocurrencies...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6">
              {filteredCryptos.map((crypto: CryptoData) => (
                <CryptoCard
                  key={crypto.id}
                  crypto={crypto}
                  currency={currency}
                  onClick={() => setSelectedCrypto(crypto)}
                  isDark={isDark}
                  onSetAlert={handleSetAlert}
                  isBookmarked={bookmarks.includes(crypto.id)}
                  onToggleBookmark={() => handleToggleBookmark(crypto.id)}
                />
              ))}
            </div>
          )}

          {selectedCrypto && selectedCryptoDetails && chartData.prices.length > 0 && (
            <CryptoModal
              crypto={selectedCrypto}
              // details={selectedCryptoDetails}
              chartData={chartData}
              currency={currency}
              onClose={() => setSelectedCrypto(null)}
              isDark={isDark}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CryptoTracker />
    </QueryClientProvider>
  );
}
