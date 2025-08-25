'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'

// Created automatically by Cursor AI (2024-01-XX)

interface ZScoreData {
  symbol: string
  sector: string
  market_cap: number
  momentum: number
  value: number
  quality: number
  growth: number
  low_vol: number
  size: number
  esg: number
  combined: number
}

interface SectorStats {
  sector: string
  count: number
  avg_momentum: number
  avg_value: number
  avg_quality: number
  avg_growth: number
  avg_low_vol: number
  avg_size: number
  avg_esg: number
  avg_combined: number
}

export function ZScoreTable() {
  const [data, setData] = useState<ZScoreData[]>([])
  const [filteredData, setFilteredData] = useState<ZScoreData[]>([])
  const [sectorStats, setSectorStats] = useState<SectorStats[]>([])
  const [selectedFactor, setSelectedFactor] = useState<string>('combined')
  const [selectedSector, setSelectedSector] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('combined')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  // Generate mock data
  useEffect(() => {
    const generateMockData = () => {
      const sectors = ['Technology', 'Healthcare', 'Finance', 'Consumer', 'Energy', 'Materials']
      const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'CRM', 'ADBE']
      
      const mockData: ZScoreData[] = []
      
      for (let i = 0; i < 100; i++) {
        const symbol = `${symbols[i % symbols.length]}_${Math.floor(i / symbols.length) + 1}`
        const sector = sectors[i % sectors.length]
        
        mockData.push({
          symbol,
          sector,
          market_cap: Math.random() * 1000000 + 100000,
          momentum: (Math.random() - 0.5) * 4,
          value: (Math.random() - 0.5) * 4,
          quality: (Math.random() - 0.5) * 4,
          growth: (Math.random() - 0.5) * 4,
          low_vol: (Math.random() - 0.5) * 4,
          size: (Math.random() - 0.5) * 4,
          esg: (Math.random() - 0.5) * 4,
          combined: (Math.random() - 0.5) * 4
        })
      }
      
      setData(mockData)
      setIsLoading(false)
    }
    
    generateMockData()
  }, [])

  // Calculate sector statistics
  useEffect(() => {
    const sectors = [...new Set(data.map(item => item.sector))]
    const stats: SectorStats[] = sectors.map(sector => {
      const sectorData = data.filter(item => item.sector === sector)
      return {
        sector,
        count: sectorData.length,
        avg_momentum: sectorData.reduce((sum, item) => sum + item.momentum, 0) / sectorData.length,
        avg_value: sectorData.reduce((sum, item) => sum + item.value, 0) / sectorData.length,
        avg_quality: sectorData.reduce((sum, item) => sum + item.quality, 0) / sectorData.length,
        avg_growth: sectorData.reduce((sum, item) => sum + item.growth, 0) / sectorData.length,
        avg_low_vol: sectorData.reduce((sum, item) => sum + item.low_vol, 0) / sectorData.length,
        avg_size: sectorData.reduce((sum, item) => sum + item.size, 0) / sectorData.length,
        avg_esg: sectorData.reduce((sum, item) => sum + item.esg, 0) / sectorData.length,
        avg_combined: sectorData.reduce((sum, item) => sum + item.combined, 0) / sectorData.length
      }
    })
    
    setSectorStats(stats)
  }, [data])

  // Filter and sort data
  useEffect(() => {
    let filtered = data
    
    // Filter by sector
    if (selectedSector !== 'all') {
      filtered = filtered.filter(item => item.sector === selectedSector)
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Sort data
    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof ZScoreData] as number
      const bValue = b[sortBy as keyof ZScoreData] as number
      
      if (sortOrder === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })
    
    setFilteredData(filtered)
  }, [data, selectedSector, searchTerm, sortBy, sortOrder])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const getZScoreColor = (value: number) => {
    if (value > 2) return 'text-green-600 bg-green-50'
    if (value > 1) return 'text-green-500 bg-green-25'
    if (value < -2) return 'text-red-600 bg-red-50'
    if (value < -1) return 'text-red-500 bg-red-25'
    return 'text-gray-600 bg-gray-50'
  }

  const getZScoreBadge = (value: number) => {
    if (value > 2) return <Badge variant="default" className="bg-green-500">Strong Buy</Badge>
    if (value > 1) return <Badge variant="secondary" className="bg-green-100 text-green-700">Buy</Badge>
    if (value < -2) return <Badge variant="destructive">Strong Sell</Badge>
    if (value < -1) return <Badge variant="outline" className="border-red-300 text-red-600">Sell</Badge>
    return <Badge variant="outline">Neutral</Badge>
  }

  const formatMarketCap = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    return `$${(value / 1e3).toFixed(1)}K`
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading Z-Score data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Z-Score Analysis</CardTitle>
          <CardDescription>
            Factor signals with sector-neutral views and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="table">Factor Table</TabsTrigger>
              <TabsTrigger value="sectors">Sector Analysis</TabsTrigger>
              <TabsTrigger value="histograms">Histograms</TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="search">Search Symbols</Label>
                  <Input
                    id="search"
                    placeholder="Search by symbol..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="sector-filter">Sector</Label>
                  <Select value={selectedSector} onValueChange={setSelectedSector}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sectors</SelectItem>
                      {sectorStats.map(stat => (
                        <SelectItem key={stat.sector} value={stat.sector}>
                          {stat.sector} ({stat.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="factor-select">Primary Factor</Label>
                  <Select value={selectedFactor} onValueChange={setSelectedFactor}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="combined">Combined</SelectItem>
                      <SelectItem value="momentum">Momentum</SelectItem>
                      <SelectItem value="value">Value</SelectItem>
                      <SelectItem value="quality">Quality</SelectItem>
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="low_vol">Low Vol</SelectItem>
                      <SelectItem value="size">Size</SelectItem>
                      <SelectItem value="esg">ESG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead>Market Cap</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('momentum')}
                      >
                        Momentum {sortBy === 'momentum' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('value')}
                      >
                        Value {sortBy === 'value' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('quality')}
                      >
                        Quality {sortBy === 'quality' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('combined')}
                      >
                        Combined {sortBy === 'combined' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead>Signal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.slice(0, 50).map((item) => (
                      <TableRow key={item.symbol}>
                        <TableCell className="font-medium">{item.symbol}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.sector}</Badge>
                        </TableCell>
                        <TableCell>{formatMarketCap(item.market_cap)}</TableCell>
                        <TableCell className={getZScoreColor(item.momentum)}>
                          {item.momentum.toFixed(2)}
                        </TableCell>
                        <TableCell className={getZScoreColor(item.value)}>
                          {item.value.toFixed(2)}
                        </TableCell>
                        <TableCell className={getZScoreColor(item.quality)}>
                          {item.quality.toFixed(2)}
                        </TableCell>
                        <TableCell className={getZScoreColor(item.combined)}>
                          {item.combined.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {getZScoreBadge(item.combined)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="sectors" className="space-y-4">
              <div className="grid gap-4">
                {sectorStats.map(stat => (
                  <Card key={stat.sector}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {stat.sector}
                        <Badge variant="secondary">{stat.count} stocks</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold">{stat.avg_momentum.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">Avg Momentum</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{stat.avg_value.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">Avg Value</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{stat.avg_quality.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">Avg Quality</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{stat.avg_combined.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">Avg Combined</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="histograms" className="space-y-4">
              <div className="grid gap-4">
                {['momentum', 'value', 'quality', 'combined'].map(factor => (
                  <Card key={factor}>
                    <CardHeader>
                      <CardTitle className="capitalize">{factor} Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {generateHistogram(data.map(item => item[factor as keyof ZScoreData] as number))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function generateHistogram(values: number[]): JSX.Element {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const bins = 10
  const binWidth = (max - min) / bins
  
  const histogram = new Array(bins).fill(0)
  values.forEach(value => {
    const binIndex = Math.min(Math.floor((value - min) / binWidth), bins - 1)
    histogram[binIndex]++
  })
  
  const maxCount = Math.max(...histogram)
  
  return (
    <div className="flex items-end space-x-1 h-32">
      {histogram.map((count, index) => {
        const height = (count / maxCount) * 100
        const binStart = min + index * binWidth
        const binEnd = min + (index + 1) * binWidth
        
        return (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className="bg-blue-500 w-full rounded-t"
              style={{ height: `${height}%` }}
            />
            <div className="text-xs text-muted-foreground mt-1 text-center">
              {binStart.toFixed(1)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
