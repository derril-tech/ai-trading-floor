# Created automatically by Cursor AI (2024-01-XX)
from celery import shared_task
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple, Any
import logging
import json
import time
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import math

logger = logging.getLogger(__name__)

class OptionType(str, Enum):
    CALL = "call"
    PUT = "put"

class OptionStyle(str, Enum):
    AMERICAN = "american"
    EUROPEAN = "european"

class BondType(str, Enum):
    TREASURY = "treasury"
    CORPORATE = "corporate"
    MUNICIPAL = "municipal"
    HIGH_YIELD = "high_yield"

class CryptoType(str, Enum):
    BITCOIN = "bitcoin"
    ETHEREUM = "ethereum"
    ALTCOIN = "altcoin"
    DEFI = "defi"

@dataclass
class OptionContract:
    symbol: str
    underlying: str
    strike_price: float
    expiration_date: datetime
    option_type: OptionType
    style: OptionStyle
    contract_size: int = 100
    multiplier: float = 1.0

@dataclass
class OptionGreeks:
    delta: float
    gamma: float
    theta: float
    vega: float
    rho: float

@dataclass
class Bond:
    symbol: str
    issuer: str
    bond_type: BondType
    face_value: float
    coupon_rate: float
    coupon_frequency: int  # payments per year
    maturity_date: datetime
    issue_date: datetime
    credit_rating: str
    yield_to_maturity: float

@dataclass
class CryptoAsset:
    symbol: str
    name: str
    crypto_type: CryptoType
    market_cap: float
    circulating_supply: float
    max_supply: float
    blockchain: str
    consensus_mechanism: str

