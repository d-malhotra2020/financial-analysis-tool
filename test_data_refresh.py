#!/usr/bin/env python3
"""
Comprehensive test script for Financial Analysis Tool API data refresh mechanism.
Tests multiple endpoints over 10-15 minutes to verify 5-minute refresh intervals.
"""

import requests
import time
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class APIRefreshTester:
    def __init__(self, base_url: str = "https://financial-analysis-tool-production.up.railway.app"):
        self.base_url = base_url.rstrip('/')
        self.test_stocks = ["JPM", "KO", "JNJ"]
        self.test_results = []
        self.sp500_results = []
        self.chart_results = []
        
    def log_test_result(self, test_type: str, endpoint: str, timestamp: str, 
                       data_timestamp: Optional[str], key_data: Dict, 
                       response_time: float, status_code: int):
        """Log a test result for analysis"""
        result = {
            "test_type": test_type,
            "endpoint": endpoint,
            "request_timestamp": timestamp,
            "data_timestamp": data_timestamp,
            "key_data": key_data,
            "response_time_ms": response_time,
            "status_code": status_code
        }
        
        if test_type == "stock":
            self.test_results.append(result)
        elif test_type == "sp500":
            self.sp500_results.append(result)
        elif test_type == "chart":
            self.chart_results.append(result)
            
    def test_stock_endpoint(self, symbol: str) -> Dict:
        """Test a single stock endpoint and extract key data"""
        start_time = time.time()
        endpoint = f"{self.base_url}/api/v1/stocks/{symbol}"
        
        try:
            response = requests.get(endpoint, timeout=10)
            response_time = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                data = response.json()
                
                # Extract key data for comparison
                latest_price = data.get('latest_price', {})
                key_data = {
                    "symbol": symbol,
                    "current_price": latest_price.get('close_price'),
                    "open_price": latest_price.get('open_price'),
                    "volume": latest_price.get('volume'),
                    "updated_at": data.get('updated_at')
                }
                
                data_timestamp = latest_price.get('timestamp')
                if isinstance(data_timestamp, str):
                    try:
                        data_timestamp = datetime.fromisoformat(data_timestamp.replace('Z', '+00:00')).isoformat()
                    except:
                        pass
                        
                self.log_test_result(
                    "stock", endpoint, datetime.now().isoformat(), 
                    data_timestamp, key_data, response_time, response.status_code
                )
                
                return {"success": True, "data": key_data, "response_time": response_time}
            else:
                logger.error(f"Stock {symbol} - HTTP {response.status_code}: {response.text[:200]}")
                return {"success": False, "status_code": response.status_code, "error": response.text[:200]}
                
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            logger.error(f"Stock {symbol} - Error: {str(e)}")
            return {"success": False, "error": str(e), "response_time": response_time}
    
    def test_sp500_endpoint(self) -> Dict:
        """Test S&P 500 market overview endpoint"""
        start_time = time.time()
        endpoint = f"{self.base_url}/api/v1/sp500/"
        
        try:
            response = requests.get(endpoint, timeout=10)
            response_time = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                data = response.json()
                
                key_data = {
                    "last_update": data.get('last_update'),
                    "total_companies": data.get('market_summary', {}).get('total_companies'),
                    "advancing_stocks": data.get('market_summary', {}).get('advancing_stocks'),
                    "declining_stocks": data.get('market_summary', {}).get('declining_stocks'),
                    "avg_change_percent": data.get('market_summary', {}).get('average_change_percent')
                }
                
                self.log_test_result(
                    "sp500", endpoint, datetime.now().isoformat(),
                    data.get('last_update'), key_data, response_time, response.status_code
                )
                
                return {"success": True, "data": key_data, "response_time": response_time}
            else:
                logger.error(f"S&P 500 - HTTP {response.status_code}: {response.text[:200]}")
                return {"success": False, "status_code": response.status_code, "error": response.text[:200]}
                
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            logger.error(f"S&P 500 - Error: {str(e)}")
            return {"success": False, "error": str(e), "response_time": response_time}
    
    def test_chart_endpoint(self, symbol: str, period: str = "1mo") -> Dict:
        """Test chart data endpoint"""
        start_time = time.time()
        endpoint = f"{self.base_url}/api/v1/stocks/{symbol}/chart?period={period}"
        
        try:
            response = requests.get(endpoint, timeout=15)
            response_time = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                data = response.json()
                chart_data = data.get('data', [])
                
                key_data = {
                    "symbol": symbol,
                    "period": period,
                    "data_points": len(chart_data),
                    "first_timestamp": chart_data[0].get('timestamp') if chart_data else None,
                    "last_timestamp": chart_data[-1].get('timestamp') if chart_data else None,
                    "last_close": chart_data[-1].get('close') if chart_data else None
                }
                
                self.log_test_result(
                    "chart", endpoint, datetime.now().isoformat(),
                    key_data.get('last_timestamp'), key_data, response_time, response.status_code
                )
                
                return {"success": True, "data": key_data, "response_time": response_time}
            else:
                logger.error(f"Chart {symbol}/{period} - HTTP {response.status_code}: {response.text[:200]}")
                return {"success": False, "status_code": response.status_code, "error": response.text[:200]}
                
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            logger.error(f"Chart {symbol}/{period} - Error: {str(e)}")
            return {"success": False, "error": str(e), "response_time": response_time}
    
    def run_single_test_cycle(self, cycle_num: int):
        """Run a single test cycle for all endpoints"""
        logger.info(f"\n{'='*60}")
        logger.info(f"TEST CYCLE {cycle_num} - {datetime.now().strftime('%H:%M:%S')}")
        logger.info(f"{'='*60}")
        
        # Test individual stock endpoints
        for stock in self.test_stocks:
            logger.info(f"Testing stock: {stock}")
            result = self.test_stock_endpoint(stock)
            if result["success"]:
                price = result["data"].get("current_price", "N/A")
                volume = result["data"].get("volume", "N/A")
                logger.info(f"  {stock}: Price=${price}, Volume={volume:,} ({result['response_time']:.0f}ms)")
            else:
                logger.error(f"  {stock}: FAILED - {result.get('error', 'Unknown error')}")
        
        # Test S&P 500 overview
        logger.info("Testing S&P 500 overview")
        sp500_result = self.test_sp500_endpoint()
        if sp500_result["success"]:
            data = sp500_result["data"]
            logger.info(f"  S&P 500: {data.get('total_companies')} companies, "
                       f"Avg change: {data.get('avg_change_percent', 0):.2f}% "
                       f"({sp500_result['response_time']:.0f}ms)")
        else:
            logger.error(f"  S&P 500: FAILED - {sp500_result.get('error', 'Unknown error')}")
        
        # Test chart endpoints for different periods
        chart_periods = ["1d", "1w", "1mo"]
        for stock in self.test_stocks:
            for period in chart_periods:
                logger.info(f"Testing chart: {stock}/{period}")
                chart_result = self.test_chart_endpoint(stock, period)
                if chart_result["success"]:
                    data = chart_result["data"]
                    logger.info(f"  {stock}/{period}: {data.get('data_points')} points "
                                f"({chart_result['response_time']:.0f}ms)")
                else:
                    logger.error(f"  {stock}/{period}: FAILED - {chart_result.get('error', 'Unknown error')}")
    
    def analyze_refresh_patterns(self):
        """Analyze test results for refresh patterns"""
        logger.info(f"\n{'='*60}")
        logger.info("REFRESH PATTERN ANALYSIS")
        logger.info(f"{'='*60}")
        
        # Analyze stock endpoint refresh patterns
        if self.test_results:
            logger.info(f"\nStock Endpoints Analysis ({len(self.test_results)} total requests):")
            
            # Group by stock symbol
            by_stock = {}
            for result in self.test_results:
                symbol = result["key_data"]["symbol"]
                if symbol not in by_stock:
                    by_stock[symbol] = []
                by_stock[symbol].append(result)
            
            for symbol, results in by_stock.items():
                logger.info(f"\n  {symbol} ({len(results)} requests):")
                
                prices = []
                timestamps = []
                for i, result in enumerate(results):
                    price = result["key_data"].get("current_price")
                    timestamp = result["request_timestamp"]
                    if price is not None:
                        prices.append(price)
                        timestamps.append(timestamp)
                    logger.info(f"    Cycle {i+1}: ${price} at {timestamp[:19]}")
                
                # Check for price changes
                if len(set(prices)) > 1:
                    logger.info(f"    ✅ Price updates detected: {len(set(prices))} unique prices")
                else:
                    logger.info(f"    ⚠️  No price changes detected (all prices: ${prices[0] if prices else 'N/A'})")
        
        # Analyze S&P 500 refresh patterns
        if self.sp500_results:
            logger.info(f"\nS&P 500 Overview Analysis ({len(self.sp500_results)} requests):")
            
            last_updates = []
            for i, result in enumerate(self.sp500_results):
                last_update = result["key_data"].get("last_update")
                last_updates.append(last_update)
                avg_change = result["key_data"].get("avg_change_percent", 0)
                logger.info(f"  Cycle {i+1}: Last update {last_update}, Avg change: {avg_change:.2f}%")
            
            unique_updates = len(set(last_updates))
            if unique_updates > 1:
                logger.info(f"    ✅ Data updates detected: {unique_updates} unique update timestamps")
            else:
                logger.info(f"    ⚠️  No update timestamp changes detected")
        
        # Time interval analysis
        logger.info(f"\nTime Interval Analysis:")
        test_duration = 0
        if self.test_results:
            first_test = datetime.fromisoformat(self.test_results[0]["request_timestamp"])
            last_test = datetime.fromisoformat(self.test_results[-1]["request_timestamp"])
            test_duration = (last_test - first_test).total_seconds() / 60
            logger.info(f"  Total test duration: {test_duration:.1f} minutes")
            logger.info(f"  Expected 5-minute updates: {int(test_duration / 5)} times")
    
    def generate_summary_report(self):
        """Generate comprehensive summary report"""
        logger.info(f"\n{'='*60}")
        logger.info("COMPREHENSIVE TEST SUMMARY")
        logger.info(f"{'='*60}")
        
        # Overall statistics
        total_requests = len(self.test_results) + len(self.sp500_results) + len(self.chart_results)
        successful_requests = sum(1 for r in self.test_results + self.sp500_results + self.chart_results 
                                 if r["status_code"] == 200)
        
        logger.info(f"Total API requests: {total_requests}")
        logger.info(f"Successful requests: {successful_requests} ({successful_requests/total_requests*100:.1f}%)")
        
        # Response time analysis
        all_times = []
        for result in self.test_results + self.sp500_results + self.chart_results:
            if result["response_time_ms"] is not None:
                all_times.append(result["response_time_ms"])
        
        if all_times:
            avg_response = sum(all_times) / len(all_times)
            max_response = max(all_times)
            min_response = min(all_times)
            logger.info(f"Response times - Avg: {avg_response:.0f}ms, Min: {min_response:.0f}ms, Max: {max_response:.0f}ms")
        
        # Data freshness assessment
        logger.info(f"\nData Freshness Assessment:")
        
        # Check if we have evidence of 5-minute refresh mechanism
        refresh_evidence = []
        
        # Stock price variations
        stock_price_changes = 0
        for stock in self.test_stocks:
            stock_results = [r for r in self.test_results if r["key_data"]["symbol"] == stock]
            prices = [r["key_data"].get("current_price") for r in stock_results if r["key_data"].get("current_price")]
            if len(set(prices)) > 1:
                stock_price_changes += 1
        
        if stock_price_changes > 0:
            refresh_evidence.append(f"Price changes detected in {stock_price_changes}/{len(self.test_stocks)} stocks")
        
        # S&P 500 timestamp changes
        sp500_timestamps = [r["key_data"].get("last_update") for r in self.sp500_results]
        unique_sp500_timestamps = len(set(sp500_timestamps))
        if unique_sp500_timestamps > 1:
            refresh_evidence.append(f"S&P 500 update timestamps changed {unique_sp500_timestamps} times")
        
        if refresh_evidence:
            logger.info("  ✅ Refresh mechanism evidence found:")
            for evidence in refresh_evidence:
                logger.info(f"    - {evidence}")
        else:
            logger.info("  ⚠️  Limited evidence of active data refresh")
        
        logger.info(f"\nTest completed successfully at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        return {
            "total_requests": total_requests,
            "successful_requests": successful_requests,
            "success_rate": successful_requests/total_requests*100 if total_requests > 0 else 0,
            "avg_response_time": avg_response if all_times else 0,
            "refresh_evidence": refresh_evidence,
            "stock_price_changes": stock_price_changes,
            "sp500_timestamp_changes": unique_sp500_timestamps
        }
    
    def run_comprehensive_test(self, duration_minutes: int = 15, interval_seconds: int = 90):
        """Run comprehensive test over specified duration"""
        logger.info(f"🚀 Starting comprehensive API refresh test")
        logger.info(f"Duration: {duration_minutes} minutes")
        logger.info(f"Test interval: {interval_seconds} seconds")
        logger.info(f"Testing endpoints:")
        logger.info(f"  - Stock endpoints: {', '.join(self.test_stocks)}")
        logger.info(f"  - S&P 500 overview: /api/v1/sp500/")
        logger.info(f"  - Chart data: Multiple periods")
        
        start_time = time.time()
        end_time = start_time + (duration_minutes * 60)
        cycle = 1
        
        while time.time() < end_time:
            self.run_single_test_cycle(cycle)
            
            cycle += 1
            remaining_time = end_time - time.time()
            
            if remaining_time > interval_seconds:
                logger.info(f"\n⏱️  Waiting {interval_seconds} seconds until next test cycle...")
                logger.info(f"   Remaining test time: {remaining_time/60:.1f} minutes")
                time.sleep(interval_seconds)
            else:
                break
        
        # Final analysis
        self.analyze_refresh_patterns()
        return self.generate_summary_report()

