'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Created automatically by Cursor AI (2024-01-XX)

interface KPI {
  name: string
  value: number
  unit: string
  description: string
  category: 'return' | 'risk' | 'efficiency' | 'trading'
  benchmark?: number
  target?: number
}

interface StrategyComparison {
  strategy_name: string
  kpis: KPI[]
}

export function KPIsTable() {
  const [comparisonData, setComparisonData] = useState<StrategyComparison[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const generateMockKPIs = (): KPI[] => {
    return [
      // Return Metrics
      {
        name: 'Total Return',
        value: 0.45,
        unit: '%',
        description: 'Cumulative return over the backtest period',
        category: 'return',
        benchmark: 0.35
      },
      {
        name: 'Annualized Return',
        value: 12.5,
        unit: '%',
        description: 'Annualized return rate',
        category: 'return',
        benchmark: 10.2
      },
      {
        name: 'Excess Return',
        value: 2.3,
        unit: '%',
        description: 'Return in excess of benchmark',
        category: 'return'
      },
      
      // Risk Metrics
      {
        name: 'Volatility',
        value: 18.2,
        unit: '%',
        description: 'Annualized standard deviation of returns',
        category: 'risk',
        benchmark: 15.8
      },
      {
        name: 'Sharpe Ratio',
        value: 0.67,
        unit: '',
        description: 'Risk-adjusted return measure',
        category: 'risk',
        benchmark: 0.58
      },
      {
        name: 'Sortino Ratio',
        value: 0.89,
        unit: '',
        description: 'Downside risk-adjusted return',
        category: 'risk',
        benchmark: 0.72
      },
      {
        name: 'Maximum Drawdown',
        value: -15.3,
        unit: '%',
        description: 'Largest peak-to-trough decline',
        category: 'risk',
        benchmark: -12.1
      },
      {
        name: 'VaR (95%)',
        value: -2.8,
        unit: '%',
        description: 'Value at Risk at 95% confidence',
        category: 'risk'
      },
      {
        name: 'CVaR (95%)',
        value: -4.2,
        unit: '%',
        description: 'Conditional Value at Risk',
        category: 'risk'
      },
      
      // Efficiency Metrics
      {
        name: 'Information Ratio',
        value: 0.45,
        unit: '',
        description: 'Excess return per unit of tracking error',
        category: 'efficiency',
        benchmark: 0.38
      },
      {
        name: 'Tracking Error',
        value: 5.1,
        unit: '%',
        description: 'Standard deviation of excess returns',
        category: 'efficiency'
      },
      {
        name: 'Beta',
        value: 0.92,
        unit: '',
        description: 'Market sensitivity',
        category: 'efficiency',
        benchmark: 1.0
      },
      {
        name: 'Alpha',
        value: 1.8,
        unit: '%',
        description: 'Excess return not explained by beta',
        category: 'efficiency'
      },
      
      // Trading Metrics
      {
        name: 'Turnover',
        value: 85.2,
        unit: '%',
        description: 'Annual portfolio turnover rate',
        category: 'trading',
        benchmark: 75.0
      },
      {
        name: 'Win Rate',
        value: 58.3,
        unit: '%',
        description: 'Percentage of profitable periods',
        category: 'trading',
        benchmark: 52.1
      },
      {
        name: 'Profit Factor',
        value: 1.42,
        unit: '',
        description: 'Ratio of gross profit to gross loss',
        category: 'trading',
        benchmark: 1.28
      },
      {
        name: 'Average Trade',
        value: 0.12,
        unit: '%',
        description: 'Average return per trade',
        category: 'trading'
      }
    ]
  }

  const runComparison = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate mock comparison data
      const strategies = [
        { name: 'Momentum Strategy', kpis: generateMockKPIs() },
        { name: 'Value Strategy', kpis: generateMockKPIs().map(kpi => ({
          ...kpi,
          value: kpi.value * (0.8 + Math.random() * 0.4) // Vary the values
        })) },
        { name: 'Quality Strategy', kpis: generateMockKPIs().map(kpi => ({
          ...kpi,
          value: kpi.value * (0.9 + Math.random() * 0.2) // Vary the values
        })) }
      ]
      
      setComparisonData(strategies)
    } catch (error) {
      console.error('Error running comparison:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatValue = (kpi: KPI) => {
    if (kpi.unit === '%') {
      return `${kpi.value.toFixed(1)}%`
    } else if (kpi.unit === '') {
      return kpi.value.toFixed(2)
    } else {
      return `${kpi.value.toFixed(2)} ${kpi.unit}`
    }
  }

  const getPerformanceColor = (kpi: KPI) => {
    if (!kpi.benchmark) return 'text-gray-600'
    
    const diff = kpi.value - kpi.benchmark
    
    // For risk metrics, lower is better
    if (kpi.category === 'risk' && kpi.name !== 'Sharpe Ratio' && kpi.name !== 'Sortino Ratio') {
      return diff <= 0 ? 'text-green-600' : 'text-red-600'
    }
    
    // For return and efficiency metrics, higher is better
    return diff >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getPerformanceBadge = (kpi: KPI) => {
    if (!kpi.benchmark) return null
    
    const diff = kpi.value - kpi.benchmark
    
    // For risk metrics, lower is better
    if (kpi.category === 'risk' && kpi.name !== 'Sharpe Ratio' && kpi.name !== 'Sortino Ratio') {
      return diff <= 0 ? 
        <Badge variant="default" className="bg-green-500">Better</Badge> : 
        <Badge variant="destructive">Worse</Badge>
    }
    
    // For return and efficiency metrics, higher is better
    return diff >= 0 ? 
      <Badge variant="default" className="bg-green-500">Better</Badge> : 
      <Badge variant="destructive">Worse</Badge>
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'return': return 'bg-blue-100 text-blue-800'
      case 'risk': return 'bg-red-100 text-red-800'
      case 'efficiency': return 'bg-green-100 text-green-800'
      case 'trading': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Calculating KPIs...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance KPIs</CardTitle>
          <CardDescription>
            Key performance indicators and strategy comparison metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-6">
            <Button onClick={runComparison} disabled={isLoading}>
              {isLoading ? 'Calculating...' : 'Run Comparison'}
            </Button>
          </div>

          {comparisonData.length > 0 && (
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="return">Returns</TabsTrigger>
                <TabsTrigger value="risk">Risk</TabsTrigger>
                <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid gap-4">
                  {comparisonData.map(strategy => (
                    <Card key={strategy.strategy_name}>
                      <CardHeader>
                        <CardTitle className="text-lg">{strategy.strategy_name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {strategy.kpis.slice(0, 4).map(kpi => (
                            <div key={kpi.name} className="text-center">
                              <div className={`text-lg font-semibold ${getPerformanceColor(kpi)}`}>
                                {formatValue(kpi)}
                              </div>
                              <div className="text-sm text-muted-foreground">{kpi.name}</div>
                              {getPerformanceBadge(kpi)}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="return" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Metric</TableHead>
                          {comparisonData.map(strategy => (
                            <TableHead key={strategy.strategy_name}>{strategy.strategy_name}</TableHead>
                          ))}
                          <TableHead>Benchmark</TableHead>
                          <TableHead>Performance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {comparisonData[0]?.kpis.filter(kpi => kpi.category === 'return').map(kpi => (
                          <TableRow key={kpi.name}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{kpi.name}</div>
                                <div className="text-sm text-muted-foreground">{kpi.description}</div>
                              </div>
                            </TableCell>
                            {comparisonData.map(strategy => {
                              const strategyKpi = strategy.kpis.find(k => k.name === kpi.name)
                              return (
                                <TableCell key={strategy.strategy_name}>
                                  <div className={`font-semibold ${getPerformanceColor(strategyKpi!)}`}>
                                    {formatValue(strategyKpi!)}
                                  </div>
                                </TableCell>
                              )
                            })}
                            <TableCell>
                              {kpi.benchmark ? formatValue({ ...kpi, value: kpi.benchmark }) : '-'}
                            </TableCell>
                            <TableCell>
                              {getPerformanceBadge(kpi)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="risk" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Metric</TableHead>
                          {comparisonData.map(strategy => (
                            <TableHead key={strategy.strategy_name}>{strategy.strategy_name}</TableHead>
                          ))}
                          <TableHead>Benchmark</TableHead>
                          <TableHead>Performance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {comparisonData[0]?.kpis.filter(kpi => kpi.category === 'risk').map(kpi => (
                          <TableRow key={kpi.name}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{kpi.name}</div>
                                <div className="text-sm text-muted-foreground">{kpi.description}</div>
                              </div>
                            </TableCell>
                            {comparisonData.map(strategy => {
                              const strategyKpi = strategy.kpis.find(k => k.name === kpi.name)
                              return (
                                <TableCell key={strategy.strategy_name}>
                                  <div className={`font-semibold ${getPerformanceColor(strategyKpi!)}`}>
                                    {formatValue(strategyKpi!)}
                                  </div>
                                </TableCell>
                              )
                            })}
                            <TableCell>
                              {kpi.benchmark ? formatValue({ ...kpi, value: kpi.benchmark }) : '-'}
                            </TableCell>
                            <TableCell>
                              {getPerformanceBadge(kpi)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="efficiency" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Metric</TableHead>
                          {comparisonData.map(strategy => (
                            <TableHead key={strategy.strategy_name}>{strategy.strategy_name}</TableHead>
                          ))}
                          <TableHead>Benchmark</TableHead>
                          <TableHead>Performance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {comparisonData[0]?.kpis.filter(kpi => kpi.category === 'efficiency').map(kpi => (
                          <TableRow key={kpi.name}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{kpi.name}</div>
                                <div className="text-sm text-muted-foreground">{kpi.description}</div>
                              </div>
                            </TableCell>
                            {comparisonData.map(strategy => {
                              const strategyKpi = strategy.kpis.find(k => k.name === kpi.name)
                              return (
                                <TableCell key={strategy.strategy_name}>
                                  <div className={`font-semibold ${getPerformanceColor(strategyKpi!)}`}>
                                    {formatValue(strategyKpi!)}
                                  </div>
                                </TableCell>
                              )
                            })}
                            <TableCell>
                              {kpi.benchmark ? formatValue({ ...kpi, value: kpi.benchmark }) : '-'}
                            </TableCell>
                            <TableCell>
                              {getPerformanceBadge(kpi)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