@shared_task(bind=True, name='advanced_trading.calculate_option_greeks')
def calculate_option_greeks(self, option_data: Dict) -> Dict:
    """
    Calculate option Greeks using Black-Scholes model
    """
    try:
        S = option_data['underlying_price']  # Current stock price
        K = option_data['strike_price']      # Strike price
        T = option_data['time_to_expiry']    # Time to expiration (in years)
        r = option_data['risk_free_rate']    # Risk-free rate
        sigma = option_data['volatility']    # Implied volatility
        option_type = OptionType(option_data['option_type'])
        
        # Black-Scholes calculations
        d1 = (np.log(S/K) + (r + 0.5*sigma**2)*T) / (sigma*np.sqrt(T))
        d2 = d1 - sigma*np.sqrt(T)
        
        if option_type == OptionType.CALL:
            delta = norm_cdf(d1)
            gamma = norm_pdf(d1) / (S * sigma * np.sqrt(T))
            theta = (-S * norm_pdf(d1) * sigma / (2 * np.sqrt(T)) - 
                    r * K * np.exp(-r*T) * norm_cdf(d2))
            vega = S * np.sqrt(T) * norm_pdf(d1)
            rho = K * T * np.exp(-r*T) * norm_cdf(d2)
        else:  # PUT
            delta = norm_cdf(d1) - 1
            gamma = norm_pdf(d1) / (S * sigma * np.sqrt(T))
            theta = (-S * norm_pdf(d1) * sigma / (2 * np.sqrt(T)) + 
                    r * K * np.exp(-r*T) * norm_cdf(-d2))
            vega = S * np.sqrt(T) * norm_pdf(d1)
            rho = -K * T * np.exp(-r*T) * norm_cdf(-d2)
        
        greeks = OptionGreeks(
            delta=delta,
            gamma=gamma,
            theta=theta,
            vega=vega,
            rho=rho
        )
        
        return {
            'status': 'success',
            'option_symbol': option_data.get('symbol', 'UNKNOWN'),
            'greeks': greeks.__dict__,
            'calculation_time': datetime.now().isoformat(),
            'message': f'Greeks calculated for {option_data.get("symbol", "option")}'
        }
        
    except Exception as e:
        logger.error(f"Error calculating option Greeks: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

@shared_task(bind=True, name='advanced_trading.calculate_bond_metrics')
def calculate_bond_metrics(self, bond_data: Dict) -> Dict:
    """
    Calculate bond metrics including yield, duration, and convexity
    """
    try:
        face_value = bond_data['face_value']
        coupon_rate = bond_data['coupon_rate']
        coupon_frequency = bond_data['coupon_frequency']
        maturity_years = bond_data['maturity_years']
        market_price = bond_data['market_price']
        yield_to_maturity = bond_data.get('yield_to_maturity')
        
        # Calculate coupon payment
        coupon_payment = face_value * coupon_rate / coupon_frequency
        
        # Calculate yield to maturity if not provided
        if not yield_to_maturity:
            yield_to_maturity = calculate_ytm(face_value, coupon_payment, 
                                            coupon_frequency, maturity_years, market_price)
        
        # Calculate Macaulay Duration
        duration = calculate_macaulay_duration(face_value, coupon_payment, 
                                             coupon_frequency, maturity_years, yield_to_maturity)
        
        # Calculate Modified Duration
        modified_duration = duration / (1 + yield_to_maturity / coupon_frequency)
        
        # Calculate Convexity
        convexity = calculate_convexity(face_value, coupon_payment, 
                                      coupon_frequency, maturity_years, yield_to_maturity)
        
        # Calculate Price Sensitivity
        price_sensitivity = -modified_duration * market_price * 0.01  # 1% rate change
        
        metrics = {
            'yield_to_maturity': yield_to_maturity,
            'macaulay_duration': duration,
            'modified_duration': modified_duration,
            'convexity': convexity,
            'price_sensitivity': price_sensitivity,
            'coupon_payment': coupon_payment,
            'total_payments': maturity_years * coupon_frequency
        }
        
        return {
            'status': 'success',
            'bond_symbol': bond_data.get('symbol', 'UNKNOWN'),
            'metrics': metrics,
            'calculation_time': datetime.now().isoformat(),
            'message': f'Bond metrics calculated for {bond_data.get("symbol", "bond")}'
        }
        
    except Exception as e:
        logger.error(f"Error calculating bond metrics: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

@shared_task(bind=True, name='advanced_trading.calculate_fx_metrics')
def calculate_fx_metrics(self, fx_data: Dict) -> Dict:
    """
    Calculate FX trading metrics including cross rates, forward points, and volatility
    """
    try:
        base_currency = fx_data['base_currency']
        quote_currency = fx_data['quote_currency']
        spot_rate = fx_data['spot_rate']
        forward_rate = fx_data.get('forward_rate')
        base_interest_rate = fx_data['base_interest_rate']
        quote_interest_rate = fx_data['quote_interest_rate']
        days_to_forward = fx_data.get('days_to_forward', 30)
        
        # Calculate forward rate if not provided
        if not forward_rate:
            forward_rate = calculate_forward_rate(spot_rate, base_interest_rate, 
                                                quote_interest_rate, days_to_forward)
        
        # Calculate forward points
        forward_points = (forward_rate - spot_rate) * 10000  # In pips
        
        # Calculate interest rate differential
        interest_differential = quote_interest_rate - base_interest_rate
        
        # Calculate implied volatility (simplified)
        implied_vol = calculate_implied_volatility(fx_data.get('option_prices', {}))
        
        # Calculate correlation with major pairs
        correlations = calculate_fx_correlations(base_currency, quote_currency)
        
        metrics = {
            'spot_rate': spot_rate,
            'forward_rate': forward_rate,
            'forward_points': forward_points,
            'interest_differential': interest_differential,
            'implied_volatility': implied_vol,
            'correlations': correlations,
            'days_to_forward': days_to_forward
        }
        
        return {
            'status': 'success',
            'currency_pair': f"{base_currency}/{quote_currency}",
            'metrics': metrics,
            'calculation_time': datetime.now().isoformat(),
            'message': f'FX metrics calculated for {base_currency}/{quote_currency}'
        }
        
    except Exception as e:
        logger.error(f"Error calculating FX metrics: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

@shared_task(bind=True, name='advanced_trading.calculate_crypto_metrics')
def calculate_crypto_metrics(self, crypto_data: Dict) -> Dict:
    """
    Calculate crypto metrics including volatility, correlation, and on-chain metrics
    """
    try:
        symbol = crypto_data['symbol']
        price_data = crypto_data['price_data']
        volume_data = crypto_data.get('volume_data', [])
        market_cap = crypto_data.get('market_cap', 0)
        
        # Calculate price volatility
        returns = calculate_returns(price_data)
        volatility = np.std(returns) * np.sqrt(252)  # Annualized
        
        # Calculate correlation with major cryptocurrencies
        correlations = calculate_crypto_correlations(symbol, price_data)
        
        # Calculate volume metrics
        volume_metrics = calculate_volume_metrics(volume_data) if volume_data else {}
        
        # Calculate market dominance
        market_dominance = calculate_market_dominance(market_cap, crypto_data.get('total_market_cap', 0))
        
        # Calculate on-chain metrics (simulated)
        on_chain_metrics = calculate_on_chain_metrics(symbol)
        
        # Calculate DeFi metrics if applicable
        defi_metrics = {}
        if crypto_data.get('crypto_type') == CryptoType.DEFI:
            defi_metrics = calculate_defi_metrics(symbol)
        
        metrics = {
            'volatility': volatility,
            'correlations': correlations,
            'volume_metrics': volume_metrics,
            'market_dominance': market_dominance,
            'on_chain_metrics': on_chain_metrics,
            'defi_metrics': defi_metrics
        }
        
        return {
            'status': 'success',
            'crypto_symbol': symbol,
            'metrics': metrics,
            'calculation_time': datetime.now().isoformat(),
            'message': f'Crypto metrics calculated for {symbol}'
        }
        
    except Exception as e:
        logger.error(f"Error calculating crypto metrics: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

@shared_task(bind=True, name='advanced_trading.optimize_options_portfolio')
def optimize_options_portfolio(self, portfolio_data: Dict) -> Dict:
    """
    Optimize options portfolio using various strategies
    """
    try:
        positions = portfolio_data['positions']
        strategy = portfolio_data.get('strategy', 'delta_neutral')
        constraints = portfolio_data.get('constraints', {})
        
        if strategy == 'delta_neutral':
            result = optimize_delta_neutral(positions, constraints)
        elif strategy == 'iron_condor':
            result = optimize_iron_condor(positions, constraints)
        elif strategy == 'butterfly_spread':
            result = optimize_butterfly_spread(positions, constraints)
        elif strategy == 'straddle':
            result = optimize_straddle(positions, constraints)
        else:
            raise ValueError(f"Unsupported options strategy: {strategy}")
        
        return {
            'status': 'success',
            'strategy': strategy,
            'optimization_result': result,
            'calculation_time': datetime.now().isoformat(),
            'message': f'Options portfolio optimized using {strategy} strategy'
        }
        
    except Exception as e:
        logger.error(f"Error optimizing options portfolio: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

@shared_task(bind=True, name='advanced_trading.calculate_yield_curve')
def calculate_yield_curve(self, bond_data: List[Dict]) -> Dict:
    """
    Calculate yield curve from bond data
    """
    try:
        # Sort bonds by maturity
        sorted_bonds = sorted(bond_data, key=lambda x: x['maturity_years'])
        
        maturities = [bond['maturity_years'] for bond in sorted_bonds]
        yields = [bond['yield_to_maturity'] for bond in sorted_bonds]
        
        # Calculate yield curve metrics
        curve_slope = calculate_curve_slope(maturities, yields)
        curve_curvature = calculate_curve_curvature(maturities, yields)
        
        # Calculate key rates
        key_rates = {
            '2y': interpolate_yield(maturities, yields, 2),
            '5y': interpolate_yield(maturities, yields, 5),
            '10y': interpolate_yield(maturities, yields, 10),
            '30y': interpolate_yield(maturities, yields, 30)
        }
        
        # Calculate spreads
        spreads = calculate_yield_spreads(key_rates)
        
        result = {
            'maturities': maturities,
            'yields': yields,
            'curve_slope': curve_slope,
            'curve_curvature': curve_curvature,
            'key_rates': key_rates,
            'spreads': spreads
        }
        
        return {
            'status': 'success',
            'yield_curve': result,
            'calculation_time': datetime.now().isoformat(),
            'message': 'Yield curve calculated successfully'
        }
        
    except Exception as e:
        logger.error(f"Error calculating yield curve: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

# Helper functions
def norm_cdf(x):
    """Standard normal cumulative distribution function"""
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def norm_pdf(x):
    """Standard normal probability density function"""
    return math.exp(-0.5 * x**2) / math.sqrt(2 * math.pi)

def calculate_ytm(face_value, coupon_payment, frequency, maturity_years, market_price):
    """Calculate yield to maturity using Newton-Raphson method"""
    # Simplified calculation
    total_coupons = coupon_payment * frequency * maturity_years
    total_return = face_value + total_coupons - market_price
    return (total_return / market_price) / maturity_years

def calculate_macaulay_duration(face_value, coupon_payment, frequency, maturity_years, ytm):
    """Calculate Macaulay Duration"""
    periods = maturity_years * frequency
    duration = 0
    price = 0
    
    for i in range(1, int(periods) + 1):
        if i == periods:
            payment = face_value + coupon_payment
        else:
            payment = coupon_payment
        
        pv = payment / ((1 + ytm / frequency) ** i)
        duration += i * pv
        price += pv
    
    return duration / price / frequency

def calculate_convexity(face_value, coupon_payment, frequency, maturity_years, ytm):
    """Calculate Convexity"""
    periods = maturity_years * frequency
    convexity = 0
    price = 0
    
    for i in range(1, int(periods) + 1):
        if i == periods:
            payment = face_value + coupon_payment
        else:
            payment = coupon_payment
        
        pv = payment / ((1 + ytm / frequency) ** i)
        convexity += i * (i + 1) * pv
        price += pv
    
    return convexity / price / (frequency ** 2)

def calculate_forward_rate(spot_rate, base_rate, quote_rate, days):
    """Calculate forward exchange rate"""
    time_factor = days / 365
    return spot_rate * math.exp((quote_rate - base_rate) * time_factor)

def calculate_implied_volatility(option_prices):
    """Calculate implied volatility from option prices"""
    # Simplified calculation
    if not option_prices:
        return 0.2  # Default volatility
    return np.mean(list(option_prices.values()))

def calculate_fx_correlations(base_currency, quote_currency):
    """Calculate FX correlations with major pairs"""
    # Simulated correlations
    major_pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF']
    correlations = {}
    
    for pair in major_pairs:
        if f"{base_currency}/{quote_currency}" != pair:
            correlations[pair] = np.random.uniform(-0.8, 0.8)
    
    return correlations

def calculate_returns(price_data):
    """Calculate returns from price data"""
    prices = np.array(price_data)
    returns = np.diff(prices) / prices[:-1]
    return returns

def calculate_crypto_correlations(symbol, price_data):
    """Calculate crypto correlations with major cryptocurrencies"""
    major_cryptos = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL']
    correlations = {}
    
    for crypto in major_cryptos:
        if crypto != symbol:
            correlations[crypto] = np.random.uniform(-0.5, 0.9)
    
    return correlations

def calculate_volume_metrics(volume_data):
    """Calculate volume metrics"""
    volumes = np.array(volume_data)
    return {
        'avg_volume': np.mean(volumes),
        'volume_volatility': np.std(volumes),
        'volume_trend': np.polyfit(range(len(volumes)), volumes, 1)[0]
    }

def calculate_market_dominance(market_cap, total_market_cap):
    """Calculate market dominance"""
    if total_market_cap > 0:
        return market_cap / total_market_cap
    return 0

def calculate_on_chain_metrics(symbol):
    """Calculate on-chain metrics (simulated)"""
    return {
        'active_addresses': np.random.randint(10000, 1000000),
        'transaction_count': np.random.randint(100000, 10000000),
        'network_hash_rate': np.random.uniform(100, 1000),
        'gas_price': np.random.uniform(10, 100)
    }

def calculate_defi_metrics(symbol):
    """Calculate DeFi metrics (simulated)"""
    return {
        'total_value_locked': np.random.uniform(1000000, 100000000),
        'daily_volume': np.random.uniform(100000, 10000000),
        'apy': np.random.uniform(0.05, 0.5),
        'liquidity_pools': np.random.randint(10, 1000)
    }

def optimize_delta_neutral(positions, constraints):
    """Optimize delta-neutral options portfolio"""
    # Simplified delta-neutral optimization
    total_delta = sum(pos.get('delta', 0) * pos.get('quantity', 0) for pos in positions)
    target_delta = 0
    
    return {
        'current_delta': total_delta,
        'target_delta': target_delta,
        'hedge_required': -total_delta,
        'recommended_actions': []
    }

def optimize_iron_condor(positions, constraints):
    """Optimize iron condor strategy"""
    return {
        'strategy_type': 'iron_condor',
        'max_profit': constraints.get('max_profit', 1000),
        'max_loss': constraints.get('max_loss', 500),
        'breakeven_points': [constraints.get('lower_strike', 100), constraints.get('upper_strike', 110)]
    }

def optimize_butterfly_spread(positions, constraints):
    """Optimize butterfly spread strategy"""
    return {
        'strategy_type': 'butterfly_spread',
        'body_strike': constraints.get('body_strike', 105),
        'wing_strikes': [constraints.get('lower_wing', 100), constraints.get('upper_wing', 110)],
        'max_profit': constraints.get('max_profit', 500)
    }

def optimize_straddle(positions, constraints):
    """Optimize straddle strategy"""
    return {
        'strategy_type': 'straddle',
        'strike_price': constraints.get('strike_price', 100),
        'max_loss': constraints.get('max_loss', 1000),
        'unlimited_profit': True
    }

def calculate_curve_slope(maturities, yields):
    """Calculate yield curve slope"""
    if len(maturities) < 2:
        return 0
    return (yields[-1] - yields[0]) / (maturities[-1] - maturities[0])

def calculate_curve_curvature(maturities, yields):
    """Calculate yield curve curvature"""
    if len(maturities) < 3:
        return 0
    mid_point = len(maturities) // 2
    return 2 * yields[mid_point] - yields[0] - yields[-1]

def interpolate_yield(maturities, yields, target_maturity):
    """Interpolate yield for target maturity"""
    # Simple linear interpolation
    for i in range(len(maturities) - 1):
        if maturities[i] <= target_maturity <= maturities[i + 1]:
            ratio = (target_maturity - maturities[i]) / (maturities[i + 1] - maturities[i])
            return yields[i] + ratio * (yields[i + 1] - yields[i])
    return yields[-1] if target_maturity > maturities[-1] else yields[0]

def calculate_yield_spreads(key_rates):
    """Calculate yield spreads"""
    return {
        '2s10s': key_rates['10y'] - key_rates['2y'],
        '5s30s': key_rates['30y'] - key_rates['5y'],
        '2s5s': key_rates['5y'] - key_rates['2y']
    }
