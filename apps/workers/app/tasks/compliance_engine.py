from celery import shared_task
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple, Any
import logging
from datetime import datetime, timedelta
import json

# Created automatically by Cursor AI (2024-01-XX)

logger = logging.getLogger(__name__)

@shared_task(bind=True, name='compliance_engine.run_pre_trade_checks')
def run_pre_trade_checks(self, portfolio_weights: Dict[str, float], universe_id: str, ruleset_id: str) -> Dict:
    """
    Run comprehensive pre-trade compliance checks
    
    Args:
        portfolio_weights: Proposed portfolio weights
        universe_id: Target universe ID
        ruleset_id: Compliance ruleset ID
    """
    try:
        # Load portfolio data and ruleset
        portfolio_data = load_portfolio_data(universe_id, portfolio_weights)
        ruleset = load_ruleset(ruleset_id)
        
        # Run compliance checks
        check_results = {}
        
        # Position-level checks
        check_results['position_limits'] = check_position_limits(portfolio_data, ruleset)
        check_results['restricted_securities'] = check_restricted_securities(portfolio_data, ruleset)
        check_results['watchlist_securities'] = check_watchlist_securities(portfolio_data, ruleset)
        
        # Portfolio-level checks
        check_results['leverage_limits'] = check_leverage_limits(portfolio_data, ruleset)
        check_results['beta_limits'] = check_beta_limits(portfolio_data, ruleset)
        check_results['sector_limits'] = check_sector_limits(portfolio_data, ruleset)
        check_results['liquidity_requirements'] = check_liquidity_requirements(portfolio_data, ruleset)
        check_results['concentration_limits'] = check_concentration_limits(portfolio_data, ruleset)
        
        # Risk-based checks
        check_results['var_limits'] = check_var_limits(portfolio_data, ruleset)
        check_results['tracking_error_limits'] = check_tracking_error_limits(portfolio_data, ruleset)
        
        # ESG and regulatory checks
        check_results['esg_requirements'] = check_esg_requirements(portfolio_data, ruleset)
        check_results['regulatory_limits'] = check_regulatory_limits(portfolio_data, ruleset)
        
        # Calculate overall compliance status
        overall_status = calculate_compliance_status(check_results)
        
        # Generate compliance report
        compliance_report = generate_compliance_report(check_results, overall_status)
        
        return {
            'status': 'success',
            'overall_status': overall_status,
            'check_results': check_results,
            'compliance_report': compliance_report,
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error running pre-trade checks: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

def load_portfolio_data(universe_id: str, weights: Dict[str, float]) -> Dict:
    """Load portfolio data for compliance checks"""
    # Simulated data loading
    # In production, this would query the database
    
    portfolio_data = {
        'positions': {},
        'portfolio_stats': {},
        'sector_exposures': {},
        'risk_metrics': {}
    }
    
    # Generate position data
    for symbol, weight in weights.items():
        portfolio_data['positions'][symbol] = {
            'weight': weight,
            'market_cap': np.random.lognormal(20, 1),
            'sector': np.random.choice(['Technology', 'Healthcare', 'Finance', 'Consumer', 'Energy', 'Utilities', 'Materials']),
            'country': np.random.choice(['US', 'UK', 'JP', 'DE', 'FR', 'CA']),
            'esg_score': np.random.uniform(0, 100),
            'adv_ratio': np.random.uniform(0.001, 0.1),
            'beta': np.random.normal(1.0, 0.3),
            'volatility': np.random.uniform(0.15, 0.45),
            'is_restricted': np.random.choice([True, False], p=[0.05, 0.95]),
            'is_watchlist': np.random.choice([True, False], p=[0.1, 0.9])
        }
    
    # Calculate portfolio statistics
    total_weight = sum(weights.values())
    portfolio_data['portfolio_stats'] = {
        'total_weight': total_weight,
        'gross_exposure': sum(abs(w) for w in weights.values()),
        'net_exposure': total_weight,
        'leverage': sum(abs(w) for w in weights.values()) / abs(total_weight) if total_weight != 0 else 0,
        'num_positions': len(weights)
    }
    
    # Calculate sector exposures
    sector_exposures = {}
    for symbol, data in portfolio_data['positions'].items():
        sector = data['sector']
        sector_exposures[sector] = sector_exposures.get(sector, 0) + data['weight']
    portfolio_data['sector_exposures'] = sector_exposures
    
    # Calculate risk metrics
    portfolio_data['risk_metrics'] = {
        'portfolio_beta': sum(data['beta'] * data['weight'] for data in portfolio_data['positions'].values()),
        'portfolio_var_95': -0.025,  # Simulated
        'tracking_error': 0.045,  # Simulated
        'concentration_index': sum(w ** 2 for w in weights.values())
    }
    
    return portfolio_data

def load_ruleset(ruleset_id: str) -> Dict:
    """Load compliance ruleset"""
    # Simulated ruleset loading
    # In production, this would query the database
    
    rulesets = {
        'long_only_fund': {
            'name': 'Long-Only Fund',
            'description': 'Standard long-only fund compliance rules',
            'position_limits': {
                'max_single_position': 0.05,
                'min_position_size': 0.001,
                'max_short_position': 0.0
            },
            'sector_limits': {
                'max_sector_weight': 0.30,
                'min_sector_weight': 0.0
            },
            'leverage_limits': {
                'max_gross_exposure': 1.0,
                'max_net_exposure': 1.0
            },
            'risk_limits': {
                'max_portfolio_beta': 1.2,
                'max_var_95': -0.03,
                'max_tracking_error': 0.05
            },
            'liquidity_requirements': {
                'min_adv_ratio': 0.01,
                'max_illiquid_weight': 0.20
            },
            'concentration_limits': {
                'max_concentration_index': 0.15
            },
            'restricted_securities': ['TOXIC_STOCK', 'SANCTIONED_ENTITY'],
            'watchlist_securities': ['VOLATILE_STOCK', 'LOW_LIQUIDITY'],
            'esg_requirements': {
                'min_esg_score': 50,
                'exclude_controversial': True
            }
        },
        'long_short_fund': {
            'name': 'Long-Short Fund',
            'description': 'Long-short fund with leverage',
            'position_limits': {
                'max_single_position': 0.08,
                'min_position_size': 0.001,
                'max_short_position': -0.05
            },
            'sector_limits': {
                'max_sector_weight': 0.40,
                'min_sector_weight': -0.20
            },
            'leverage_limits': {
                'max_gross_exposure': 2.0,
                'max_net_exposure': 0.5
            },
            'risk_limits': {
                'max_portfolio_beta': 0.8,
                'max_var_95': -0.04,
                'max_tracking_error': 0.08
            },
            'liquidity_requirements': {
                'min_adv_ratio': 0.005,
                'max_illiquid_weight': 0.30
            },
            'concentration_limits': {
                'max_concentration_index': 0.20
            },
            'restricted_securities': ['TOXIC_STOCK', 'SANCTIONED_ENTITY'],
            'watchlist_securities': ['VOLATILE_STOCK', 'LOW_LIQUIDITY'],
            'esg_requirements': {
                'min_esg_score': 30,
                'exclude_controversial': False
            }
        }
    }
    
    return rulesets.get(ruleset_id, rulesets['long_only_fund'])

def check_position_limits(portfolio_data: Dict, ruleset: Dict) -> Dict:
    """Check position size limits"""
    results = {
        'status': 'PASS',
        'violations': [],
        'warnings': []
    }
    
    max_single = ruleset['position_limits']['max_single_position']
    min_position = ruleset['position_limits']['min_position_size']
    max_short = ruleset['position_limits']['max_short_position']
    
    for symbol, data in portfolio_data['positions'].items():
        weight = data['weight']
        
        # Check maximum position size
        if abs(weight) > max_single:
            results['violations'].append({
                'symbol': symbol,
                'rule': 'max_single_position',
                'current': weight,
                'limit': max_single,
                'message': f'Position {symbol} exceeds maximum size limit'
            })
        
        # Check minimum position size
        if abs(weight) > 0 and abs(weight) < min_position:
            results['warnings'].append({
                'symbol': symbol,
                'rule': 'min_position_size',
                'current': weight,
                'limit': min_position,
                'message': f'Position {symbol} below minimum size threshold'
            })
        
        # Check short position limits
        if weight < max_short:
            results['violations'].append({
                'symbol': symbol,
                'rule': 'max_short_position',
                'current': weight,
                'limit': max_short,
                'message': f'Short position {symbol} exceeds limit'
            })
    
    if results['violations']:
        results['status'] = 'FAIL'
    elif results['warnings']:
        results['status'] = 'WARNING'
    
    return results

def check_restricted_securities(portfolio_data: Dict, ruleset: Dict) -> Dict:
    """Check for restricted securities"""
    results = {
        'status': 'PASS',
        'violations': [],
        'warnings': []
    }
    
    restricted_list = ruleset['restricted_securities']
    
    for symbol, data in portfolio_data['positions'].items():
        if data['is_restricted'] or symbol in restricted_list:
            results['violations'].append({
                'symbol': symbol,
                'rule': 'restricted_securities',
                'current': data['weight'],
                'limit': 0,
                'message': f'Security {symbol} is on restricted list'
            })
    
    if results['violations']:
        results['status'] = 'FAIL'
    
    return results

def check_watchlist_securities(portfolio_data: Dict, ruleset: Dict) -> Dict:
    """Check for watchlist securities"""
    results = {
        'status': 'PASS',
        'violations': [],
        'warnings': []
    }
    
    watchlist = ruleset['watchlist_securities']
    
    for symbol, data in portfolio_data['positions'].items():
        if data['is_watchlist'] or symbol in watchlist:
            results['warnings'].append({
                'symbol': symbol,
                'rule': 'watchlist_securities',
                'current': data['weight'],
                'limit': 'N/A',
                'message': f'Security {symbol} is on watchlist'
            })
    
    if results['warnings']:
        results['status'] = 'WARNING'
    
    return results

def check_leverage_limits(portfolio_data: Dict, ruleset: Dict) -> Dict:
    """Check leverage limits"""
    results = {
        'status': 'PASS',
        'violations': [],
        'warnings': []
    }
    
    stats = portfolio_data['portfolio_stats']
    limits = ruleset['leverage_limits']
    
    # Check gross exposure
    if stats['gross_exposure'] > limits['max_gross_exposure']:
        results['violations'].append({
            'rule': 'max_gross_exposure',
            'current': stats['gross_exposure'],
            'limit': limits['max_gross_exposure'],
            'message': f'Gross exposure {stats["gross_exposure"]:.2%} exceeds limit {limits["max_gross_exposure"]:.2%}'
        })
    
    # Check net exposure
    if abs(stats['net_exposure']) > limits['max_net_exposure']:
        results['violations'].append({
            'rule': 'max_net_exposure',
            'current': stats['net_exposure'],
            'limit': limits['max_net_exposure'],
            'message': f'Net exposure {stats["net_exposure"]:.2%} exceeds limit {limits["max_net_exposure"]:.2%}'
        })
    
    if results['violations']:
        results['status'] = 'FAIL'
    
    return results

def check_beta_limits(portfolio_data: Dict, ruleset: Dict) -> Dict:
    """Check beta limits"""
    results = {
        'status': 'PASS',
        'violations': [],
        'warnings': []
    }
    
    portfolio_beta = portfolio_data['risk_metrics']['portfolio_beta']
    max_beta = ruleset['risk_limits']['max_portfolio_beta']
    
    if abs(portfolio_beta) > max_beta:
        results['violations'].append({
            'rule': 'max_portfolio_beta',
            'current': portfolio_beta,
            'limit': max_beta,
            'message': f'Portfolio beta {portfolio_beta:.2f} exceeds limit {max_beta:.2f}'
        })
    
    if results['violations']:
        results['status'] = 'FAIL'
    
    return results

def check_sector_limits(portfolio_data: Dict, ruleset: Dict) -> Dict:
    """Check sector concentration limits"""
    results = {
        'status': 'PASS',
        'violations': [],
        'warnings': []
    }
    
    sector_exposures = portfolio_data['sector_exposures']
    max_sector = ruleset['sector_limits']['max_sector_weight']
    min_sector = ruleset['sector_limits']['min_sector_weight']
    
    for sector, exposure in sector_exposures.items():
        if exposure > max_sector:
            results['violations'].append({
                'sector': sector,
                'rule': 'max_sector_weight',
                'current': exposure,
                'limit': max_sector,
                'message': f'Sector {sector} exposure {exposure:.2%} exceeds limit {max_sector:.2%}'
            })
        elif exposure < min_sector:
            results['violations'].append({
                'sector': sector,
                'rule': 'min_sector_weight',
                'current': exposure,
                'limit': min_sector,
                'message': f'Sector {sector} exposure {exposure:.2%} below limit {min_sector:.2%}'
            })
    
    if results['violations']:
        results['status'] = 'FAIL'
    
    return results

def check_liquidity_requirements(portfolio_data: Dict, ruleset: Dict) -> Dict:
    """Check liquidity requirements"""
    results = {
        'status': 'PASS',
        'violations': [],
        'warnings': []
    }
    
    min_adv_ratio = ruleset['liquidity_requirements']['min_adv_ratio']
    max_illiquid = ruleset['liquidity_requirements']['max_illiquid_weight']
    
    illiquid_weight = 0
    
    for symbol, data in portfolio_data['positions'].items():
        if data['adv_ratio'] < min_adv_ratio:
            results['warnings'].append({
                'symbol': symbol,
                'rule': 'min_adv_ratio',
                'current': data['adv_ratio'],
                'limit': min_adv_ratio,
                'message': f'Security {symbol} has low liquidity (ADV ratio: {data["adv_ratio"]:.3f})'
            })
            illiquid_weight += abs(data['weight'])
    
    if illiquid_weight > max_illiquid:
        results['violations'].append({
            'rule': 'max_illiquid_weight',
            'current': illiquid_weight,
            'limit': max_illiquid,
            'message': f'Illiquid weight {illiquid_weight:.2%} exceeds limit {max_illiquid:.2%}'
        })
    
    if results['violations']:
        results['status'] = 'FAIL'
    elif results['warnings']:
        results['status'] = 'WARNING'
    
    return results

def check_concentration_limits(portfolio_data: Dict, ruleset: Dict) -> Dict:
    """Check concentration limits"""
    results = {
        'status': 'PASS',
        'violations': [],
        'warnings': []
    }
    
    concentration_index = portfolio_data['risk_metrics']['concentration_index']
    max_concentration = ruleset['concentration_limits']['max_concentration_index']
    
    if concentration_index > max_concentration:
        results['violations'].append({
            'rule': 'max_concentration_index',
            'current': concentration_index,
            'limit': max_concentration,
            'message': f'Concentration index {concentration_index:.3f} exceeds limit {max_concentration:.3f}'
        })
    
    if results['violations']:
        results['status'] = 'FAIL'
    
    return results

def check_var_limits(portfolio_data: Dict, ruleset: Dict) -> Dict:
    """Check VaR limits"""
    results = {
        'status': 'PASS',
        'violations': [],
        'warnings': []
    }
    
    portfolio_var = portfolio_data['risk_metrics']['portfolio_var_95']
    max_var = ruleset['risk_limits']['max_var_95']
    
    if portfolio_var < max_var:
        results['violations'].append({
            'rule': 'max_var_95',
            'current': portfolio_var,
            'limit': max_var,
            'message': f'Portfolio VaR {portfolio_var:.2%} exceeds limit {max_var:.2%}'
        })
    
    if results['violations']:
        results['status'] = 'FAIL'
    
    return results

def check_tracking_error_limits(portfolio_data: Dict, ruleset: Dict) -> Dict:
    """Check tracking error limits"""
    results = {
        'status': 'PASS',
        'violations': [],
        'warnings': []
    }
    
    tracking_error = portfolio_data['risk_metrics']['tracking_error']
    max_te = ruleset['risk_limits']['max_tracking_error']
    
    if tracking_error > max_te:
        results['violations'].append({
            'rule': 'max_tracking_error',
            'current': tracking_error,
            'limit': max_te,
            'message': f'Tracking error {tracking_error:.2%} exceeds limit {max_te:.2%}'
        })
    
    if results['violations']:
        results['status'] = 'FAIL'
    
    return results

def check_esg_requirements(portfolio_data: Dict, ruleset: Dict) -> Dict:
    """Check ESG requirements"""
    results = {
        'status': 'PASS',
        'violations': [],
        'warnings': []
    }
    
    min_esg_score = ruleset['esg_requirements']['min_esg_score']
    
    for symbol, data in portfolio_data['positions'].items():
        if data['esg_score'] < min_esg_score:
            results['warnings'].append({
                'symbol': symbol,
                'rule': 'min_esg_score',
                'current': data['esg_score'],
                'limit': min_esg_score,
                'message': f'Security {symbol} has low ESG score ({data["esg_score"]:.1f})'
            })
    
    if results['warnings']:
        results['status'] = 'WARNING'
    
    return results

def check_regulatory_limits(portfolio_data: Dict, ruleset: Dict) -> Dict:
    """Check regulatory limits"""
    results = {
        'status': 'PASS',
        'violations': [],
        'warnings': []
    }
    
    # Simulated regulatory checks
    # In production, this would check against regulatory databases
    
    for symbol, data in portfolio_data['positions'].items():
        # Check for sanctioned countries
        if data['country'] in ['IR', 'KP', 'CU']:  # Iran, North Korea, Cuba
            results['violations'].append({
                'symbol': symbol,
                'rule': 'sanctioned_country',
                'current': data['country'],
                'limit': 'N/A',
                'message': f'Security {symbol} from sanctioned country {data["country"]}'
            })
    
    if results['violations']:
        results['status'] = 'FAIL'
    
    return results

def calculate_compliance_status(check_results: Dict) -> str:
    """Calculate overall compliance status"""
    has_failures = any(result['status'] == 'FAIL' for result in check_results.values())
    has_warnings = any(result['status'] == 'WARNING' for result in check_results.values())
    
    if has_failures:
        return 'BLOCK'
    elif has_warnings:
        return 'REVIEW'
    else:
        return 'OK'

def generate_compliance_report(check_results: Dict, overall_status: str) -> Dict:
    """Generate comprehensive compliance report"""
    report = {
        'overall_status': overall_status,
        'summary': {
            'total_checks': len(check_results),
            'passed_checks': sum(1 for r in check_results.values() if r['status'] == 'PASS'),
            'warning_checks': sum(1 for r in check_results.values() if r['status'] == 'WARNING'),
            'failed_checks': sum(1 for r in check_results.values() if r['status'] == 'FAIL')
        },
        'violations': [],
        'warnings': [],
        'recommendations': []
    }
    
    # Collect all violations and warnings
    for check_name, result in check_results.items():
        for violation in result.get('violations', []):
            violation['check_type'] = check_name
            report['violations'].append(violation)
        
        for warning in result.get('warnings', []):
            warning['check_type'] = check_name
            report['warnings'].append(warning)
    
    # Generate recommendations
    if report['violations']:
        report['recommendations'].append('Address all violations before proceeding with trade')
    
    if report['warnings']:
        report['recommendations'].append('Review warnings and consider adjustments')
    
    if overall_status == 'OK':
        report['recommendations'].append('All compliance checks passed - trade can proceed')
    
    return report

@shared_task(bind=True, name='compliance_engine.request_exception')
def request_exception(self, violation_id: str, justification: str, user_id: str) -> Dict:
    """Request exception for a compliance violation"""
    try:
        # In production, this would create an exception request in the database
        exception_request = {
            'id': f'exc_{datetime.now().strftime("%Y%m%d_%H%M%S")}',
            'violation_id': violation_id,
            'justification': justification,
            'user_id': user_id,
            'status': 'PENDING',
            'timestamp': datetime.now().isoformat(),
            'reviewed_by': None,
            'reviewed_at': None,
            'approved': None
        }
        
        return {
            'status': 'success',
            'exception_request': exception_request,
            'message': 'Exception request submitted for review'
        }
        
    except Exception as e:
        logger.error(f"Error requesting exception: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise
