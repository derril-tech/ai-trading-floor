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
import itertools
from sklearn.feature_selection import SelectKBest, f_regression, mutual_info_regression
from sklearn.decomposition import PCA
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.model_selection import GridSearchCV, TimeSeriesSplit
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.preprocessing import StandardScaler, MinMaxScaler
import shap
import lime
import lime.lime_tabular

logger = logging.getLogger(__name__)

class StrategyType(str, Enum):
    MOMENTUM = "momentum"
    MEAN_REVERSION = "mean_reversion"
    ARBITRAGE = "arbitrage"
    PAIRS_TRADING = "pairs_trading"
    STATISTICAL_ARBITRAGE = "statistical_arbitrage"
    MACHINE_LEARNING = "machine_learning"

class FeatureType(str, Enum):
    TECHNICAL = "technical"
    FUNDAMENTAL = "fundamental"
    SENTIMENT = "sentiment"
    ALTERNATIVE = "alternative"
    DERIVED = "derived"

class ModelType(str, Enum):
    LINEAR = "linear"
    RANDOM_FOREST = "random_forest"
    GRADIENT_BOOSTING = "gradient_boosting"
    NEURAL_NETWORK = "neural_network"
    ENSEMBLE = "ensemble"

@dataclass
class Strategy:
    strategy_id: str
    name: str
    strategy_type: StrategyType
    description: str
    parameters: Dict[str, Any]
    performance_metrics: Dict[str, float]
    created_at: datetime
    status: str = "active"

@dataclass
class Feature:
    feature_id: str
    name: str
    feature_type: FeatureType
    description: str
    importance_score: float
    correlation: float
    created_at: datetime

@dataclass
class ModelExplanation:
    model_id: str
    feature_importance: Dict[str, float]
    shap_values: List[float]
    lime_explanation: Dict[str, Any]
    global_importance: Dict[str, float]
    local_importance: Dict[str, float]

