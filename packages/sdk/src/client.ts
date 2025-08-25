import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  LoginRequest,
  LoginResponse,
  User,
  Universe,
  CreateUniverseRequest,
  Strategy,
  CreateStrategyRequest,
  RiskMetrics,
  ComplianceCheck,
  ExportRequest,
  ExportResponse,
} from './types';

// Created automatically by Cursor AI (2024-01-XX)

export class TradingFloorClient {
  private client: AxiosInstance;
  private accessToken?: string;

  constructor(baseURL: string = 'http://localhost:3001/api/v1') {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
    });

    // Add request interceptor for auth
    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });
  }

  // Auth methods
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.client.post('/auth/login', request);
    this.accessToken = response.data.accessToken;
    return response.data;
  }

  async refresh(refreshToken: string): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.client.post('/auth/refresh', { refreshToken });
    this.accessToken = response.data.accessToken;
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response: AxiosResponse<User> = await this.client.get('/auth/me');
    return response.data;
  }

  // Universe methods
  async createUniverse(request: CreateUniverseRequest): Promise<Universe> {
    const response: AxiosResponse<Universe> = await this.client.post('/universes', request);
    return response.data;
  }

  async getUniverses(): Promise<Universe[]> {
    const response: AxiosResponse<Universe[]> = await this.client.get('/universes');
    return response.data;
  }

  async getUniverse(id: string): Promise<Universe> {
    const response: AxiosResponse<Universe> = await this.client.get(`/universes/${id}`);
    return response.data;
  }

  // Strategy methods
  async createStrategy(request: CreateStrategyRequest): Promise<Strategy> {
    const response: AxiosResponse<Strategy> = await this.client.post('/strategies', request);
    return response.data;
  }

  async getStrategies(): Promise<Strategy[]> {
    const response: AxiosResponse<Strategy[]> = await this.client.get('/strategies');
    return response.data;
  }

  async getStrategy(id: string): Promise<Strategy> {
    const response: AxiosResponse<Strategy> = await this.client.get(`/strategies/${id}`);
    return response.data;
  }

  // Risk methods
  async calculateRisk(strategyId: string): Promise<RiskMetrics> {
    const response: AxiosResponse<RiskMetrics> = await this.client.post(`/risk/strategies/${strategyId}/risk`);
    return response.data;
  }

  // Compliance methods
  async pretradeCheck(strategyId: string): Promise<ComplianceCheck> {
    const response: AxiosResponse<ComplianceCheck> = await this.client.post(`/compliance/strategies/${strategyId}/pretrade`);
    return response.data;
  }

  // Export methods
  async exportStrategy(strategyId: string, request: ExportRequest): Promise<ExportResponse> {
    const response: AxiosResponse<ExportResponse> = await this.client.post(`/exports/strategies/${strategyId}/export`, request);
    return response.data;
  }

  // Utility methods
  setAccessToken(token: string) {
    this.accessToken = token;
  }

  clearAccessToken() {
    this.accessToken = undefined;
  }
}
