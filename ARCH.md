# Architecture — AI TRADING FLOOR

## Topology
- **Frontend**: Next.js 14 (TS). UI: shadcn + Tailwind (desk‑terminal). Data: TanStack Query; Zustand for what‑if sliders/cursors. Realtime: WS + SSE fallback. Charts: Recharts (equity/drawdown/exposures/tornado).
- **API Gateway**: NestJS (REST /v1; OpenAPI 3.1; Zod/AJV validation; RBAC; rate limits; Idempotency‑Key; Problem+JSON). Signed S3/R2 URLs.
- **Auth**: Auth.js (OAuth/passwordless) + short‑lived JWT; SAML/OIDC; SCIM.
- **Orchestrator**: FastAPI + CrewAI agents (Quant Analyst, Market Strategist, Risk Manager, Compliance Officer).
- **Workers (Python)**: data‑ingest, factor‑engine, optimizer, backtester, risk‑engine, compliance‑check, reporter, exporter.
- **Infra**: Postgres (+ Timescale hypertables for prices/signals) + pgvector; Upstash Redis; NATS; Celery; S3/R2; OTel/Prom/Grafana; Sentry; Vault/KMS.

## Data Model (high level)
- **Tenancy**: `orgs`, `users`, `memberships` (Owner/Admin/Quant/Strategist/Risk/Compliance/Viewer).
- **Universe & Data**: `instruments`, `universes`, `universe_members`, Timescale `prices`, `fundamentals`, `signals`.
- **Strategies**: `strategies`, `backtests`, `weights`, `orders` (paper).
- **Risk/Scenarios**: `risk_metrics`, `scenarios`.
- **Compliance**: `rulesets`, `restricted_list`, `compliance_checks`.
- **Collab/Exports**: `comments`, `exports`, `audit_log`.

## API Surface (v1)
- **Auth/Orgs**: `POST /auth/login`, `POST /auth/refresh`, `GET /me`, `GET /orgs/:id`
- **Universes**: `POST /universes`, `POST /universes/:id/data/upload`, `GET /universes/:id/members`
- **Strategies**: `POST /strategies`, `POST /strategies/:id/signals/run`, `POST /strategies/:id/backtest`, `POST /strategies/:id/optimize`
- **Risk**: `POST /strategies/:id/risk`, `POST /strategies/:id/scenarios`, `GET /strategies/:id/risk-metrics`
- **Compliance**: `POST /rulesets`, `POST /strategies/:id/compliance/pretrade`, `GET /strategies/:id/compliance/history`
- **Orders & Export**: `POST /strategies/:id/orders` (paper), `POST /strategies/:id/export`, `GET /exports/:id`
**Conventions**: Idempotency‑Key for mutations; Problem+JSON; strict RLS.

## Agent Tool Contracts (strict JSON)
- `Data.load(universe_id, fields, range)` → `{panel}`
- `Signal.compute(universe_id, recipe)` → `{z_scores, combined, diagnostics}`
- `Portfolio.optimize(method, inputs, constraints)` → `{weights, diag}`
- `Backtest.run(universe_id, weights_fn, costs, rebal)` → `{equity_curve, kpis, trades_key}`
- `Risk.metrics(weights, returns, cov, params)` → `{var_95, es_97, beta, te, exposures}`
- `Risk.stress(weights, scenarios)` → `{scenario_results[{name, pnl, breaches, exposures_delta}], hedges}`
- `Compliance.check(orders|weights, ruleset)` → `{status: 'OK'|'REVIEW'|'BLOCK', reasons[]}`
- `Report.build(strategy_id, targets)` / `Export.bundle(strategy_id, targets[])` → `{links[]}`

## Deterministic Heuristics
- **Factor math**: winsorization (e.g., 5/95), z‑score, sector/size neutralization, decay λ, rebalance cadence.
- **Costs**: bps + slippage = f(ADV, participation); borrow bps for shorts; trades throttled by liquidity cap.
- **Optimizers**: MV with Ledoit‑Wolf shrinkage; BL with strategist views (P,Q,Ω) and τ; Risk‑Parity/ERC convex solver; long‑only or 130/30.
- **Risk**: Parametric VaR/ES (Cornish‑Fisher), Historical VaR rolling window; factor VaR decomposition; beta & TE.
- **Scenarios**: shocks map to factor returns & idiosyncratic residuals; liquidity stress = days‑to‑liquidate at x% ADV.
- **Compliance**: rule precedence BLOCK > REVIEW > OK; explanation strings enumerate offenders & limits breached.

## Realtime Channels
- `strategy:{id}:signals` (compute progress/results)
- `strategy:{id}:backtest` (equity curve chunks)
- `strategy:{id}:risk` (VaR/ES/exposures ready)
- `strategy:{id}:compliance` (pre‑trade outcome)
- `export:{id}:status`
Presence & soft locks during compliance review.

## Security & Compliance
RBAC (approval gates lock edits post‑sign‑off); Postgres RLS; signed URLs; PII avoidance; immutable audit_log for data loads, runs, approvals, exports; retention policies; supply‑chain hardening (SBOM, image signing).

## Deployment & SLOs
FE: Vercel. APIs/Workers: Render/Fly → GKE at scale (CPU: factor/backtest; mem‑opt: risk; burst: exports).  
DB: Managed Postgres + Timescale + pgvector. Cache: Upstash Redis. Bus: NATS.  
**SLOs**: signals < **8 s**; backtest < **12 s**; risk < **5 s**; scenarios < **6 s**; export < **10 s**; 5xx < **0.5%/1k**.
