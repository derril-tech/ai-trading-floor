'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Created automatically by Cursor AI (2024-01-XX)

interface ExposureData {
  symbol: string
  sector: string
  market_cap: number
  weight: number
  market_beta: number
  size_beta: number
  value_beta: number
  momentum_beta: number
  volatility: number
  correlation: number
}

interface HeatmapData {
  factor_exposures: ExposureData[]
  sector_exposures: Record<string, number>
  factor_correlations: Record<string, Record<string, number>>
}

export function ExposureHeatmap() {
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedView, setSelectedView] = useState<'factors' | 'sectors' | 'correlations'>('factors')
  const [selectedFactor, setSelectedFactor] = useState<string>('market_beta')
  const [sortBy, setSortBy] = useState<string>('weight')

  const loadExposureData = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generate mock exposure data
    const mockData: HeatmapData = {
      factor_exposures: Array.from({ length: 50 }, (_, i) => ({
        symbol: `ASSET_${i.toString().padStart(3, '0')}`,
        sector: ['Technology', 'Healthcare', 'Finance', 'Consumer', 'Energy', 'Utilities', 'Materials'][i % 7],
        market_cap: Math.random() * 1000 + 100,
        weight: Math.random() * 0.05 + 0.01,
        market_beta: (Math.random() - 0.5) * 2 + 1,
        size_beta: (Math.random() - 0.5) * 1.5,
        value_beta: (Math.random() - 0.5) * 1.2,
        momentum_beta: (Math.random() - 0.5) * 1.0,
        volatility: Math.random() * 0.3 + 0.15,
        correlation: Math.random() * 0.8 + 0.2
      })),
      sector_exposures: {
        'Technology': 0.28,
        'Healthcare': 0.22,
        'Finance': 0.18,
        'Consumer': 0.15,
        'Energy': 0.08,
        'Utilities': 0.06,
        'Materials': 0.03
      },
      factor_correlations: {
        'market_beta': {
          'market_beta': 1.0,
          'size_beta': -0.3,
          'value_beta': 0.2,
          'momentum_beta': 0.1
        },
        'size_beta': {
          'market_beta': -0.3,
          'size_beta': 1.0,
          'value_beta': 0.4,
          'momentum_beta': -0.2
        },
        'value_beta': {
          'market_beta': 0.2,
          'size_beta': 0.4,
          'value_beta': 1.0,
          'momentum_beta': -0.1
        },
        'momentum_beta': {
          'market_beta': 0.1,
          'size_beta': -0.2,
          'value_beta': -0.1,
          'momentum_beta': 1.0
        }
      }
    }
    
    setHeatmapData(mockData)
    setIsLoading(false)
  }

  useEffect(() => {
    loadExposureData()
  }, [])

  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`
  const formatNumber = (value: number) => value.toFixed(3)
  const formatCurrency = (value: number) => `$${(value / 1000).toFixed(1)}B`

  const getExposureColor = (value: number, min: number, max: number) => {
    const normalized = (value - min) / (max - min)
    if (normalized < 0.33) return 'bg-red-100 text-red-800'
    if (normalized < 0.66) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getCorrelationColor = (value: number) => {
    const absValue = Math.abs(value)
    if (absValue > 0.7) return 'bg-red-500'
    if (absValue > 0.4) return 'bg-yellow-500'
    if (absValue > 0.2) return 'bg-blue-500'
    return 'bg-gray-300'
  }

  const getCorrelationIntensity = (value: number) => {
    const absValue = Math.abs(value)
    if (absValue > 0.7) return 'text-red-600 font-bold'
    if (absValue > 0.4) return 'text-yellow-600 font-semibold'
    if (absValue > 0.2) return 'text-blue-600'
    return 'text-gray-500'
  }

  const sortData = (data: ExposureData[]) => {
    return [...data].sort((a, b) => {
      switch (sortBy) {
        case 'weight':
          return b.weight - a.weight
        case 'market_cap':
          return b.market_cap - a.market_cap
        case 'volatility':
          return b.volatility - a.volatility
        case 'correlation':
          return b.correlation - a.correlation
        default:
          return b.weight - a.weight
      }
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Exposure Heatmap</CardTitle>
          <CardDescription>Loading exposure data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!heatmapData) return null

  const sortedData = sortData(heatmapData.factor_exposures)
  const factorNames = {
    'market_beta': 'Market Beta',
    'size_beta': 'Size Beta',
    'value_beta': 'Value Beta',
    'momentum_beta': 'Momentum Beta'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Exposure Heatmap</CardTitle>
              <CardDescription>Factor and sector exposure visualization</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight">Weight</SelectItem>
                  <SelectItem value="market_cap">Market Cap</SelectItem>
                  <SelectItem value="volatility">Volatility</SelectItem>
                  <SelectItem value="correlation">Correlation</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm"
                onClick={loadExposureData}
                disabled={isLoading}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="factors">Factor Exposures</TabsTrigger>
              <TabsTrigger value="sectors">Sector Exposures</TabsTrigger>
              <TabsTrigger value="correlations">Factor Correlations</TabsTrigger>
            </TabsList>

            <TabsContent value="factors" className="space-y-4">
              <div className="flex items-center space-x-4 mb-4">
                <Select value={selectedFactor} onValueChange={setSelectedFactor}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(factorNames).map(([key, name]) => (
                      <SelectItem key={key} value={key}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="outline">
                  {sortedData.length} Assets
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                {sortedData.slice(0, 30).map((asset, index) => (
                  <div key={asset.symbol} className="grid grid-cols-8 gap-2 p-2 border rounded hover:bg-gray-50">
                    <div className="col-span-2">
                      <div className="font-medium">{asset.symbol}</div>
                      <div className="text-sm text-muted-foreground">{asset.sector}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono">{formatPercentage(asset.weight)}</div>
                      <div className="text-xs text-muted-foreground">Weight</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono">{formatCurrency(asset.market_cap)}</div>
                      <div className="text-xs text-muted-foreground">Market Cap</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-mono px-2 py-1 rounded ${getExposureColor(asset[selectedFactor as keyof ExposureData] as number, -1, 2)}`}>
                        {formatNumber(asset[selectedFactor as keyof ExposureData] as number)}
                      </div>
                      <div className="text-xs text-muted-foreground">{factorNames[selectedFactor as keyof typeof factorNames]}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono">{formatPercentage(asset.volatility)}</div>
                      <div className="text-xs text-muted-foreground">Volatility</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono">{formatNumber(asset.correlation)}</div>
                      <div className="text-xs text-muted-foreground">Correlation</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sectors" className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Sector Weight Distribution</h3>
                  <div className="space-y-3">
                    {Object.entries(heatmapData.sector_exposures)
                      .sort(([,a], [,b]) => b - a)
                      .map(([sector, exposure]) => (
                        <div key={sector} className="flex items-center justify-between">
                          <span className="font-medium">{sector}</span>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                                style={{ width: `${exposure * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-mono w-16 text-right">{formatPercentage(exposure)}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Sector Heatmap</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(heatmapData.sector_exposures)
                      .sort(([,a], [,b]) => b - a)
                      .map(([sector, exposure]) => (
                        <div 
                          key={sector}
                          className="p-3 border rounded text-center hover:bg-gray-50 cursor-pointer transition-colors"
                          style={{
                            backgroundColor: `rgba(59, 130, 246, ${exposure * 2})`,
                            color: exposure > 0.15 ? 'white' : 'inherit'
                          }}
                        >
                          <div className="font-medium">{sector}</div>
                          <div className="text-sm font-mono">{formatPercentage(exposure)}</div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="correlations" className="space-y-4">
              <h3 className="text-lg font-semibold">Factor Correlation Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 text-left">Factor</th>
                      {Object.keys(heatmapData.factor_correlations).map(factor => (
                        <th key={factor} className="border p-2 text-center">
                          {factorNames[factor as keyof typeof factorNames]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(heatmapData.factor_correlations).map(([factor1, correlations]) => (
                      <tr key={factor1}>
                        <td className="border p-2 font-medium">
                          {factorNames[factor1 as keyof typeof factorNames]}
                        </td>
                        {Object.entries(correlations).map(([factor2, correlation]) => (
                          <td 
                            key={factor2} 
                            className={`border p-2 text-center ${getCorrelationIntensity(correlation)}`}
                            style={{
                              backgroundColor: factor1 === factor2 ? 'rgba(156, 163, 175, 0.2)' : 'transparent'
                            }}
                          >
                            <div className="flex items-center justify-center space-x-1">
                              <div 
                                className={`w-3 h-3 rounded-full ${getCorrelationColor(correlation)}`}
                              ></div>
                              <span className="font-mono">{formatNumber(correlation)}</span>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span>Low</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Medium</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>High</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Very High</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
