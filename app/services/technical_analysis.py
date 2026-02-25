import pandas as pd
import numpy as np
from typing import Dict, Optional
import talib

class TechnicalAnalysisService:
    """Service for calculating technical indicators and analysis"""
    
    def calculate_indicators(self, hist_data: pd.DataFrame) -> Dict:
        """Calculate basic technical indicators"""
        
        if hist_data.empty or len(hist_data) < 20:
            return {}
        
        close_prices = hist_data['Close'].values
        high_prices = hist_data['High'].values
        low_prices = hist_data['Low'].values
        volume = hist_data['Volume'].values
        
        try:
            # RSI
            rsi = self._calculate_rsi(close_prices)
            
            # MACD
            macd_line, macd_signal, macd_histogram = self._calculate_macd(close_prices)
            
            # Bollinger Bands
            upper_band, middle_band, lower_band = self._calculate_bollinger_bands(close_prices)
            
            # Moving Averages
            sma_20 = self._calculate_sma(close_prices, 20)
            sma_50 = self._calculate_sma(close_prices, 50)
            
            # Volatility
            volatility = self._calculate_volatility(close_prices)
            
            # Sharpe Ratio (simplified)
            returns = np.diff(close_prices) / close_prices[:-1]
            sharpe_ratio = np.mean(returns) / np.std(returns) * np.sqrt(252) if np.std(returns) != 0 else 0
            
            # Generate recommendation
            recommendation = self._generate_recommendation(rsi[-1] if len(rsi) > 0 else 50, 
                                                         close_prices[-1], 
                                                         sma_20[-1] if len(sma_20) > 0 else close_prices[-1])
            
            return {
                'rsi': rsi[-1] if len(rsi) > 0 else None,
                'macd': macd_line[-1] if len(macd_line) > 0 else None,
                'bollinger_upper': upper_band[-1] if len(upper_band) > 0 else None,
                'bollinger_lower': lower_band[-1] if len(lower_band) > 0 else None,
                'sma_20': sma_20[-1] if len(sma_20) > 0 else None,
                'sma_50': sma_50[-1] if len(sma_50) > 0 else None,
                'volatility': volatility,
                'sharpe_ratio': sharpe_ratio,
                'recommendation': recommendation,
                'trend': self._determine_trend(close_prices, sma_20, sma_50)
            }
        except Exception as e:
            print(f"Error calculating indicators: {e}")
            return {}
    
    def calculate_comprehensive_analysis(self, hist_data: pd.DataFrame) -> Dict:
        """Calculate comprehensive technical analysis"""
        
        basic_indicators = self.calculate_indicators(hist_data)
        
        # Additional indicators for comprehensive analysis
        close_prices = hist_data['Close'].values
        volume = hist_data['Volume'].values
        
        try:
            # Volume indicators
            volume_sma = self._calculate_sma(volume, 20)
            volume_ratio = volume[-1] / volume_sma[-1] if len(volume_sma) > 0 and volume_sma[-1] != 0 else 1
            
            # Support and Resistance levels
            support_resistance = self._find_support_resistance(close_prices)
            
            # Momentum indicators
            momentum = self._calculate_momentum(close_prices, 14)
            
            basic_indicators.update({
                'volume_ratio': volume_ratio,
                'support_levels': support_resistance['support'],
                'resistance_levels': support_resistance['resistance'],
                'momentum': momentum[-1] if len(momentum) > 0 else None,
                'strength': self._calculate_trend_strength(close_prices)
            })
            
            return basic_indicators
            
        except Exception as e:
            print(f"Error in comprehensive analysis: {e}")
            return basic_indicators
    
    def generate_predictions(self, hist_data: pd.DataFrame) -> Dict:
        """Generate ML-based price predictions (simplified simulation)"""
        
        if hist_data.empty:
            return {}
        
        close_prices = hist_data['Close'].values
        current_price = close_prices[-1]
        
        # Simulate ML predictions with some realistic variance
        volatility = np.std(np.diff(close_prices) / close_prices[:-1]) * np.sqrt(252)
        
        # Simple trend-following prediction model
        recent_trend = (close_prices[-1] - close_prices[-5]) / close_prices[-5] if len(close_prices) >= 5 else 0
        
        pred_1d = current_price * (1 + recent_trend * 0.1 + np.random.normal(0, volatility/252))
        pred_7d = current_price * (1 + recent_trend * 0.3 + np.random.normal(0, volatility/52))
        pred_30d = current_price * (1 + recent_trend * 0.8 + np.random.normal(0, volatility/12))
        
        return {
            '1d': round(pred_1d, 2),
            '7d': round(pred_7d, 2),
            '30d': round(pred_30d, 2)
        }
    
    def calculate_risk_metrics(self, hist_data: pd.DataFrame) -> Dict:
        """Calculate risk metrics for the stock"""
        
        if hist_data.empty or len(hist_data) < 30:
            return {}
        
        close_prices = hist_data['Close'].values
        returns = np.diff(close_prices) / close_prices[:-1]
        
        try:
            # Value at Risk (VaR)
            var_95 = np.percentile(returns, 5)
            var_99 = np.percentile(returns, 1)
            
            # Maximum Drawdown
            max_drawdown = self._calculate_max_drawdown(close_prices)
            
            # Volatility (annualized)
            volatility = np.std(returns) * np.sqrt(252)
            
            # Skewness and Kurtosis
            skewness = self._calculate_skewness(returns)
            kurtosis = self._calculate_kurtosis(returns)
            
            return {
                'volatility_annual': volatility,
                'var_95': var_95,
                'var_99': var_99,
                'max_drawdown': max_drawdown,
                'skewness': skewness,
                'kurtosis': kurtosis,
                'risk_score': self._calculate_risk_score(volatility, max_drawdown, var_95)
            }
            
        except Exception as e:
            print(f"Error calculating risk metrics: {e}")
            return {}
    
    # Helper methods
    def _calculate_rsi(self, prices: np.ndarray, period: int = 14) -> np.ndarray:
        """Calculate RSI indicator"""
        deltas = np.diff(prices)
        seed = deltas[:period+1]
        up = seed[seed >= 0].sum() / period
        down = -seed[seed < 0].sum() / period
        rs = up / down if down != 0 else 0
        rsi = np.zeros_like(prices)
        rsi[:period] = 100. - 100. / (1. + rs)
        
        for i in range(period, len(prices)):
            delta = deltas[i-1]
            if delta > 0:
                upval = delta
                downval = 0.
            else:
                upval = 0.
                downval = -delta
                
            up = (up * (period - 1) + upval) / period
            down = (down * (period - 1) + downval) / period
            rs = up / down if down != 0 else 0
            rsi[i] = 100. - 100. / (1. + rs)
            
        return rsi
    
    def _calculate_macd(self, prices: np.ndarray) -> tuple:
        """Calculate MACD indicator"""
        exp1 = self._ema(prices, 12)
        exp2 = self._ema(prices, 26)
        macd_line = exp1 - exp2
        signal_line = self._ema(macd_line, 9)
        histogram = macd_line - signal_line
        return macd_line, signal_line, histogram
    
    def _ema(self, prices: np.ndarray, period: int) -> np.ndarray:
        """Calculate Exponential Moving Average"""
        ema = np.zeros_like(prices)
        ema[0] = prices[0]
        alpha = 2 / (period + 1)
        for i in range(1, len(prices)):
            ema[i] = alpha * prices[i] + (1 - alpha) * ema[i-1]
        return ema
    
    def _calculate_sma(self, prices: np.ndarray, period: int) -> np.ndarray:
        """Calculate Simple Moving Average"""
        return np.convolve(prices, np.ones(period)/period, mode='valid')
    
    def _calculate_bollinger_bands(self, prices: np.ndarray, period: int = 20) -> tuple:
        """Calculate Bollinger Bands"""
        sma = self._calculate_sma(prices, period)
        std = np.array([np.std(prices[i:i+period]) for i in range(len(prices)-period+1)])
        upper_band = sma + (std * 2)
        lower_band = sma - (std * 2)
        return upper_band, sma, lower_band
    
    def _calculate_volatility(self, prices: np.ndarray) -> float:
        """Calculate price volatility"""
        returns = np.diff(prices) / prices[:-1]
        return np.std(returns) * np.sqrt(252)
    
    def _generate_recommendation(self, rsi: float, current_price: float, sma_20: float) -> str:
        """Generate buy/sell/hold recommendation"""
        if rsi < 30 and current_price > sma_20:
            return "BUY"
        elif rsi > 70 and current_price < sma_20:
            return "SELL"
        else:
            return "HOLD"
    
    def _determine_trend(self, prices: np.ndarray, sma_20: np.ndarray, sma_50: np.ndarray) -> str:
        """Determine price trend"""
        if len(sma_20) == 0 or len(sma_50) == 0:
            return "neutral"
        
        current_price = prices[-1]
        if current_price > sma_20[-1] > sma_50[-1]:
            return "bullish"
        elif current_price < sma_20[-1] < sma_50[-1]:
            return "bearish"
        else:
            return "neutral"
    
    def _find_support_resistance(self, prices: np.ndarray) -> Dict:
        """Find support and resistance levels"""
        # Simplified support/resistance calculation
        recent_prices = prices[-50:] if len(prices) >= 50 else prices
        support = np.min(recent_prices)
        resistance = np.max(recent_prices)
        
        return {
            'support': [support * 0.95, support],
            'resistance': [resistance, resistance * 1.05]
        }
    
    def _calculate_momentum(self, prices: np.ndarray, period: int) -> np.ndarray:
        """Calculate momentum indicator"""
        if len(prices) < period:
            return np.array([])
        return prices[period:] - prices[:-period]
    
    def _calculate_trend_strength(self, prices: np.ndarray) -> str:
        """Calculate trend strength"""
        if len(prices) < 20:
            return "weak"
        
        recent_change = (prices[-1] - prices[-20]) / prices[-20]
        if abs(recent_change) > 0.1:
            return "strong"
        elif abs(recent_change) > 0.05:
            return "moderate"
        else:
            return "weak"
    
    def _calculate_max_drawdown(self, prices: np.ndarray) -> float:
        """Calculate maximum drawdown"""
        peak = np.maximum.accumulate(prices)
        drawdown = (prices - peak) / peak
        return np.min(drawdown)
    
    def _calculate_skewness(self, returns: np.ndarray) -> float:
        """Calculate skewness of returns"""
        mean_return = np.mean(returns)
        std_return = np.std(returns)
        if std_return == 0:
            return 0
        return np.mean(((returns - mean_return) / std_return) ** 3)
    
    def _calculate_kurtosis(self, returns: np.ndarray) -> float:
        """Calculate kurtosis of returns"""
        mean_return = np.mean(returns)
        std_return = np.std(returns)
        if std_return == 0:
            return 0
        return np.mean(((returns - mean_return) / std_return) ** 4) - 3
    
    def _calculate_risk_score(self, volatility: float, max_drawdown: float, var_95: float) -> float:
        """Calculate overall risk score (0-100, higher = riskier)"""
        vol_score = min(volatility * 100, 50)
        dd_score = min(abs(max_drawdown) * 100, 30) 
        var_score = min(abs(var_95) * 100, 20)
        return vol_score + dd_score + var_score