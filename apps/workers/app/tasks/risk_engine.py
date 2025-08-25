from celery import shared_task
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
import logging
from scipy import stats
from scipy.optimize import minimize
import cvxpy as cp

# Created automatically by Cursor AI (2024-01-XX)

logger = logging.getLogger(__name__)

@shared_task(bind=True, name='risk_engine.calculate_risk_metrics')
def calculate_risk_metrics(self, portfolio_weights: Dict[str, float], universe_id: str, risk_params: Dict) -> Dict:
    """
    Calculate comprehensive risk metrics for a portfolio
    
    Args:
        portfolio_weights: Portfolio weights by symbol
        universe_id: Target universe ID
        risk_params: Risk calculation parameters
    """
    try:
        # Load market data
        data = load_market_data(universe_id)
        
        # Calculate portfolio returns
        portfolio_returns = calculate_portfolio_returns(data, portfolio_weights)
        
        # Calculate risk metrics
        var_parametric = calculate_var_parametric(portfolio_returns, risk_params.get('var_confidence', 0.95))
        var_historical = calculate_var_historical(portfolio_returns, risk_params.get('var_confidence', 0.95))
        es_parametric = calculate_es_parametric(portfolio_returns, risk_params.get('es_confidence', 0.95))
        es_historical = calculate_es_historical(portfolio_returns, risk_params.get('es_confidence', 0.95))
        
        # Calculate factor exposures
        factor_exposures = calculate_factor_exposures(data, portfolio_weights)
        
        # Calculate stress test results
        stress_results = run_stress_tests(portfolio_weights, data, risk_params.get('stress_scenarios', {}))
        
        return {
            'status': 'success',
            'var_parametric': var_parametric,
            'var_historical': var_historical,
            'es_parametric': es_parametric,
            'es_historical': es_historical,
            'factor_exposures': factor_exposures,
            'stress_results': stress_results,
            'portfolio_stats': calculate_portfolio_stats(portfolio_returns)
        }
        
    except Exception as e:
        logger.error(f"Error calculating risk metrics: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

def load_market_data(universe_id: str) -> pd.DataFrame:
    """Load market data for universe"""
    # Simulated data loading
    # In production, this would query the database
    
    np.random.seed(42)  # For reproducible results
    n_assets = 100
    n_days = 252 * 3  # 3 years of data
    
    symbols = [f'ASSET_{i:03d}' for i in range(n_assets)]
    dates = pd.date_range('2021-01-01', periods=n_days, freq='D')
    
    # Generate synthetic returns data with factor structure
    data = []
    for symbol in symbols:
        # Generate factor exposures
        market_beta = np.random.normal(1.0, 0.3)
        size_beta = np.random.normal(0.0, 0.5)
        value_beta = np.random.normal(0.0, 0.4)
        momentum_beta = np.random.normal(0.0, 0.3)
        
        # Generate factor returns
        market_returns = np.random.normal(0.0005, 0.015, n_days)
        size_returns = np.random.normal(0.0, 0.008, n_days)
        value_returns = np.random.normal(0.0, 0.006, n_days)
        momentum_returns = np.random.normal(0.0, 0.005, n_days)
        
        # Generate idiosyncratic returns
        idiosyncratic_returns = np.random.normal(0.0, 0.02, n_days)
        
        # Combine to get asset returns
        asset_returns = (market_beta * market_returns + 
                        size_beta * size_returns + 
                        value_beta * value_returns + 
                        momentum_beta * momentum_returns + 
                        idiosyncratic_returns)
        
        for i, date in enumerate(dates):
            data.append({
                'symbol': symbol,
                'date': date,
                'return': asset_returns[i],
                'market_beta': market_beta,
                'size_beta': size_beta,
                'value_beta': value_beta,
                'momentum_beta': momentum_beta,
                'market_cap': np.random.lognormal(20, 1),
                'sector': np.random.choice(['Technology', 'Healthcare', 'Finance', 'Consumer'])
            })
    
    return pd.DataFrame(data)

def calculate_portfolio_returns(data: pd.DataFrame, weights: Dict[str, float]) -> pd.Series:
    """Calculate portfolio returns"""
    # Pivot data to get returns matrix
    returns_matrix = data.pivot(index='date', columns='symbol', values='return')
    
    # Calculate portfolio returns
    portfolio_returns = returns_matrix[list(weights.keys())].multiply(list(weights.values())).sum(axis=1)
    
    return portfolio_returns

def calculate_var_parametric(returns: pd.Series, confidence: float) -> float:
    """Calculate parametric VaR"""
    mean_return = returns.mean()
    std_return = returns.std()
    
    # Normal distribution assumption
    z_score = stats.norm.ppf(1 - confidence)
    var = mean_return + z_score * std_return
    
    return float(var)

def calculate_var_historical(returns: pd.Series, confidence: float) -> float:
    """Calculate historical VaR"""
    var = np.percentile(returns, (1 - confidence) * 100)
    return float(var)

def calculate_es_parametric(returns: pd.Series, confidence: float) -> float:
    """Calculate parametric Expected Shortfall (Conditional VaR)"""
    mean_return = returns.mean()
    std_return = returns.std()
    
    # Normal distribution assumption
    z_score = stats.norm.ppf(1 - confidence)
    es = mean_return - std_return * stats.norm.pdf(z_score) / (1 - confidence)
    
    return float(es)

def calculate_es_historical(returns: pd.Series, confidence: float) -> float:
    """Calculate historical Expected Shortfall"""
    var_threshold = np.percentile(returns, (1 - confidence) * 100)
    tail_returns = returns[returns <= var_threshold]
    es = tail_returns.mean()
    
    return float(es)

def calculate_factor_exposures(data: pd.DataFrame, weights: Dict[str, float]) -> Dict:
    """Calculate factor exposures for the portfolio"""
    # Get factor betas for portfolio assets
    portfolio_data = data[data['symbol'].isin(weights.keys())].copy()
    
    # Calculate weighted factor exposures
    factor_exposures = {}
    for factor in ['market_beta', 'size_beta', 'value_beta', 'momentum_beta']:
        exposure = 0
        for symbol, weight in weights.items():
            symbol_data = portfolio_data[portfolio_data['symbol'] == symbol]
            if not symbol_data.empty:
                exposure += weight * symbol_data[factor].iloc[0]
        factor_exposures[factor] = float(exposure)
    
    # Calculate sector exposures
    sector_exposures = {}
    for symbol, weight in weights.items():
        symbol_data = portfolio_data[portfolio_data['symbol'] == symbol]
        if not symbol_data.empty:
            sector = symbol_data['sector'].iloc[0]
            sector_exposures[sector] = sector_exposures.get(sector, 0) + weight
    
    return {
        'factor_exposures': factor_exposures,
        'sector_exposures': sector_exposures
    }

def run_stress_tests(weights: Dict[str, float], data: pd.DataFrame, scenarios: Dict) -> Dict:
    """Run stress tests on portfolio"""
    if not scenarios:
        # Default scenarios
        scenarios = {
            'market_crash': {'market_shock': -0.20, 'volatility_shock': 2.0},
            'rates_spike': {'rates_shock': 0.02, 'duration_impact': -0.15},
            'oil_shock': {'oil_shock': -0.15, 'energy_impact': -0.25},
            'fx_crisis': {'fx_shock': -0.10, 'international_impact': -0.20},
            'sector_rotation': {'tech_shock': -0.15, 'defensive_shock': 0.10}
        }
    
    stress_results = {}
    
    for scenario_name, scenario_params in scenarios.items():
        # Calculate scenario impact
        scenario_return = calculate_scenario_return(weights, data, scenario_params)
        stress_results[scenario_name] = {
            'scenario_return': float(scenario_return),
            'scenario_loss': float(-scenario_return) if scenario_return < 0 else 0.0,
            'scenario_params': scenario_params
        }
    
    return stress_results

def calculate_scenario_return(weights: Dict[str, float], data: pd.DataFrame, scenario_params: Dict) -> float:
    """Calculate portfolio return under a specific scenario"""
    portfolio_data = data[data['symbol'].isin(weights.keys())].copy()
    
    total_impact = 0
    
    for symbol, weight in weights.items():
        symbol_data = portfolio_data[portfolio_data['symbol'] == symbol]
        if symbol_data.empty:
            continue
        
        # Base impact from market shock
        market_impact = scenario_params.get('market_shock', 0) * symbol_data['market_beta'].iloc[0]
        
        # Sector-specific impacts
        sector = symbol_data['sector'].iloc[0]
        sector_impact = 0
        
        if 'tech_shock' in scenario_params and sector == 'Technology':
            sector_impact = scenario_params['tech_shock']
        elif 'defensive_shock' in scenario_params and sector in ['Healthcare', 'Utilities']:
            sector_impact = scenario_params['defensive_shock']
        elif 'energy_impact' in scenario_params and sector == 'Energy':
            sector_impact = scenario_params['energy_impact']
        
        # Size impact
        size_impact = scenario_params.get('rates_shock', 0) * symbol_data['size_beta'].iloc[0] * 0.5
        
        # Total impact for this asset
        asset_impact = market_impact + sector_impact + size_impact
        total_impact += weight * asset_impact
    
    return total_impact

def calculate_portfolio_stats(returns: pd.Series) -> Dict:
    """Calculate portfolio statistics"""
    stats_dict = {
        'mean_return': float(returns.mean()),
        'volatility': float(returns.std()),
        'skewness': float(stats.skew(returns)),
        'kurtosis': float(stats.kurtosis(returns)),
        'min_return': float(returns.min()),
        'max_return': float(returns.max()),
        'var_95': float(np.percentile(returns, 5)),
        'var_99': float(np.percentile(returns, 1)),
        'es_95': float(returns[returns <= np.percentile(returns, 5)].mean()),
        'es_99': float(returns[returns <= np.percentile(returns, 1)].mean())
    }
    
    return stats_dict

@shared_task(bind=True, name='risk_engine.run_scenario_analysis')
def run_scenario_analysis(self, portfolio_weights: Dict[str, float], universe_id: str, scenarios: Dict) -> Dict:
    """Run comprehensive scenario analysis"""
    try:
        # Load market data
        data = load_market_data(universe_id)
        
        # Run scenarios
        scenario_results = {}
        
        for scenario_name, scenario_config in scenarios.items():
            # Calculate scenario impact
            scenario_return = calculate_scenario_return(portfolio_weights, data, scenario_config['params'])
            
            # Calculate factor exposures under scenario
            scenario_factor_exposures = calculate_scenario_factor_exposures(
                portfolio_weights, data, scenario_config['params']
            )
            
            scenario_results[scenario_name] = {
                'scenario_return': float(scenario_return),
                'scenario_loss': float(-scenario_return) if scenario_return < 0 else 0.0,
                'factor_exposures': scenario_factor_exposures,
                'description': scenario_config.get('description', ''),
                'probability': scenario_config.get('probability', 0.01)
            }
        
        # Calculate scenario risk metrics
        scenario_risk_metrics = calculate_scenario_risk_metrics(scenario_results)
        
        return {
            'status': 'success',
            'scenario_results': scenario_results,
            'scenario_risk_metrics': scenario_risk_metrics
        }
        
    except Exception as e:
        logger.error(f"Error running scenario analysis: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

def calculate_scenario_factor_exposures(weights: Dict[str, float], data: pd.DataFrame, scenario_params: Dict) -> Dict:
    """Calculate factor exposures under a specific scenario"""
    # This would calculate how factor exposures change under the scenario
    # For now, we'll return the base exposures with some scenario adjustment
    
    base_exposures = calculate_factor_exposures(data, weights)
    
    # Apply scenario adjustments
    adjusted_exposures = base_exposures.copy()
    
    # Market beta adjustment
    if 'market_shock' in scenario_params:
        adjusted_exposures['factor_exposures']['market_beta'] *= (1 + scenario_params['market_shock'] * 0.1)
    
    # Size beta adjustment
    if 'rates_shock' in scenario_params:
        adjusted_exposures['factor_exposures']['size_beta'] *= (1 + scenario_params['rates_shock'] * 0.2)
    
    return adjusted_exposures

def calculate_scenario_risk_metrics(scenario_results: Dict) -> Dict:
    """Calculate risk metrics across scenarios"""
    returns = [result['scenario_return'] for result in scenario_results.values()]
    losses = [result['scenario_loss'] for result in scenario_results.values()]
    probabilities = [result['probability'] for result in scenario_results.values()]
    
    # Expected loss
    expected_loss = sum(loss * prob for loss, prob in zip(losses, probabilities))
    
    # Worst case loss
    worst_case_loss = max(losses)
    
    # Scenario VaR (95th percentile of losses)
    if losses:
        scenario_var = np.percentile(losses, 95)
    else:
        scenario_var = 0
    
    # Maximum drawdown across scenarios
    cumulative_returns = np.cumprod([1 + r for r in returns])
    max_drawdown = np.min(cumulative_returns / np.maximum.accumulate(cumulative_returns) - 1)
    
    return {
        'expected_loss': float(expected_loss),
        'worst_case_loss': float(worst_case_loss),
        'scenario_var_95': float(scenario_var),
        'max_drawdown': float(max_drawdown),
        'num_scenarios': len(scenario_results)
    }

@shared_task(bind=True, name='risk_engine.calculate_liquidity_stress')
def calculate_liquidity_stress(self, portfolio_weights: Dict[str, float], universe_id: str, stress_params: Dict) -> Dict:
    """Calculate liquidity stress test results"""
    try:
        # Load market data
        data = load_market_data(universe_id)
        
        # Calculate liquidity metrics
        liquidity_metrics = calculate_liquidity_metrics(data, portfolio_weights)
        
        # Run liquidity stress scenarios
        stress_scenarios = {
            'normal_market': {'liquidity_multiplier': 1.0, 'spread_widening': 0.0},
            'stressed_market': {'liquidity_multiplier': 3.0, 'spread_widening': 0.002},
            'crisis_market': {'liquidity_multiplier': 10.0, 'spread_widening': 0.01}
        }
        
        stress_results = {}
        for scenario_name, params in stress_scenarios.items():
            scenario_impact = calculate_liquidity_impact(liquidity_metrics, params)
            stress_results[scenario_name] = scenario_impact
        
        return {
            'status': 'success',
            'liquidity_metrics': liquidity_metrics,
            'stress_results': stress_results
        }
        
    except Exception as e:
        logger.error(f"Error calculating liquidity stress: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

def calculate_liquidity_metrics(data: pd.DataFrame, weights: Dict[str, float]) -> Dict:
    """Calculate liquidity metrics for portfolio"""
    portfolio_data = data[data['symbol'].isin(weights.keys())].copy()
    
    liquidity_metrics = {
        'total_adv_ratio': 0,
        'weighted_avg_adv_ratio': 0,
        'illiquid_weight': 0,
        'concentration_risk': 0
    }
    
    total_weight = sum(weights.values())
    
    for symbol, weight in weights.items():
        symbol_data = portfolio_data[portfolio_data['symbol'] == symbol]
        if symbol_data.empty:
            continue
        
        # Simulate ADV ratio (in practice, this would come from market data)
        adv_ratio = np.random.uniform(0.001, 0.1)
        
        liquidity_metrics['total_adv_ratio'] += weight * adv_ratio
        liquidity_metrics['weighted_avg_adv_ratio'] += weight * adv_ratio
        
        # Identify illiquid positions
        if adv_ratio < 0.01:
            liquidity_metrics['illiquid_weight'] += weight
    
    # Calculate concentration risk (Herfindahl index)
    liquidity_metrics['concentration_risk'] = sum(w ** 2 for w in weights.values())
    
    return liquidity_metrics

def calculate_liquidity_impact(liquidity_metrics: Dict, stress_params: Dict) -> Dict:
    """Calculate liquidity impact under stress scenario"""
    multiplier = stress_params.get('liquidity_multiplier', 1.0)
    spread_widening = stress_params.get('spread_widening', 0.0)
    
    # Calculate impact on trading costs
    base_cost = 0.001  # 10bps base cost
    stressed_cost = base_cost * multiplier + spread_widening
    
    # Calculate impact on portfolio value
    cost_impact = stressed_cost - base_cost
    
    return {
        'cost_impact': float(cost_impact),
        'stressed_cost': float(stressed_cost),
        'liquidity_multiplier': float(multiplier),
        'spread_widening': float(spread_widening)
    }
