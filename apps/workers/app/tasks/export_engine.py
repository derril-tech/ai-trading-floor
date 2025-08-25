from celery import shared_task
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple, Any
import logging
from datetime import datetime, timedelta
import json
import uuid
import io
import base64
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
import zipfile

# Created automatically by Cursor AI (2024-01-XX)

logger = logging.getLogger(__name__)

@shared_task(bind=True, name='export_engine.generate_pdf_report')
def generate_pdf_report(self, report_type: str, data_params: Dict, report_config: Dict) -> Dict:
    """
    Generate PDF report for various analysis types
    
    Args:
        report_type: Type of report (backtest, risk, compliance, etc.)
        data_params: Parameters for data retrieval
        report_config: Report configuration and styling
    """
    try:
        # Load data based on report type
        report_data = load_report_data(report_type, data_params)
        
        # Generate PDF content
        pdf_content = generate_pdf_content(report_type, report_data, report_config)
        
        # Create PDF file
        pdf_buffer = io.BytesIO()
        doc = SimpleDocTemplate(pdf_buffer, pagesize=A4)
        doc.build(pdf_content)
        
        # Encode PDF to base64
        pdf_base64 = base64.b64encode(pdf_buffer.getvalue()).decode('utf-8')
        
        # Generate signed URL (simulated)
        signed_url = generate_signed_url(f"reports/{report_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf")
        
        return {
            'status': 'success',
            'report_type': report_type,
            'pdf_base64': pdf_base64,
            'signed_url': signed_url,
            'file_size': len(pdf_buffer.getvalue()),
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating PDF report: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

@shared_task(bind=True, name='export_engine.export_csv_data')
def export_csv_data(self, data_type: str, data_params: Dict, export_config: Dict) -> Dict:
    """
    Export data to CSV format
    
    Args:
        data_type: Type of data to export (portfolio, trades, signals, etc.)
        data_params: Parameters for data retrieval
        export_config: Export configuration
    """
    try:
        # Load data
        data = load_export_data(data_type, data_params)
        
        # Convert to DataFrame
        df = pd.DataFrame(data)
        
        # Apply filters and transformations
        if export_config.get('filters'):
            df = apply_data_filters(df, export_config['filters'])
        
        if export_config.get('sort_by'):
            df = df.sort_values(export_config['sort_by'])
        
        # Generate CSV
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False)
        csv_content = csv_buffer.getvalue()
        
        # Generate signed URL
        signed_url = generate_signed_url(f"exports/{data_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv")
        
        return {
            'status': 'success',
            'data_type': data_type,
            'csv_content': csv_content,
            'signed_url': signed_url,
            'row_count': len(df),
            'column_count': len(df.columns),
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error exporting CSV data: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

@shared_task(bind=True, name='export_engine.export_json_data')
def export_json_data(self, data_type: str, data_params: Dict, export_config: Dict) -> Dict:
    """
    Export data to JSON format
    
    Args:
        data_type: Type of data to export
        data_params: Parameters for data retrieval
        export_config: Export configuration
    """
    try:
        # Load data
        data = load_export_data(data_type, data_params)
        
        # Apply transformations
        if export_config.get('include_metadata'):
            data = add_metadata(data, data_type, export_config)
        
        # Generate JSON
        json_content = json.dumps(data, indent=2, default=str)
        
        # Generate signed URL
        signed_url = generate_signed_url(f"exports/{data_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
        
        return {
            'status': 'success',
            'data_type': data_type,
            'json_content': json_content,
            'signed_url': signed_url,
            'file_size': len(json_content),
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error exporting JSON data: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

@shared_task(bind=True, name='export_engine.create_export_bundle')
def create_export_bundle(self, bundle_config: Dict) -> Dict:
    """
    Create a comprehensive export bundle with multiple file types
    
    Args:
        bundle_config: Configuration for the export bundle
    """
    try:
        bundle_id = f"bundle_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
        bundle_files = []
        
        # Create ZIP file
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            
            # Add PDF reports
            if bundle_config.get('include_pdfs'):
                for report_type in bundle_config['pdf_reports']:
                    pdf_result = generate_pdf_report(report_type, bundle_config['data_params'], bundle_config['report_config'])
                    zip_file.writestr(f"reports/{report_type}_report.pdf", base64.b64decode(pdf_result['pdf_base64']))
                    bundle_files.append({
                        'type': 'PDF',
                        'name': f"{report_type}_report.pdf",
                        'size': pdf_result['file_size']
                    })
            
            # Add CSV exports
            if bundle_config.get('include_csvs'):
                for data_type in bundle_config['csv_exports']:
                    csv_result = export_csv_data(data_type, bundle_config['data_params'], bundle_config['export_config'])
                    zip_file.writestr(f"data/{data_type}_data.csv", csv_result['csv_content'])
                    bundle_files.append({
                        'type': 'CSV',
                        'name': f"{data_type}_data.csv",
                        'size': len(csv_result['csv_content'])
                    })
            
            # Add JSON exports
            if bundle_config.get('include_jsons'):
                for data_type in bundle_config['json_exports']:
                    json_result = export_json_data(data_type, bundle_config['data_params'], bundle_config['export_config'])
                    zip_file.writestr(f"data/{data_type}_data.json", json_result['json_content'])
                    bundle_files.append({
                        'type': 'JSON',
                        'name': f"{data_type}_data.json",
                        'size': json_result['file_size']
                    })
            
            # Add bundle manifest
            manifest = {
                'bundle_id': bundle_id,
                'created_at': datetime.now().isoformat(),
                'files': bundle_files,
                'config': bundle_config
            }
            zip_file.writestr('manifest.json', json.dumps(manifest, indent=2))
        
        # Generate signed URL
        signed_url = generate_signed_url(f"bundles/{bundle_id}.zip")
        
        return {
            'status': 'success',
            'bundle_id': bundle_id,
            'signed_url': signed_url,
            'file_count': len(bundle_files),
            'total_size': len(zip_buffer.getvalue()),
            'files': bundle_files,
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error creating export bundle: {str(e)}")
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

def load_report_data(report_type: str, data_params: Dict) -> Dict:
    """Load data for report generation"""
    # Simulated data loading
    # In production, this would query the database
    
    if report_type == 'backtest':
        return {
            'strategy_name': 'Momentum Quality Blend',
            'period': '2023-01-01 to 2023-12-31',
            'total_return': 0.156,
            'annualized_return': 0.142,
            'volatility': 0.089,
            'sharpe_ratio': 1.59,
            'max_drawdown': -0.087,
            'win_rate': 0.634,
            'total_trades': 1247,
            'avg_trade': 0.0012,
            'equity_curve': generate_equity_curve_data(),
            'performance_metrics': generate_performance_metrics()
        }
    elif report_type == 'risk':
        return {
            'portfolio_name': 'Core Portfolio',
            'as_of_date': datetime.now().strftime('%Y-%m-%d'),
            'var_95': -0.0234,
            'var_99': -0.0345,
            'expected_shortfall': -0.0312,
            'beta': 0.87,
            'tracking_error': 0.0456,
            'factor_exposures': generate_factor_exposures(),
            'sector_exposures': generate_sector_exposures(),
            'stress_test_results': generate_stress_test_results()
        }
    elif report_type == 'compliance':
        return {
            'compliance_date': datetime.now().strftime('%Y-%m-%d'),
            'overall_status': 'OK',
            'total_checks': 15,
            'passed_checks': 14,
            'warning_checks': 1,
            'failed_checks': 0,
            'violations': [],
            'warnings': generate_compliance_warnings(),
            'recommendations': ['Monitor ESG scores for low-rated securities']
        }
    else:
        return {'error': f'Unknown report type: {report_type}'}

def generate_pdf_content(report_type: str, report_data: Dict, report_config: Dict) -> List:
    """Generate PDF content based on report type"""
    styles = getSampleStyleSheet()
    content = []
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=1  # Center
    )
    content.append(Paragraph(f"{report_type.upper()} REPORT", title_style))
    content.append(Spacer(1, 20))
    
    # Date
    content.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    content.append(Spacer(1, 20))
    
    if report_type == 'backtest':
        content.extend(generate_backtest_content(report_data, styles))
    elif report_type == 'risk':
        content.extend(generate_risk_content(report_data, styles))
    elif report_type == 'compliance':
        content.extend(generate_compliance_content(report_data, styles))
    
    return content

def generate_backtest_content(data: Dict, styles) -> List:
    """Generate backtest report content"""
    content = []
    
    # Strategy Overview
    content.append(Paragraph("Strategy Overview", styles['Heading2']))
    content.append(Spacer(1, 12))
    
    overview_data = [
        ['Strategy Name', data['strategy_name']],
        ['Period', data['period']],
        ['Total Return', f"{data['total_return']:.2%}"],
        ['Annualized Return', f"{data['annualized_return']:.2%}"],
        ['Volatility', f"{data['volatility']:.2%}"],
        ['Sharpe Ratio', f"{data['sharpe_ratio']:.2f}"],
        ['Max Drawdown', f"{data['max_drawdown']:.2%}"],
        ['Win Rate', f"{data['win_rate']:.1%}"],
        ['Total Trades', str(data['total_trades'])],
        ['Avg Trade', f"{data['avg_trade']:.4f}"]
    ]
    
    overview_table = Table(overview_data, colWidths=[2*inch, 3*inch])
    overview_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.grey),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    content.append(overview_table)
    content.append(Spacer(1, 20))
    
    return content

def generate_risk_content(data: Dict, styles) -> List:
    """Generate risk report content"""
    content = []
    
    # Risk Metrics
    content.append(Paragraph("Risk Metrics", styles['Heading2']))
    content.append(Spacer(1, 12))
    
    risk_data = [
        ['Metric', 'Value'],
        ['VaR (95%)', f"{data['var_95']:.2%}"],
        ['VaR (99%)', f"{data['var_99']:.2%}"],
        ['Expected Shortfall', f"{data['expected_shortfall']:.2%}"],
        ['Beta', f"{data['beta']:.2f}"],
        ['Tracking Error', f"{data['tracking_error']:.2%}"]
    ]
    
    risk_table = Table(risk_data, colWidths=[2*inch, 2*inch])
    risk_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.grey),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    content.append(risk_table)
    content.append(Spacer(1, 20))
    
    return content

def generate_compliance_content(data: Dict, styles) -> List:
    """Generate compliance report content"""
    content = []
    
    # Compliance Summary
    content.append(Paragraph("Compliance Summary", styles['Heading2']))
    content.append(Spacer(1, 12))
    
    summary_data = [
        ['Metric', 'Value'],
        ['Overall Status', data['overall_status']],
        ['Total Checks', str(data['total_checks'])],
        ['Passed Checks', str(data['passed_checks'])],
        ['Warning Checks', str(data['warning_checks'])],
        ['Failed Checks', str(data['failed_checks'])]
    ]
    
    summary_table = Table(summary_data, colWidths=[2*inch, 2*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.grey),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    content.append(summary_table)
    content.append(Spacer(1, 20))
    
    return content

def load_export_data(data_type: str, data_params: Dict) -> List[Dict]:
    """Load data for export"""
    # Simulated data loading
    # In production, this would query the database
    
    if data_type == 'portfolio':
        return generate_portfolio_data()
    elif data_type == 'trades':
        return generate_trades_data()
    elif data_type == 'signals':
        return generate_signals_data()
    elif data_type == 'risk_metrics':
        return generate_risk_metrics_data()
    else:
        return []

def apply_data_filters(df: pd.DataFrame, filters: Dict) -> pd.DataFrame:
    """Apply filters to DataFrame"""
    for column, filter_config in filters.items():
        if column in df.columns:
            if filter_config['type'] == 'range':
                df = df[(df[column] >= filter_config['min']) & (df[column] <= filter_config['max'])]
            elif filter_config['type'] == 'equals':
                df = df[df[column] == filter_config['value']]
            elif filter_config['type'] == 'contains':
                df = df[df[column].str.contains(filter_config['value'], na=False)]
    
    return df

def add_metadata(data: List[Dict], data_type: str, export_config: Dict) -> Dict:
    """Add metadata to export data"""
    return {
        'metadata': {
            'data_type': data_type,
            'export_timestamp': datetime.now().isoformat(),
            'record_count': len(data),
            'export_config': export_config
        },
        'data': data
    }

def generate_signed_url(file_path: str) -> str:
    """Generate signed URL for file access"""
    # Simulated signed URL generation
    # In production, this would use AWS S3 or similar service
    base_url = "https://ai-trading-floor-exports.s3.amazonaws.com"
    token = f"token_{uuid.uuid4().hex[:16]}"
    return f"{base_url}/{file_path}?token={token}&expires={int((datetime.now() + timedelta(hours=24)).timestamp())}"

# Helper functions for generating sample data
def generate_equity_curve_data() -> List[Dict]:
    """Generate sample equity curve data"""
    dates = pd.date_range('2023-01-01', '2023-12-31', freq='D')
    returns = np.random.normal(0.0005, 0.015, len(dates))
    cumulative = np.cumprod(1 + returns)
    
    return [{'date': date.strftime('%Y-%m-%d'), 'value': value} for date, value in zip(dates, cumulative)]

def generate_performance_metrics() -> Dict:
    """Generate sample performance metrics"""
    return {
        'monthly_returns': [0.02, -0.01, 0.03, 0.01, -0.02, 0.04, 0.02, -0.01, 0.03, 0.01, 0.02, 0.03],
        'rolling_sharpe': [1.2, 1.4, 1.6, 1.3, 1.5, 1.7, 1.4, 1.6, 1.8, 1.5, 1.7, 1.9],
        'rolling_volatility': [0.08, 0.09, 0.07, 0.08, 0.09, 0.07, 0.08, 0.09, 0.07, 0.08, 0.09, 0.07]
    }

def generate_factor_exposures() -> Dict:
    """Generate sample factor exposures"""
    return {
        'market_beta': 0.87,
        'size_factor': -0.12,
        'value_factor': 0.23,
        'momentum_factor': 0.45,
        'quality_factor': 0.34,
        'low_vol_factor': -0.18
    }

def generate_sector_exposures() -> Dict:
    """Generate sample sector exposures"""
    return {
        'Technology': 0.25,
        'Healthcare': 0.18,
        'Financials': 0.15,
        'Consumer Discretionary': 0.12,
        'Industrials': 0.10,
        'Energy': 0.08,
        'Materials': 0.06,
        'Utilities': 0.04,
        'Real Estate': 0.02
    }

def generate_stress_test_results() -> Dict:
    """Generate sample stress test results"""
    return {
        'market_crash': -0.15,
        'rates_spike': -0.08,
        'oil_shock': -0.05,
        'fx_crisis': -0.03,
        'sector_rotation': -0.06
    }

def generate_compliance_warnings() -> List[Dict]:
    """Generate sample compliance warnings"""
    return [
        {
            'symbol': 'ASSET_015',
            'rule': 'min_adv_ratio',
            'message': 'Security has low liquidity'
        }
    ]

def generate_portfolio_data() -> List[Dict]:
    """Generate sample portfolio data"""
    symbols = [f'ASSET_{i:03d}' for i in range(1, 51)]
    data = []
    
    for symbol in symbols:
        data.append({
            'symbol': symbol,
            'quantity': np.random.randint(1000, 10000),
            'avg_price': np.random.uniform(50, 200),
            'market_value': np.random.uniform(100000, 500000),
            'weight': np.random.uniform(0.01, 0.05),
            'sector': np.random.choice(['Technology', 'Healthcare', 'Finance', 'Consumer', 'Energy']),
            'country': np.random.choice(['US', 'UK', 'JP', 'DE', 'FR'])
        })
    
    return data

def generate_trades_data() -> List[Dict]:
    """Generate sample trades data"""
    data = []
    symbols = [f'ASSET_{i:03d}' for i in range(1, 51)]
    
    for i in range(100):
        data.append({
            'trade_id': f'trade_{i+1:06d}',
            'symbol': np.random.choice(symbols),
            'side': np.random.choice(['BUY', 'SELL']),
            'quantity': np.random.randint(100, 1000),
            'price': np.random.uniform(50, 200),
            'timestamp': (datetime.now() - timedelta(days=np.random.randint(1, 365))).isoformat(),
            'commission': np.random.uniform(10, 100)
        })
    
    return data

def generate_signals_data() -> List[Dict]:
    """Generate sample signals data"""
    data = []
    symbols = [f'ASSET_{i:03d}' for i in range(1, 51)]
    
    for symbol in symbols:
        data.append({
            'symbol': symbol,
            'momentum_score': np.random.uniform(-2, 2),
            'value_score': np.random.uniform(-2, 2),
            'quality_score': np.random.uniform(-2, 2),
            'growth_score': np.random.uniform(-2, 2),
            'size_score': np.random.uniform(-2, 2),
            'esg_score': np.random.uniform(0, 100),
            'composite_score': np.random.uniform(-2, 2),
            'date': datetime.now().strftime('%Y-%m-%d')
        })
    
    return data

def generate_risk_metrics_data() -> List[Dict]:
    """Generate sample risk metrics data"""
    data = []
    symbols = [f'ASSET_{i:03d}' for i in range(1, 51)]
    
    for symbol in symbols:
        data.append({
            'symbol': symbol,
            'beta': np.random.uniform(0.5, 1.5),
            'volatility': np.random.uniform(0.15, 0.45),
            'var_95': np.random.uniform(-0.05, -0.02),
            'var_99': np.random.uniform(-0.08, -0.04),
            'expected_shortfall': np.random.uniform(-0.07, -0.03),
            'correlation': np.random.uniform(-0.3, 0.8),
            'date': datetime.now().strftime('%Y-%m-%d')
        })
    
    return data
