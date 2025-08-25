-- Created automatically by Cursor AI (2024-01-XX)
-- Initial database schema for AI Trading Floor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "timescaledb";

-- Create organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Owner', 'Admin', 'Quant', 'Strategist', 'Risk', 'Compliance', 'Viewer')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create instruments table
CREATE TABLE instruments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    asset_class VARCHAR(50) NOT NULL,
    sector VARCHAR(100),
    industry VARCHAR(100),
    country VARCHAR(50),
    exchange VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create universes table
CREATE TABLE universes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    filters JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create universe_members table
CREATE TABLE universe_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    universe_id UUID REFERENCES universes(id) ON DELETE CASCADE,
    instrument_id UUID REFERENCES instruments(id) ON DELETE CASCADE,
    weight DECIMAL(10,6) DEFAULT 0,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(universe_id, instrument_id)
);

-- Create prices hypertable (TimescaleDB)
CREATE TABLE prices (
    time TIMESTAMPTZ NOT NULL,
    instrument_id UUID REFERENCES instruments(id) ON DELETE CASCADE,
    open DECIMAL(15,6),
    high DECIMAL(15,6),
    low DECIMAL(15,6),
    close DECIMAL(15,6),
    volume BIGINT,
    adjusted_close DECIMAL(15,6)
);

-- Convert to hypertable
SELECT create_hypertable('prices', 'time', chunk_time_interval => INTERVAL '1 day');

-- Create fundamentals table
CREATE TABLE fundamentals (
    time TIMESTAMPTZ NOT NULL,
    instrument_id UUID REFERENCES instruments(id) ON DELETE CASCADE,
    metric VARCHAR(100) NOT NULL,
    value DECIMAL(20,6),
    unit VARCHAR(20),
    period VARCHAR(20)
);

-- Convert to hypertable
SELECT create_hypertable('fundamentals', 'time', chunk_time_interval => INTERVAL '1 month');

-- Create strategies table
CREATE TABLE strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    universe_id UUID REFERENCES universes(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    signals JSONB NOT NULL DEFAULT '{}',
    constraints JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'completed', 'failed')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create backtests table
CREATE TABLE backtests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    rebalance_frequency VARCHAR(20) DEFAULT 'monthly',
    costs_model JSONB DEFAULT '{}',
    results JSONB,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Create weights table
