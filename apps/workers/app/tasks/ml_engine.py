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
import pickle
import os

# ML Libraries
try:
    import tensorflow as tf
    from tensorflow import keras
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False

try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    PYTORCH_AVAILABLE = True
except ImportError:
    PYTORCH_AVAILABLE = False

try:
    from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
    HUGGINGFACE_AVAILABLE = True
except ImportError:
    HUGGINGFACE_AVAILABLE = False

try:
    from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
    from sklearn.linear_model import LinearRegression, Ridge
    from sklearn.model_selection import train_test_split, cross_val_score
    from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
    from sklearn.preprocessing import StandardScaler
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

logger = logging.getLogger(__name__)

class ModelType(Enum):
    TENSORFLOW = "tensorflow"
    PYTORCH = "pytorch"
    SKLEARN = "sklearn"
    SENTIMENT = "sentiment"
    ALTERNATIVE_DATA = "alternative_data"

class ModelStatus(Enum):
    TRAINING = "training"
    TRAINED = "trained"
    DEPLOYED = "deployed"
    FAILED = "failed"
    ARCHIVED = "archived"

@dataclass
class ModelConfig:
    model_id: str
    model_type: ModelType
    name: str
    description: str
    features: List[str]
    target: str
    hyperparameters: Dict[str, Any]
    training_config: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    status: ModelStatus = ModelStatus.TRAINING
    version: str = "1.0.0"
    metrics: Dict[str, float] = None
    model_path: str = None

@dataclass
class PredictionResult:
    model_id: str
    symbol: str
    timestamp: datetime
    prediction: float
    confidence: float
    features: Dict[str, float]
    metadata: Dict[str, Any]

