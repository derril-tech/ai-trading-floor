# TODO — AI TRADING FLOOR
> Phase‑gated backlog. [Code] deterministic | [Crew] agents/contracts.

## Phase 0 — Repo, Infra, CI/CD
- [x] Monorepo scaffold (`apps/{web,gateway,orchestrator,workers}`, `packages/{types,sdk-web,sdk-python}`).
- [x] `docker-compose.dev.yml`: Postgres+Timescale, Redis, NATS, MinIO; healthchecks; seed scripts.
- [x] GitHub Actions: lint/typecheck/unit; Docker build; SBOM + cosign; migration gate.
- [x] `.env.example` (DB/Timescale, S3, Redis, NATS, JWT/OAuth).

## Phase 1 — DB, Auth, Contracts
- [x] SQL migrations from ARCH; hypertables, compression policies; indexes; RLS policies.
- [x] NestJS OpenAPI 3.1 + Zod parity; Problem+JSON; Idempotency middleware; rate‑limiters.
- [x] Auth.js + RBAC guards (Owner/Admin/Quant/Strategist/Risk/Compliance/Viewer).

## Phase 2 — Universe & Data
- [x] CSV/Parquet ingest (prices/fundamentals); corporate‑action adjust; symbol mapping; data‑health metrics.
- [x] **UniverseBuilder**, **CSVUploader**, **DataHealthCard**.

## Phase 3 — Signals
- [x] factor‑engine (momentum/value/quality/growth/low‑vol/size/ESG tilt); winsorize→zscore→neutralize→combine→decay.
- [x] **SignalRecipeEditor**, **ZScoreTable** with sector‑neutral views & histograms; WS streaming.

## Phase 4 — Backtest
- [x] backtester (D/W/M rebalance; costs/borrow; turnover/TE; trades CSV).
- [x] **EquityCurve**, **DrawdownChart**, KPIs table; download trades.

## Phase 5 — Portfolio Construction
- [x] optimizers (MV w/ shrinkage, BL, RP/ERC); constraints (gross/net, sector caps, single‑name, beta, TE band, liquidity ≤ x% ADV).
- [x] **ConstraintsForm**, **BLViewsEditor**, **WeightsTable** with deltas & liquidity bars.

## Phase 6 — Risk & Scenarios
- [x] VaR/ES (parametric & historical), factor exposures; scenario shocks (rates, oil, FX, volatility, sector shocks); liquidity stress.
- [x] **RiskKPIDials**, **ExposureHeatmap**, **ScenarioTornado**; hedging what‑ifs.

## Phase 7 — Compliance
- [x] rules engine (restricted/watchlist, exclusions, leverage/beta caps, sector/single‑name caps, liquidity floors); pre‑trade outcome & notes.
- [x] **CompliancePanel** with OK/REVIEW/BLOCK, offenders table, "request exception" thread.

## Phase 8 — Paper Orders & Exports
- [x] VWAP/TWAP slicer (plan only), drift monitor; reporter (PDFs), exporter (CSV/JSON/ZIP) with signed URLs and change log.
- [x] **OrdersTable**, **ExportHub** (idea/backtest/compliance/bundle).

## Phase 9 — Live Trading
- [x] real-time market data (websockets); order routing (FIX/REST); execution management (OMS); trade reconciliation.
- [x] **LiveOrders**, **TradeBlotter**, **MarketDataStream**.

## Phase 10 — Advanced Enterprise Platform
- [x] **Advanced Analytics & ML**: TensorFlow/PyTorch integration, sentiment analysis, alternative data sources, model performance tracking.
- [x] **Enterprise Features**: Multi-tenancy, audit logging, advanced reporting, API rate limiting.
- [x] **Performance & Scale**: Microservices, Kubernetes deployment, caching strategy, database optimization.
- [x] **Trading Enhancements**: Options trading, fixed income, FX trading, crypto integration.
- [x] **AI/ML Pipeline**: Automated strategy discovery, feature engineering, model explainability, AutoML.

## Testing Matrix
- **Unit**: factor math & neutralization; optimizer feasibility & constraint binding; costs/borrow model; VaR/ES math; scenario shocks; rules engine precedence.
- **Contract**: OpenAPI & Zod parity; Problem+JSON.
- **E2E (Playwright)**: brief→universe→signals→backtest→optimize→risk→compliance→export.
- **Load (k6)**: parallel backtests & risk runs; export bursts.
- **Chaos**: missing windows, symbol remaps, extreme constraints (infeasible), CSV with corporate‑action quirks.
- **Security**: ZAP; dependency scans; secret scanning; S3 scope tests.

## Seeds & Fixtures
- [Code] Demo universe (≤150 symbols) with synthetic EOD panel (5y daily).
- [Code] Example recipes (momentum/quality blend, value/low‑vol tilt).
- [Code] Ruleset templates (long‑only fund, 130/30 prop, ESG moderate).
- [Code] Scenario presets (rates+100bps, oil −15%, FX shock, vol spike).

## Runbooks
- SLO dashboards (signals/backtest/risk/export).
- On‑call playbooks: WS degradation, NATS backlog, Redis eviction, long backtests.
- Cost controls: job concurrency caps; compute quotas per org; cache TTLs; Timescale compression.

## Out of Scope (MVP)
- Live trading connectivity; OMS/EMS integration.
- Vendor data licensing; tick‑level analytics; options greeks beyond summary (unless user supplies).
