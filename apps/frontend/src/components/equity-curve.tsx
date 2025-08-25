'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

// Created automatically by Cursor AI (2024-01-XX)

interface EquityCurveData {
  date: string
  value: number
  cash: number
  gross_exposure: number
  net_exposure: number
}

interface PerformanceMetrics {
  total_return: number
  annualized_return: number
  volatility: number
  sharpe_ratio: number
  max_drawdown: number
  win_rate: number
  total_turnover: number
  avg_turnover: number
  final_value: number
  num_trades: number
}

interface BacktestResult {
  equity_curve: EquityCurveData[]
  performance: PerformanceMetrics
  trades: any[]
}

export function EquityCurve() {
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<'1Y' | '3Y' | '5Y' | 'ALL'>('ALL')

  const runBacktest = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Generate mock data
      const mockData = generateMockEquityCurve()
      const mockPerformance = generateMockPerformance()
      
      setBacktestResult({
        equity_curve: mockData,
        performance: mockPerformance,
        trades: []
      })
    } catch (error) {
      console.error('Error running backtest:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockEquityCurve = (): EquityCurveData[] => {
    const data: EquityCurveData[] = []
    const startDate = new Date('2020-01-01')
    const endDate = new Date('2023-12-31')
    const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    let value = 1000000 // Starting value
    let cash = 1000000
    let gross_exposure = 0
    let net_exposure = 0
    
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      
      // Simulate daily returns
      const dailyReturn = (Math.random() - 0.5) * 0.02 + 0.0005 // Slight positive bias
      value *= (1 + dailyReturn)
      
      // Simulate some rebalancing effects
      if (i % 30 === 0) { // Monthly rebalancing
        gross_exposure = value * 0.95
        net_exposure = value * 0.8
        cash = value * 0.05
      }
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value),
        cash: Math.round(cash),
        gross_exposure: Math.round(gross_exposure),
        net_exposure: Math.round(net_exposure)
      })
    }
    
    return data
  }

  const generateMockPerformance = (): PerformanceMetrics => {
    return {
      total_return: 0.45,
      annualized_return: 0.12,
      volatility: 0.18,
      sharpe_ratio: 0.67,
      max_drawdown: -0.15,
      win_rate: 0.58,
      total_turnover: 2500000,
      avg_turnover: 8500,
      final_value: 1450000,
      num_trades: 294
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`
  }

  const getReturnColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getDrawdownColor = (value: number) => {
    return value >= -0.05 ? 'text-green-600' : value >= -0.10 ? 'text-yellow-600' : 'text-red-600'
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Running backtest...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Backtest Results</CardTitle>
          <CardDescription>
            Strategy performance analysis and equity curve visualization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              <Button 
                variant={selectedPeriod === '1Y' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('1Y')}
              >
                1Y
              </Button>
              <Button 
                variant={selectedPeriod === '3Y' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('3Y')}
              >
                3Y
              </Button>
              <Button 
                variant={selectedPeriod === '5Y' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('5Y')}
              >
                5Y
              </Button>
              <Button 
                variant={selectedPeriod === 'ALL' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('ALL')}
              >
                ALL
              </Button>
            </div>
            <Button onClick={runBacktest} disabled={isLoading}>
              {isLoading ? 'Running...' : 'Run Backtest'}
            </Button>
          </div>

          {backtestResult && (
            <>
              {/* Performance Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getReturnColor(backtestResult.performance.total_return)}`}>
                        {formatPercentage(backtestResult.performance.total_return)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Return</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getReturnColor(backtestResult.performance.annualized_return)}`}>
                        {formatPercentage(backtestResult.performance.annualized_return)}
                      </div>
                      <div className="text-sm text-muted-foreground">Annualized Return</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {backtestResult.performance.sharpe_ratio.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getDrawdownColor(backtestResult.performance.max_drawdown)}`}>
                        {formatPercentage(backtestResult.performance.max_drawdown)}
                      </div>
                      <div className="text-sm text-muted-foreground">Max Drawdown</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="equity" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="equity">Equity Curve</TabsTrigger>
                  <TabsTrigger value="drawdown">Drawdown</TabsTrigger>
                  <TabsTrigger value="exposure">Exposure</TabsTrigger>
                </TabsList>

                <TabsContent value="equity" className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={backtestResult.equity_curve}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(value) => new Date(value).toLocaleDateString()}
                          />
                          <YAxis 
                            tickFormatter={(value) => formatCurrency(value)}
                          />
                          <Tooltip 
                            formatter={(value: number) => [formatCurrency(value), 'Portfolio Value']}
                            labelFormatter={(label) => new Date(label).toLocaleDateString()}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#2563eb" 
                            fill="#3b82f6" 
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="drawdown" className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={calculateDrawdown(backtestResult.equity_curve)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(value) => new Date(value).toLocaleDateString()}
                          />
                          <YAxis 
                            tickFormatter={(value) => formatPercentage(value)}
                          />
                          <Tooltip 
                            formatter={(value: number) => [formatPercentage(value), 'Drawdown']}
                            labelFormatter={(label) => new Date(label).toLocaleDateString()}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="drawdown" 
                            stroke="#dc2626" 
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="exposure" className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={backtestResult.equity_curve}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(value) => new Date(value).toLocaleDateString()}
                          />
                          <YAxis 
                            tickFormatter={(value) => formatCurrency(value)}
                          />
                          <Tooltip 
                            formatter={(value: number) => [formatCurrency(value), 'Exposure']}
                            labelFormatter={(label) => new Date(label).toLocaleDateString()}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="gross_exposure" 
                            stroke="#059669" 
                            strokeWidth={2}
                            name="Gross Exposure"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="net_exposure" 
                            stroke="#7c3aed" 
                            strokeWidth={2}
                            name="Net Exposure"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Additional Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-lg font-semibold">{formatCurrency(backtestResult.performance.final_value)}</div>
                  <div className="text-sm text-muted-foreground">Final Value</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{formatPercentage(backtestResult.performance.volatility)}</div>
                  <div className="text-sm text-muted-foreground">Volatility</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{formatPercentage(backtestResult.performance.win_rate)}</div>
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{backtestResult.performance.num_trades}</div>
                  <div className="text-sm text-muted-foreground">Total Trades</div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function calculateDrawdown(equityCurve: EquityCurveData[]): Array<{date: string, drawdown: number}> {
  const drawdowns = []
  let peak = equityCurve[0].value
  
  for (const point of equityCurve) {
    if (point.value > peak) {
      peak = point.value
    }
    const drawdown = (point.value - peak) / peak
    drawdowns.push({
      date: point.date,
      drawdown: drawdown
    })
  }
  
  return drawdowns
}
