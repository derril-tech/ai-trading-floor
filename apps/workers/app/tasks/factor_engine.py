from celery import shared_task
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
import logging
from scipy import stats
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

# Created automatically by Cursor AI (2024-01-XX)

logger = logging.getLogger(__name__)

@shared_task(bind=True, name='factor_engine.compute_signals')
def compute_signals(self, universe_id: str, recipe: Dict, data_params: Dict) -> Dict:
    """
    Compute factor signals based on recipe
    
    Args:
        universe_id: Target universe ID
        recipe: Signal recipe with factors and parameters
        data_params: Data loading parameters
    """
    try:
        # Load data (simulated)
        data = load_market_data(universe_id, data_params)
        
        # Compute individual factors
        factor_signals = {}
        for factor_name, factor_config in recipe['factors'].items():
            factor_signals[factor_name] = compute_factor(data, factor_name, factor_config)
        
        # Apply signal pipeline
        processed_signals = apply_signal_pipeline(factor_signals, recipe['pipeline'])
        
        # Combine signals
        combined_signal = combine_signals(processed_signals, recipe['combination'])
        
        # Calculate diagnostics
        diagnostics = calculate_signal_diagnostics(combined_signal, data)
        
        return {
            'status': 'success',
            'signals': processed_signals,
            'combined_signal': combined_signal,
            'diagnostics': diagnostics
        }
        
    except Exception as e:
        logger.error(f"Error computing signals: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

def load_market_data(universe_id: str, data_params: Dict) -> pd.DataFrame:
    """Load market data for universe"""
    # Simulated data loading
    # In production, this would query the database
    
    np.random.seed(42)  # For reproducible results
    n_symbols = 100
    n_days = 252 * 2  # 2 years of data
    
    symbols = [f'SYMBOL_{i:03d}' for i in range(n_symbols)]
    dates = pd.date_range('2022-01-01', periods=n_days, freq='D')
    
    # Generate synthetic price data
    data = []
    for symbol in symbols:
        # Generate price series with some trend and volatility
        returns = np.random.normal(0.0005, 0.02, n_days)  # Daily returns
        prices = 100 * np.exp(np.cumsum(returns))
        
        for i, date in enumerate(dates):
            data.append({
                'symbol': symbol,
                'date': date,
                'close': prices[i],
                'volume': np.random.lognormal(10, 1),
                'market_cap': np.random.lognormal(20, 1),
                'sector': np.random.choice(['Technology', 'Healthcare', 'Finance', 'Consumer']),
                'pe_ratio': np.random.normal(20, 5),
                'pb_ratio': np.random.normal(3, 1),
                'roe': np.random.normal(0.15, 0.05),
                'debt_to_equity': np.random.normal(0.5, 0.2),
                'beta': np.random.normal(1.0, 0.3)
            })
    
    return pd.DataFrame(data)

def compute_factor(data: pd.DataFrame, factor_name: str, config: Dict) -> pd.Series:
    """Compute a specific factor signal"""
    
    if factor_name == 'momentum':
        return compute_momentum_factor(data, config)
    elif factor_name == 'value':
        return compute_value_factor(data, config)
    elif factor_name == 'quality':
        return compute_quality_factor(data, config)
    elif factor_name == 'growth':
        return compute_growth_factor(data, config)
    elif factor_name == 'low_vol':
        return compute_low_vol_factor(data, config)
    elif factor_name == 'size':
        return compute_size_factor(data, config)
    elif factor_name == 'esg':
        return compute_esg_factor(data, config)
    else:
        raise ValueError(f"Unknown factor: {factor_name}")

def compute_momentum_factor(data: pd.DataFrame, config: Dict) -> pd.Series:
    """Compute momentum factor"""
    lookback = config.get('lookback', 252)  # Default 1 year
    
    # Calculate returns over lookback period
    returns = data.groupby('symbol')['close'].pct_change(lookback)
    
    # Winsorize outliers
    returns = winsorize_series(returns, config.get('winsorize_percentile', 0.05))
    
    return returns

def compute_value_factor(data: pd.DataFrame, config: Dict) -> pd.Series:
    """Compute value factor"""
    # Use P/E and P/B ratios
    pe_ratio = data.groupby('symbol')['pe_ratio'].last()
    pb_ratio = data.groupby('symbol')['pb_ratio'].last()
    
    # Invert ratios (lower is better for value)
    pe_score = -pe_ratio
    pb_score = -pb_ratio
    
    # Combine scores
    value_score = (pe_score + pb_score) / 2
    
    # Winsorize
    value_score = winsorize_series(value_score, config.get('winsorize_percentile', 0.05))
    
    return value_score

def compute_quality_factor(data: pd.DataFrame, config: Dict) -> pd.Series:
    """Compute quality factor"""
    # Use ROE and debt-to-equity
    roe = data.groupby('symbol')['roe'].last()
    debt_to_equity = data.groupby('symbol')['debt_to_equity'].last()
    
    # Higher ROE is better, lower debt is better
    quality_score = roe - debt_to_equity
    
    # Winsorize
    quality_score = winsorize_series(quality_score, config.get('winsorize_percentile', 0.05))
    
    return quality_score

def compute_growth_factor(data: pd.DataFrame, config: Dict) -> pd.Series:
    """Compute growth factor"""
    # Use revenue growth (simulated)
    # In real implementation, you'd use actual revenue data
    
    # Simulate growth rates
    growth_rates = np.random.normal(0.1, 0.2, len(data.groupby('symbol')))
    growth_series = pd.Series(growth_rates, index=data.groupby('symbol').groups.keys())
    
    # Winsorize
    growth_series = winsorize_series(growth_series, config.get('winsorize_percentile', 0.05))
    
    return growth_series

def compute_low_vol_factor(data: pd.DataFrame, config: Dict) -> pd.Series:
    """Compute low volatility factor"""
    lookback = config.get('lookback', 252)
    
    # Calculate rolling volatility
    returns = data.groupby('symbol')['close'].pct_change()
    volatility = returns.rolling(lookback).std()
    
    # Invert (lower volatility is better)
    low_vol_score = -volatility.iloc[-1]
    
    # Winsorize
    low_vol_score = winsorize_series(low_vol_score, config.get('winsorize_percentile', 0.05))
    
    return low_vol_score

def compute_size_factor(data: pd.DataFrame, config: Dict) -> pd.Series:
    """Compute size factor"""
    # Use market cap (log scale)
    market_cap = data.groupby('symbol')['market_cap'].last()
    size_score = -np.log(market_cap)  # Smaller is better
    
    # Winsorize
    size_score = winsorize_series(size_score, config.get('winsorize_percentile', 0.05))
    
    return size_score

def compute_esg_factor(data: pd.DataFrame, config: Dict) -> pd.Series:
    """Compute ESG factor"""
    # Simulated ESG scores
    # In real implementation, you'd use actual ESG data
    
    esg_scores = np.random.normal(0.6, 0.2, len(data.groupby('symbol')))
    esg_series = pd.Series(esg_scores, index=data.groupby('symbol').groups.keys())
    
    # Winsorize
    esg_series = winsorize_series(esg_series, config.get('winsorize_percentile', 0.05))
    
    return esg_series

def winsorize_series(series: pd.Series, percentile: float) -> pd.Series:
    """Winsorize a series to handle outliers"""
    lower = series.quantile(percentile)
    upper = series.quantile(1 - percentile)
    
    winsorized = series.clip(lower=lower, upper=upper)
    return winsorized

def apply_signal_pipeline(signals: Dict[str, pd.Series], pipeline: Dict) -> Dict[str, pd.Series]:
    """Apply signal processing pipeline"""
    processed_signals = {}
    
    for factor_name, signal in signals.items():
        processed_signal = signal.copy()
        
        # Z-score normalization
        if pipeline.get('zscore', True):
            processed_signal = (processed_signal - processed_signal.mean()) / processed_signal.std()
        
        # Sector neutralization
        if pipeline.get('sector_neutralize', True):
            processed_signal = neutralize_by_sector(processed_signal, factor_name)
        
        # Size neutralization
        if pipeline.get('size_neutralize', True):
            processed_signal = neutralize_by_size(processed_signal, factor_name)
        
        # Decay
        if pipeline.get('decay', 0) > 0:
            processed_signal = apply_decay(processed_signal, pipeline['decay'])
        
        processed_signals[factor_name] = processed_signal
    
    return processed_signals

def neutralize_by_sector(signal: pd.Series, factor_name: str) -> pd.Series:
    """Neutralize signal by sector"""
    # In real implementation, you'd use actual sector data
    # For now, we'll simulate sector neutralization
    
    # Simulate sector assignments
    sectors = np.random.choice(['Technology', 'Healthcare', 'Finance', 'Consumer'], len(signal))
    sector_means = signal.groupby(sectors).mean()
    
    # Remove sector effects
    neutralized = signal.copy()
    for sector in sector_means.index:
        mask = sectors == sector
        neutralized[mask] = signal[mask] - sector_means[sector]
    
    return neutralized

def neutralize_by_size(signal: pd.Series, factor_name: str) -> pd.Series:
    """Neutralize signal by size"""
    # In real implementation, you'd use actual market cap data
    # For now, we'll simulate size neutralization
    
    # Simulate size quintiles
    size_quintiles = pd.qcut(np.random.rand(len(signal)), 5, labels=False)
    size_means = signal.groupby(size_quintiles).mean()
    
    # Remove size effects
    neutralized = signal.copy()
    for quintile in size_means.index:
        mask = size_quintiles == quintile
        neutralized[mask] = signal[mask] - size_means[quintile]
    
    return neutralized

def apply_decay(signal: pd.Series, decay_factor: float) -> pd.Series:
    """Apply exponential decay to signal"""
    # Simulate time decay
    decayed = signal * (1 - decay_factor)
    return decayed

def combine_signals(signals: Dict[str, pd.Series], combination: Dict) -> pd.Series:
    """Combine multiple signals"""
    method = combination.get('method', 'weighted_sum')
    weights = combination.get('weights', {})
    
    if method == 'weighted_sum':
        # Weighted sum of signals
        combined = pd.Series(0.0, index=list(signals.values())[0].index)
        
        for factor_name, signal in signals.items():
            weight = weights.get(factor_name, 1.0)
            combined += weight * signal
        
        return combined
    
    elif method == 'pca':
        # PCA-based combination
        signal_matrix = pd.DataFrame(signals)
        pca = PCA(n_components=1)
        combined = pd.Series(pca.fit_transform(signal_matrix)[:, 0], index=signal_matrix.index)
        return combined
    
    else:
        raise ValueError(f"Unknown combination method: {method}")

def calculate_signal_diagnostics(combined_signal: pd.Series, data: pd.DataFrame) -> Dict:
    """Calculate signal diagnostics"""
    diagnostics = {
        'mean': float(combined_signal.mean()),
        'std': float(combined_signal.std()),
        'skewness': float(stats.skew(combined_signal.dropna())),
        'kurtosis': float(stats.kurtosis(combined_signal.dropna())),
        'min': float(combined_signal.min()),
        'max': float(combined_signal.max()),
        'ic': calculate_information_coefficient(combined_signal, data),
        'turnover': calculate_turnover(combined_signal),
        'concentration': calculate_concentration(combined_signal)
    }
    
    return diagnostics

def calculate_information_coefficient(signal: pd.Series, data: pd.DataFrame) -> float:
    """Calculate information coefficient (correlation with future returns)"""
    # In real implementation, you'd calculate correlation with actual future returns
    # For now, we'll simulate this
    future_returns = np.random.normal(0, 0.02, len(signal))
    ic = np.corrcoef(signal, future_returns)[0, 1]
    return float(ic) if not np.isnan(ic) else 0.0

def calculate_turnover(signal: pd.Series) -> float:
    """Calculate signal turnover"""
    # In real implementation, you'd compare with previous period
    # For now, we'll simulate this
    return float(np.random.uniform(0.1, 0.3))

def calculate_concentration(signal: pd.Series) -> float:
    """Calculate signal concentration (Herfindahl index)"""
    weights = np.abs(signal) / np.abs(signal).sum()
    concentration = np.sum(weights ** 2)
    return float(concentration)

@shared_task(bind=True, name='factor_engine.backtest_signals')
def backtest_signals(self, universe_id: str, signals: Dict, backtest_params: Dict) -> Dict:
    """Backtest factor signals"""
    try:
        # Load historical data
        data = load_market_data(universe_id, backtest_params)
        
        # Simulate backtest
        results = simulate_backtest(data, signals, backtest_params)
        
        return {
            'status': 'success',
            'results': results
        }
        
    except Exception as e:
        logger.error(f"Error backtesting signals: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

def simulate_backtest(data: pd.DataFrame, signals: Dict, params: Dict) -> Dict:
    """Simulate backtest of signals"""
    # This is a simplified backtest simulation
    # In production, you'd implement a full backtest engine
    
    returns = np.random.normal(0.001, 0.02, 252)  # Daily returns
    cumulative_returns = np.cumprod(1 + returns)
    
    results = {
        'total_return': float(cumulative_returns[-1] - 1),
        'annualized_return': float((cumulative_returns[-1] ** (252/len(returns))) - 1),
        'volatility': float(np.std(returns) * np.sqrt(252)),
        'sharpe_ratio': float(np.mean(returns) / np.std(returns) * np.sqrt(252)),
        'max_drawdown': float(np.min(cumulative_returns / np.maximum.accumulate(cumulative_returns) - 1)),
        'win_rate': float(np.sum(returns > 0) / len(returns))
    }
    
    return results
