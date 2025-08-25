'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Created automatically by Cursor AI (2024-01-XX)

interface PortfolioConstraints {
  // Position constraints
  max_position: number
  min_position: number
  long_only: boolean
  
  // Exposure constraints
  max_gross_exposure: number
  max_net_exposure: number
  
  // Sector constraints
  sector_caps: Record<string, number>
  sector_floors: Record<string, number>
  
  // Risk constraints
  max_beta: number
  max_volatility: number
  max_tracking_error: number
  
  // Liquidity constraints
  max_illiquid_weight: number
  min_adv_ratio: number
  
  // Other constraints
  max_concentration: number
  min_diversification: number
}

const SECTORS = [
  'Technology',
  'Healthcare', 
  'Finance',
  'Consumer',
  'Energy',
  'Materials',
  'Industrials',
  'Utilities',
  'Real Estate',
  'Communication Services'
]

export function ConstraintsForm() {
  const [constraints, setConstraints] = useState<PortfolioConstraints>({
    max_position: 0.05,
    min_position: 0.0,
    long_only: true,
    max_gross_exposure: 1.0,
    max_net_exposure: 1.0,
    sector_caps: {
      'Technology': 0.30,
      'Healthcare': 0.25,
      'Finance': 0.20,
      'Consumer': 0.20,
      'Energy': 0.15,
      'Materials': 0.15,
      'Industrials': 0.20,
      'Utilities': 0.10,
      'Real Estate': 0.10,
      'Communication Services': 0.15
    },
    sector_floors: {
      'Technology': 0.0,
      'Healthcare': 0.0,
      'Finance': 0.0,
      'Consumer': 0.0,
      'Energy': 0.0,
      'Materials': 0.0,
      'Industrials': 0.0,
      'Utilities': 0.0,
      'Real Estate': 0.0,
      'Communication Services': 0.0
    },
    max_beta: 1.2,
    max_volatility: 0.20,
    max_tracking_error: 0.05,
    max_illiquid_weight: 0.10,
    min_adv_ratio: 0.01,
    max_concentration: 0.25,
    min_diversification: 0.75
  })

  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationResult, setOptimizationResult] = useState<any>(null)

  const updateConstraint = (key: keyof PortfolioConstraints, value: any) => {
    setConstraints(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const updateSectorCap = (sector: string, value: number) => {
    setConstraints(prev => ({
      ...prev,
      sector_caps: {
        ...prev.sector_caps,
        [sector]: value
      }
    }))
  }

  const updateSectorFloor = (sector: string, value: number) => {
    setConstraints(prev => ({
      ...prev,
      sector_floors: {
        ...prev.sector_floors,
        [sector]: value
      }
    }))
  }

  const runOptimization = async () => {
    setIsOptimizing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock optimization result
      setOptimizationResult({
        status: 'success',
        weights: {
          'AAPL': 0.045,
          'MSFT': 0.042,
          'GOOGL': 0.038,
          'AMZN': 0.035,
          'TSLA': 0.032,
          'META': 0.030,
          'NVDA': 0.028,
          'NFLX': 0.025,
          'CRM': 0.022,
          'ADBE': 0.020
        },
        metrics: {
          expected_return: 0.12,
          volatility: 0.18,
          sharpe_ratio: 0.67,
          herfindahl_index: 0.08,
          num_positions: 45,
          sector_exposures: {
            'Technology': 0.28,
            'Healthcare': 0.22,
            'Finance': 0.18,
            'Consumer': 0.16,
            'Energy': 0.08,
            'Materials': 0.06,
            'Industrials': 0.02
          }
        },
        constraints_satisfied: {
          budget: true,
          long_only: true,
          max_position: true,
          sector_caps: true
        }
      })
    } catch (error) {
      console.error('Error running optimization:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const getConstraintStatus = (satisfied: boolean) => {
    return satisfied ? 
      <Badge variant="default" className="bg-green-500">✓ Satisfied</Badge> :
      <Badge variant="destructive">✗ Violated</Badge>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Constraints</CardTitle>
          <CardDescription>
            Configure position limits, sector caps, and risk constraints for portfolio optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="position" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="position">Position</TabsTrigger>
              <TabsTrigger value="sector">Sector</TabsTrigger>
              <TabsTrigger value="risk">Risk</TabsTrigger>
              <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
            </TabsList>

            <TabsContent value="position" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max-position">Maximum Position Size</Label>
                  <Input
                    id="max-position"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={constraints.max_position}
                    onChange={(e) => updateConstraint('max_position', parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Maximum weight for any single position ({formatPercentage(constraints.max_position)})
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="min-position">Minimum Position Size</Label>
                  <Input
                    id="min-position"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={constraints.min_position}
                    onChange={(e) => updateConstraint('min_position', parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Minimum weight for any position ({formatPercentage(constraints.min_position)})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max-gross">Maximum Gross Exposure</Label>
                  <Input
                    id="max-gross"
                    type="number"
                    step="0.1"
                    min="0"
                    value={constraints.max_gross_exposure}
                    onChange={(e) => updateConstraint('max_gross_exposure', parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Maximum total exposure including leverage
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="max-net">Maximum Net Exposure</Label>
                  <Input
                    id="max-net"
                    type="number"
                    step="0.1"
                    min="0"
                    value={constraints.max_net_exposure}
                    onChange={(e) => updateConstraint('max_net_exposure', parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Maximum net long/short exposure
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="long-only"
                  checked={constraints.long_only}
                  onCheckedChange={(checked) => updateConstraint('long_only', checked)}
                />
                <Label htmlFor="long-only">Long-Only Portfolio</Label>
              </div>
            </TabsContent>

            <TabsContent value="sector" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium">Sector Caps & Floors</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sector</TableHead>
                      <TableHead>Cap</TableHead>
                      <TableHead>Floor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SECTORS.map(sector => (
                      <TableRow key={sector}>
                        <TableCell className="font-medium">{sector}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            value={constraints.sector_caps[sector] || 0}
                            onChange={(e) => updateSectorCap(sector, parseFloat(e.target.value))}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            value={constraints.sector_floors[sector] || 0}
                            onChange={(e) => updateSectorFloor(sector, parseFloat(e.target.value))}
                            className="w-20"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="risk" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max-beta">Maximum Beta</Label>
                  <Input
                    id="max-beta"
                    type="number"
                    step="0.1"
                    min="0"
                    value={constraints.max_beta}
                    onChange={(e) => updateConstraint('max_beta', parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Maximum portfolio beta relative to market
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="max-volatility">Maximum Volatility</Label>
                  <Input
                    id="max-volatility"
                    type="number"
                    step="0.01"
                    min="0"
                    value={constraints.max_volatility}
                    onChange={(e) => updateConstraint('max_volatility', parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Maximum annualized portfolio volatility
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max-te">Maximum Tracking Error</Label>
                  <Input
                    id="max-te"
                    type="number"
                    step="0.01"
                    min="0"
                    value={constraints.max_tracking_error}
                    onChange={(e) => updateConstraint('max_tracking_error', parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Maximum tracking error vs benchmark
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="max-concentration">Maximum Concentration</Label>
                  <Input
                    id="max-concentration"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={constraints.max_concentration}
                    onChange={(e) => updateConstraint('max_concentration', parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Maximum Herfindahl index ({formatPercentage(constraints.max_concentration)})
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="liquidity" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max-illiquid">Maximum Illiquid Weight</Label>
                  <Input
                    id="max-illiquid"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={constraints.max_illiquid_weight}
                    onChange={(e) => updateConstraint('max_illiquid_weight', parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Maximum weight in illiquid securities ({formatPercentage(constraints.max_illiquid_weight)})
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="min-adv">Minimum ADV Ratio</Label>
                  <Input
                    id="min-adv"
                    type="number"
                    step="0.001"
                    min="0"
                    value={constraints.min_adv_ratio}
                    onChange={(e) => updateConstraint('min_adv_ratio', parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Minimum position size as % of average daily volume
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-6">
            <Button onClick={runOptimization} disabled={isOptimizing}>
              {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {optimizationResult && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Results</CardTitle>
            <CardDescription>
              Portfolio weights and constraint satisfaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{formatPercentage(optimizationResult.metrics.expected_return)}</div>
                <div className="text-sm text-muted-foreground">Expected Return</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formatPercentage(optimizationResult.metrics.volatility)}</div>
                <div className="text-sm text-muted-foreground">Volatility</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{optimizationResult.metrics.sharpe_ratio.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{optimizationResult.metrics.num_positions}</div>
                <div className="text-sm text-muted-foreground">Positions</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Top Positions</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Weight</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(optimizationResult.weights)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 10)
                      .map(([symbol, weight]) => (
                        <TableRow key={symbol}>
                          <TableCell className="font-medium">{symbol}</TableCell>
                          <TableCell>{formatPercentage(weight)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              <div>
                <h4 className="font-medium mb-3">Sector Exposures</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sector</TableHead>
                      <TableHead>Weight</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(optimizationResult.metrics.sector_exposures)
                      .sort(([,a], [,b]) => b - a)
                      .map(([sector, weight]) => (
                        <TableRow key={sector}>
                          <TableCell className="font-medium">{sector}</TableCell>
                          <TableCell>{formatPercentage(weight)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-3">Constraint Satisfaction</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(optimizationResult.constraints_satisfied).map(([constraint, satisfied]) => (
                  <div key={constraint} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{constraint.replace('_', ' ')}:</span>
                    {getConstraintStatus(satisfied)}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
