'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'

// Created automatically by Cursor AI (2024-01-XX)

interface RiskMetrics {
  var_parametric: number
  var_historical: number
  es_parametric: number
  es_historical: number
  portfolio_stats: {
    mean_return: number
    volatility: number
    skewness: number
    kurtosis: number
    min_return: number
    max_return: number
    var_95: number
    var_99: number
    es_95: number
    es_99: number
  }
}

interface FactorExposures {
  factor_exposures: {
    market_beta: number
    size_beta: number
    value_beta: number
    momentum_beta: number
  }
  sector_exposures: Record<string, number>
}

interface StressResults {
  market_crash: { scenario_return: number; scenario_loss: number }
  rates_spike: { scenario_return: number; scenario_loss: number }
  oil_shock: { scenario_return: number; scenario_loss: number }
  fx_crisis: { scenario_return: number; scenario_loss: number }
  sector_rotation: { scenario_return: number; scenario_loss: number }
}

interface RiskData {
  risk_metrics: RiskMetrics
  factor_exposures: FactorExposures
  stress_results: StressResults
}

export function RiskKPIDials() {
  const [riskData, setRiskData] = useState<RiskData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedConfidence, setSelectedConfidence] = useState<'95%' | '99%'>('95%')

  const calculateRiskMetrics = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock data
    const mockData: RiskData = {
      risk_metrics: {
        var_parametric: -0.0234,
        var_historical: -0.0256,
        es_parametric: -0.0312,
        es_historical: -0.0345,
        portfolio_stats: {
          mean_return: 0.0008,
          volatility: 0.0189,
          skewness: -0.234,
          kurtosis: 4.567,
          min_return: -0.089,
          max_return: 0.067,
          var_95: -0.0234,
          var_99: -0.0345,
          es_95: -0.0312,
          es_99: -0.0456
        }
      },
      factor_exposures: {
        factor_exposures: {
          market_beta: 0.89,
          size_beta: -0.12,
          value_beta: 0.34,
          momentum_beta: 0.23
        },
        sector_exposures: {
          'Technology': 0.28,
          'Healthcare': 0.22,
          'Finance': 0.18,
          'Consumer': 0.15,
          'Energy': 0.08,
          'Utilities': 0.06,
          'Materials': 0.03
        }
      },
      stress_results: {
        market_crash: { scenario_return: -0.156, scenario_loss: 0.156 },
        rates_spike: { scenario_return: -0.089, scenario_loss: 0.089 },
        oil_shock: { scenario_return: -0.067, scenario_loss: 0.067 },
        fx_crisis: { scenario_return: -0.123, scenario_loss: 0.123 },
        sector_rotation: { scenario_return: -0.045, scenario_loss: 0.045 }
      }
    }
    
    setRiskData(mockData)
    setIsLoading(false)
  }

  useEffect(() => {
    calculateRiskMetrics()
  }, [])

  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`
  const formatNumber = (value: number) => value.toFixed(4)
  
  const getRiskColor = (value: number, threshold: number) => {
    const absValue = Math.abs(value)
    if (absValue > threshold * 1.5) return 'text-red-600'
    if (absValue > threshold) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getRiskBadge = (value: number, threshold: number) => {
    const absValue = Math.abs(value)
    if (absValue > threshold * 1.5) return <Badge variant="destructive">High</Badge>
    if (absValue > threshold) return <Badge variant="secondary">Medium</Badge>
    return <Badge variant="default">Low</Badge>
  }

  const getDialValue = (value: number, min: number, max: number) => {
    return Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Metrics</CardTitle>
          <CardDescription>Calculating portfolio risk metrics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!riskData) return null

  const { risk_metrics, factor_exposures, stress_results } = riskData

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Risk Metrics</CardTitle>
              <CardDescription>Portfolio risk analysis and stress testing</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={calculateRiskMetrics}
                disabled={isLoading}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="var-es" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="var-es">VaR & ES</TabsTrigger>
              <TabsTrigger value="factors">Factor Exposures</TabsTrigger>
              <TabsTrigger value="stress">Stress Tests</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="var-es" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Value at Risk (VaR)</h3>
                    <div className="mt-2">
                      <div className="text-3xl font-bold text-red-600">
                        {formatPercentage(selectedConfidence === '95%' ? risk_metrics.var_parametric : risk_metrics.portfolio_stats.var_99)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedConfidence} Confidence Level
                      </div>
                    </div>
                    <div className="mt-4">
                      <Progress 
                        value={getDialValue(Math.abs(selectedConfidence === '95%' ? risk_metrics.var_parametric : risk_metrics.portfolio_stats.var_99), 0, 0.1)} 
                        className="h-2"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Parametric</div>
                      <div className={getRiskColor(risk_metrics.var_parametric, 0.025)}>
                        {formatPercentage(risk_metrics.var_parametric)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Historical</div>
                      <div className={getRiskColor(risk_metrics.var_historical, 0.025)}>
                        {formatPercentage(risk_metrics.var_historical)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Expected Shortfall (ES)</h3>
                    <div className="mt-2">
                      <div className="text-3xl font-bold text-orange-600">
                        {formatPercentage(selectedConfidence === '95%' ? risk_metrics.es_parametric : risk_metrics.portfolio_stats.es_99)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedConfidence} Confidence Level
                      </div>
                    </div>
                    <div className="mt-4">
                      <Progress 
                        value={getDialValue(Math.abs(selectedConfidence === '95%' ? risk_metrics.es_parametric : risk_metrics.portfolio_stats.es_99), 0, 0.15)} 
                        className="h-2"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Parametric</div>
                      <div className={getRiskColor(risk_metrics.es_parametric, 0.035)}>
                        {formatPercentage(risk_metrics.es_parametric)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Historical</div>
                      <div className={getRiskColor(risk_metrics.es_historical, 0.035)}>
                        {formatPercentage(risk_metrics.es_historical)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <Button
                  variant={selectedConfidence === '95%' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedConfidence('95%')}
                >
                  95% Confidence
                </Button>
                <Button
                  variant={selectedConfidence === '99%' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedConfidence('99%')}
                >
                  99% Confidence
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="factors" className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Factor Exposures</h3>
                  <div className="space-y-3">
                    {Object.entries(factor_exposures.factor_exposures).map(([factor, exposure]) => (
                      <div key={factor} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="capitalize">{factor.replace('_', ' ')}</span>
                          {getRiskBadge(exposure, 0.5)}
                        </div>
                        <div className={`font-mono ${getRiskColor(exposure, 0.5)}`}>
                          {formatNumber(exposure)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Sector Exposures</h3>
                  <div className="space-y-3">
                    {Object.entries(factor_exposures.sector_exposures)
                      .sort(([,a], [,b]) => b - a)
                      .map(([sector, exposure]) => (
                        <div key={sector} className="flex items-center justify-between">
                          <span>{sector}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${exposure * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-mono">{formatPercentage(exposure)}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stress" className="space-y-4">
              <h3 className="text-lg font-semibold">Stress Test Results</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(stress_results).map(([scenario, result]) => (
                  <Card key={scenario} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold capitalize">{scenario.replace('_', ' ')}</h4>
                      {getRiskBadge(result.scenario_loss, 0.1)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Return:</span>
                        <span className={`font-mono ${result.scenario_return < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatPercentage(result.scenario_return)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Loss:</span>
                        <span className="font-mono text-red-600">
                          {formatPercentage(result.scenario_loss)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <h3 className="text-lg font-semibold">Portfolio Statistics</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Mean Return</span>
                    <span className="font-mono text-green-600">{formatPercentage(risk_metrics.portfolio_stats.mean_return)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Volatility</span>
                    <span className="font-mono">{formatPercentage(risk_metrics.portfolio_stats.volatility)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Skewness</span>
                    <span className="font-mono">{formatNumber(risk_metrics.portfolio_stats.skewness)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kurtosis</span>
                    <span className="font-mono">{formatNumber(risk_metrics.portfolio_stats.kurtosis)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Min Return</span>
                    <span className="font-mono text-red-600">{formatPercentage(risk_metrics.portfolio_stats.min_return)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Return</span>
                    <span className="font-mono text-green-600">{formatPercentage(risk_metrics.portfolio_stats.max_return)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VaR (95%)</span>
                    <span className="font-mono text-red-600">{formatPercentage(risk_metrics.portfolio_stats.var_95)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VaR (99%)</span>
                    <span className="font-mono text-red-600">{formatPercentage(risk_metrics.portfolio_stats.var_99)}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
