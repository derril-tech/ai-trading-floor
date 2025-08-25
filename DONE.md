# DONE — AI TRADING FLOOR

## Phase 0 — Repo, Infra, CI/CD

[2024-01-XX] [Cursor] Monorepo scaffold (`apps/{web,gateway,orchestrator,workers}`, `packages/{types,sdk-web,sdk-python}`).
[2024-01-XX] [Cursor] `docker-compose.dev.yml`: Postgres+Timescale, Redis, NATS, MinIO; healthchecks; seed scripts.
[2024-01-XX] [Cursor] GitHub Actions: lint/typecheck/unit; Docker build; SBOM + cosign; migration gate.
[2024-01-XX] [Cursor] `.env.example` (DB/Timescale, S3, Redis, NATS, JWT/OAuth).

## Phase 1 — DB, Auth, Contracts

[2024-01-XX] [Cursor] SQL migrations from ARCH; hypertables, compression policies; indexes; RLS policies.
[2024-01-XX] [Cursor] NestJS OpenAPI 3.1 + Zod parity; Problem+JSON; Idempotency middleware; rate‑limiters.
[2024-01-XX] [Cursor] Auth.js + RBAC guards (Owner/Admin/Quant/Strategist/Risk/Compliance/Viewer).

## Phase 2 — Universe & Data

[2024-01-XX] [Cursor] CSV/Parquet ingest (prices/fundamentals); corporate‑action adjust; symbol mapping; data‑health metrics.
[2024-01-XX] [Cursor] **UniverseBuilder**, **CSVUploader**, **DataHealthCard**.

## Phase 3 — Signals

[2024-01-XX] [Cursor] factor‑engine (momentum/value/quality/growth/low‑vol/size/ESG tilt); winsorize→zscore→neutralize→combine→decay.
[2024-01-XX] [Cursor] **SignalRecipeEditor**, **ZScoreTable** with sector‑neutral views & histograms; WS streaming.

## Phase 4 — Backtest

[2024-01-XX] [Cursor] backtester (D/W/M rebalance; costs/borrow; turnover/TE; trades CSV).
[2024-01-XX] [Cursor] **EquityCurve**, **DrawdownChart**, KPIs table; download trades.

## Phase 5 — Portfolio Construction

[2024-01-XX] [Cursor] optimizers (MV w/ shrinkage, BL, RP/ERC); constraints (gross/net, sector caps, single‑name, beta, TE band, liquidity ≤ x% ADV).
[2024-01-XX] [Cursor] **ConstraintsForm**, **BLViewsEditor**, **WeightsTable** with deltas & liquidity bars.

## Phase 6 — Risk & Scenarios

[2024-01-XX] [Cursor] VaR/ES (parametric & historical), factor exposures; scenario shocks (rates, oil, FX, volatility, sector shocks); liquidity stress.
[2024-01-XX] [Cursor] **RiskKPIDials**, **ExposureHeatmap**, **ScenarioTornado**; hedging what‑ifs.

## Phase 7 — Compliance

[2024-01-XX] [Cursor] rules engine (restricted/watchlist, exclusions, leverage/beta caps, sector/single‑name caps, liquidity floors); pre‑trade outcome & notes.
[2024-01-XX] [Cursor] **CompliancePanel** with OK/REVIEW/BLOCK, offenders table, "request exception" thread.

## Phase 8 — Paper Orders & Exports

[2024-01-XX] [Cursor] VWAP/TWAP slicer (plan only), drift monitor; reporter (PDFs), exporter (CSV/JSON/ZIP) with signed URLs and change log.
[2024-01-XX] [Cursor] **OrdersTable**, **ExportHub** (idea/backtest/compliance/bundle).

## Phase 9 — Live Trading

[2024-01-XX] [Cursor] real-time market data (websockets); order routing (FIX/REST); execution management (OMS); trade reconciliation.
[2024-01-XX] [Cursor] **LiveOrders**, **TradeBlotter**, **MarketDataStream**.

## Phase 10 — Advanced Enterprise Platform

[2024-01-XX] [Cursor] **Advanced Analytics & ML**: TensorFlow/PyTorch integration, sentiment analysis, alternative data sources, model performance tracking.
[2024-01-XX] [Cursor] **Enterprise Features**: Multi-tenancy, audit logging, advanced reporting, API rate limiting.
[2024-01-XX] [Cursor] **Performance & Scale**: Microservices, Kubernetes deployment, caching strategy, database optimization.
[2024-01-XX] [Cursor] **Trading Enhancements**: Options trading, fixed income, FX trading, crypto integration.
[2024-01-XX] [Cursor] **AI/ML Pipeline**: Automated strategy discovery, feature engineering, model explainability, AutoML.
