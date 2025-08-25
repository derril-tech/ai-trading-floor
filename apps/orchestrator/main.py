from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.security import verify_token
from app.agents.crew import create_trading_crew
from app.models.strategy import StrategyRequest, StrategyResponse

# Created automatically by Cursor AI (2024-01-XX)

security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting AI Trading Floor Orchestrator...")
    yield
    # Shutdown
    print("Shutting down AI Trading Floor Orchestrator...")

app = FastAPI(
    title="AI Trading Floor Orchestrator",
    description="CrewAI-powered multi-agent trading research orchestration",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = verify_token(credentials.credentials)
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "orchestrator"}

@app.post("/strategies/analyze", response_model=StrategyResponse)
async def analyze_strategy(
    request: StrategyRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Analyze a trading strategy using CrewAI agents
    """
    try:
        # Create the trading crew with agents
        crew = create_trading_crew()
        
        # Execute the analysis
        result = await crew.kickoff({
            "brief": request.brief,
            "universe": request.universe,
            "constraints": request.constraints,
            "user_id": current_user.get("sub")
        })
        
        return StrategyResponse(
            strategy_id=result.get("strategy_id"),
            analysis=result.get("analysis"),
            signals=result.get("signals"),
            risk_metrics=result.get("risk_metrics"),
            compliance_status=result.get("compliance_status")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/strategies/{strategy_id}")
async def get_strategy(
    strategy_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get strategy analysis results
    """
    # TODO: Implement strategy retrieval from database
    raise HTTPException(status_code=501, detail="Not implemented yet")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
