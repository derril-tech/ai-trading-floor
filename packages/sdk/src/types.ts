import { z } from 'zod';

// Created automatically by Cursor AI (2024-01-XX)

// User and Auth Types
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['Owner', 'Admin', 'Quant', 'Strategist', 'Risk', 'Compliance', 'Viewer']),
  orgId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserSchema,
});

// Universe Types
export const UniverseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  symbols: z.array(z.string()),
  filters: z.record(z.any()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateUniverseRequestSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  symbols: z.array(z.string()),
  filters: z.record(z.any()).optional(),
});

// Strategy Types
export const StrategySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  universeId: z.string(),
  signals: z.record(z.any()),
  constraints: z.record(z.any()),
  status: z.enum(['draft', 'running', 'completed', 'failed']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateStrategyRequestSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  universeId: z.string(),
  signals: z.record(z.any()),
  constraints: z.record(z.any()),
});

// Risk Types
export const RiskMetricsSchema = z.object({
  var95: z.number(),
  es97: z.number(),
  beta: z.number(),
  trackingError: z.number(),
  sharpeRatio: z.number(),
  maxDrawdown: z.number(),
  exposures: z.record(z.number()),
});

// Compliance Types
export const ComplianceStatusSchema = z.enum(['OK', 'REVIEW', 'BLOCK']);

export const ComplianceCheckSchema = z.object({
  status: ComplianceStatusSchema,
  reasons: z.array(z.string()),
  violations: z.array(z.object({
    rule: z.string(),
    description: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
  })),
});

// Export Types
export const ExportTypeSchema = z.enum(['idea_memo', 'backtest_report', 'compliance_report', 'trades_csv']);

export const ExportRequestSchema = z.object({
  strategyId: z.string(),
  types: z.array(ExportTypeSchema),
});

export const ExportResponseSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  downloadUrl: z.string().optional(),
  expiresAt: z.string().optional(),
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type Universe = z.infer<typeof UniverseSchema>;
export type CreateUniverseRequest = z.infer<typeof CreateUniverseRequestSchema>;
export type Strategy = z.infer<typeof StrategySchema>;
export type CreateStrategyRequest = z.infer<typeof CreateStrategyRequestSchema>;
export type RiskMetrics = z.infer<typeof RiskMetricsSchema>;
export type ComplianceStatus = z.infer<typeof ComplianceStatusSchema>;
export type ComplianceCheck = z.infer<typeof ComplianceCheckSchema>;
export type ExportType = z.infer<typeof ExportTypeSchema>;
export type ExportRequest = z.infer<typeof ExportRequestSchema>;
export type ExportResponse = z.infer<typeof ExportResponseSchema>;
