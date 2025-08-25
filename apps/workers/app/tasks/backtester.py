from celery import shared_task
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
import logging
from datetime import datetime, timedelta
import json

# Created automatically by Cursor AI (2024-01-XX)

logger = logging.getLogger(__name__)

@shared_task(bind=True, name='backtester.run_backtest')
def run_backtest(self, strategy_config: Dict, universe_id: str, backtest_params: Dict) -> Dict:
    """
    Run a complete backtest for a strategy
    
    Args:
        strategy_config: Strategy configuration with signals and weights
        universe_id: Target universe ID
        backtest_params: Backtest parameters (start_date, end_date, rebalance_freq, etc.)
    """
    try:
        # Load historical data
        data = load_historical_data(universe_id, backtest_params)
        
        # Initialize backtest engine
        engine = BacktestEngine(data, backtest_params)
        
        # Run backtest
        results = engine.run_backtest(strategy_config)
        
        # Calculate performance metrics
        performance = calculate_performance_metrics(results)
        
        # Generate trade list
        trades = generate_trade_list(results)
        
        return {
            'status': 'success',
            'results': results,
            'performance': performance,
            'trades': trades
        }
        
    except Exception as e:
        logger.error(f"Error running backtest: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

def load_historical_data(universe_id: str, params: Dict) -> pd.DataFrame:
    """Load historical price data for universe"""
    # Simulated data loading
    # In production, this would query the database
    
    np.random.seed(42)  # For reproducible results
    n_symbols = 100
    start_date = pd.to_datetime(params.get('start_date', '2020-01-01'))
    end_date = pd.to_datetime(params.get('end_date', '2023-12-31'))
    
    symbols = [f'SYMBOL_{i:03d}' for i in range(n_symbols)]
    dates = pd.date_range(start_date, end_date, freq='D')
    
    # Generate synthetic price data
    data = []
    for symbol in symbols:
        # Generate price series with some trend and volatility
        returns = np.random.normal(0.0005, 0.02, len(dates))  # Daily returns
        prices = 100 * np.exp(np.cumsum(returns))
        
        for i, date in enumerate(dates):
            data.append({
                'symbol': symbol,
                'date': date,
                'close': prices[i],
                'volume': np.random.lognormal(10, 1),
                'market_cap': np.random.lognormal(20, 1)
            })
    
    return pd.DataFrame(data)

class BacktestEngine:
    def __init__(self, data: pd.DataFrame, params: Dict):
        self.data = data
        self.params = params
        self.rebalance_freq = params.get('rebalance_freq', 'M')  # M=monthly, W=weekly, D=daily
        self.transaction_costs = params.get('transaction_costs', 0.001)  # 10bps
        self.borrow_costs = params.get('borrow_costs', 0.02)  # 2% annual
        self.max_leverage = params.get('max_leverage', 1.0)
        
    def run_backtest(self, strategy_config: Dict) -> Dict:
        """Run the backtest"""
        # Get rebalance dates
        rebalance_dates = self._get_rebalance_dates()
        
        # Initialize portfolio
        portfolio = Portfolio(self.params.get('initial_capital', 1000000))
        
        # Store results
        equity_curve = []
        positions_history = []
        trades_history = []
        
        for i, date in enumerate(rebalance_dates):
            # Get current prices
            current_prices = self._get_prices_at_date(date)
            
            # Calculate target weights
            target_weights = self._calculate_target_weights(strategy_config, date)
            
            # Rebalance portfolio
            trades = portfolio.rebalance(target_weights, current_prices, self.transaction_costs)
            
            # Update portfolio value
            portfolio.update_value(current_prices)
            
            # Store results
            equity_curve.append({
                'date': date,
                'value': portfolio.total_value,
                'cash': portfolio.cash,
                'gross_exposure': portfolio.gross_exposure,
                'net_exposure': portfolio.net_exposure
            })
            
            positions_history.append({
                'date': date,
                'positions': portfolio.positions.copy()
            })
            
            trades_history.extend(trades)
            
            # Apply borrowing costs
            if portfolio.net_exposure > 0:
                portfolio.apply_borrowing_costs(self.borrow_costs, date)
        
        return {
            'equity_curve': equity_curve,
            'positions_history': positions_history,
            'trades_history': trades_history,
            'final_portfolio': portfolio
        }
    
    def _get_rebalance_dates(self) -> List[datetime]:
        """Get list of rebalance dates"""
        start_date = self.data['date'].min()
        end_date = self.data['date'].max()
        
        if self.rebalance_freq == 'D':
            return pd.date_range(start_date, end_date, freq='D').tolist()
        elif self.rebalance_freq == 'W':
            return pd.date_range(start_date, end_date, freq='W').tolist()
        elif self.rebalance_freq == 'M':
            return pd.date_range(start_date, end_date, freq='M').tolist()
        else:
            raise ValueError(f"Unsupported rebalance frequency: {self.rebalance_freq}")
    
    def _get_prices_at_date(self, date: datetime) -> Dict[str, float]:
        """Get prices for all symbols at a given date"""
        date_data = self.data[self.data['date'] == date]
        return dict(zip(date_data['symbol'], date_data['close']))
    
    def _calculate_target_weights(self, strategy_config: Dict, date: datetime) -> Dict[str, float]:
        """Calculate target weights based on strategy configuration"""
        # In a real implementation, this would use the factor engine
        # For now, we'll simulate some weights
        
        symbols = self.data['symbol'].unique()
        n_symbols = len(symbols)
        
        # Generate random weights (in practice, these would come from signals)
        weights = np.random.dirichlet(np.ones(n_symbols))
        
        # Apply constraints
        weights = self._apply_constraints(weights, strategy_config.get('constraints', {}))
        
        return dict(zip(symbols, weights))
    
    def _apply_constraints(self, weights: np.ndarray, constraints: Dict) -> np.ndarray:
        """Apply portfolio constraints"""
        # Max position size
        max_position = constraints.get('max_position', 0.05)
        weights = np.clip(weights, 0, max_position)
        
        # Normalize weights
        weights = weights / weights.sum()
        
        return weights

class Portfolio:
    def __init__(self, initial_capital: float):
        self.initial_capital = initial_capital
        self.cash = initial_capital
        self.positions = {}  # symbol -> shares
        self.total_value = initial_capital
        
    def rebalance(self, target_weights: Dict[str, float], prices: Dict[str, float], transaction_costs: float) -> List[Dict]:
        """Rebalance portfolio to target weights"""
        trades = []
        
        # Calculate current portfolio value
        current_value = self.cash
        for symbol, shares in self.positions.items():
            if symbol in prices:
                current_value += shares * prices[symbol]
        
        # Calculate target positions
        target_positions = {}
        for symbol, weight in target_weights.items():
            if symbol in prices:
                target_value = current_value * weight
                target_shares = target_value / prices[symbol]
                target_positions[symbol] = target_shares
        
        # Calculate trades needed
        for symbol in set(list(self.positions.keys()) + list(target_positions.keys())):
            current_shares = self.positions.get(symbol, 0)
            target_shares = target_positions.get(symbol, 0)
            
            if abs(target_shares - current_shares) > 1e-6:  # Avoid tiny trades
                trade_shares = target_shares - current_shares
                trade_value = trade_shares * prices.get(symbol, 0)
                
                # Apply transaction costs
                if trade_value > 0:
                    cost = abs(trade_value) * transaction_costs
                    self.cash -= cost
                
                # Update positions
                if target_shares == 0:
                    self.positions.pop(symbol, None)
                else:
                    self.positions[symbol] = target_shares
                
                # Update cash
                self.cash -= trade_value
                
                trades.append({
                    'symbol': symbol,
                    'shares': trade_shares,
                    'price': prices.get(symbol, 0),
                    'value': trade_value,
                    'cost': abs(trade_value) * transaction_costs
                })
        
        return trades
    
    def update_value(self, prices: Dict[str, float]):
        """Update portfolio value based on current prices"""
        self.total_value = self.cash
        for symbol, shares in self.positions.items():
            if symbol in prices:
                self.total_value += shares * prices[symbol]
    
    @property
    def gross_exposure(self) -> float:
        """Calculate gross exposure"""
        return sum(abs(shares) for shares in self.positions.values())
    
    @property
    def net_exposure(self) -> float:
        """Calculate net exposure"""
        return sum(shares for shares in self.positions.values())
    
    def apply_borrowing_costs(self, borrow_rate: float, date: datetime):
        """Apply borrowing costs for leveraged positions"""
        if self.net_exposure > 0:
            # Calculate daily borrowing cost
            daily_rate = borrow_rate / 252
            cost = self.net_exposure * daily_rate
            self.cash -= cost

def calculate_performance_metrics(results: Dict) -> Dict:
    """Calculate performance metrics from backtest results"""
    equity_curve = pd.DataFrame(results['equity_curve'])
    
    # Calculate returns
    equity_curve['returns'] = equity_curve['value'].pct_change()
    
    # Basic metrics
    total_return = (equity_curve['value'].iloc[-1] / equity_curve['value'].iloc[0]) - 1
    annualized_return = (1 + total_return) ** (252 / len(equity_curve)) - 1
    volatility = equity_curve['returns'].std() * np.sqrt(252)
    sharpe_ratio = annualized_return / volatility if volatility > 0 else 0
    
    # Maximum drawdown
    cumulative = (1 + equity_curve['returns']).cumprod()
    running_max = cumulative.expanding().max()
    drawdown = (cumulative - running_max) / running_max
    max_drawdown = drawdown.min()
    
    # Win rate
    positive_returns = equity_curve['returns'] > 0
    win_rate = positive_returns.mean()
    
    # Turnover
    trades = results['trades_history']
    total_turnover = sum(abs(trade['value']) for trade in trades)
    avg_turnover = total_turnover / len(equity_curve) if len(equity_curve) > 0 else 0
    
    return {
        'total_return': float(total_return),
        'annualized_return': float(annualized_return),
        'volatility': float(volatility),
        'sharpe_ratio': float(sharpe_ratio),
        'max_drawdown': float(max_drawdown),
        'win_rate': float(win_rate),
        'total_turnover': float(total_turnover),
        'avg_turnover': float(avg_turnover),
        'final_value': float(equity_curve['value'].iloc[-1]),
        'num_trades': len(trades)
    }

def generate_trade_list(results: Dict) -> List[Dict]:
    """Generate formatted trade list"""
    trades = []
    for trade in results['trades_history']:
        trades.append({
            'date': trade.get('date', ''),
            'symbol': trade['symbol'],
            'action': 'BUY' if trade['shares'] > 0 else 'SELL',
            'shares': abs(trade['shares']),
            'price': trade['price'],
            'value': abs(trade['value']),
            'cost': trade['cost']
        })
    return trades

@shared_task(bind=True, name='backtester.compare_strategies')
def compare_strategies(self, strategies: List[Dict], universe_id: str, backtest_params: Dict) -> Dict:
    """Compare multiple strategies"""
    try:
        results = {}
        
        for strategy in strategies:
            strategy_name = strategy['name']
            strategy_config = strategy['config']
            
            # Run backtest for this strategy
            backtest_result = run_backtest(strategy_config, universe_id, backtest_params)
            
            results[strategy_name] = {
                'performance': backtest_result['performance'],
                'equity_curve': backtest_result['results']['equity_curve']
            }
        
        return {
            'status': 'success',
            'comparison': results
        }
        
    except Exception as e:
        logger.error(f"Error comparing strategies: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise
