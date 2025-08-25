'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

// Created automatically by Cursor AI (2024-01-XX)

interface ScenarioShock {
  name: string
  description: string
  base_value: number
  shock_values: number[]
  impact: number[]
  probability: number
}

interface ScenarioResult {
  scenario_name: string
  base_return: number
  shocked_return: number
  impact: number
  probability: number
  description: string
}

interface HedgingStrategy {
  name: string
  instrument: string
  notional: number
  cost: number
  effectiveness: number
  scenario_impact: Record<string, number>
}

interface TornadoData {
  scenarios: ScenarioShock[]
  results: ScenarioResult[]
  hedging_strategies: HedgingStrategy[]
  portfolio_value: number
}

export function ScenarioTornado() {
  const [tornadoData, setTornadoData] = useState<TornadoData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedScenario, setSelectedScenario] = useState<string>('market_crash')
  const [customShock, setCustomShock] = useState<number>(0.1)
  const [selectedHedging, setSelectedHedging] = useState<string[]>([])
  const [showHedging, setShowHedging] = useState(false)

  const loadScenarioData = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock data
    const mockData: TornadoData = {
      portfolio_value: 100000000, // $100M
      scenarios: [
        {
          name: 'market_crash',
          description: 'Equity market crash with increased volatility',
          base_value: 0.0,
          shock_values: [-0.15, -0.20, -0.25, -0.30],
          impact: [-0.089, -0.156, -0.234, -0.312],
          probability: 0.05
        },
        {
          name: 'rates_spike',
          description: 'Interest rate spike affecting duration-sensitive assets',
          base_value: 0.02,
          shock_values: [0.01, 0.02, 0.03, 0.05],
          impact: [-0.045, -0.089, -0.134, -0.223],
          probability: 0.15
        },
        {
          name: 'oil_shock',
          description: 'Oil price shock affecting energy and transportation',
          base_value: 80.0,
          shock_values: [-0.10, -0.20, -0.30, -0.50],
          impact: [-0.023, -0.067, -0.112, -0.189],
          probability: 0.10
        },
        {
          name: 'fx_crisis',
          description: 'Currency crisis affecting international exposures',
          base_value: 1.0,
          shock_values: [-0.05, -0.10, -0.15, -0.25],
          impact: [-0.034, -0.078, -0.123, -0.201],
          probability: 0.08
        },
        {
          name: 'sector_rotation',
          description: 'Sector rotation from growth to value',
          base_value: 0.0,
          shock_values: [-0.10, -0.15, -0.20, -0.30],
          impact: [-0.056, -0.089, -0.134, -0.201],
          probability: 0.20
        }
      ],
      results: [
        {
          scenario_name: 'market_crash',
          base_return: 0.0008,
          shocked_return: -0.156,
          impact: -0.157,
          probability: 0.05,
          description: 'Equity market crash with increased volatility'
        },
        {
          scenario_name: 'rates_spike',
          base_return: 0.0008,
          shocked_return: -0.089,
          impact: -0.090,
          probability: 0.15,
          description: 'Interest rate spike affecting duration-sensitive assets'
        },
        {
          scenario_name: 'oil_shock',
          base_return: 0.0008,
          shocked_return: -0.067,
          impact: -0.068,
          probability: 0.10,
          description: 'Oil price shock affecting energy and transportation'
        },
        {
          scenario_name: 'fx_crisis',
          base_return: 0.0008,
          shocked_return: -0.123,
          impact: -0.124,
          probability: 0.08,
          description: 'Currency crisis affecting international exposures'
        },
        {
          scenario_name: 'sector_rotation',
          base_return: 0.0008,
          shocked_return: -0.089,
          impact: -0.090,
          probability: 0.20,
          description: 'Sector rotation from growth to value'
        }
      ],
      hedging_strategies: [
        {
          name: 'SPY Put Options',
          instrument: 'SPY 3M ATM Puts',
          notional: 50000000,
          cost: 1500000,
          effectiveness: 0.85,
          scenario_impact: {
            'market_crash': -0.089,
            'rates_spike': -0.023,
            'oil_shock': -0.012,
            'fx_crisis': -0.034,
            'sector_rotation': -0.045
          }
        },
        {
          name: 'VIX Futures',
          instrument: 'VIX 3M Futures',
          notional: 30000000,
          cost: 800000,
          effectiveness: 0.72,
          scenario_impact: {
            'market_crash': -0.067,
            'rates_spike': -0.012,
            'oil_shock': -0.008,
            'fx_crisis': -0.023,
            'sector_rotation': -0.034
          }
        },
        {
          name: 'Treasury Futures',
          instrument: '10Y Treasury Futures',
          notional: 40000000,
          cost: 600000,
          effectiveness: 0.68,
          scenario_impact: {
            'market_crash': -0.045,
            'rates_spike': -0.078,
            'oil_shock': -0.012,
            'fx_crisis': -0.023,
            'sector_rotation': -0.012
          }
        },
        {
          name: 'Currency Forwards',
          instrument: 'EUR/USD 3M Forwards',
          notional: 25000000,
          cost: 400000,
          effectiveness: 0.58,
          scenario_impact: {
            'market_crash': -0.012,
            'rates_spike': -0.008,
            'oil_shock': -0.006,
            'fx_crisis': -0.089,
            'sector_rotation': -0.012
          }
        }
      ]
    }
    
    setTornadoData(mockData)
    setIsLoading(false)
  }

  useEffect(() => {
    loadScenarioData()
  }, [])

  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`
  const formatCurrency = (value: number) => `$${(value / 1000000).toFixed(1)}M`
  const formatNumber = (value: number) => value.toFixed(4)

  const getImpactColor = (impact: number) => {
    const absImpact = Math.abs(impact)
    if (absImpact > 0.15) return 'text-red-600'
    if (absImpact > 0.10) return 'text-orange-600'
    if (absImpact > 0.05) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getImpactBadge = (impact: number) => {
    const absImpact = Math.abs(impact)
    if (absImpact > 0.15) return <Badge variant="destructive">Severe</Badge>
    if (absImpact > 0.10) return <Badge variant="secondary">High</Badge>
    if (absImpact > 0.05) return <Badge variant="outline">Medium</Badge>
    return <Badge variant="default">Low</Badge>
  }

  const calculateHedgedImpact = (scenario: ScenarioResult, hedgingStrategies: HedgingStrategy[]) => {
    let totalHedgingImpact = 0
    let totalCost = 0
    
    hedgingStrategies.forEach(strategy => {
      const strategyImpact = strategy.scenario_impact[scenario.scenario_name] || 0
      totalHedgingImpact += strategyImpact
      totalCost += strategy.cost
    })
    
    return {
      hedgedImpact: scenario.impact + totalHedgingImpact,
      totalCost: totalCost,
      netImpact: scenario.impact + totalHedgingImpact + (totalCost / tornadoData!.portfolio_value)
    }
  }

  const runCustomScenario = async () => {
    if (!tornadoData) return
    
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate custom scenario calculation
    const customImpact = customShock * -0.8 // Simplified impact calculation
    const customResult: ScenarioResult = {
      scenario_name: 'custom_shock',
      base_return: 0.0008,
      shocked_return: customImpact,
      impact: customImpact - 0.0008,
      probability: 0.10,
      description: `Custom shock of ${formatPercentage(customShock)}`
    }
    
    setTornadoData({
      ...tornadoData,
      results: [...tornadoData.results, customResult]
    })
    
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scenario Analysis</CardTitle>
          <CardDescription>Loading scenario data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!tornadoData) return null

  const selectedScenarioData = tornadoData.scenarios.find(s => s.name === selectedScenario)
  const selectedResult = tornadoData.results.find(r => r.scenario_name === selectedScenario)
  const selectedHedgingStrategies = tornadoData.hedging_strategies.filter(h => selectedHedging.includes(h.name))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Scenario Analysis</CardTitle>
              <CardDescription>Stress testing and hedging what-if analysis</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={loadScenarioData}
                disabled={isLoading}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tornado" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tornado">Tornado Chart</TabsTrigger>
              <TabsTrigger value="scenarios">Scenario Details</TabsTrigger>
              <TabsTrigger value="hedging">Hedging Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="tornado" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Scenario Impact Ranking</h3>
                  <div className="space-y-3">
                    {tornadoData.results
                      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
                      .map((result, index) => {
                        const hedgedData = calculateHedgedImpact(result, selectedHedgingStrategies)
                        return (
                          <div key={result.scenario_name} className="border rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium capitalize">{result.scenario_name.replace('_', ' ')}</span>
                                {getImpactBadge(result.impact)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatPercentage(result.probability)} probability
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">Base Impact:</span>
                                <span className={`text-sm font-mono ${getImpactColor(result.impact)}`}>
                                  {formatPercentage(result.impact)}
                                </span>
                              </div>
                              {showHedging && (
                                <div className="flex justify-between">
                                  <span className="text-sm">Hedged Impact:</span>
                                  <span className={`text-sm font-mono ${getImpactColor(hedgedData.hedgedImpact)}`}>
                                    {formatPercentage(hedgedData.hedgedImpact)}
                                  </span>
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground">
                                {result.description}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Custom Scenario</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="custom-shock">Shock Size</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          id="custom-shock"
                          type="number"
                          step="0.01"
                          value={customShock}
                          onChange={(e) => setCustomShock(parseFloat(e.target.value) || 0)}
                          className="w-32"
                        />
                        <span className="text-sm text-muted-foreground">(0-1)</span>
                      </div>
                    </div>
                    <Button onClick={runCustomScenario} disabled={isLoading}>
                      Run Custom Scenario
                    </Button>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={showHedging}
                        onCheckedChange={setShowHedging}
                      />
                      <Label>Show Hedging Impact</Label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="scenarios" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Scenario Selection</h3>
                  <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tornadoData.scenarios.map(scenario => (
                        <SelectItem key={scenario.name} value={scenario.name}>
                          {scenario.name.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedScenarioData && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <h4 className="font-medium">Description</h4>
                        <p className="text-sm text-muted-foreground">{selectedScenarioData.description}</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Probability</h4>
                        <p className="text-sm font-mono">{formatPercentage(selectedScenarioData.probability)}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Impact Sensitivity</h3>
                  {selectedScenarioData && (
                    <div className="space-y-3">
                      {selectedScenarioData.shock_values.map((shock, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="font-medium">{formatPercentage(shock)} Shock</div>
                            <div className="text-sm text-muted-foreground">
                              {formatPercentage(selectedScenarioData.probability * (index + 1) * 0.5)} probability
                            </div>
                          </div>
                          <div className={`font-mono ${getImpactColor(selectedScenarioData.impact[index])}`}>
                            {formatPercentage(selectedScenarioData.impact[index])}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hedging" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Hedging Strategies</h3>
                  <div className="space-y-3">
                    {tornadoData.hedging_strategies.map(strategy => (
                      <div key={strategy.name} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedHedging.includes(strategy.name)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedHedging([...selectedHedging, strategy.name])
                                } else {
                                  setSelectedHedging(selectedHedging.filter(h => h !== strategy.name))
                                }
                              }}
                            />
                            <span className="font-medium">{strategy.name}</span>
                            <Badge variant="outline">{formatPercentage(strategy.effectiveness)}</Badge>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Instrument:</span>
                            <span className="font-mono">{strategy.instrument}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Notional:</span>
                            <span className="font-mono">{formatCurrency(strategy.notional)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cost:</span>
                            <span className="font-mono">{formatCurrency(strategy.cost)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Hedging Effectiveness</h3>
                  {selectedHedgingStrategies.length > 0 ? (
                    <div className="space-y-4">
                      {tornadoData.results.map(result => {
                        const hedgedData = calculateHedgedImpact(result, selectedHedgingStrategies)
                        return (
                          <div key={result.scenario_name} className="border rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium capitalize">{result.scenario_name.replace('_', ' ')}</span>
                              <Badge variant="outline">{formatPercentage(result.probability)}</Badge>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Base Impact:</span>
                                <span className={`font-mono ${getImpactColor(result.impact)}`}>
                                  {formatPercentage(result.impact)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Hedging Impact:</span>
                                <span className="font-mono text-green-600">
                                  {formatPercentage(hedgedData.hedgedImpact - result.impact)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Hedging Cost:</span>
                                <span className="font-mono text-red-600">
                                  {formatPercentage(hedgedData.totalCost / tornadoData.portfolio_value)}
                                </span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span>Net Impact:</span>
                                <span className={`font-mono ${getImpactColor(hedgedData.netImpact)}`}>
                                  {formatPercentage(hedgedData.netImpact)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Select hedging strategies to see effectiveness analysis
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
