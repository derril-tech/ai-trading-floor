'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Created automatically by Cursor AI (2024-01-XX)

interface PortfolioWeight {
  symbol: string
  sector: string
  current_weight: number
  target_weight: number
  delta: number
  market_cap: number
  adv_ratio: number
  beta: number
  volatility: number
  signal_score: number
}

interface PortfolioData {
  weights: PortfolioWeight[]
  summary: {
    total_positions: number
    total_weight: number
    avg_weight: number
    max_weight: number
    concentration: number
  }
}

export function WeightsTable() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [filteredData, setFilteredData] = useState<PortfolioWeight[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSector, setSelectedSector] = useState('all')
  const [sortBy, setSortBy] = useState<keyof PortfolioWeight>('current_weight')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    generateMockData()
  }, [])

  useEffect(() => {
    if (portfolioData) {
      filterAndSortData()
    }
  }, [portfolioData, searchTerm, selectedSector, sortBy, sortOrder])

  const generateMockData = () => {
    const symbols = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'CRM', 'ADBE',
      'JPM', 'BAC', 'WFC', 'GS', 'MS', 'JNJ', 'PFE', 'UNH', 'ABBV', 'TMO',
      'XOM', 'CVX', 'COP', 'EOG', 'SLB', 'HD', 'LOW', 'CAT', 'DE', 'BA'
    ]
    
    const sectors = ['Technology', 'Healthcare', 'Finance', 'Consumer', 'Energy', 'Industrials']
    
    const weights: PortfolioWeight[] = symbols.map((symbol, index) => {
      const current_weight = Math.random() * 0.05 + 0.01 // 1-6%
      const target_weight = current_weight * (0.8 + Math.random() * 0.4) // ±20% variation
      
      return {
        symbol,
        sector: sectors[index % sectors.length],
        current_weight,
        target_weight,
        delta: target_weight - current_weight,
        market_cap: Math.random() * 1000000 + 100000,
        adv_ratio: Math.random() * 0.1 + 0.01,
        beta: Math.random() * 0.6 + 0.7,
        volatility: Math.random() * 0.3 + 0.2,
        signal_score: Math.random() * 2 - 1
      }
    })
    
    // Normalize weights to sum to 1
    const totalWeight = weights.reduce((sum, w) => sum + w.current_weight, 0)
    weights.forEach(w => {
      w.current_weight /= totalWeight
      w.target_weight /= totalWeight
      w.delta = w.target_weight - w.current_weight
    })
    
    const summary = {
      total_positions: weights.length,
      total_weight: weights.reduce((sum, w) => sum + w.current_weight, 0),
      avg_weight: weights.reduce((sum, w) => sum + w.current_weight, 0) / weights.length,
      max_weight: Math.max(...weights.map(w => w.current_weight)),
      concentration: weights.reduce((sum, w) => sum + w.current_weight ** 2, 0)
    }
    
    setPortfolioData({ weights, summary })
    setIsLoading(false)
  }

  const filterAndSortData = () => {
    if (!portfolioData) return
    
    let filtered = portfolioData.weights
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Filter by sector
    if (selectedSector !== 'all') {
      filtered = filtered.filter(item => item.sector === selectedSector)
    }
    
    // Sort data
    filtered.sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      
      if (sortOrder === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })
    
    setFilteredData(filtered)
  }

  const handleSort = (column: keyof PortfolioWeight) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`
  }

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    return `$${(value / 1e3).toFixed(1)}K`
  }

  const getDeltaColor = (delta: number) => {
    if (delta > 0.01) return 'text-green-600'
    if (delta < -0.01) return 'text-red-600'
    return 'text-gray-600'
  }

  const getDeltaBadge = (delta: number) => {
    if (delta > 0.01) return <Badge variant="default" className="bg-green-500">+{formatPercentage(delta)}</Badge>
    if (delta < -0.01) return <Badge variant="destructive">{formatPercentage(delta)}</Badge>
    return <Badge variant="outline">No Change</Badge>
  }

  const getSignalColor = (score: number) => {
    if (score > 0.5) return 'text-green-600'
    if (score < -0.5) return 'text-red-600'
    return 'text-gray-600'
  }

  const getLiquidityColor = (advRatio: number) => {
    if (advRatio > 0.05) return 'text-green-600'
    if (advRatio < 0.02) return 'text-red-600'
    return 'text-yellow-600'
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading portfolio data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!portfolioData) return null

  const sectors = [...new Set(portfolioData.weights.map(w => w.sector))]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Weights</CardTitle>
          <CardDescription>
            Current portfolio weights with target weights, deltas, and liquidity metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{portfolioData.summary.total_positions}</div>
              <div className="text-sm text-muted-foreground">Positions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatPercentage(portfolioData.summary.total_weight)}</div>
              <div className="text-sm text-muted-foreground">Total Weight</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatPercentage(portfolioData.summary.avg_weight)}</div>
              <div className="text-sm text-muted-foreground">Avg Weight</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatPercentage(portfolioData.summary.max_weight)}</div>
              <div className="text-sm text-muted-foreground">Max Weight</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatPercentage(portfolioData.summary.concentration)}</div>
              <div className="text-sm text-muted-foreground">Concentration</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search symbols..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Sectors</option>
                {sectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>
          </div>

          <Tabs defaultValue="weights" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="weights">Weights & Deltas</TabsTrigger>
              <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
              <TabsTrigger value="risk">Risk Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="weights" className="space-y-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('current_weight')}
                      >
                        Current Weight {sortBy === 'current_weight' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('target_weight')}
                      >
                        Target Weight {sortBy === 'target_weight' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('delta')}
                      >
                        Delta {sortBy === 'delta' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('signal_score')}
                      >
                        Signal {sortBy === 'signal_score' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item) => (
                      <TableRow key={item.symbol}>
                        <TableCell className="font-medium">{item.symbol}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.sector}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{formatPercentage(item.current_weight)}</span>
                            <Progress value={item.current_weight * 1000} className="w-16" />
                          </div>
                        </TableCell>
                        <TableCell>{formatPercentage(item.target_weight)}</TableCell>
                        <TableCell>
                          <div className={`font-semibold ${getDeltaColor(item.delta)}`}>
                            {getDeltaBadge(item.delta)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`font-semibold ${getSignalColor(item.signal_score)}`}>
                            {item.signal_score.toFixed(2)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="liquidity" className="space-y-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Market Cap</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('adv_ratio')}
                      >
                        ADV Ratio {sortBy === 'adv_ratio' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead>Liquidity Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item) => (
                      <TableRow key={item.symbol}>
                        <TableCell className="font-medium">{item.symbol}</TableCell>
                        <TableCell>{formatCurrency(item.market_cap)}</TableCell>
                        <TableCell>
                          <div className={`font-semibold ${getLiquidityColor(item.adv_ratio)}`}>
                            {formatPercentage(item.adv_ratio)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.adv_ratio > 0.05 ? 
                            <Badge variant="default" className="bg-green-500">High</Badge> :
                            item.adv_ratio < 0.02 ?
                            <Badge variant="destructive">Low</Badge> :
                            <Badge variant="secondary">Medium</Badge>
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="risk" className="space-y-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('beta')}
                      >
                        Beta {sortBy === 'beta' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('volatility')}
                      >
                        Volatility {sortBy === 'volatility' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead>Risk Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item) => (
                      <TableRow key={item.symbol}>
                        <TableCell className="font-medium">{item.symbol}</TableCell>
                        <TableCell>{item.beta.toFixed(2)}</TableCell>
                        <TableCell>{formatPercentage(item.volatility)}</TableCell>
                        <TableCell>
                          {item.volatility > 0.4 ? 
                            <Badge variant="destructive">High</Badge> :
                            item.volatility < 0.25 ?
                            <Badge variant="default" className="bg-green-500">Low</Badge> :
                            <Badge variant="secondary">Medium</Badge>
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
