export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
  market_cap: number;
  total_volume: number;
  description?: {
    en: string;
  };
  sparkline_in_7d?: {
    price: number[];
  };
}

export type Currency = 'USD' | 'EUR' | 'INR';

export interface PriceAlert {
  id: string;
  coinId: string;
  targetPrice: number;
  isAbove: boolean;
  createdAt: Date;
}

export interface Theme {
  isDark: boolean;
  toggleTheme: () => void;
}