CREATE TABLE weights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
    backtest_id UUID REFERENCES backtests(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    instrument_id UUID REFERENCES instruments(id) ON DELETE CASCADE,
    weight DECIMAL(10,6) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create risk_metrics table
CREATE TABLE risk_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
    backtest_id UUID REFERENCES backtests(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    var_95 DECIMAL(10,6),
    es_97 DECIMAL(10,6),
    beta DECIMAL(10,6),
    tracking_error DECIMAL(10,6),
    sharpe_ratio DECIMAL(10,6),
    max_drawdown DECIMAL(10,6),
    exposures JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create scenarios table
CREATE TABLE scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    shocks JSONB NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create scenario_results table
CREATE TABLE scenario_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
    scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
    pnl DECIMAL(15,2),
    breaches JSONB,
    exposures_delta JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rulesets table
CREATE TABLE rulesets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    rules JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create restricted_list table
CREATE TABLE restricted_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    instrument_id UUID REFERENCES instruments(id) ON DELETE CASCADE,
    reason TEXT,
    added_by UUID REFERENCES users(id),
    added_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create compliance_checks table
CREATE TABLE compliance_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
    ruleset_id UUID REFERENCES rulesets(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('OK', 'REVIEW', 'BLOCK')),
    reasons JSONB,
    violations JSONB,
    checked_by UUID REFERENCES users(id),
    checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create exports table
CREATE TABLE exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    file_path VARCHAR(500),
    download_url VARCHAR(500),
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Create audit_log table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_instruments_symbol ON instruments(symbol);
CREATE INDEX idx_instruments_sector ON instruments(sector);
CREATE INDEX idx_universes_org_id ON universes(org_id);
CREATE INDEX idx_universe_members_universe_id ON universe_members(universe_id);
CREATE INDEX idx_prices_instrument_id ON prices(instrument_id, time DESC);
CREATE INDEX idx_fundamentals_instrument_id ON fundamentals(instrument_id, time DESC);
CREATE INDEX idx_strategies_org_id ON strategies(org_id);
CREATE INDEX idx_strategies_universe_id ON strategies(universe_id);
CREATE INDEX idx_backtests_strategy_id ON backtests(strategy_id);
CREATE INDEX idx_weights_strategy_id ON weights(strategy_id, date);
CREATE INDEX idx_risk_metrics_strategy_id ON risk_metrics(strategy_id, date);
CREATE INDEX idx_compliance_checks_strategy_id ON compliance_checks(strategy_id);
CREATE INDEX idx_audit_log_org_id ON audit_log(org_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE universes ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE backtests ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Organizations: users can only see their own org
CREATE POLICY org_policy ON organizations
    FOR ALL USING (id = current_setting('app.current_org_id')::UUID);

-- Users: users can only see users in their org
CREATE POLICY users_policy ON users
    FOR ALL USING (org_id = current_setting('app.current_org_id')::UUID);

-- Universes: users can only see universes in their org
CREATE POLICY universes_policy ON universes
    FOR ALL USING (org_id = current_setting('app.current_org_id')::UUID);

-- Strategies: users can only see strategies in their org
CREATE POLICY strategies_policy ON strategies
    FOR ALL USING (org_id = current_setting('app.current_org_id')::UUID);

-- Backtests: users can only see backtests for strategies in their org
CREATE POLICY backtests_policy ON backtests
    FOR ALL USING (
        strategy_id IN (
            SELECT id FROM strategies 
            WHERE org_id = current_setting('app.current_org_id')::UUID
        )
    );

-- Risk metrics: users can only see risk metrics for strategies in their org
CREATE POLICY risk_metrics_policy ON risk_metrics
    FOR ALL USING (
        strategy_id IN (
            SELECT id FROM strategies 
            WHERE org_id = current_setting('app.current_org_id')::UUID
        )
    );

-- Compliance checks: users can only see compliance checks for strategies in their org
CREATE POLICY compliance_checks_policy ON compliance_checks
    FOR ALL USING (
        strategy_id IN (
            SELECT id FROM strategies 
            WHERE org_id = current_setting('app.current_org_id')::UUID
        )
    );

-- Exports: users can only see exports for strategies in their org
CREATE POLICY exports_policy ON exports
    FOR ALL USING (
        strategy_id IN (
            SELECT id FROM strategies 
            WHERE org_id = current_setting('app.current_org_id')::UUID
        )
    );

-- Audit log: users can only see audit logs for their org
CREATE POLICY audit_log_policy ON audit_log
    FOR ALL USING (org_id = current_setting('app.current_org_id')::UUID);

-- Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_universes_updated_at BEFORE UPDATE ON universes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_strategies_updated_at BEFORE UPDATE ON strategies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rulesets_updated_at BEFORE UPDATE ON rulesets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO organizations (id, name, slug) VALUES 
    (uuid_generate_v4(), 'Demo Trading Corp', 'demo-trading');

-- Get the org ID for sample data
DO $$
DECLARE
    demo_org_id UUID;
BEGIN
    SELECT id INTO demo_org_id FROM organizations WHERE slug = 'demo-trading';
    
    -- Insert sample user
    INSERT INTO users (email, name, password_hash, org_id, role) VALUES 
        ('admin@tradingfloor.com', 'Admin User', crypt('password123', gen_salt('bf')), demo_org_id, 'Admin');
    
    -- Insert sample instruments
    INSERT INTO instruments (symbol, name, asset_class, sector, industry, country, exchange) VALUES 
        ('AAPL', 'Apple Inc.', 'Equity', 'Technology', 'Consumer Electronics', 'US', 'NASDAQ'),
        ('MSFT', 'Microsoft Corporation', 'Equity', 'Technology', 'Software', 'US', 'NASDAQ'),
        ('GOOGL', 'Alphabet Inc.', 'Equity', 'Technology', 'Internet Services', 'US', 'NASDAQ'),
        ('TSLA', 'Tesla Inc.', 'Equity', 'Consumer Discretionary', 'Automobiles', 'US', 'NASDAQ'),
        ('NVDA', 'NVIDIA Corporation', 'Equity', 'Technology', 'Semiconductors', 'US', 'NASDAQ');
END $$;
