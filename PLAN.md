# Project Plan — AI TRADING FLOOR

> Scope: Turn a themed brief (e.g., “Find trading opportunities in renewable energy.”) into **idea packets** with quantified signals, **strategy sheets** (universe, factor model, portfolio construction), **risk dossiers** (VaR/ES/stress), **compliance notes**, paper‑orders, and **exportable memos** (PDF/CSV/JSON).

## Product Goal
Give research desks a fast, explainable pipeline from idea → signals → backtest → portfolio → risk → compliance → **paper‑approved** plan, with tight guardrails and full auditability.

## Safety, Legal & Scope
- **Not investment advice. No brokerage or routing. Paper simulation only.**
- User‑supplied market data adapters (CSV/Parquet/custom)—no vendor baked in.
- Compliance features are **assistive**; org policies prevail.
- PII avoidance: no personal accounts or client data. Configurable retention & DSR endpoints.

## 80/20 Build Strategy
- **80% deterministic/code**: factor/neutralization math, optimizers (MV/BL/RP/ERC), VaR/ES/stress, liquidity/ADV checks, rules engine, exports.
- **20% generative/agents**: idea narratives, strategist BL views text, risk commentary, compliance notes—**constrained by JSON tool contracts**.

## Immediate Next 3 Tasks
1) **Monorepo & infra**: `apps/{web,gateway,orchestrator,workers}`; `docker-compose.dev` (Postgres+Timescale, Redis, NATS, MinIO); CI with lint/test/build; SBOM/cosign; `.env.example`.
2) **Contracts**: NestJS gateway with OpenAPI 3.1, Problem+JSON, Idempotency‑Key, RBAC; WebSocket channels; signed upload/exports.
3) **Signal core**: factor engine (momentum/value/quality/low‑vol/size), winsorize→zscore→neutralize→combine pipeline; SignalRecipe UI + streaming.

## Phases
- **P0** Repo/infra/CI + typed contracts  
- **P1** DB schema (Postgres+Timescale+pgvector) + auth/RBAC + RLS  
- **P2** Universe builder & data ingest health (CSV/Parquet)  
- **P3** Factor/Signal engine + recipe editor & z‑score views  
- **P4** Backtester + costs/borrow models + trades CSV  
- **P5** Portfolio optimizers (MV/BL/RP/ERC) + constraints & BL views  
- **P6** Risk (VaR/ES/exposures) + scenarios/stress + liquidity  
- **P7** Compliance rules engine + pre‑trade checks + notes  
- **P8** Paper orders (VWAP/TWAP), exports (idea/backtest/compliance/bundle), hardening & observability

## Definition of Done (MVP)
- **Universe** created from filters/upload; data health report passes thresholds.
- **Signals** run from a saved recipe (winsorize/zscore/neutralize/combine/decay) with sector‑neutral summaries.
- **Backtest** produces equity curve, drawdown, Sharpe/Sortino, turnover, trades CSV.
- **Portfolio** constructed with constraints (gross/net, sector caps, single‑name, beta, TE, liquidity).
- **Risk**: parametric & historical VaR/ES, exposures heatmap, ≥3 scenario shocks with P&L & breaches.
- **Compliance**: pre‑trade status (OK/REVIEW/BLOCK) with reasons per rule.
- **Paper orders**: VWAP/TWAP plan preview (no routing).
- **Exports**: Idea memo PDF, Backtest PDF, Trades CSV, Strategy JSON, Compliance report.
- **SLOs**: signals < **8 s P95**; backtest < **12 s**; risk < **5 s**; 5 scenarios < **6 s**; export < **10 s**.

## Non‑Goals (MVP)
- No live brokerage integration or order submission.
- No vendor market‑data licensing or ingestion beyond user‑provided adapters.
- No intraday tick analytics; daily bars baseline.

## Key Risks & Mitigations
- **Data quality gaps** → ingest health checks, survivorship guards, symbol remaps, gaps interpolation rules.
- **Overfitting** → walk‑forward & OOS splits; turnover & TE penalties; regime gating.
- **Constraint explosions** → convex optimizer fallbacks; informative error remediations.
- **Compliance false negatives** → conservative defaults; explicit BLOCK on uncertainty; human sign‑off gate.

## KPIs (first 90 days)
- **Idea time**: brief → paper‑approved in **< 45 min** median.
- **Risk coverage**: ≥ **95%** of approved runs include VaR + ≥3 scenarios.
- **Compliance friction**: ≤ **10%** of approved runs require exceptions.
- **Adoption**: ≥ **70%** strategies export both idea memo & backtest.
