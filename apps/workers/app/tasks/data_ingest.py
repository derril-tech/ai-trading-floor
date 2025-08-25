from celery import shared_task
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
import logging
from datetime import datetime, timedelta
import io
import json

# Created automatically by Cursor AI (2024-01-XX)

logger = logging.getLogger(__name__)

@shared_task(bind=True, name='data_ingest.process_csv')
def process_csv(self, file_content: str, file_type: str, universe_id: str, metadata: Dict) -> Dict:
    """
    Process CSV file for data ingestion
    
    Args:
        file_content: Base64 encoded CSV content
        file_type: 'prices' or 'fundamentals'
        universe_id: Target universe ID
        metadata: Additional metadata about the file
    """
    try:
        # Decode base64 content
        import base64
        csv_content = base64.b64decode(file_content).decode('utf-8')
        
        # Read CSV
        df = pd.read_csv(io.StringIO(csv_content))
        
        # Validate and clean data
        cleaned_df = clean_dataframe(df, file_type)
        
        # Check data health
        health_metrics = calculate_data_health(cleaned_df, file_type)
        
        # Store in database (simulated)
        stored_count = store_data(cleaned_df, file_type, universe_id)
        
        return {
            'status': 'success',
            'processed_rows': len(cleaned_df),
            'stored_rows': stored_count,
            'health_metrics': health_metrics,
            'warnings': health_metrics.get('warnings', [])
        }
        
    except Exception as e:
        logger.error(f"Error processing CSV: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

@shared_task(bind=True, name='data_ingest.process_parquet')
def process_parquet(self, file_path: str, file_type: str, universe_id: str, metadata: Dict) -> Dict:
    """
    Process Parquet file for data ingestion
    """
    try:
        # Read parquet file
        df = pd.read_parquet(file_path)
        
        # Validate and clean data
        cleaned_df = clean_dataframe(df, file_type)
        
        # Check data health
        health_metrics = calculate_data_health(cleaned_df, file_type)
        
        # Store in database (simulated)
        stored_count = store_data(cleaned_df, file_type, universe_id)
        
        return {
            'status': 'success',
            'processed_rows': len(cleaned_df),
            'stored_rows': stored_count,
            'health_metrics': health_metrics,
            'warnings': health_metrics.get('warnings', [])
        }
        
    except Exception as e:
        logger.error(f"Error processing Parquet: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

def clean_dataframe(df: pd.DataFrame, file_type: str) -> pd.DataFrame:
    """Clean and validate dataframe based on file type"""
    
    if file_type == 'prices':
        return clean_prices_data(df)
    elif file_type == 'fundamentals':
        return clean_fundamentals_data(df)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")

def clean_prices_data(df: pd.DataFrame) -> pd.DataFrame:
    """Clean price data"""
    
    # Required columns for price data
    required_cols = ['symbol', 'date', 'open', 'high', 'low', 'close', 'volume']
    
    # Check required columns
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing required columns: {missing_cols}")
    
    # Convert date column
    df['date'] = pd.to_datetime(df['date'])
    
    # Remove rows with invalid dates
    df = df[df['date'].notna()]
    
    # Convert price columns to numeric
    price_cols = ['open', 'high', 'low', 'close']
    for col in price_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Remove rows with negative prices
    for col in price_cols:
        df = df[df[col] > 0]
    
    # Convert volume to numeric
    df['volume'] = pd.to_numeric(df['volume'], errors='coerce')
    df = df[df['volume'] >= 0]
    
    # Sort by symbol and date
    df = df.sort_values(['symbol', 'date'])
    
    # Remove duplicates
    df = df.drop_duplicates(subset=['symbol', 'date'])
    
    return df

def clean_fundamentals_data(df: pd.DataFrame) -> pd.DataFrame:
    """Clean fundamentals data"""
    
    # Required columns for fundamentals data
    required_cols = ['symbol', 'date', 'metric', 'value']
    
    # Check required columns
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing required columns: {missing_cols}")
    
    # Convert date column
    df['date'] = pd.to_datetime(df['date'])
    
    # Remove rows with invalid dates
    df = df[df['date'].notna()]
    
    # Convert value to numeric
    df['value'] = pd.to_numeric(df['value'], errors='coerce')
    
    # Remove rows with invalid values
    df = df[df['value'].notna()]
    
    # Sort by symbol, metric, and date
    df = df.sort_values(['symbol', 'metric', 'date'])
    
    # Remove duplicates
    df = df.drop_duplicates(subset=['symbol', 'metric', 'date'])
    
    return df

def calculate_data_health(df: pd.DataFrame, file_type: str) -> Dict:
    """Calculate data health metrics"""
    
    health_metrics = {
        'total_rows': len(df),
        'unique_symbols': df['symbol'].nunique(),
        'date_range': {
            'start': df['date'].min().isoformat() if len(df) > 0 else None,
            'end': df['date'].max().isoformat() if len(df) > 0 else None
        },
        'missing_data': {},
        'warnings': []
    }
    
    if file_type == 'prices':
        # Check for missing price data
        price_cols = ['open', 'high', 'low', 'close']
        for col in price_cols:
            missing_count = df[col].isna().sum()
            health_metrics['missing_data'][col] = missing_count
            
            if missing_count > 0:
                health_metrics['warnings'].append(f"Missing {missing_count} values in {col}")
        
        # Check for price anomalies
        for col in price_cols:
            if col in df.columns:
                # Check for extreme outliers (beyond 3 standard deviations)
                mean_val = df[col].mean()
                std_val = df[col].std()
                outliers = df[abs(df[col] - mean_val) > 3 * std_val]
                
                if len(outliers) > 0:
                    health_metrics['warnings'].append(f"Found {len(outliers)} outliers in {col}")
        
        # Check for volume anomalies
        if 'volume' in df.columns:
            zero_volume = df[df['volume'] == 0]
            if len(zero_volume) > 0:
                health_metrics['warnings'].append(f"Found {len(zero_volume)} rows with zero volume")
    
    elif file_type == 'fundamentals':
        # Check for missing fundamental data
        missing_count = df['value'].isna().sum()
        health_metrics['missing_data']['value'] = missing_count
        
        if missing_count > 0:
            health_metrics['warnings'].append(f"Missing {missing_count} fundamental values")
        
        # Check for negative values in certain metrics
        negative_metrics = ['revenue', 'earnings', 'assets', 'equity']
        for metric in negative_metrics:
            negative_values = df[(df['metric'] == metric) & (df['value'] < 0)]
            if len(negative_values) > 0:
                health_metrics['warnings'].append(f"Found {len(negative_values)} negative values for {metric}")
    
    # Calculate data completeness
    total_expected = health_metrics['total_rows']
    total_missing = sum(health_metrics['missing_data'].values())
    health_metrics['completeness'] = (total_expected - total_missing) / total_expected if total_expected > 0 else 0
    
    return health_metrics

def store_data(df: pd.DataFrame, file_type: str, universe_id: str) -> int:
    """
    Store cleaned data in database
    This is a simplified version - in production, you'd use SQLAlchemy or similar
    """
    
    # Simulate database storage
    stored_count = len(df)
    
    # In a real implementation, you would:
    # 1. Connect to the database
    # 2. Insert data in batches
    # 3. Handle conflicts and updates
    # 4. Update universe metadata
    
    logger.info(f"Stored {stored_count} rows of {file_type} data for universe {universe_id}")
    
    return stored_count

@shared_task(bind=True, name='data_ingest.corporate_actions')
def process_corporate_actions(self, universe_id: str, actions: List[Dict]) -> Dict:
    """
    Process corporate actions (splits, dividends, etc.)
    """
    try:
        processed_actions = []
        
        for action in actions:
            action_type = action.get('type')
            symbol = action.get('symbol')
            effective_date = action.get('effective_date')
            
            if action_type == 'split':
                ratio = action.get('ratio', 1.0)
                # Adjust historical prices
                processed_actions.append({
                    'symbol': symbol,
                    'type': 'split',
                    'ratio': ratio,
                    'effective_date': effective_date
                })
            
            elif action_type == 'dividend':
                amount = action.get('amount', 0.0)
                # Adjust historical prices
                processed_actions.append({
                    'symbol': symbol,
                    'type': 'dividend',
                    'amount': amount,
                    'effective_date': effective_date
                })
        
        return {
            'status': 'success',
            'processed_actions': len(processed_actions),
            'actions': processed_actions
        }
        
    except Exception as e:
        logger.error(f"Error processing corporate actions: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

@shared_task(bind=True, name='data_ingest.symbol_mapping')
def process_symbol_mapping(self, universe_id: str, mappings: List[Dict]) -> Dict:
    """
    Process symbol mappings (e.g., ticker changes)
    """
    try:
        processed_mappings = []
        
        for mapping in mappings:
            old_symbol = mapping.get('old_symbol')
            new_symbol = mapping.get('new_symbol')
            effective_date = mapping.get('effective_date')
            
            # Update symbol references
            processed_mappings.append({
                'old_symbol': old_symbol,
                'new_symbol': new_symbol,
                'effective_date': effective_date
            })
        
        return {
            'status': 'success',
            'processed_mappings': len(processed_mappings),
            'mappings': processed_mappings
        }
        
    except Exception as e:
        logger.error(f"Error processing symbol mappings: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise
