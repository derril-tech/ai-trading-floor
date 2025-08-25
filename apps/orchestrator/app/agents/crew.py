from crewai import Crew, Agent, Task
from langchain_openai import ChatOpenAI
from app.core.config import settings

# Created automatically by Cursor AI (2024-01-XX)

def create_trading_crew():
    """Create a CrewAI crew with trading research agents"""
    
    # Initialize LLM
    llm = ChatOpenAI(
        model="gpt-4",
        api_key=settings.OPENAI_API_KEY,
        temperature=0.1
    )
    
    # Define agents
    quant_analyst = Agent(
        role="Quantitative Analyst",
        goal="Analyze market data and generate quantitative signals",
        backstory="""You are an experienced quantitative analyst with expertise in 
        factor modeling, statistical analysis, and financial engineering. You excel 
        at identifying patterns in market data and creating robust trading signals.""",
        verbose=settings.CREW_VERBOSE,
        allow_delegation=False,
        llm=llm
    )
    
    market_strategist = Agent(
        role="Market Strategist",
        goal="Develop trading strategies and portfolio construction approaches",
        backstory="""You are a senior market strategist with deep knowledge of 
        portfolio theory, risk management, and market dynamics. You understand how 
        to translate quantitative signals into actionable trading strategies.""",
        verbose=settings.CREW_VERBOSE,
        allow_delegation=False,
        llm=llm
    )
    
    risk_manager = Agent(
        role="Risk Manager",
        goal="Assess and manage portfolio risk through comprehensive analysis",
        backstory="""You are a seasoned risk manager with expertise in VaR modeling, 
        stress testing, and risk factor analysis. You ensure all strategies meet 
        risk tolerance and regulatory requirements.""",
        verbose=settings.CREW_VERBOSE,
        allow_delegation=False,
        llm=llm
    )
    
    compliance_officer = Agent(
        role="Compliance Officer",
        goal="Ensure all trading activities comply with regulations and internal policies",
        backstory="""You are a compliance officer with extensive knowledge of 
        financial regulations, trading restrictions, and compliance frameworks. 
        You review all strategies for regulatory compliance.""",
        verbose=settings.CREW_VERBOSE,
        allow_delegation=False,
        llm=llm
    )
    
    # Define tasks
    analyze_signals = Task(
        description="""Analyze the given brief and universe to generate quantitative signals.
        Consider factors like momentum, value, quality, and market conditions.
        Provide detailed analysis with specific recommendations.""",
        agent=quant_analyst,
        expected_output="Comprehensive signal analysis with factor breakdowns and recommendations"
    )
    
    develop_strategy = Task(
        description="""Based on the signal analysis, develop a comprehensive trading strategy.
        Include portfolio construction approach, rebalancing frequency, and risk parameters.
        Consider the given constraints and objectives.""",
        agent=market_strategist,
        expected_output="Detailed trading strategy with portfolio construction and implementation plan"
    )
    
    assess_risk = Task(
        description="""Conduct comprehensive risk analysis of the proposed strategy.
        Calculate VaR, stress test scenarios, and identify potential risk factors.
        Provide risk mitigation recommendations.""",
        agent=risk_manager,
        expected_output="Risk assessment report with metrics, scenarios, and mitigation strategies"
    )
    
    compliance_review = Task(
        description="""Review the strategy for compliance with regulations and internal policies.
        Check for restricted securities, position limits, and regulatory requirements.
        Provide compliance status and any required modifications.""",
        agent=compliance_officer,
        expected_output="Compliance review with status, violations, and recommendations"
    )
    
    # Create crew
    crew = Crew(
        agents=[quant_analyst, market_strategist, risk_manager, compliance_officer],
        tasks=[analyze_signals, develop_strategy, assess_risk, compliance_review],
        verbose=settings.CREW_VERBOSE,
        memory=settings.CREW_MEMORY
    )
    
    return crew
