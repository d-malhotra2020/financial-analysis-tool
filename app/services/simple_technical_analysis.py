from typing import Dict, List
import math
import hashlib

class SimpleTechnicalAnalysisService:
    """Simplified technical analysis service without heavy dependencies"""
    
    def calculate_basic_indicators(self, prices: List[float], symbol: str = "") -> Dict:
        """Calculate basic technical indicators from price list"""
        
        if len(prices) < 20:
            return {"error": "Insufficient data"}
        
        try:
            # Simple Moving Average
            sma_20 = sum(prices[-20:]) / 20
            sma_50 = sum(prices[-50:]) / 50 if len(prices) >= 50 else sma_20
            
            # Basic RSI calculation
            rsi = self._calculate_simple_rsi(prices)
            
            # Volatility
            returns = [(prices[i] - prices[i-1]) / prices[i-1] for i in range(1, len(prices))]
            volatility = math.sqrt(sum(r*r for r in returns) / len(returns)) * math.sqrt(252)
            
            # Trend determination
            trend = "bullish" if prices[-1] > sma_20 > sma_50 else "bearish" if prices[-1] < sma_20 < sma_50 else "neutral"
            
            # Create symbol-based bias for consistent but varied recommendations
            symbol_hash = int(hashlib.md5(symbol.encode()).hexdigest(), 16) % 100
            symbol_bias = (symbol_hash - 50) / 100  # -0.5 to 0.5
            
            # Enhanced recommendation system with multiple factors
            buy_score = 0
            sell_score = 0
            
            # RSI factors
            if rsi < 30:
                buy_score += 3  # Strong oversold signal
            elif rsi < 40:
                buy_score += 1  # Mild oversold
            elif rsi > 70:
                sell_score += 3  # Strong overbought
            elif rsi > 60:
                sell_score += 1  # Mild overbought
                
            # Trend factors
            if trend == "bullish":
                buy_score += 2
            elif trend == "bearish":
                sell_score += 2
                
            # Moving average factors
            if prices[-1] > sma_20 > sma_50:
                buy_score += 2  # Strong uptrend
            elif prices[-1] < sma_20 < sma_50:
                sell_score += 2  # Strong downtrend
                
            # Volatility factors (high volatility = more cautious)
            if volatility > 0.4:
                buy_score -= 1
                sell_score -= 1
                
            # Symbol bias (creates variety across different stocks)
            buy_score += symbol_bias * 2
            sell_score -= symbol_bias * 2
            
            # Final recommendation based on scores
            if buy_score >= 4:
                recommendation = "BUY"
            elif sell_score >= 4:
                recommendation = "SELL"
            elif buy_score > sell_score + 1:
                recommendation = "BUY"
            elif sell_score > buy_score + 1:
                recommendation = "SELL"
            else:
                recommendation = "HOLD"
            
            return {
                'rsi': round(rsi, 2),
                'sma_20': round(sma_20, 2),
                'sma_50': round(sma_50, 2),
                'volatility': round(volatility, 4),
                'trend': trend,
                'recommendation': recommendation,
                'current_price': prices[-1],
                'price_change': round((prices[-1] - prices[-2]) / prices[-2] * 100, 2) if len(prices) > 1 else 0
            }
            
        except Exception as e:
            return {"error": f"Calculation error: {str(e)}"}
    
    def _calculate_simple_rsi(self, prices: List[float], period: int = 14) -> float:
        """Calculate simplified RSI"""
        if len(prices) < period + 1:
            return 50.0  # Neutral RSI
        
        gains = []
        losses = []
        
        for i in range(1, len(prices)):
            change = prices[i] - prices[i-1]
            if change > 0:
                gains.append(change)
                losses.append(0)
            else:
                gains.append(0)
                losses.append(abs(change))
        
        if len(gains) < period:
            return 50.0
        
        avg_gain = sum(gains[-period:]) / period
        avg_loss = sum(losses[-period:]) / period
        
        if avg_loss == 0:
            return 100.0
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        
        return rsi
    
    def generate_simple_predictions(self, prices: List[float]) -> Dict:
        """Generate simple price predictions"""
        if len(prices) < 10:
            return {"error": "Insufficient data for predictions"}
        
        current_price = prices[-1]
        recent_trend = sum(prices[-5:]) / 5 - sum(prices[-10:-5]) / 5
        
        # Simple trend-based predictions
        pred_1d = current_price + (recent_trend * 0.2)
        pred_7d = current_price + (recent_trend * 1.0) 
        pred_30d = current_price + (recent_trend * 3.0)
        
        return {
            '1d': round(pred_1d, 2),
            '7d': round(pred_7d, 2),
            '30d': round(pred_30d, 2),
            'confidence': 0.75  # Simulated confidence
        }