def main():
    """Main test function"""
    # Test both local and deployed versions
    base_urls = [
        "https://financial-analysis-tool-production.up.railway.app",
        "http://localhost:8000"  # Fallback to local if deployed version fails
    ]
    
    for base_url in base_urls:
        logger.info(f"\n🔍 Testing API at: {base_url}")
        
        # Quick health check
        try:
            response = requests.get(f"{base_url}/health", timeout=5)
            if response.status_code == 200:
                logger.info(f"✅ Health check passed for {base_url}")
                
                # Run comprehensive test
                tester = APIRefreshTester(base_url)
                summary = tester.run_comprehensive_test(duration_minutes=15, interval_seconds=90)
                
                # Save results to file
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                results_file = f"api_refresh_test_results_{timestamp}.json"
                
                with open(results_file, 'w') as f:
                    json.dump({
                        "test_summary": summary,
                        "stock_results": tester.test_results,
                        "sp500_results": tester.sp500_results,
                        "chart_results": tester.chart_results,
                        "test_config": {
                            "base_url": base_url,
                            "test_stocks": tester.test_stocks,
                            "duration_minutes": 15,
                            "interval_seconds": 90
                        }
                    }, f, indent=2, default=str)
                
                logger.info(f"📊 Detailed results saved to: {results_file}")
                return  # Success, exit after first working endpoint
                
        except Exception as e:
            logger.error(f"❌ Failed to connect to {base_url}: {str(e)}")
            continue
    
    logger.error("❌ No working API endpoints found")

if __name__ == "__main__":
    main()