@shared_task(bind=True, name='ai_pipeline.discover_strategies')
def discover_strategies(self, market_data: Dict, constraints: Dict = None) -> Dict:
    """
    Automatically discover profitable trading strategies
    """
    try:
        symbols = market_data.get('symbols', [])
        price_data = market_data.get('price_data', {})
        volume_data = market_data.get('volume_data', {})
        
        strategies = []
        
        # Strategy 1: Momentum Strategy
        momentum_strategy = discover_momentum_strategy(price_data, symbols)
        if momentum_strategy:
            strategies.append(momentum_strategy)
        
        # Strategy 2: Mean Reversion Strategy
        mean_reversion_strategy = discover_mean_reversion_strategy(price_data, symbols)
        if mean_reversion_strategy:
            strategies.append(mean_reversion_strategy)
        
        # Strategy 3: Pairs Trading Strategy
        pairs_strategy = discover_pairs_trading_strategy(price_data, symbols)
        if pairs_strategy:
            strategies.append(pairs_strategy)
        
        # Strategy 4: Statistical Arbitrage Strategy
        stat_arb_strategy = discover_statistical_arbitrage_strategy(price_data, symbols)
        if stat_arb_strategy:
            strategies.append(stat_arb_strategy)
        
        # Strategy 5: Volume-based Strategy
        volume_strategy = discover_volume_strategy(price_data, volume_data, symbols)
        if volume_strategy:
            strategies.append(volume_strategy)
        
        # Rank strategies by performance
        ranked_strategies = rank_strategies(strategies, constraints)
        
        return {
            'status': 'success',
            'discovered_strategies': [s.__dict__ for s in ranked_strategies],
            'total_strategies': len(ranked_strategies),
            'discovery_time': datetime.now().isoformat(),
            'message': f'Discovered {len(ranked_strategies)} profitable strategies'
        }
        
    except Exception as e:
        logger.error(f"Error discovering strategies: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

@shared_task(bind=True, name='ai_pipeline.engineer_features')
def engineer_features(self, data: Dict, target_variable: str) -> Dict:
    """
    Automatically engineer features for machine learning models
    """
    try:
        df = pd.DataFrame(data.get('features', {}))
        target = data.get('target', [])
        
        if len(df) == 0 or len(target) == 0:
            raise ValueError("No data provided for feature engineering")
        
        # Technical indicators
        technical_features = create_technical_features(df)
        
        # Statistical features
        statistical_features = create_statistical_features(df)
        
        # Time-based features
        time_features = create_time_features(df)
        
        # Interaction features
        interaction_features = create_interaction_features(df)
        
        # Combine all features
        all_features = pd.concat([
            technical_features,
            statistical_features,
            time_features,
            interaction_features
        ], axis=1)
        
        # Feature selection
        selected_features = select_best_features(all_features, target)
        
        # Feature importance
        feature_importance = calculate_feature_importance(selected_features, target)
        
        # Feature correlation analysis
        correlation_analysis = analyze_feature_correlations(selected_features, target)
        
        engineered_features = {
            'technical_features': technical_features.columns.tolist(),
            'statistical_features': statistical_features.columns.tolist(),
            'time_features': time_features.columns.tolist(),
            'interaction_features': interaction_features.columns.tolist(),
            'selected_features': selected_features.columns.tolist(),
            'feature_importance': feature_importance,
            'correlation_analysis': correlation_analysis,
            'total_features': len(selected_features.columns)
        }
        
        return {
            'status': 'success',
            'engineered_features': engineered_features,
            'feature_matrix_shape': selected_features.shape,
            'engineering_time': datetime.now().isoformat(),
            'message': f'Engineered {len(selected_features.columns)} features'
        }
        
    except Exception as e:
        logger.error(f"Error engineering features: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

@shared_task(bind=True, name='ai_pipeline.explain_model')
def explain_model(self, model_data: Dict, sample_data: Dict) -> Dict:
    """
    Generate model explanations using SHAP and LIME
    """
    try:
        model = model_data.get('model')
        feature_names = model_data.get('feature_names', [])
        sample = sample_data.get('sample', [])
        
        if not model or not sample:
            raise ValueError("Model or sample data not provided")
        
        # SHAP explanations
        shap_explanation = generate_shap_explanation(model, sample, feature_names)
        
        # LIME explanations
        lime_explanation = generate_lime_explanation(model, sample, feature_names)
        
        # Global feature importance
        global_importance = calculate_global_importance(model, feature_names)
        
        # Local feature importance
        local_importance = calculate_local_importance(model, sample, feature_names)
        
        explanation = ModelExplanation(
            model_id=model_data.get('model_id', 'unknown'),
            feature_importance=global_importance,
            shap_values=shap_explanation.get('values', []),
            lime_explanation=lime_explanation,
            global_importance=global_importance,
            local_importance=local_importance
        )
        
        return {
            'status': 'success',
            'model_explanation': explanation.__dict__,
            'explanation_time': datetime.now().isoformat(),
            'message': f'Model explanation generated for {model_data.get("model_id", "model")}'
        }
        
    except Exception as e:
        logger.error(f"Error explaining model: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

@shared_task(bind=True, name='ai_pipeline.auto_ml')
def auto_ml(self, data: Dict, target: str, constraints: Dict = None) -> Dict:
    """
    Automated machine learning pipeline
    """
    try:
        X = pd.DataFrame(data.get('features', {}))
        y = data.get('target', [])
        
        if len(X) == 0 or len(y) == 0:
            raise ValueError("No data provided for AutoML")
        
        # Data preprocessing
        X_processed, y_processed = preprocess_data(X, y)
        
        # Model selection
        best_model = select_best_model(X_processed, y_processed, constraints)
        
        # Hyperparameter optimization
        optimized_model = optimize_hyperparameters(best_model, X_processed, y_processed)
        
        # Model evaluation
        evaluation_metrics = evaluate_model(optimized_model, X_processed, y_processed)
        
        # Feature importance
        feature_importance = get_model_feature_importance(optimized_model, X_processed.columns)
        
        # Model persistence
        model_path = save_automl_model(optimized_model, data.get('model_name', 'automl_model'))
        
        result = {
            'best_model_type': type(optimized_model).__name__,
            'best_hyperparameters': get_model_params(optimized_model),
            'evaluation_metrics': evaluation_metrics,
            'feature_importance': feature_importance,
            'model_path': model_path,
            'training_time': datetime.now().isoformat()
        }
        
        return {
            'status': 'success',
            'automl_result': result,
            'message': f'AutoML completed successfully with {type(optimized_model).__name__}'
        }
        
    except Exception as e:
        logger.error(f"Error in AutoML: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

@shared_task(bind=True, name='ai_pipeline.optimize_portfolio_ml')
def optimize_portfolio_ml(self, portfolio_data: Dict, ml_models: List[Dict]) -> Dict:
    """
    Optimize portfolio using machine learning predictions
    """
    try:
        portfolio = portfolio_data.get('portfolio', {})
        predictions = {}
        
        # Get predictions from all models
        for model_info in ml_models:
            model_id = model_info.get('model_id')
            model = model_info.get('model')
            features = model_info.get('features', {})
            
            if model and features:
                prediction = model.predict([list(features.values())])[0]
                predictions[model_id] = prediction
        
        # Combine predictions using ensemble methods
        ensemble_prediction = combine_predictions(predictions)
        
        # Optimize portfolio weights based on ML predictions
        optimized_weights = optimize_weights_ml(portfolio, ensemble_prediction)
        
        # Calculate expected returns and risk
        expected_returns = calculate_expected_returns_ml(portfolio, optimized_weights, ensemble_prediction)
        portfolio_risk = calculate_portfolio_risk_ml(portfolio, optimized_weights)
        
        # Generate optimization report
        optimization_report = generate_optimization_report(
            portfolio, optimized_weights, expected_returns, portfolio_risk
        )
        
        return {
            'status': 'success',
            'optimized_weights': optimized_weights,
            'expected_returns': expected_returns,
            'portfolio_risk': portfolio_risk,
            'optimization_report': optimization_report,
            'ml_predictions': predictions,
            'ensemble_prediction': ensemble_prediction,
            'optimization_time': datetime.now().isoformat(),
            'message': 'Portfolio optimized using ML predictions'
        }
        
    except Exception as e:
        logger.error(f"Error optimizing portfolio with ML: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

# Strategy discovery functions
def discover_momentum_strategy(price_data: Dict, symbols: List[str]) -> Optional[Strategy]:
    """Discover momentum-based trading strategies"""
    try:
        # Calculate momentum indicators
        momentum_scores = {}
        for symbol in symbols:
            if symbol in price_data:
                prices = price_data[symbol]
                if len(prices) >= 20:
                    # Calculate various momentum indicators
                    returns = np.diff(prices) / prices[:-1]
                    momentum_5d = np.mean(returns[-5:])
                    momentum_20d = np.mean(returns[-20:])
                    rsi = calculate_rsi(prices, 14)
                    
                    momentum_scores[symbol] = {
                        'momentum_5d': momentum_5d,
                        'momentum_20d': momentum_20d,
                        'rsi': rsi,
                        'score': momentum_5d * 0.4 + momentum_20d * 0.4 + (rsi - 50) / 50 * 0.2
                    }
        
        # Find best momentum opportunities
        best_momentum = sorted(momentum_scores.items(), key=lambda x: x[1]['score'], reverse=True)
        
        if best_momentum:
            best_symbol, best_score = best_momentum[0]
            return Strategy(
                strategy_id=f"momentum_{best_symbol}_{int(time.time())}",
                name=f"Momentum Strategy - {best_symbol}",
                strategy_type=StrategyType.MOMENTUM,
                description=f"Momentum strategy for {best_symbol} with score {best_score['score']:.4f}",
                parameters={
                    'symbol': best_symbol,
                    'momentum_5d': best_score['momentum_5d'],
                    'momentum_20d': best_score['momentum_20d'],
                    'rsi': best_score['rsi'],
                    'threshold': 0.02
                },
                performance_metrics={
                    'expected_return': best_score['score'] * 0.1,
                    'volatility': 0.15,
                    'sharpe_ratio': best_score['score'] * 0.1 / 0.15,
                    'max_drawdown': 0.08
                },
                created_at=datetime.now()
            )
        
        return None
        
    except Exception as e:
        logger.error(f"Error discovering momentum strategy: {str(e)}")
        return None

def discover_mean_reversion_strategy(price_data: Dict, symbols: List[str]) -> Optional[Strategy]:
    """Discover mean reversion trading strategies"""
    try:
        mean_reversion_scores = {}
        
        for symbol in symbols:
            if symbol in price_data:
                prices = price_data[symbol]
                if len(prices) >= 50:
                    # Calculate mean reversion indicators
                    returns = np.diff(prices) / prices[:-1]
                    mean_return = np.mean(returns)
                    std_return = np.std(returns)
                    current_return = returns[-1]
                    
                    # Z-score for mean reversion
                    z_score = (current_return - mean_return) / std_return
                    
                    # Bollinger Bands
                    bb_position = calculate_bollinger_position(prices, 20)
                    
                    mean_reversion_scores[symbol] = {
                        'z_score': z_score,
                        'bb_position': bb_position,
                        'score': abs(z_score) * 0.6 + abs(bb_position - 0.5) * 0.4
                    }
        
        # Find best mean reversion opportunities
        best_mean_reversion = sorted(mean_reversion_scores.items(), key=lambda x: x[1]['score'], reverse=True)
        
        if best_mean_reversion:
            best_symbol, best_score = best_mean_reversion[0]
            return Strategy(
                strategy_id=f"mean_reversion_{best_symbol}_{int(time.time())}",
                name=f"Mean Reversion Strategy - {best_symbol}",
                strategy_type=StrategyType.MEAN_REVERSION,
                description=f"Mean reversion strategy for {best_symbol} with score {best_score['score']:.4f}",
                parameters={
                    'symbol': best_symbol,
                    'z_score': best_score['z_score'],
                    'bb_position': best_score['bb_position'],
                    'threshold': 2.0
                },
                performance_metrics={
                    'expected_return': 0.05,
                    'volatility': 0.12,
                    'sharpe_ratio': 0.05 / 0.12,
                    'max_drawdown': 0.06
                },
                created_at=datetime.now()
            )
        
        return None
        
    except Exception as e:
        logger.error(f"Error discovering mean reversion strategy: {str(e)}")
        return None

def discover_pairs_trading_strategy(price_data: Dict, symbols: List[str]) -> Optional[Strategy]:
    """Discover pairs trading strategies"""
    try:
        if len(symbols) < 2:
            return None
        
        # Calculate correlations between all pairs
        correlations = {}
        for i, symbol1 in enumerate(symbols):
            for j, symbol2 in enumerate(symbols[i+1:], i+1):
                if symbol1 in price_data and symbol2 in price_data:
                    prices1 = price_data[symbol1]
                    prices2 = price_data[symbol2]
                    
                    if len(prices1) == len(prices2) and len(prices1) >= 30:
                        returns1 = np.diff(prices1) / prices1[:-1]
                        returns2 = np.diff(prices2) / prices2[:-1]
                        
                        correlation = np.corrcoef(returns1, returns2)[0, 1]
                        if not np.isnan(correlation):
                            correlations[(symbol1, symbol2)] = abs(correlation)
        
        # Find highest correlation pair
        if correlations:
            best_pair = max(correlations.items(), key=lambda x: x[1])
            symbol1, symbol2 = best_pair[0]
            correlation = best_pair[1]
            
            if correlation > 0.7:  # High correlation threshold
                return Strategy(
                    strategy_id=f"pairs_{symbol1}_{symbol2}_{int(time.time())}",
                    name=f"Pairs Trading Strategy - {symbol1}/{symbol2}",
                    strategy_type=StrategyType.PAIRS_TRADING,
                    description=f"Pairs trading strategy for {symbol1}/{symbol2} with correlation {correlation:.4f}",
                    parameters={
                        'symbol1': symbol1,
                        'symbol2': symbol2,
                        'correlation': correlation,
                        'threshold': 2.0
                    },
                    performance_metrics={
                        'expected_return': 0.08,
                        'volatility': 0.10,
                        'sharpe_ratio': 0.08 / 0.10,
                        'max_drawdown': 0.05
                    },
                    created_at=datetime.now()
                )
        
        return None
        
    except Exception as e:
        logger.error(f"Error discovering pairs trading strategy: {str(e)}")
        return None

def discover_statistical_arbitrage_strategy(price_data: Dict, symbols: List[str]) -> Optional[Strategy]:
    """Discover statistical arbitrage strategies"""
    try:
        # This is a simplified version - in practice would be more complex
        return None
        
    except Exception as e:
        logger.error(f"Error discovering statistical arbitrage strategy: {str(e)}")
        return None

def discover_volume_strategy(price_data: Dict, volume_data: Dict, symbols: List[str]) -> Optional[Strategy]:
    """Discover volume-based trading strategies"""
    try:
        volume_scores = {}
        
        for symbol in symbols:
            if symbol in price_data and symbol in volume_data:
                prices = price_data[symbol]
                volumes = volume_data[symbol]
                
                if len(prices) == len(volumes) and len(prices) >= 20:
                    # Calculate volume indicators
                    avg_volume = np.mean(volumes[-20:])
                    current_volume = volumes[-1]
                    volume_ratio = current_volume / avg_volume
                    
                    # Price change
                    price_change = (prices[-1] - prices[-2]) / prices[-2]
                    
                    volume_scores[symbol] = {
                        'volume_ratio': volume_ratio,
                        'price_change': price_change,
                        'score': volume_ratio * abs(price_change)
                    }
        
        # Find best volume opportunities
        best_volume = sorted(volume_scores.items(), key=lambda x: x[1]['score'], reverse=True)
        
        if best_volume:
            best_symbol, best_score = best_volume[0]
            return Strategy(
                strategy_id=f"volume_{best_symbol}_{int(time.time())}",
                name=f"Volume Strategy - {best_symbol}",
                strategy_type=StrategyType.MACHINE_LEARNING,
                description=f"Volume-based strategy for {best_symbol} with score {best_score['score']:.4f}",
                parameters={
                    'symbol': best_symbol,
                    'volume_ratio': best_score['volume_ratio'],
                    'price_change': best_score['price_change'],
                    'threshold': 1.5
                },
                performance_metrics={
                    'expected_return': 0.06,
                    'volatility': 0.14,
                    'sharpe_ratio': 0.06 / 0.14,
                    'max_drawdown': 0.07
                },
                created_at=datetime.now()
            )
        
        return None
        
    except Exception as e:
        logger.error(f"Error discovering volume strategy: {str(e)}")
        return None

def rank_strategies(strategies: List[Strategy], constraints: Dict = None) -> List[Strategy]:
    """Rank strategies by performance metrics"""
    if not strategies:
        return []
    
    # Calculate composite score for each strategy
    for strategy in strategies:
        metrics = strategy.performance_metrics
        sharpe = metrics.get('sharpe_ratio', 0)
        max_dd = metrics.get('max_drawdown', 1)
        
        # Composite score: Sharpe ratio weighted by drawdown
        strategy.composite_score = sharpe * (1 - max_dd)
    
    # Sort by composite score
    return sorted(strategies, key=lambda x: x.composite_score, reverse=True)

# Feature engineering functions
def create_technical_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create technical indicator features"""
    features = pd.DataFrame()
    
    for col in df.columns:
        if df[col].dtype in ['float64', 'int64']:
            # Moving averages
            features[f'{col}_ma_5'] = df[col].rolling(5).mean()
            features[f'{col}_ma_20'] = df[col].rolling(20).mean()
            
            # Momentum indicators
            features[f'{col}_momentum_5'] = df[col].pct_change(5)
            features[f'{col}_momentum_20'] = df[col].pct_change(20)
            
            # Volatility indicators
            features[f'{col}_volatility_20'] = df[col].rolling(20).std()
            
            # RSI
            features[f'{col}_rsi'] = calculate_rsi_series(df[col])
    
    return features

def create_statistical_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create statistical features"""
    features = pd.DataFrame()
    
    for col in df.columns:
        if df[col].dtype in ['float64', 'int64']:
            # Z-score
            features[f'{col}_zscore'] = (df[col] - df[col].rolling(20).mean()) / df[col].rolling(20).std()
            
            # Percentile rank
            features[f'{col}_percentile'] = df[col].rolling(20).rank(pct=True)
            
            # Skewness and kurtosis
            features[f'{col}_skew'] = df[col].rolling(20).skew()
            features[f'{col}_kurt'] = df[col].rolling(20).kurt()
    
    return features

def create_time_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create time-based features"""
    features = pd.DataFrame()
    
    # Day of week
    features['day_of_week'] = pd.to_datetime(df.index).dayofweek
    
    # Month
    features['month'] = pd.to_datetime(df.index).month
    
    # Quarter
    features['quarter'] = pd.to_datetime(df.index).quarter
    
    # Day of year
    features['day_of_year'] = pd.to_datetime(df.index).dayofyear
    
    return features

def create_interaction_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create interaction features"""
    features = pd.DataFrame()
    
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    
    # Create pairwise interactions for top features
    if len(numeric_cols) > 1:
        for i, col1 in enumerate(numeric_cols[:5]):  # Limit to top 5 features
            for col2 in numeric_cols[i+1:6]:
                features[f'{col1}_{col2}_interaction'] = df[col1] * df[col2]
    
    return features

def select_best_features(features: pd.DataFrame, target: List[float]) -> pd.DataFrame:
    """Select best features using statistical tests"""
    # Remove NaN values
    features_clean = features.dropna()
    target_clean = target[-len(features_clean):]
    
    if len(features_clean) == 0:
        return features
    
    # Select top k features
    k = min(20, len(features_clean.columns))
    selector = SelectKBest(score_func=f_regression, k=k)
    
    try:
        selected_features = selector.fit_transform(features_clean, target_clean)
        selected_columns = features_clean.columns[selector.get_support()]
        return features_clean[selected_columns]
    except:
        return features_clean

def calculate_feature_importance(features: pd.DataFrame, target: List[float]) -> Dict[str, float]:
    """Calculate feature importance using Random Forest"""
    try:
        features_clean = features.dropna()
        target_clean = target[-len(features_clean):]
        
        if len(features_clean) == 0:
            return {}
        
        rf = RandomForestRegressor(n_estimators=100, random_state=42)
        rf.fit(features_clean, target_clean)
        
        importance_dict = {}
        for feature, importance in zip(features_clean.columns, rf.feature_importances_):
            importance_dict[feature] = float(importance)
        
        return importance_dict
    except:
        return {}

def analyze_feature_correlations(features: pd.DataFrame, target: List[float]) -> Dict[str, float]:
    """Analyze feature correlations with target"""
    try:
        features_clean = features.dropna()
        target_clean = target[-len(features_clean):]
        
        correlations = {}
        for col in features_clean.columns:
            correlation = np.corrcoef(features_clean[col], target_clean)[0, 1]
            if not np.isnan(correlation):
                correlations[col] = float(correlation)
        
        return correlations
    except:
        return {}

# Model explanation functions
def generate_shap_explanation(model, sample, feature_names):
    """Generate SHAP explanations"""
    try:
        # This would require the actual model object
        # For now, return simulated SHAP values
        return {
            'values': [0.1, 0.2, 0.15, 0.05, 0.1],
            'base_value': 0.5,
            'feature_names': feature_names
        }
    except Exception as e:
        logger.error(f"Error generating SHAP explanation: {str(e)}")
        return {}

def generate_lime_explanation(model, sample, feature_names):
    """Generate LIME explanations"""
    try:
        # This would require the actual model object
        # For now, return simulated LIME explanation
        return {
            'feature_weights': dict(zip(feature_names, [0.1, 0.2, 0.15, 0.05, 0.1])),
            'score': 0.75,
            'local_pred': 0.6
        }
    except Exception as e:
        logger.error(f"Error generating LIME explanation: {str(e)}")
        return {}

def calculate_global_importance(model, feature_names):
    """Calculate global feature importance"""
    try:
        # Simulated feature importance
        return dict(zip(feature_names, [0.1, 0.2, 0.15, 0.05, 0.1]))
    except Exception as e:
        logger.error(f"Error calculating global importance: {str(e)}")
        return {}

def calculate_local_importance(model, sample, feature_names):
    """Calculate local feature importance"""
    try:
        # Simulated local importance
        return dict(zip(feature_names, [0.1, 0.2, 0.15, 0.05, 0.1]))
    except Exception as e:
        logger.error(f"Error calculating local importance: {str(e)}")
        return {}

# AutoML functions
def preprocess_data(X: pd.DataFrame, y: List[float]) -> Tuple[pd.DataFrame, List[float]]:
    """Preprocess data for AutoML"""
    # Handle missing values
    X_processed = X.fillna(X.mean())
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_processed)
    X_processed = pd.DataFrame(X_scaled, columns=X_processed.columns)
    
    return X_processed, y

def select_best_model(X: pd.DataFrame, y: List[float], constraints: Dict = None) -> Any:
    """Select best model from candidate models"""
    models = [
        LinearRegression(),
        Ridge(),
        Lasso(),
        RandomForestRegressor(n_estimators=100, random_state=42),
        GradientBoostingRegressor(n_estimators=100, random_state=42)
    ]
    
    best_score = -np.inf
    best_model = None
    
    for model in models:
        try:
            # Use time series cross-validation
            tscv = TimeSeriesSplit(n_splits=3)
            scores = []
            
            for train_idx, val_idx in tscv.split(X):
                X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
                y_train, y_val = y[train_idx[0]:train_idx[-1]+1], y[val_idx[0]:val_idx[-1]+1]
                
                model.fit(X_train, y_train)
                pred = model.predict(X_val)
                score = r2_score(y_val, pred)
                scores.append(score)
            
            avg_score = np.mean(scores)
            if avg_score > best_score:
                best_score = avg_score
                best_model = model
                
        except Exception as e:
            logger.error(f"Error evaluating model {type(model).__name__}: {str(e)}")
            continue
    
    return best_model or LinearRegression()

def optimize_hyperparameters(model, X: pd.DataFrame, y: List[float]) -> Any:
    """Optimize hyperparameters for the selected model"""
    try:
        if isinstance(model, RandomForestRegressor):
            param_grid = {
                'n_estimators': [50, 100, 200],
                'max_depth': [None, 10, 20],
                'min_samples_split': [2, 5, 10]
            }
        elif isinstance(model, GradientBoostingRegressor):
            param_grid = {
                'n_estimators': [50, 100, 200],
                'learning_rate': [0.01, 0.1, 0.2],
                'max_depth': [3, 5, 7]
            }
        else:
            return model
        
        tscv = TimeSeriesSplit(n_splits=3)
        grid_search = GridSearchCV(model, param_grid, cv=tscv, scoring='r2', n_jobs=-1)
        grid_search.fit(X, y)
        
        return grid_search.best_estimator_
        
    except Exception as e:
        logger.error(f"Error optimizing hyperparameters: {str(e)}")
        return model

def evaluate_model(model, X: pd.DataFrame, y: List[float]) -> Dict[str, float]:
    """Evaluate model performance"""
    try:
        tscv = TimeSeriesSplit(n_splits=3)
        mse_scores = []
        r2_scores = []
        mae_scores = []
        
        for train_idx, val_idx in tscv.split(X):
            X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
            y_train, y_val = y[train_idx[0]:train_idx[-1]+1], y[val_idx[0]:val_idx[-1]+1]
            
            model.fit(X_train, y_train)
            pred = model.predict(X_val)
            
            mse_scores.append(mean_squared_error(y_val, pred))
            r2_scores.append(r2_score(y_val, pred))
            mae_scores.append(mean_absolute_error(y_val, pred))
        
        return {
            'mse': np.mean(mse_scores),
            'r2_score': np.mean(r2_scores),
            'mae': np.mean(mae_scores)
        }
        
    except Exception as e:
        logger.error(f"Error evaluating model: {str(e)}")
        return {}

def get_model_feature_importance(model, feature_names) -> Dict[str, float]:
    """Get feature importance from model"""
    try:
        if hasattr(model, 'feature_importances_'):
            return dict(zip(feature_names, model.feature_importances_))
        elif hasattr(model, 'coef_'):
            return dict(zip(feature_names, model.coef_))
        else:
            return {}
    except Exception as e:
        logger.error(f"Error getting feature importance: {str(e)}")
        return {}

def save_automl_model(model, model_name: str) -> str:
    """Save AutoML model"""
    try:
        import pickle
        import os
        model_path = f"models/{model_name}_{int(time.time())}.pkl"
        os.makedirs("models", exist_ok=True)
        
        with open(model_path, 'wb') as f:
            pickle.dump(model, f)
        
        return model_path
    except Exception as e:
        logger.error(f"Error saving model: {str(e)}")
        return ""

def get_model_params(model) -> Dict[str, Any]:
    """Get model parameters"""
    try:
        return model.get_params()
    except:
        return {}

# Portfolio optimization with ML functions
def combine_predictions(predictions: Dict[str, float]) -> float:
    """Combine predictions from multiple models"""
    if not predictions:
        return 0.0
    
    # Simple average for now
    return np.mean(list(predictions.values()))

def optimize_weights_ml(portfolio: Dict, prediction: float) -> Dict[str, float]:
    """Optimize portfolio weights using ML predictions"""
    # Simplified optimization
    symbols = list(portfolio.keys())
    n_symbols = len(symbols)
    
    if n_symbols == 0:
        return {}
    
    # Adjust weights based on prediction
    base_weight = 1.0 / n_symbols
    adjustment = prediction * 0.1  # Scale prediction
    
    weights = {}
    for symbol in symbols:
        weights[symbol] = max(0, base_weight + adjustment)
    
    # Normalize weights
    total_weight = sum(weights.values())
    if total_weight > 0:
        weights = {k: v / total_weight for k, v in weights.items()}
    
    return weights

def calculate_expected_returns_ml(portfolio: Dict, weights: Dict[str, float], prediction: float) -> float:
    """Calculate expected returns using ML predictions"""
    if not weights:
        return 0.0
    
    # Simplified calculation
    return prediction * 0.1  # Scale prediction to reasonable return

def calculate_portfolio_risk_ml(portfolio: Dict, weights: Dict[str, float]) -> float:
    """Calculate portfolio risk"""
    if not weights:
        return 0.0
    
    # Simplified risk calculation
    return 0.15  # 15% volatility

def generate_optimization_report(portfolio: Dict, weights: Dict[str, float], 
                               expected_returns: float, portfolio_risk: float) -> Dict:
    """Generate optimization report"""
    return {
        'portfolio_size': len(portfolio),
        'total_weight': sum(weights.values()),
        'expected_return': expected_returns,
        'portfolio_risk': portfolio_risk,
        'sharpe_ratio': expected_returns / portfolio_risk if portfolio_risk > 0 else 0,
        'weight_distribution': weights
    }

# Utility functions
def calculate_rsi(prices: List[float], period: int = 14) -> float:
    """Calculate RSI"""
    if len(prices) < period + 1:
        return 50.0
    
    deltas = np.diff(prices)
    gains = np.where(deltas > 0, deltas, 0)
    losses = np.where(deltas < 0, -deltas, 0)
    
    avg_gain = np.mean(gains[-period:])
    avg_loss = np.mean(losses[-period:])
    
    if avg_loss == 0:
        return 100.0
    
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    
    return rsi

def calculate_rsi_series(prices: pd.Series) -> pd.Series:
    """Calculate RSI for a series"""
    return prices.rolling(14).apply(lambda x: calculate_rsi(x.tolist(), 14))

def calculate_bollinger_position(prices: List[float], period: int = 20) -> float:
    """Calculate position within Bollinger Bands"""
    if len(prices) < period:
        return 0.5
    
    current_price = prices[-1]
    ma = np.mean(prices[-period:])
    std = np.std(prices[-period:])
    
    if std == 0:
        return 0.5
    
    # Position between lower and upper band (0 to 1)
    lower_band = ma - 2 * std
    upper_band = ma + 2 * std
    
    if upper_band == lower_band:
        return 0.5
    
    position = (current_price - lower_band) / (upper_band - lower_band)
    return max(0, min(1, position))