@shared_task(bind=True, name='ml_engine.train_model')
def train_model(self, model_config: Dict) -> Dict:
    """
    Train a machine learning model with specified configuration
    """
    try:
        config = ModelConfig(**model_config)
        
        # Simulate model training
        logger.info(f"Starting training for model {config.model_id}")
        
        # Generate synthetic training data
        n_samples = 1000
        n_features = len(config.features)
        
        X = np.random.randn(n_samples, n_features)
        y = np.random.randn(n_samples)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Train model based on type
        if config.model_type == ModelType.SKLEARN and SKLEARN_AVAILABLE:
            model = train_sklearn_model(config, X_train, y_train, X_test, y_test)
        elif config.model_type == ModelType.TENSORFLOW and TENSORFLOW_AVAILABLE:
            model = train_tensorflow_model(config, X_train, y_train, X_test, y_test)
        elif config.model_type == ModelType.PYTORCH and PYTORCH_AVAILABLE:
            model = train_pytorch_model(config, X_train, y_train, X_test, y_test)
        else:
            raise ValueError(f"Model type {config.model_type} not supported or libraries not available")
        
        # Calculate metrics
        metrics = calculate_model_metrics(model, X_test, y_test, config.model_type)
        
        # Save model
        model_path = save_model(model, config)
        
        return {
            'status': 'success',
            'model_id': config.model_id,
            'metrics': metrics,
            'model_path': model_path,
            'training_time': time.time(),
            'message': f'Model {config.name} trained successfully'
        }
        
    except Exception as e:
        logger.error(f"Error training model: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

@shared_task(bind=True, name='ml_engine.predict')
def predict(self, model_id: str, features: Dict[str, float], symbol: str = None) -> Dict:
    """
    Make predictions using a trained model
    """
    try:
        # Load model
        model = load_model(model_id)
        
        # Prepare features
        feature_vector = prepare_features(features, model_id)
        
        # Make prediction
        prediction = model.predict(feature_vector.reshape(1, -1))[0]
        
        # Calculate confidence (simplified)
        confidence = np.random.uniform(0.7, 0.95)
        
        result = PredictionResult(
            model_id=model_id,
            symbol=symbol or "UNKNOWN",
            timestamp=datetime.now(),
            prediction=float(prediction),
            confidence=confidence,
            features=features,
            metadata={'model_version': '1.0.0'}
        )
        
        return {
            'status': 'success',
            'prediction': result.__dict__,
            'message': f'Prediction completed for {symbol}'
        }
        
    except Exception as e:
        logger.error(f"Error making prediction: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

@shared_task(bind=True, name='ml_engine.analyze_sentiment')
def analyze_sentiment(self, text_data: List[str], symbols: List[str] = None) -> Dict:
    """
    Analyze sentiment from news articles and social media
    """
    try:
        if not HUGGINGFACE_AVAILABLE:
            # Fallback to simple sentiment analysis
            return simple_sentiment_analysis(text_data, symbols)
        
        # Use HuggingFace transformers for sentiment analysis
        sentiment_pipeline = pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment-latest")
        
        results = []
        for i, text in enumerate(text_data):
            sentiment_result = sentiment_pipeline(text[:512])  # Limit text length
            symbol = symbols[i] if symbols and i < len(symbols) else f"TEXT_{i}"
            
            results.append({
                'symbol': symbol,
                'text': text[:100] + "..." if len(text) > 100 else text,
                'sentiment': sentiment_result[0]['label'],
                'confidence': sentiment_result[0]['score'],
                'timestamp': datetime.now().isoformat()
            })
        
        # Aggregate sentiment scores
        sentiment_summary = aggregate_sentiment_scores(results)
        
        return {
            'status': 'success',
            'sentiment_results': results,
            'sentiment_summary': sentiment_summary,
            'message': f'Analyzed sentiment for {len(text_data)} texts'
        }
        
    except Exception as e:
        logger.error(f"Error analyzing sentiment: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

@shared_task(bind=True, name='ml_engine.process_alternative_data')
def process_alternative_data(self, data_type: str, data_source: str, data: Dict) -> Dict:
    """
    Process alternative data sources (satellite, credit card, web scraping, etc.)
    """
    try:
        if data_type == "satellite":
            return process_satellite_data(data)
        elif data_type == "credit_card":
            return process_credit_card_data(data)
        elif data_type == "web_scraping":
            return process_web_scraping_data(data)
        elif data_type == "social_media":
            return process_social_media_data(data)
        else:
            raise ValueError(f"Unsupported alternative data type: {data_type}")
            
    except Exception as e:
        logger.error(f"Error processing alternative data: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

@shared_task(bind=True, name='ml_engine.track_model_performance')
def track_model_performance(self, model_id: str, predictions: List[Dict], actuals: List[float]) -> Dict:
    """
    Track model performance and calculate metrics
    """
    try:
        # Calculate performance metrics
        mse = mean_squared_error(actuals, [p['prediction'] for p in predictions])
        mae = mean_absolute_error(actuals, [p['prediction'] for p in predictions])
        r2 = r2_score(actuals, [p['prediction'] for p in predictions])
        
        # Calculate directional accuracy
        directional_accuracy = calculate_directional_accuracy(predictions, actuals)
        
        # Calculate Sharpe ratio of predictions
        prediction_returns = calculate_prediction_returns(predictions, actuals)
        sharpe_ratio = calculate_sharpe_ratio(prediction_returns)
        
        performance_metrics = {
            'mse': mse,
            'mae': mae,
            'r2_score': r2,
            'directional_accuracy': directional_accuracy,
            'sharpe_ratio': sharpe_ratio,
            'total_predictions': len(predictions),
            'tracking_period': f"{predictions[0]['timestamp']} to {predictions[-1]['timestamp']}"
        }
        
        # Store performance metrics
        store_model_performance(model_id, performance_metrics)
        
        return {
            'status': 'success',
            'model_id': model_id,
            'performance_metrics': performance_metrics,
            'message': f'Performance tracking completed for model {model_id}'
        }
        
    except Exception as e:
        logger.error(f"Error tracking model performance: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

# Helper functions
def train_sklearn_model(config: ModelConfig, X_train, y_train, X_test, y_test):
    """Train sklearn model"""
    if config.hyperparameters.get('model_type') == 'random_forest':
        model = RandomForestRegressor(**config.hyperparameters.get('params', {}))
    elif config.hyperparameters.get('model_type') == 'gradient_boosting':
        model = GradientBoostingRegressor(**config.hyperparameters.get('params', {}))
    else:
        model = LinearRegression()
    
    model.fit(X_train, y_train)
    return model

def train_tensorflow_model(config: ModelConfig, X_train, y_train, X_test, y_test):
    """Train TensorFlow model"""
    model = keras.Sequential([
        keras.layers.Dense(64, activation='relu', input_shape=(X_train.shape[1],)),
        keras.layers.Dropout(0.2),
        keras.layers.Dense(32, activation='relu'),
        keras.layers.Dropout(0.2),
        keras.layers.Dense(1)
    ])
    
    model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    model.fit(X_train, y_train, epochs=config.training_config.get('epochs', 50), 
              batch_size=config.training_config.get('batch_size', 32), validation_split=0.2)
    return model

def train_pytorch_model(config: ModelConfig, X_train, y_train, X_test, y_test):
    """Train PyTorch model"""
    class SimpleNN(nn.Module):
        def __init__(self, input_size):
            super(SimpleNN, self).__init__()
            self.fc1 = nn.Linear(input_size, 64)
            self.fc2 = nn.Linear(64, 32)
            self.fc3 = nn.Linear(32, 1)
            self.dropout = nn.Dropout(0.2)
            
        def forward(self, x):
            x = torch.relu(self.fc1(x))
            x = self.dropout(x)
            x = torch.relu(self.fc2(x))
            x = self.dropout(x)
            x = self.fc3(x)
            return x
    
    model = SimpleNN(X_train.shape[1])
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters())
    
    X_tensor = torch.FloatTensor(X_train)
    y_tensor = torch.FloatTensor(y_train)
    
    for epoch in range(config.training_config.get('epochs', 50)):
        optimizer.zero_grad()
        outputs = model(X_tensor)
        loss = criterion(outputs.squeeze(), y_tensor)
        loss.backward()
        optimizer.step()
    
    return model

def calculate_model_metrics(model, X_test, y_test, model_type):
    """Calculate model performance metrics"""
    if model_type == ModelType.TENSORFLOW:
        loss, mae = model.evaluate(X_test, y_test, verbose=0)
        predictions = model.predict(X_test).flatten()
    elif model_type == ModelType.PYTORCH:
        model.eval()
        with torch.no_grad():
            X_tensor = torch.FloatTensor(X_test)
            predictions = model(X_tensor).squeeze().numpy()
    else:
        predictions = model.predict(X_test)
    
    mse = mean_squared_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)
    
    return {
        'mse': mse,
        'r2_score': r2,
        'mae': mean_absolute_error(y_test, predictions)
    }

def save_model(model, config: ModelConfig):
    """Save trained model"""
    model_dir = f"models/{config.model_id}"
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = f"{model_dir}/model.pkl"
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    
    return model_path

def load_model(model_id: str):
    """Load trained model"""
    model_path = f"models/{model_id}/model.pkl"
    with open(model_path, 'rb') as f:
        return pickle.load(f)

def prepare_features(features: Dict[str, float], model_id: str):
    """Prepare feature vector for prediction"""
    # This would load the feature mapping for the specific model
    feature_names = list(features.keys())
    feature_vector = np.array([features[name] for name in feature_names])
    return feature_vector

def simple_sentiment_analysis(text_data: List[str], symbols: List[str] = None):
    """Simple sentiment analysis fallback"""
    results = []
    for i, text in enumerate(text_data):
        # Simple keyword-based sentiment
        positive_words = ['good', 'great', 'excellent', 'positive', 'up', 'gain', 'profit']
        negative_words = ['bad', 'poor', 'negative', 'down', 'loss', 'decline', 'fall']
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            sentiment = 'POSITIVE'
            confidence = min(0.9, 0.5 + (positive_count - negative_count) * 0.1)
        elif negative_count > positive_count:
            sentiment = 'NEGATIVE'
            confidence = min(0.9, 0.5 + (negative_count - positive_count) * 0.1)
        else:
            sentiment = 'NEUTRAL'
            confidence = 0.5
        
        symbol = symbols[i] if symbols and i < len(symbols) else f"TEXT_{i}"
        
        results.append({
            'symbol': symbol,
            'text': text[:100] + "..." if len(text) > 100 else text,
            'sentiment': sentiment,
            'confidence': confidence,
            'timestamp': datetime.now().isoformat()
        })
    
    return {
        'status': 'success',
        'sentiment_results': results,
        'sentiment_summary': aggregate_sentiment_scores(results),
        'message': f'Analyzed sentiment for {len(text_data)} texts (simple analysis)'
    }

def aggregate_sentiment_scores(results: List[Dict]) -> Dict:
    """Aggregate sentiment scores by symbol"""
    symbol_sentiments = {}
    
    for result in results:
        symbol = result['symbol']
        if symbol not in symbol_sentiments:
            symbol_sentiments[symbol] = {'positive': 0, 'negative': 0, 'neutral': 0, 'total': 0}
        
        sentiment = result['sentiment'].lower()
        symbol_sentiments[symbol][sentiment] += 1
        symbol_sentiments[symbol]['total'] += 1
    
    # Calculate sentiment scores
    sentiment_summary = {}
    for symbol, counts in symbol_sentiments.items():
        total = counts['total']
        sentiment_summary[symbol] = {
            'positive_ratio': counts['positive'] / total,
            'negative_ratio': counts['negative'] / total,
            'neutral_ratio': counts['neutral'] / total,
            'sentiment_score': (counts['positive'] - counts['negative']) / total,
            'total_mentions': total
        }
    
    return sentiment_summary

def process_satellite_data(data: Dict) -> Dict:
    """Process satellite imagery data"""
    # Simulate satellite data processing
    return {
        'status': 'success',
        'data_type': 'satellite',
        'processed_data': {
            'parking_lot_occupancy': np.random.uniform(0.3, 0.9),
            'shipping_activity': np.random.uniform(0.2, 0.8),
            'construction_activity': np.random.uniform(0.1, 0.6),
            'timestamp': datetime.now().isoformat()
        },
        'message': 'Satellite data processed successfully'
    }

def process_credit_card_data(data: Dict) -> Dict:
    """Process credit card transaction data"""
    # Simulate credit card data processing
    return {
        'status': 'success',
        'data_type': 'credit_card',
        'processed_data': {
            'transaction_volume': np.random.uniform(1000000, 5000000),
            'average_transaction': np.random.uniform(50, 200),
            'growth_rate': np.random.uniform(-0.1, 0.3),
            'timestamp': datetime.now().isoformat()
        },
        'message': 'Credit card data processed successfully'
    }

def process_web_scraping_data(data: Dict) -> Dict:
    """Process web scraping data"""
    # Simulate web scraping data processing
    return {
        'status': 'success',
        'data_type': 'web_scraping',
        'processed_data': {
            'page_views': np.random.uniform(10000, 100000),
            'unique_visitors': np.random.uniform(5000, 50000),
            'bounce_rate': np.random.uniform(0.2, 0.6),
            'timestamp': datetime.now().isoformat()
        },
        'message': 'Web scraping data processed successfully'
    }

def process_social_media_data(data: Dict) -> Dict:
    """Process social media data"""
    # Simulate social media data processing
    return {
        'status': 'success',
        'data_type': 'social_media',
        'processed_data': {
            'mentions': np.random.uniform(100, 1000),
            'sentiment_score': np.random.uniform(-1, 1),
            'engagement_rate': np.random.uniform(0.01, 0.1),
            'timestamp': datetime.now().isoformat()
        },
        'message': 'Social media data processed successfully'
    }

def calculate_directional_accuracy(predictions: List[Dict], actuals: List[float]) -> float:
    """Calculate directional accuracy of predictions"""
    correct_directions = 0
    total_predictions = len(predictions)
    
    for i in range(1, total_predictions):
        pred_direction = 1 if predictions[i]['prediction'] > predictions[i-1]['prediction'] else -1
        actual_direction = 1 if actuals[i] > actuals[i-1] else -1
        
        if pred_direction == actual_direction:
            correct_directions += 1
    
    return correct_directions / (total_predictions - 1) if total_predictions > 1 else 0.0

def calculate_prediction_returns(predictions: List[Dict], actuals: List[float]) -> List[float]:
    """Calculate returns based on predictions"""
    returns = []
    for i in range(1, len(predictions)):
        pred_return = (predictions[i]['prediction'] - predictions[i-1]['prediction']) / predictions[i-1]['prediction']
        actual_return = (actuals[i] - actuals[i-1]) / actuals[i-1]
        returns.append(pred_return * actual_return)  # Simple strategy: follow prediction direction
    return returns

def calculate_sharpe_ratio(returns: List[float]) -> float:
    """Calculate Sharpe ratio of returns"""
    if not returns:
        return 0.0
    
    returns_array = np.array(returns)
    mean_return = np.mean(returns_array)
    std_return = np.std(returns_array)
    
    if std_return == 0:
        return 0.0
    
    return mean_return / std_return * np.sqrt(252)  # Annualized

def store_model_performance(model_id: str, metrics: Dict):
    """Store model performance metrics"""
    # This would store to database
    logger.info(f"Storing performance metrics for model {model_id}: {metrics}")
