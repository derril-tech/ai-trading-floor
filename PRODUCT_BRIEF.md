AI TRADING FLOOR — END‑TO‑END PRODUCT BLUEPRINT
(React 18 + Next.js 14 App Router; CrewAI multi‑agent orchestration; TypeScript‑first contracts.)
1) Product Description & Presentation
One‑liner
A multi‑agent trading research desk that turns a brief like “Find trading opportunities in renewable energy.” into idea packets with quantified signals, portfolio proposals, risk scenarios (VaR/ES/stress), and compliance notes—plus paper‑trade execution plans and exportable memos.
What it produces
•
Idea cards: instrument set, thesis, factors & signals, entry range, risk/return stats, scenario outcomes, hedge suggestions.
•
Strategy sheets: universe, factor model, portfolio construction (MV/BL/risk‑parity), constraints, turnover, liquidity.
•
Risk dossiers: factor exposures, VaR/ES, stress tests (macro/sector/idiosyncratic), concentration & liquidity flags, greeks (if options).
•
Compliance notes: pre‑trade checks vs. restricted lists, watchlists, max position & concentration, disclosure reminders.
•
Exports: PDF memo, CSV trades, JSON strategy bundle, backtest report.
Safety & scope
•
Not investment advice. Outputs are simulations and require human review. No brokerage or order routing.
2) Target User
•
Buy‑side research teams, prop desks, family offices, corporate treasury running paper strategies.
•
Energy transition funds exploring sector tilts / hedged baskets.
•
Enterprise risk groups validating scenario impacts.
3) Features & Functionalities (Extensive)
Intake & Universe Selection
•
Brief wizard: theme (e.g., renewables), asset classes (Equities/ETFs/Futures/Options), geography, market‑cap floor, liquidity min (ADV), shorting allowed?, leverage cap, turnover target, tax sensitivity (high/med/low), ESG tilt (off/moderate/strong).
•
Universe builder: sector/industry filters (e.g., solar, wind, storage, grid), ETF constituents import, custom tickers upload (CSV).
•
Data adapters (pluggable): end‑of‑day OHLCV, fundamentals (rev/GM/ROIC), estimates, sector/industry classification, sentiment (news RSS), emissions/ESG (if provided). All optional; user supplies sources.
Factor & Signal Engine
•
Built‑in factors: Momentum (12‑1, 6‑1), Value (EV/EBITDA, P/B), Quality (ROE, GM stability), Growth (sales/EBITDA), Low‑vol, Size, ESG tilt score.
•
Custom signals: expression builder (e.g., (mom_12_1 * 0.6 + quality_z * 0.4) * esg_tilt).
•
Signal pipeline: winsorize → z‑score → neutralize (by sector/size) → combine → decay → rebalance cadence.
•
Regime tags: macro state heuristics (risk‑on/off) to gate signals.
Backtesting & Portfolio Construction
•
Backtest settings: lookback, rebalance freq (D/W/M), costs model (bps + slippage function of ADV), borrow cost (for shorts), corporate actions adjust, survivorship‑bias guards.
•
Portfolio methods: Mean‑Variance (cov shrinkage), Risk‑Parity, Black‑Litterman (views from Strategist), Equal‑risk‑contrib, Long‑only or 130/30.
•
Constraints: gross/net exposure, sector caps, single‑name max, liquidity (position ≤ x% ADV), beta target, tracking error band.
•
Outputs: returns, vol, Sharpe/Sortino, hit rate, drawdown, turnover, TE vs. benchmark, factor exposure time series.
Risk & Scenarios
•
Risk metrics: Parametric VaR/ES (Cornish‑Fisher), Historical VaR, factor VaR.
•
Scenarios: macro shocks (rates +100bps, oil −15%, FX shock), policy change (subsidy rollback), supply shock (poly‑silicon), demand shock, volatility spike.
•
Stress harness: apply shocks to factors & idiosyncratic returns; show P&L, exposures change, breached limits, suggested hedges (e.g., short high‑beta peers, long utilities).
•
Liquidity: turnover stress; days‑to‑liquidate at x% ADV; price impact heuristic.
Compliance & Controls
•
Rule library: restricted list symbols; watchlist symbols; concentration & sector caps; leverage & beta caps; hard liquidity floors; ESG exclusion lists; “no shorting” buckets.
•
Pre‑trade checks: evaluate every proposed order/weight; label BLOCK/REVIEW/OK with reasons.
•
Post‑trade surveillance (paper): limit breaches over time, unusual turnover, wash‑trade heuristic across strategy versions.
•
Attestations: disclaimer banners; conflict‑of‑interest checklist on export.
Paper Execution & Monitoring
•
Execution plan: VWAP/TWAP slices, urgency levels, no real routing.
•
Drift monitor: price move vs. triggers → rebalance suggestions.
•
What‑if edits: adjust constraints, see impact delta instantly.
Collaboration & Governance
•
Roles: Quant Analyst, Market Strategist, Risk Manager, Compliance Officer, Viewer.
•
Comments, mentions, approvals: Strategy → Risk → Compliance → Approved for paper.
•
Versioning & diffs of universe, signals, constraints.
Exports
•
Idea memo PDF, Backtest PDF, Trades CSV, Strategy JSON, Compliance report PDF.
4) Backend Architecture (Extremely Detailed & Deployment‑Ready)
4.1 Topology
•
Frontend/BFF: Next.js 14 (Vercel), server actions for small writes & signed URLs.
•
API Gateway: Node/NestJS (REST; OpenAPI 3.1; Zod/AJV; RBAC; rate limiting; Idempotency‑Key; Problem+JSON).
•
Auth: Auth.js (OAuth/passwordless) + short‑lived JWT (rotating refresh); SAML/OIDC for enterprise; SCIM for provisioning.
•
Orchestration: CrewAI Orchestrator (Python FastAPI) coordinating agents:
o
Quant Analyst (signals, backtests, portfolio optimization)
o
Market Strategist (themes, Black‑Litterman views, scenario narratives)
o
Risk Manager (VaR/ES, stress, limits, hedges)
o
Compliance Officer (rules engine, attestations, notes)
•
Workers (Python):
o
data-ingest (CSV/Parquet ingest; corporate action adjust; symbol mapping)
o
factor-engine (compute factors/signals; neutralization)
o
optimizer (MV/BL/RP/ERC with constraints)
o
backtester (returns, stats, turnover, TE; t‑cost model)
o
risk-engine (VaR/ES; scenario shocks; liquidity)
o
compliance-check (pre‑trade checks; surveillance)
o
reporter (PDF backtest/idea/compliance)
o
exporter (CSV/JSON/ZIP bundles)
•
Event Bus: NATS (universe.*, signal.*, backtest.*, portfolio.*, risk.*, compliance.*, export.*).
•
Task Queue: Celery (NATS/Redis backend), lanes: interactive (what‑if), compute (backtests/risk), exports.
•
DB: Postgres (Neon/Cloud SQL) + TimescaleDB (prices/signals) + pgvector (narratives/notes embeddings).
•
Object Storage: S3/R2 (uploads, exports, reports).
•
Cache: Upstash Redis (hot strategy state, last KPIs).
•
Realtime: WebSocket gateway (NestJS) + SSE fallback (job progress, metric streams).
•
Observability: OpenTelemetry traces; Prometheus/Grafana; Sentry; structured logs.
•
Secrets: Cloud Secrets Manager/Vault; KMS‑wrapped; no plaintext secrets.
4.2 CrewAI Agents & Tool Surface
Agents
•
Quant Analyst — builds universe; computes signals; runs backtests; proposes portfolio & trades; writes idea rationale.
•
Market Strategist — maps macro themes; creates BL views (P, Q, Ω); defines scenario narratives.
•
Risk Manager — computes VaR/ES; runs stresses; recommends hedges; checks exposures/limits.
•
Compliance Officer — runs rule checks; annotates compliance notes; flags restricted/watchlist breaches.
Tool Interfaces (strict)
•
Data.load(universe_id, fields, range) → prices/fundamentals panel.
•
Signal.compute(universe_id, recipe) → factor z‑scores, combined signal.
•
Portfolio.optimize(method, inputs, constraints) → weights, diagnostics.
•
Backtest.run(universe_id, weights_fn, costs, rebal) → equity curve, stats, trades.
•
Risk.metrics(weights, returns, cov, params) → VaR/ES, factor exposure, beta, TE.
•
Risk.stress(weights, scenarios) → P&L per scenario, breaches, hedge suggestions.
•
Compliance.check(orders|weights, ruleset) → {status: OK/REVIEW/BLOCK, reasons[]}.
•
Report.build(strategy_id, targets) → PDFs/CSVs.
•
Export.bundle(strategy_id, targets[]) → signed URLs.
4.3 Data Model (Postgres + Timescale + pgvector)
-- Tenancy & Identity CREATE TABLE orgs ( id UUID PRIMARY KEY, name TEXT NOT NULL, plan TEXT, created_at TIMESTAMPTZ DEFAULT now() ); CREATE TABLE users ( id UUID PRIMARY KEY, org_id UUID REFERENCES orgs(id), email CITEXT UNIQUE, name TEXT, role TEXT, tz TEXT, created_at TIMESTAMPTZ DEFAULT now() ); CREATE TABLE memberships ( user_id UUID REFERENCES users(id), org_id UUID REFERENCES orgs(id), workspace_role TEXT CHECK (workspace_role IN ('owner','admin','quant','strategist','risk','compliance','viewer')), PRIMARY KEY (user_id, org_id) ); -- Instruments & Universes CREATE TABLE instruments ( id UUID PRIMARY KEY, symbol TEXT, name TEXT, asset_class TEXT, sector TEXT, industry TEXT, currency TEXT ); CREATE TABLE universes ( id UUID PRIMARY KEY, org_id UUID, name TEXT, description TEXT, created_by UUID, created_at TIMESTAMPTZ DEFAULT now() ); CREATE TABLE universe_members ( universe_id UUID REFERENCES universes(id), instrument_id UUID REFERENCES instruments(id), weight_hint NUMERIC, PRIMARY KEY (universe_id, instrument_id) ); -- Market Data (Timescale hypertables) CREATE TABLE prices ( instrument_id UUID REFERENCES instruments(id), ts TIMESTAMPTZ, open NUMERIC, high NUMERIC, low NUMERIC, close NUMERIC, adj_close NUMERIC, volume BIGINT,
PRIMARY KEY (instrument_id, ts) ); SELECT create_hypertable('prices', by_range('ts'), if_not_exists => TRUE); CREATE TABLE fundamentals ( instrument_id UUID, period DATE, metric TEXT, value NUMERIC, PRIMARY KEY (instrument_id, period, metric) ); CREATE TABLE signals ( universe_id UUID, instrument_id UUID, ts TIMESTAMPTZ, name TEXT, value NUMERIC, PRIMARY KEY (universe_id, instrument_id, ts, name) ); SELECT create_hypertable('signals', by_range('ts'), if_not_exists => TRUE); -- Strategies & Backtests CREATE TABLE strategies ( id UUID PRIMARY KEY, org_id UUID, universe_id UUID, title TEXT, method TEXT, -- 'MV','BL','RP','ERC' config JSONB, status TEXT CHECK (status IN ('created','research','risk_review','compliance','approved','exported','archived')) DEFAULT 'created', created_by UUID, created_at TIMESTAMPTZ DEFAULT now() ); CREATE TABLE backtests ( id UUID PRIMARY KEY, strategy_id UUID REFERENCES strategies(id), start DATE, "end" DATE, freq TEXT, costs_bps NUMERIC, borrow_bps NUMERIC, kpis JSONB, equity_curve_key TEXT, trades_csv_key TEXT, created_at TIMESTAMPTZ DEFAULT now() ); -- Weights, Trades (paper) CREATE TABLE weights ( id UUID PRIMARY KEY, strategy_id UUID, ts TIMESTAMPTZ, instrument_id
UUID, weight NUMERIC ); CREATE TABLE orders ( id UUID PRIMARY KEY, strategy_id UUID, ts TIMESTAMPTZ, instrument_id UUID, side TEXT CHECK (side IN ('BUY','SELL')), qty NUMERIC, price_hint NUMERIC, status TEXT CHECK (status IN ('PAPER','CANCELED')) DEFAULT 'PAPER' ); -- Risk & Scenarios CREATE TABLE risk_metrics ( id UUID PRIMARY KEY, strategy_id UUID, ts TIMESTAMPTZ, var_95 NUMERIC, es_97 NUMERIC, beta NUMERIC, te NUMERIC, exposure JSONB ); CREATE TABLE scenarios ( id UUID PRIMARY KEY, strategy_id UUID, name TEXT, params JSONB, results JSONB, -- {pnl, breaches[], exposures_delta} created_at TIMESTAMPTZ DEFAULT now() ); -- Compliance CREATE TABLE rulesets ( id UUID PRIMARY KEY, org_id UUID, name TEXT, rules JSONB, created_at TIMESTAMPTZ DEFAULT now() ); CREATE TABLE restricted_list ( id UUID PRIMARY KEY, org_id UUID, instrument_id UUID, reason TEXT, updated_at TIMESTAMPTZ DEFAULT now() ); CREATE TABLE compliance_checks ( id UUID PRIMARY KEY, strategy_id UUID, ts TIMESTAMPTZ, status TEXT CHECK (status IN ('OK','REVIEW','BLOCK')), reasons TEXT[], detail JSONB ); -- Collaboration & Exports CREATE TABLE comments (
id UUID PRIMARY KEY, strategy_id UUID, author_id UUID, body TEXT, anchor JSONB, embedding VECTOR(1536), created_at TIMESTAMPTZ DEFAULT now() ); CREATE TABLE exports ( id UUID PRIMARY KEY, strategy_id UUID, kind TEXT, s3_key TEXT, meta JSONB, created_at TIMESTAMPTZ DEFAULT now() ); CREATE TABLE audit_log ( id BIGSERIAL PRIMARY KEY, org_id UUID, user_id UUID, strategy_id UUID, action TEXT, target TEXT, meta JSONB, created_at TIMESTAMPTZ DEFAULT now() );
Indexes & Constraints (high‑value)
•
Timescale compression policies on prices, signals.
•
CREATE INDEX ON risk_metrics (strategy_id, ts DESC);
•
Foreign‑key cascades on universes→universe_members, strategies→children.
•
Service invariant: sum(weights) within [−1.0, +1.0] unless leverage enabled.
4.4 API Surface (REST /v1, OpenAPI)
Auth & Orgs
•
POST /v1/auth/login / POST /v1/auth/refresh
•
GET /v1/me / GET /v1/orgs/:id
Universe & Data
•
POST /v1/universes {name, description, members[]}
•
POST /v1/universes/:id/data/upload (CSV/Parquet) → prices/fundamentals ingest
•
GET /v1/universes/:id/members / GET /v1/instruments/:id/prices?from&to
Signals & Strategies
•
POST /v1/strategies {universe_id,title,method,config}
•
POST /v1/strategies/:id/signals/run {recipe} → signals rows
•
POST /v1/strategies/:id/optimize {method,constraints} → weights proposal
•
POST /v1/strategies/:id/backtest {start,end,freq,costs_bps,borrow_bps} → equity curve & KPIs
Risk & Scenarios
•
POST /v1/strategies/:id/risk {params} → VaR/ES/exposures
•
POST /v1/strategies/:id/scenarios {scenarios[]} → results
•
GET /v1/strategies/:id/risk-metrics
Compliance
•
POST /v1/rulesets {name,rules}
•
POST /v1/strategies/:id/compliance/pretrade {weights|orders} → status & reasons
•
GET /v1/strategies/:id/compliance/history
Paper Execution & Exports
•
POST /v1/strategies/:id/orders {orders[]} (paper only)
•
POST /v1/strategies/:id/export {targets:['idea_pdf','backtest_pdf','trades_csv','bundle_zip']}
•
GET /v1/exports/:id → signed URL
Conventions
•
All generate/mutate endpoints require Idempotency‑Key.
•
Errors: Problem+JSON with remediation.
•
Strict RLS per org/strategy.
4.5 Orchestration Logic (CrewAI)
State machine (per strategy)
created → research (signals/backtest) → risk_review → compliance → approved (paper) → exported → archived
Turn sequence
1.
data-ingest loads panel data for the universe.
2.
Quant Analyst runs factor-engine & backtester → candidate portfolio.
3.
Market Strategist adds BL views; optimizer recomputes; writes macro thesis.
4.
Risk Manager computes VaR/ES, runs stresses; proposes hedges & limit changes.
5.
Compliance Officer runs pre‑trade checks; emits notes & flags; requests edits if required.
6.
reporter/exporter produce idea memo, trades CSV, compliance report.
4.6 Background Jobs
•
IngestMarketData(universeId, files)
•
ComputeSignals(strategyId, recipe)
•
RunBacktest(strategyId, params)
•
OptimizePortfolio(strategyId, method, constraints)
•
ComputeRisk(strategyId, params)
•
RunScenarios(strategyId, list)
•
CompliancePretrade(strategyId, weights)
•
BuildExports(strategyId, targets[])
•
Periodics: CompressionPolicy, CostRollup, RetentionSweep, AlertOnFailure.
4.7 Realtime
•
WS channels:
o
strategy:{id}:signals (progress & readiness)
o
strategy:{id}:backtest (equity curve chunks)
o
strategy:{id}:risk (VaR/ES ready)
o
strategy:{id}:compliance (pre‑trade result)
o
export:{id}:status
•
Presence: who is editing which panel; lock on compliance when under review.
4.8 Caching & Performance
•
Redis: last signals, last weights, last risk metrics, recent equity curve.
•
SLOs (universe ≤ 1k symbols, 5y daily):
o
Signal compute < 8s P95.
o
Backtest < 12s P95.
o
Risk metrics < 5s P95.
o
Scenarios (5 shocks) < 6s P95.
o
Export bundle < 10s P95.
4.9 Observability
•
OTel spans with tags: universe_id, strategy_id, job_type, tokens/cost.
•
Metrics: job durations, backtest error rate, compliance BLOCK rate, VaR drift vs realized paper P&L.
•
Logs: structured JSON; audit_log for runs, edits, approvals, exports.
5) Frontend Architecture (React 18 + Next.js 14)
5.1 Tech Choices
•
Next.js 14 App Router, TypeScript.
•
UI: shadcn/ui + Tailwind (desk‑terminal aesthetic).
•
State/data: TanStack Query (server cache) + Zustand (what‑if sliders, chart cursors).
•
Realtime: WebSocket client with reconnect/backoff; SSE fallback.
•
Charts: Recharts (equity curves, drawdown, exposures heatmap, tornado scenario bars).
•
Tables: virtualized (universes, signals, trades).
•
File handling: signed S3 URLs for CSV/Parquet upload & exports.
5.2 App Structure
/app /(marketing)/page.tsx /(app) dashboard/page.tsx universes/ new/page.tsx [universeId]/page.tsx strategies/ new/page.tsx [strategyId]/ page.tsx // Strategy overview universe/page.tsx // Universe & data health
signals/page.tsx // Factor recipes & z-scores backtest/page.tsx // Settings & results optimize/page.tsx // Portfolio construction risk/page.tsx // VaR/ES, exposures, stress compliance/page.tsx // Pre-trade results & notes orders/page.tsx // Paper orders view exports/page.tsx admin/rulesets/page.tsx admin/audit/page.tsx /components BriefWizard/* UniverseBuilder/* CSVUploader/* DataHealthCard/* SignalRecipeEditor/* ZScoreTable/* EquityCurve/* DrawdownChart/* ExposureHeatmap/* RiskKPIDials/* ScenarioTornado/* BLViewsEditor/* ConstraintsForm/* WeightsTable/* OrdersTable/* CompliancePanel/* ExportHub/* CommentThread/* /lib api-client.ts ws-client.ts zod-schemas.ts rbac.ts /store useStrategyStore.ts useSignalsStore.ts useRiskStore.ts useRealtimeStore.ts
5.3 Key Pages & UX Flows
Dashboard
•
Tiles: “Start strategy,” “Risk review pending,” “Compliance flags,” “Recent exports.”
•
Cards: top Sharpe backtests (last 7d), avg VaR, compliance BLOCK rate.
Universe
•
UniverseBuilder: filters (sector/ADV/mcap), add/remove tickers, view member count; CSVUploader for custom panels; DataHealthCard (missing data, splits, stale symbols).
Signals
•
SignalRecipeEditor: add factors, weights, neutralization; preview z‑score distribution; ZScoreTable with sector‑neutral means.
•
Save recipe → WS shows compute progress → results table & histogram.
Backtest
•
Choose start/end/freq/costs; run; EquityCurve & DrawdownChart render; KPIs table (Sharpe, Sortino, TE, turnover).
•
Hover shows regime tags; download trades CSV.
Optimize
•
ConstraintsForm (gross/net, caps, beta, liquidity, TE band); pick method (MV/BL/RP/ERC).
•
BLViewsEditor for strategist priors; recompute weights; WeightsTable with deltas & liquidity bars.
Risk
•
RiskKPIDials (VaR/ES/Beta/TE); ExposureHeatmap by factor/sector; ScenarioTornado shows P&L under shocks.
•
Toggle hedges; preview residual risk change.
Compliance
•
CompliancePanel shows pre‑trade result (OK/REVIEW/BLOCK) per rule; click reason to see offending names; “Request exception” (adds comment to compliance thread).
Orders (Paper)
•
OrdersTable lists simulated slices (VWAP/TWAP); edit urgency; no routing; just plan preview.
Exports
•
ExportHub: idea memo, backtest PDF, trades CSV, bundle; progress list; signed URLs; change log since last export.
5.4 Component Breakdown (Selected)
•
SignalRecipeEditor/Term.tsx
Props: { factor, weight, neutralizeBy }; validates sum of weights; hints if high collinearity.
•
ExposureHeatmap/Matrix.tsx
Props: { exposures }; rows=factors, cols=portfolio/time; tooltips show contribution to risk.
•
ScenarioTornado/Bar.tsx
Props: { scenario, pnl }; shows +/- bars; click drills into factor contributions to P&L.
•
CompliancePanel/RuleRow.tsx
Props: { rule, status, offenders }; severity badges; export to PDF notes.
5.5 Data Fetching & Caching
•
Server Components for lists (universes, strategies, rulesets) and snapshots (last KPIs).
•
TanStack Query for compute results (signals, backtests, risk, compliance).
•
WS pushes to update charts/tables in place via queryClient.setQueryData.
•
Prefetch neighbors: signals → backtest → optimize → risk → compliance.
5.6 Validation & Error Handling
•
Zod schemas: universe members, price rows, factor recipes, backtest params, constraints, scenarios, rulesets.
•
Problem+JSON renderer with fixes (e.g., “Liquidity breach: reduce max weight or raise ADV floor”).
•
Guardrails: export disabled if compliance status = BLOCK; backtest disabled if data health < threshold.
5.7 Accessibility & i18n
•
Keyboard navigation across tables/charts; ARIA roles; focus‑visible rings.
•
High‑contrast charts; color‑blind palettes; tooltips usable via keyboard.
•
next-intl scaffolding; currency/number/date localization.
6) Integrations
•
Market data: pluggable adapters (CSV/Parquet upload, custom APIs)—user‑configured; no vendor baked in.
•
Comms: Slack/Email (risk complete, compliance ready, export finished).
•
Identity/SSO: Auth.js; SAML/OIDC; SCIM for enterprise.
•
Payments (SaaS): Stripe (seats + metered compute).
•
No brokerage connectivity—paper simulation only.
7) DevOps & Deployment
•
FE: Vercel (Next.js 14).
•
APIs/Workers: Render/Fly.io (simple) or GKE (scale; node pools: CPU for factor/backtest; mem‑opt for risk; burst for exports).
•
DB: Managed Postgres + Timescale + pgvector; PITR; gated migrations.
•
Cache: Upstash Redis.
•
Object Store: S3/R2 with lifecycle (retain exports; purge temp uploads).
•
Event Bus: NATS (managed/self‑hosted).
•
CI/CD: GitHub Actions — lint/typecheck/unit/integration; Docker build; SBOM + cosign; blue/green; migration approvals.
•
IaC: Terraform modules (DB, Redis, NATS, buckets, secrets, DNS/CDN).
•
Testing
o
Unit: factor math, neutralization, optimizer constraints, t‑cost model, VaR/ES formulas, rules engine.
o
Contract: OpenAPI.
o
E2E (Playwright): brief→universe→signals→backtest→optimize→risk→compliance→export.
o
Load: k6 (backtests & risk in parallel).
o
Chaos: missing data windows, symbol remaps, extreme constraints.
o
Security: ZAP; container/dependency scans; secret scanning.
•
SLOs (restate §4.8): signals <8s; backtest <12s; risk <5s; scenarios <6s; export <10s; 5xx <0.5%/1k.
8) Success Criteria
Product KPIs
•
Idea time: brief → approved paper strategy in < 45 min median.
•
Compliance friction: ≤ 10% of approved runs require exception notes.
•
Risk coverage: ≥ 95% runs include VaR + ≥3 scenarios before approval.
•
User satisfaction: ≥ 80% rate outputs “actionable (paper)”.
Engineering SLOs
•
Export success ≥ 99%; WS reconnect < 2 s P95; chart interactivity < 120 ms perceived latency.
9) Security & Compliance
•
RBAC: Owner/Admin/Quant/Strategist/Risk/Compliance/Viewer; approval gates lock edits post‑sign‑off.
•
Encryption: TLS 1.2+; AES‑256 at rest; KMS‑wrapped secrets; signed URLs for uploads/exports.
•
Privacy: no personal trading accounts; no client PII; configurable retention; DSR endpoints.
•
Tenant isolation: Postgres RLS; S3 prefix isolation.
•
Auditability: immutable audit_log for data loads, computations, approvals, exports.
•
Supply chain: SLSA provenance; image signing; pinned deps.
•
Legal disclaimers: not investment advice; not a broker‑dealer; paper simulation only.
10) Visual/Logical Flows
A) Brief → Universe → Signals
User sets theme & constraints → upload/confirm data → Quant Analyst computes factors/z‑scores → combined signal preview.
B) Backtest → Optimize
Backtest with costs/borrow → view KPIs & trades → pick construction method & constraints → weights table emits proposed portfolio.
C) Risk Review
Risk Manager computes VaR/ES & runs shocks → flags breaches → proposes hedges → update weights/constraints.
D) Compliance
Compliance Officer runs rules → OK/REVIEW/BLOCK → annotate notes or request changes.
E) Paper Orders & Export
Generate paper orders (VWAP/TWAP) → ExportHub builds idea memo, backtest PDF, trades CSV, compliance report → signed URLs.