from celery import shared_task
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
import logging
from scipy.optimize import minimize
from scipy import stats
import cvxpy as cp

# Created automatically by Cursor AI (2024-01-XX)

logger = logging.getLogger(__name__)

@shared_task(bind=True, name='portfolio_optimizer.optimize_portfolio')
def optimize_portfolio(self, universe_id: str, signals: Dict, constraints: Dict, method: str = 'mean_variance') -> Dict:
    """
    Optimize portfolio weights based on signals and constraints
    
    Args:
        universe_id: Target universe ID
        signals: Factor signals for each asset
        constraints: Portfolio constraints
        method: Optimization method ('mean_variance', 'black_litterman', 'risk_parity')
    """
    try:
        # Load market data
        data = load_market_data(universe_id)
        
        # Calculate expected returns and covariance
        expected_returns = calculate_expected_returns(data, signals)
        covariance_matrix = calculate_covariance_matrix(data)
        
        # Apply shrinkage to covariance matrix
        if constraints.get('shrinkage', True):
            covariance_matrix = apply_shrinkage(covariance_matrix)
        
        # Run optimization based on method
        if method == 'mean_variance':
            weights = mean_variance_optimization(expected_returns, covariance_matrix, constraints)
        elif method == 'black_litterman':
            weights = black_litterman_optimization(data, expected_returns, covariance_matrix, constraints)
        elif method == 'risk_parity':
            weights = risk_parity_optimization(covariance_matrix, constraints)
        else:
            raise ValueError(f"Unknown optimization method: {method}")
        
        # Calculate portfolio metrics
        metrics = calculate_portfolio_metrics(weights, expected_returns, covariance_matrix)
        
        return {
            'status': 'success',
            'weights': weights,
            'metrics': metrics,
            'constraints_satisfied': check_constraints(weights, constraints)
        }
        
    except Exception as e:
        logger.error(f"Error optimizing portfolio: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

def load_market_data(universe_id: str) -> pd.DataFrame:
    """Load market data for universe"""
    # Simulated data loading
    # In production, this would query the database
    
    np.random.seed(42)  # For reproducible results
    n_assets = 100
    n_days = 252 * 2  # 2 years of data
    
    symbols = [f'ASSET_{i:03d}' for i in range(n_assets)]
    dates = pd.date_range('2022-01-01', periods=n_days, freq='D')
    
    # Generate synthetic returns data
    data = []
    for symbol in symbols:
        # Generate return series with some correlation structure
        returns = np.random.normal(0.0005, 0.02, n_days)
        for i, date in enumerate(dates):
            data.append({
                'symbol': symbol,
                'date': date,
                'return': returns[i],
                'market_cap': np.random.lognormal(20, 1),
                'sector': np.random.choice(['Technology', 'Healthcare', 'Finance', 'Consumer'])
            })
    
    return pd.DataFrame(data)

def calculate_expected_returns(data: pd.DataFrame, signals: Dict) -> pd.Series:
    """Calculate expected returns from signals"""
    # In a real implementation, you'd use the factor engine signals
    # For now, we'll simulate expected returns
    
    symbols = data['symbol'].unique()
    expected_returns = {}
    
    for symbol in symbols:
        # Simulate expected return based on signals
        base_return = 0.08  # 8% annual base return
        signal_contribution = np.random.normal(0, 0.02)  # Signal contribution
        expected_returns[symbol] = base_return + signal_contribution
    
    return pd.Series(expected_returns)

def calculate_covariance_matrix(data: pd.DataFrame) -> pd.DataFrame:
    """Calculate covariance matrix from historical returns"""
    # Pivot data to get returns matrix
    returns_matrix = data.pivot(index='date', columns='symbol', values='return')
    
    # Calculate covariance matrix
    covariance_matrix = returns_matrix.cov() * 252  # Annualize
    
    return covariance_matrix

def apply_shrinkage(covariance_matrix: pd.DataFrame, shrinkage_target: str = 'constant_correlation') -> pd.DataFrame:
    """Apply shrinkage to covariance matrix"""
    if shrinkage_target == 'constant_correlation':
        # Ledoit-Wolf shrinkage to constant correlation
        n_assets = len(covariance_matrix)
        
        # Calculate sample correlation matrix
        std_devs = np.sqrt(np.diag(covariance_matrix))
        correlation_matrix = covariance_matrix / np.outer(std_devs, std_devs)
        
        # Calculate shrinkage target (constant correlation)
        off_diagonal_correlations = correlation_matrix.values[np.triu_indices(n_assets, k=1)]
        target_correlation = np.mean(off_diagonal_correlations)
        
        # Create target matrix
        target_matrix = np.full((n_assets, n_assets), target_correlation)
        np.fill_diagonal(target_matrix, 1.0)
        target_covariance = target_matrix * np.outer(std_devs, std_devs)
        
        # Calculate optimal shrinkage parameter
        # Simplified version - in practice, you'd use more sophisticated methods
        shrinkage_param = 0.3
        
        # Apply shrinkage
        shrunk_covariance = (1 - shrinkage_param) * covariance_matrix + shrinkage_param * target_covariance
        
        return pd.DataFrame(shrunk_covariance, index=covariance_matrix.index, columns=covariance_matrix.columns)
    
    return covariance_matrix

def mean_variance_optimization(expected_returns: pd.Series, covariance_matrix: pd.DataFrame, constraints: Dict) -> Dict[str, float]:
    """Mean-variance optimization"""
    n_assets = len(expected_returns)
    symbols = expected_returns.index
    
    # Define optimization variables
    weights = cp.Variable(n_assets)
    
    # Objective function: maximize Sharpe ratio (approximated as return/volatility)
    portfolio_return = expected_returns @ weights
    portfolio_variance = cp.quad_form(weights, covariance_matrix.values)
    portfolio_volatility = cp.sqrt(portfolio_variance)
    
    # Maximize Sharpe ratio (minimize negative Sharpe ratio)
    objective = cp.Minimize(-portfolio_return / portfolio_volatility)
    
    # Constraints
    constraints_list = []
    
    # Budget constraint
    constraints_list.append(cp.sum(weights) == 1)
    
    # Long-only constraint
    constraints_list.append(weights >= 0)
    
    # Maximum position size
    max_position = constraints.get('max_position', 0.05)
    constraints_list.append(weights <= max_position)
    
    # Sector constraints
    if 'sector_caps' in constraints:
        for sector, cap in constraints['sector_caps'].items():
            # In real implementation, you'd map symbols to sectors
            # For now, we'll use a simplified approach
            sector_symbols = [s for s in symbols if sector in s]
            if sector_symbols:
                sector_indices = [list(symbols).index(s) for s in sector_symbols]
                sector_weight = cp.sum(weights[sector_indices])
                constraints_list.append(sector_weight <= cap)
    
    # Beta constraint
    if 'max_beta' in constraints:
        # Simplified beta calculation
        market_betas = np.random.normal(1.0, 0.3, n_assets)
        portfolio_beta = market_betas @ weights
        constraints_list.append(portfolio_beta <= constraints['max_beta'])
    
    # Solve optimization problem
    problem = cp.Problem(objective, constraints_list)
    problem.solve()
    
    if problem.status != 'optimal':
        raise ValueError(f"Optimization failed: {problem.status}")
    
    # Return weights as dictionary
    weights_dict = {symbol: float(weights.value[i]) for i, symbol in enumerate(symbols)}
    return weights_dict

def black_litterman_optimization(data: pd.DataFrame, expected_returns: pd.Series, covariance_matrix: pd.DataFrame, constraints: Dict) -> Dict[str, float]:
    """Black-Litterman optimization with views"""
    # Market equilibrium returns (reverse optimization)
    market_caps = data.groupby('symbol')['market_cap'].last()
    market_weights = market_caps / market_caps.sum()
    
    # Risk aversion parameter
    risk_aversion = 3.0
    
    # Market equilibrium returns
    pi = risk_aversion * covariance_matrix @ market_weights
    
    # Views matrix and vector
    # In practice, these would come from analyst views
    # For now, we'll create some example views
    symbols = expected_returns.index
    n_assets = len(symbols)
    
    # Example views: Technology sector will outperform by 2%
    tech_symbols = [s for s in symbols if 'Technology' in s]
    if tech_symbols:
        P = np.zeros((1, n_assets))
        for symbol in tech_symbols:
            idx = list(symbols).index(symbol)
            P[0, idx] = 1.0 / len(tech_symbols)
        
        Q = np.array([0.02])  # 2% outperformance
        omega = np.array([[0.01]])  # View uncertainty
        
        # Black-Litterman formula
        tau = 0.05  # Scaling factor
        
        # Posterior returns
        M = np.linalg.inv(np.linalg.inv(tau * covariance_matrix) + P.T @ np.linalg.inv(omega) @ P)
        mu_bl = M @ (np.linalg.inv(tau * covariance_matrix) @ pi + P.T @ np.linalg.inv(omega) @ Q)
        
        # Posterior covariance
        sigma_bl = covariance_matrix + M
        
        # Use mean-variance optimization with posterior estimates
        expected_returns_bl = pd.Series(mu_bl, index=symbols)
        return mean_variance_optimization(expected_returns_bl, pd.DataFrame(sigma_bl, index=symbols, columns=symbols), constraints)
    
    # Fallback to mean-variance if no views
    return mean_variance_optimization(expected_returns, covariance_matrix, constraints)

def risk_parity_optimization(covariance_matrix: pd.DataFrame, constraints: Dict) -> Dict[str, float]:
    """Risk parity optimization"""
    n_assets = len(covariance_matrix)
    symbols = covariance_matrix.index
    
    # Define optimization variables
    weights = cp.Variable(n_assets)
    
    # Risk contributions
    portfolio_variance = cp.quad_form(weights, covariance_matrix.values)
    portfolio_volatility = cp.sqrt(portfolio_variance)
    
    # Risk contribution of each asset
    risk_contributions = []
    for i in range(n_assets):
        # Simplified risk contribution calculation
        asset_weight = weights[i]
        asset_variance = covariance_matrix.iloc[i, i]
        asset_covariance = covariance_matrix.iloc[i, :] @ weights
        risk_contribution = asset_weight * asset_covariance / portfolio_volatility
        risk_contributions.append(risk_contribution)
    
    # Objective: minimize sum of squared differences in risk contributions
    target_risk = portfolio_volatility / n_assets
    objective = cp.Minimize(cp.sum_squares(cp.hstack(risk_contributions) - target_risk))
    
    # Constraints
    constraints_list = []
    
    # Budget constraint
    constraints_list.append(cp.sum(weights) == 1)
    
    # Long-only constraint
    constraints_list.append(weights >= 0)
    
    # Maximum position size
    max_position = constraints.get('max_position', 0.05)
    constraints_list.append(weights <= max_position)
    
    # Solve optimization problem
    problem = cp.Problem(objective, constraints_list)
    problem.solve()
    
    if problem.status != 'optimal':
        raise ValueError(f"Optimization failed: {problem.status}")
    
    # Return weights as dictionary
    weights_dict = {symbol: float(weights.value[i]) for i, symbol in enumerate(symbols)}
    return weights_dict

def calculate_portfolio_metrics(weights: Dict[str, float], expected_returns: pd.Series, covariance_matrix: pd.DataFrame) -> Dict:
    """Calculate portfolio metrics"""
    symbols = list(weights.keys())
    weight_vector = np.array([weights[symbol] for symbol in symbols])
    
    # Portfolio return
    portfolio_return = np.sum(weight_vector * expected_returns[symbols])
    
    # Portfolio volatility
    portfolio_variance = weight_vector.T @ covariance_matrix.loc[symbols, symbols] @ weight_vector
    portfolio_volatility = np.sqrt(portfolio_variance)
    
    # Sharpe ratio
    risk_free_rate = 0.02  # 2% risk-free rate
    sharpe_ratio = (portfolio_return - risk_free_rate) / portfolio_volatility
    
    # Concentration metrics
    herfindahl_index = np.sum(weight_vector ** 2)
    
    # Number of positions
    num_positions = np.sum(weight_vector > 0.001)  # Positions > 0.1%
    
    # Sector exposures (simplified)
    sector_exposures = {}
    for symbol in symbols:
        if 'Technology' in symbol:
            sector_exposures['Technology'] = sector_exposures.get('Technology', 0) + weights[symbol]
        elif 'Healthcare' in symbol:
            sector_exposures['Healthcare'] = sector_exposures.get('Healthcare', 0) + weights[symbol]
        elif 'Finance' in symbol:
            sector_exposures['Finance'] = sector_exposures.get('Finance', 0) + weights[symbol]
        else:
            sector_exposures['Consumer'] = sector_exposures.get('Consumer', 0) + weights[symbol]
    
    return {
        'expected_return': float(portfolio_return),
        'volatility': float(portfolio_volatility),
        'sharpe_ratio': float(sharpe_ratio),
        'herfindahl_index': float(herfindahl_index),
        'num_positions': int(num_positions),
        'sector_exposures': sector_exposures
    }

def check_constraints(weights: Dict[str, float], constraints: Dict) -> Dict[str, bool]:
    """Check if portfolio satisfies constraints"""
    weight_values = list(weights.values())
    
    checks = {}
    
    # Budget constraint
    checks['budget'] = abs(sum(weight_values) - 1.0) < 1e-6
    
    # Long-only constraint
    checks['long_only'] = all(w >= 0 for w in weight_values)
    
    # Maximum position size
    max_position = constraints.get('max_position', 0.05)
    checks['max_position'] = all(w <= max_position for w in weight_values)
    
    # Sector constraints
    if 'sector_caps' in constraints:
        sector_exposures = {}
        for symbol, weight in weights.items():
            if 'Technology' in symbol:
                sector_exposures['Technology'] = sector_exposures.get('Technology', 0) + weight
            elif 'Healthcare' in symbol:
                sector_exposures['Healthcare'] = sector_exposures.get('Healthcare', 0) + weight
            elif 'Finance' in symbol:
                sector_exposures['Finance'] = sector_exposures.get('Finance', 0) + weight
            else:
                sector_exposures['Consumer'] = sector_exposures.get('Consumer', 0) + weight
        
        checks['sector_caps'] = all(
            exposure <= constraints['sector_caps'].get(sector, 1.0)
            for sector, exposure in sector_exposures.items()
        )
    
    return checks

@shared_task(bind=True, name='portfolio_optimizer.compare_methods')
def compare_optimization_methods(self, universe_id: str, signals: Dict, constraints: Dict) -> Dict:
    """Compare different optimization methods"""
    try:
        methods = ['mean_variance', 'black_litterman', 'risk_parity']
        results = {}
        
        for method in methods:
            result = optimize_portfolio(universe_id, signals, constraints, method)
            results[method] = {
                'weights': result['weights'],
                'metrics': result['metrics'],
                'constraints_satisfied': result['constraints_satisfied']
            }
        
        return {
            'status': 'success',
            'comparison': results
        }
        
    except Exception as e:
        logger.error(f"Error comparing optimization methods: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise
