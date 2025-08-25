from celery import shared_task
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple, Any
import logging
from datetime import datetime, timedelta
import json
import uuid

# Created automatically by Cursor AI (2024-01-XX)

logger = logging.getLogger(__name__)

@shared_task(bind=True, name='order_engine.create_vwap_order')
def create_vwap_order(self, portfolio_weights: Dict[str, float], universe_id: str, order_params: Dict) -> Dict:
    """
    Create VWAP (Volume Weighted Average Price) order with slicing
    
    Args:
        portfolio_weights: Target portfolio weights
        universe_id: Target universe ID
        order_params: Order parameters including slice duration, start time, etc.
    """
    try:
        # Load current portfolio and market data
        current_portfolio = load_current_portfolio(universe_id)
        market_data = load_market_data(universe_id)
        
        # Calculate required trades
        required_trades = calculate_required_trades(current_portfolio, portfolio_weights)
        
        # Generate VWAP order slices
        order_slices = generate_vwap_slices(required_trades, order_params, market_data)
        
        # Create order with slices
        order_id = f"order_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
        order = {
            'order_id': order_id,
            'order_type': 'VWAP',
            'status': 'PENDING',
            'created_at': datetime.now().isoformat(),
            'target_weights': portfolio_weights,
            'total_notional': calculate_total_notional(required_trades, market_data),
            'slices': order_slices,
            'execution_summary': {
                'total_slices': len(order_slices),
                'executed_slices': 0,
                'total_executed': 0.0,
                'total_commission': 0.0,
                'avg_execution_price': 0.0
            }
        }
        
        return {
            'status': 'success',
            'order': order,
            'message': f'VWAP order {order_id} created with {len(order_slices)} slices'
        }
        
    except Exception as e:
        logger.error(f"Error creating VWAP order: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

@shared_task(bind=True, name='order_engine.create_twap_order')
def create_twap_order(self, portfolio_weights: Dict[str, float], universe_id: str, order_params: Dict) -> Dict:
    """
    Create TWAP (Time Weighted Average Price) order with slicing
    
    Args:
        portfolio_weights: Target portfolio weights
        universe_id: Target universe ID
        order_params: Order parameters including slice duration, start time, etc.
    """
    try:
        # Load current portfolio and market data
        current_portfolio = load_current_portfolio(universe_id)
        market_data = load_market_data(universe_id)
        
        # Calculate required trades
        required_trades = calculate_required_trades(current_portfolio, portfolio_weights)
        
        # Generate TWAP order slices
        order_slices = generate_twap_slices(required_trades, order_params, market_data)
        
        # Create order with slices
        order_id = f"order_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
        order = {
            'order_id': order_id,
            'order_type': 'TWAP',
            'status': 'PENDING',
            'created_at': datetime.now().isoformat(),
            'target_weights': portfolio_weights,
            'total_notional': calculate_total_notional(required_trades, market_data),
            'slices': order_slices,
            'execution_summary': {
                'total_slices': len(order_slices),
                'executed_slices': 0,
                'total_executed': 0.0,
                'total_commission': 0.0,
                'avg_execution_price': 0.0
            }
        }
        
        return {
            'status': 'success',
            'order': order,
            'message': f'TWAP order {order_id} created with {len(order_slices)} slices'
        }
        
    except Exception as e:
        logger.error(f"Error creating TWAP order: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

@shared_task(bind=True, name='order_engine.monitor_order_drift')
def monitor_order_drift(self, order_id: str) -> Dict:
    """
    Monitor order execution drift and market impact
    
    Args:
        order_id: Order ID to monitor
    """
    try:
        # Load order and execution data
        order = load_order(order_id)
        execution_data = load_execution_data(order_id)
        market_data = load_market_data(order['universe_id'])
        
        # Calculate drift metrics
        drift_metrics = calculate_drift_metrics(order, execution_data, market_data)
        
        # Check for drift alerts
        alerts = check_drift_alerts(drift_metrics, order['order_params'])
        
        # Update order status if needed
        if alerts:
            order['status'] = 'ALERT'
            order['drift_alerts'] = alerts
        
        return {
            'status': 'success',
            'order_id': order_id,
            'drift_metrics': drift_metrics,
            'alerts': alerts,
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error monitoring order drift: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

@shared_task(bind=True, name='order_engine.execute_order_slice')
def execute_order_slice(self, order_id: str, slice_id: str) -> Dict:
    """
    Execute a single order slice
    
    Args:
        order_id: Order ID
        slice_id: Slice ID to execute
    """
    try:
        # Load order and slice data
        order = load_order(order_id)
        slice_data = next(s for s in order['slices'] if s['slice_id'] == slice_id)
        
        # Simulate execution
        execution_result = simulate_execution(slice_data, order['market_data'])
        
        # Update slice status
        slice_data['status'] = 'EXECUTED'
        slice_data['executed_at'] = datetime.now().isoformat()
        slice_data['execution_price'] = execution_result['avg_price']
        slice_data['executed_quantity'] = execution_result['quantity']
        slice_data['commission'] = execution_result['commission']
        
        # Update order summary
        update_order_summary(order, execution_result)
        
        return {
            'status': 'success',
            'order_id': order_id,
            'slice_id': slice_id,
            'execution_result': execution_result,
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error executing order slice: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

def load_current_portfolio(universe_id: str) -> Dict:
    """Load current portfolio positions"""
    # Simulated portfolio data
    # In production, this would query the database
    
    portfolio = {
        'positions': {},
        'total_value': 10000000,  # $10M portfolio
        'cash': 500000  # $500K cash
    }
    
    # Generate current positions
    symbols = [f'ASSET_{i:03d}' for i in range(1, 51)]
    for symbol in symbols:
        portfolio['positions'][symbol] = {
            'quantity': np.random.randint(1000, 10000),
            'avg_price': np.random.uniform(50, 200),
            'market_value': np.random.uniform(100000, 500000),
            'weight': np.random.uniform(0.01, 0.05)
        }
    
    return portfolio

def load_market_data(universe_id: str) -> Dict:
    """Load market data for order execution"""
    # Simulated market data
    # In production, this would query real-time market data
    
    market_data = {
        'prices': {},
        'volumes': {},
        'bid_ask_spreads': {},
        'market_caps': {}
    }
    
    symbols = [f'ASSET_{i:03d}' for i in range(1, 51)]
    for symbol in symbols:
        market_data['prices'][symbol] = np.random.uniform(50, 200)
        market_data['volumes'][symbol] = np.random.uniform(1000000, 10000000)
        market_data['bid_ask_spreads'][symbol] = np.random.uniform(0.001, 0.01)
        market_data['market_caps'][symbol] = np.random.uniform(1000000000, 10000000000)
    
    return market_data

def calculate_required_trades(current_portfolio: Dict, target_weights: Dict[str, float]) -> Dict[str, float]:
    """Calculate required trades to reach target weights"""
    trades = {}
    total_value = current_portfolio['total_value']
    
    for symbol, target_weight in target_weights.items():
        current_weight = current_portfolio['positions'].get(symbol, {}).get('weight', 0)
        current_value = current_portfolio['positions'].get(symbol, {}).get('market_value', 0)
        
        target_value = total_value * target_weight
        trade_value = target_value - current_value
        
        if abs(trade_value) > 1000:  # Minimum trade size
            trades[symbol] = trade_value
    
    return trades

def generate_vwap_slices(required_trades: Dict[str, float], order_params: Dict, market_data: Dict) -> List[Dict]:
    """Generate VWAP order slices based on volume profile"""
    slices = []
    
    # VWAP parameters
    start_time = order_params.get('start_time', datetime.now())
    end_time = order_params.get('end_time', start_time + timedelta(hours=6))
    slice_duration = order_params.get('slice_duration', timedelta(minutes=30))
    
    # Calculate number of slices
    total_duration = end_time - start_time
    num_slices = int(total_duration / slice_duration)
    
    # Generate volume-weighted slices
    for i in range(num_slices):
        slice_start = start_time + i * slice_duration
        slice_end = slice_start + slice_duration
        
        # Volume profile (higher volume in first and last hour)
        volume_multiplier = calculate_volume_multiplier(slice_start, start_time, end_time)
        
        slice_data = {
            'slice_id': f"slice_{i+1:03d}",
            'start_time': slice_start.isoformat(),
            'end_time': slice_end.isoformat(),
            'status': 'PENDING',
            'volume_multiplier': volume_multiplier,
            'trades': {}
        }
        
        # Distribute trades across slices based on volume
        for symbol, trade_value in required_trades.items():
            slice_trade_value = trade_value * volume_multiplier / num_slices
            if abs(slice_trade_value) > 100:  # Minimum slice size
                slice_data['trades'][symbol] = slice_trade_value
        
        slices.append(slice_data)
    
    return slices

def generate_twap_slices(required_trades: Dict[str, float], order_params: Dict, market_data: Dict) -> List[Dict]:
    """Generate TWAP order slices with equal time distribution"""
    slices = []
    
    # TWAP parameters
    start_time = order_params.get('start_time', datetime.now())
    end_time = order_params.get('end_time', start_time + timedelta(hours=6))
    slice_duration = order_params.get('slice_duration', timedelta(minutes=30))
    
    # Calculate number of slices
    total_duration = end_time - start_time
    num_slices = int(total_duration / slice_duration)
    
    # Generate time-weighted slices
    for i in range(num_slices):
        slice_start = start_time + i * slice_duration
        slice_end = slice_start + slice_duration
        
        slice_data = {
            'slice_id': f"slice_{i+1:03d}",
            'start_time': slice_start.isoformat(),
            'end_time': slice_end.isoformat(),
            'status': 'PENDING',
            'volume_multiplier': 1.0,  # Equal time distribution
            'trades': {}
        }
        
        # Distribute trades equally across slices
        for symbol, trade_value in required_trades.items():
            slice_trade_value = trade_value / num_slices
            if abs(slice_trade_value) > 100:  # Minimum slice size
                slice_data['trades'][symbol] = slice_trade_value
        
        slices.append(slice_data)
    
    return slices

def calculate_volume_multiplier(slice_time: datetime, start_time: datetime, end_time: datetime) -> float:
    """Calculate volume multiplier based on time of day"""
    # Simulate U-shaped volume curve (higher at open/close)
    total_duration = (end_time - start_time).total_seconds() / 3600  # hours
    elapsed_hours = (slice_time - start_time).total_seconds() / 3600
    
    # U-shaped curve: high at beginning and end, low in middle
    if elapsed_hours < 1 or elapsed_hours > total_duration - 1:
        return 1.5  # Higher volume at start/end
    else:
        return 0.7  # Lower volume in middle

def calculate_total_notional(required_trades: Dict[str, float], market_data: Dict) -> float:
    """Calculate total notional value of trades"""
    return sum(abs(trade_value) for trade_value in required_trades.values())

def load_order(order_id: str) -> Dict:
    """Load order data"""
    # Simulated order data
    # In production, this would query the database
    
    return {
        'order_id': order_id,
        'order_type': 'VWAP',
        'status': 'PENDING',
        'universe_id': 'universe_001',
        'order_params': {
            'start_time': datetime.now(),
            'end_time': datetime.now() + timedelta(hours=6),
            'slice_duration': timedelta(minutes=30)
        },
        'market_data': load_market_data('universe_001'),
        'slices': []
    }

def load_execution_data(order_id: str) -> Dict:
    """Load order execution data"""
    # Simulated execution data
    # In production, this would query the database
    
    return {
        'executed_slices': [],
        'total_executed': 0.0,
        'total_commission': 0.0,
        'avg_execution_price': 0.0
    }

def calculate_drift_metrics(order: Dict, execution_data: Dict, market_data: Dict) -> Dict:
    """Calculate order execution drift metrics"""
    metrics = {
        'price_drift': {},
        'volume_drift': {},
        'timing_drift': {},
        'market_impact': {}
    }
    
    # Calculate price drift for each symbol
    for symbol in order.get('target_weights', {}).keys():
        if symbol in market_data['prices']:
            # Simulate price drift calculation
            metrics['price_drift'][symbol] = np.random.uniform(-0.02, 0.02)  # ±2%
            metrics['volume_drift'][symbol] = np.random.uniform(-0.1, 0.1)   # ±10%
            metrics['timing_drift'][symbol] = np.random.uniform(-300, 300)   # ±5 minutes
            metrics['market_impact'][symbol] = np.random.uniform(0.001, 0.005)  # 0.1-0.5%
    
    return metrics

def check_drift_alerts(drift_metrics: Dict, order_params: Dict) -> List[Dict]:
    """Check for drift alerts based on thresholds"""
    alerts = []
    
    # Price drift alerts
    for symbol, drift in drift_metrics['price_drift'].items():
        if abs(drift) > 0.01:  # 1% threshold
            alerts.append({
                'type': 'PRICE_DRIFT',
                'symbol': symbol,
                'value': drift,
                'threshold': 0.01,
                'severity': 'HIGH' if abs(drift) > 0.02 else 'MEDIUM'
            })
    
    # Volume drift alerts
    for symbol, drift in drift_metrics['volume_drift'].items():
        if abs(drift) > 0.05:  # 5% threshold
            alerts.append({
                'type': 'VOLUME_DRIFT',
                'symbol': symbol,
                'value': drift,
                'threshold': 0.05,
                'severity': 'HIGH' if abs(drift) > 0.1 else 'MEDIUM'
            })
    
    # Timing drift alerts
    for symbol, drift in drift_metrics['timing_drift'].items():
        if abs(drift) > 180:  # 3 minutes threshold
            alerts.append({
                'type': 'TIMING_DRIFT',
                'symbol': symbol,
                'value': drift,
                'threshold': 180,
                'severity': 'HIGH' if abs(drift) > 300 else 'MEDIUM'
            })
    
    return alerts

def simulate_execution(slice_data: Dict, market_data: Dict) -> Dict:
    """Simulate order slice execution"""
    total_quantity = 0
    total_value = 0
    total_commission = 0
    
    for symbol, trade_value in slice_data['trades'].items():
        if symbol in market_data['prices']:
            price = market_data['prices'][symbol]
            quantity = trade_value / price
            commission = abs(trade_value) * 0.001  # 0.1% commission
            
            total_quantity += abs(quantity)
            total_value += abs(trade_value)
            total_commission += commission
    
    avg_price = total_value / total_quantity if total_quantity > 0 else 0
    
    return {
        'quantity': total_quantity,
        'avg_price': avg_price,
        'commission': total_commission,
        'execution_time': datetime.now().isoformat()
    }

def update_order_summary(order: Dict, execution_result: Dict):
    """Update order execution summary"""
    summary = order['execution_summary']
    summary['executed_slices'] += 1
    summary['total_executed'] += execution_result['quantity']
    summary['total_commission'] += execution_result['commission']
    
    # Update average execution price
    if summary['total_executed'] > 0:
        summary['avg_execution_price'] = (
            (summary['avg_execution_price'] * (summary['executed_slices'] - 1) + execution_result['avg_price']) 
            / summary['executed_slices']
        )

@shared_task(bind=True, name='order_engine.get_order_status')
def get_order_status(self, order_id: str) -> Dict:
    """Get comprehensive order status and execution summary"""
    try:
        order = load_order(order_id)
        execution_data = load_execution_data(order_id)
        
        # Calculate execution progress
        total_slices = len(order.get('slices', []))
        executed_slices = len(execution_data.get('executed_slices', []))
        progress = (executed_slices / total_slices * 100) if total_slices > 0 else 0
        
        # Determine order status
        if progress >= 100:
            status = 'COMPLETED'
        elif progress > 0:
            status = 'IN_PROGRESS'
        else:
            status = 'PENDING'
        
        return {
            'status': 'success',
            'order_id': order_id,
            'order_status': status,
            'progress': progress,
            'execution_summary': execution_data,
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting order status: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise
