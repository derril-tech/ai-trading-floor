from pydantic import BaseModel
from typing import Dict, Any, Optional

# Created automatically by Cursor AI (2024-01-XX)

class StrategyRequest(BaseModel):
    brief: str
    universe: Dict[str, Any]
    constraints: Dict[str, Any]

class StrategyResponse(BaseModel):
    strategy_id: str
    analysis: Dict[str, Any]
    signals: Dict[str, Any]
    risk_metrics: Dict[str, Any]
    compliance_status: str
