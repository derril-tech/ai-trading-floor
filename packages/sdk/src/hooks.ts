import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TradingFloorClient } from './client';
import {
  LoginRequest,
  CreateUniverseRequest,
  CreateStrategyRequest,
  ExportRequest,
} from './types';

// Created automatically by Cursor AI (2024-01-XX)

// Create a singleton client instance
const client = new TradingFloorClient();

// Auth hooks
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: LoginRequest) => client.login(request),
    onSuccess: (data) => {
      // Store user data in query cache
      queryClient.setQueryData(['user'], data.user);
    },
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => client.getProfile(),
    enabled: false, // Only fetch when explicitly called
  });
};

// Universe hooks
export const useUniverses = () => {
  return useQuery({
    queryKey: ['universes'],
    queryFn: () => client.getUniverses(),
  });
};

export const useUniverse = (id: string) => {
  return useQuery({
    queryKey: ['universes', id],
    queryFn: () => client.getUniverse(id),
    enabled: !!id,
  });
};

export const useCreateUniverse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: CreateUniverseRequest) => client.createUniverse(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universes'] });
    },
  });
};

// Strategy hooks
export const useStrategies = () => {
  return useQuery({
    queryKey: ['strategies'],
    queryFn: () => client.getStrategies(),
  });
};

export const useStrategy = (id: string) => {
  return useQuery({
    queryKey: ['strategies', id],
    queryFn: () => client.getStrategy(id),
    enabled: !!id,
  });
};

export const useCreateStrategy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: CreateStrategyRequest) => client.createStrategy(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
    },
  });
};

// Risk hooks
export const useRiskCalculation = (strategyId: string) => {
  return useQuery({
    queryKey: ['risk', strategyId],
    queryFn: () => client.calculateRisk(strategyId),
    enabled: !!strategyId,
  });
};

// Compliance hooks
export const useComplianceCheck = () => {
  return useMutation({
    mutationFn: (strategyId: string) => client.pretradeCheck(strategyId),
  });
};

// Export hooks
export const useExportStrategy = () => {
  return useMutation({
    mutationFn: ({ strategyId, request }: { strategyId: string; request: ExportRequest }) =>
      client.exportStrategy(strategyId, request),
  });
};
