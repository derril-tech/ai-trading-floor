'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TrendingUp, TrendingDown, DollarSign, Activity, Filter, Download, RefreshCw } from 'lucide-react'

interface Trade {
  trade_id: string
  order_id: string
  symbol: string
  side: 'BUY' | 'SELL'
  quantity: number
  price: number
  notional: number
  timestamp: string
  venue: string
  commission: number
  fees: number
  net_amount: number
  execution_quality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'
  slippage: number
  market_impact: number
}

interface TradeBlotterData {
  trades: Trade[]
  total_trades: number
  total_volume: number
  total_notional: number
  total_commission: number
  total_fees: number
  net_pnl: number
  execution_summary: {
    excellent: number
    good: number
    fair: number
    poor: number
  }
}

export function TradeBlotter() {
  const [blotterData, setBlotterData] = useState<TradeBlotterData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [filters, setFilters] = useState({
    symbol: '',
    side: '',
    venue: '',
    date_from: '',
    date_to: '',
    execution_quality: ''
  })

  const loadTrades = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data
      const mockTrades: Trade[] = [
        {
          trade_id: 'trade_001',
          order_id: 'ord_001',
          symbol: 'AAPL',
          side: 'BUY',
          quantity: 500,
          price: 150.0,
          notional: 75000,
          timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          venue: 'NYSE',
          commission: 15.0,
          fees: 5.0,
          net_amount: 75020,
          execution_quality: 'EXCELLENT',
          slippage: -0.05,
          market_impact: 0.02
        },
        {
          trade_id: 'trade_002',
          order_id: 'ord_001',
          symbol: 'AAPL',
          side: 'BUY',
          quantity: 250,
          price: 150.5,
          notional: 37625,
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          venue: 'NYSE',
          commission: 7.5,
          fees: 2.5,
          net_amount: 37635,
          execution_quality: 'GOOD',
          slippage: 0.10,
          market_impact: 0.03
        },
        {
          trade_id: 'trade_003',
          order_id: 'ord_002',
          symbol: 'MSFT',
          side: 'SELL',
          quantity: 500,
          price: 300.75,
          notional: 150375,
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          venue: 'NASDAQ',
          commission: 30.0,
          fees: 10.0,
          net_amount: 150335,
          execution_quality: 'EXCELLENT',
          slippage: 0.02,
          market_impact: 0.01
        },
        {
          trade_id: 'trade_004',
          order_id: 'ord_003',
          symbol: 'GOOGL',
          side: 'BUY',
          quantity: 100,
          price: 2800.0,
          notional: 280000,
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          venue: 'NASDAQ',
          commission: 50.0,
          fees: 15.0,
          net_amount: 280065,
          execution_quality: 'FAIR',
          slippage: 0.25,
          market_impact: 0.08
        }
      ]

      const total_notional = mockTrades.reduce((sum, trade) => sum + trade.notional, 0)
      const total_commission = mockTrades.reduce((sum, trade) => sum + trade.commission, 0)
      const total_fees = mockTrades.reduce((sum, trade) => sum + trade.fees, 0)
      const net_pnl = mockTrades.reduce((sum, trade) => {
        return sum + (trade.side === 'SELL' ? trade.notional : -trade.notional)
      }, 0)

      const execution_summary = {
        excellent: mockTrades.filter(t => t.execution_quality === 'EXCELLENT').length,
        good: mockTrades.filter(t => t.execution_quality === 'GOOD').length,
        fair: mockTrades.filter(t => t.execution_quality === 'FAIR').length,
        poor: mockTrades.filter(t => t.execution_quality === 'POOR').length
      }

      setBlotterData({
        trades: mockTrades,
        total_trades: mockTrades.length,
        total_volume: mockTrades.reduce((sum, trade) => sum + trade.quantity, 0),
        total_notional,
        total_commission,
        total_fees,
        net_pnl,
        execution_summary
      })
    } catch (error) {
      console.error('Error loading trades:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportTrades = async () => {
    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('Exporting trades...')
    } catch (error) {
      console.error('Error exporting trades:', error)
    }
  }

  useEffect(() => {
    loadTrades()
    // Set up real-time updates
    const interval = setInterval(loadTrades, 10000)
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`
  const formatNumber = (value: number) => value.toLocaleString()
  const formatDateTime = (dateString: string) => new Date(dateString).toLocaleString()
  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`

  const getExecutionQualityBadge = (quality: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'EXCELLENT': 'default',
      'GOOD': 'default',
      'FAIR': 'outline',
      'POOR': 'destructive'
    }
    
    const colors: Record<string, string> = {
      'EXCELLENT': 'text-green-600',
      'GOOD': 'text-blue-600',
      'FAIR': 'text-yellow-600',
      'POOR': 'text-red-600'
    }

    return (
      <Badge variant={variants[quality] || 'default'} className={colors[quality]}>
        {quality}
      </Badge>
    )
  }

  const getSideIcon = (side: string) => {
    return side === 'BUY' ? 
      <TrendingUp className="w-4 h-4 text-green-600" /> : 
      <TrendingDown className="w-4 h-4 text-red-600" />
  }

  const getSlippageColor = (slippage: number) => {
    if (slippage <= 0) return 'text-green-600'
    if (slippage <= 0.1) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (isLoading && !blotterData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!blotterData) return null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Trade Blotter</CardTitle>
              <CardDescription>
                Real-time trade execution details and reconciliation
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={loadTrades}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={exportTrades}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Total Trades</div>
              <div className="text-2xl font-bold text-blue-900">{blotterData.total_trades}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Total Volume</div>
              <div className="text-2xl font-bold text-green-900">{formatNumber(blotterData.total_volume)}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600 font-medium">Total Notional</div>
              <div className="text-2xl font-bold text-purple-900">{formatCurrency(blotterData.total_notional)}</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-orange-600 font-medium">Net P&L</div>
              <div className={`text-2xl font-bold ${blotterData.net_pnl >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                {formatCurrency(blotterData.net_pnl)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 font-medium">Total Commission</div>
              <div className="text-xl font-bold text-gray-900">{formatCurrency(blotterData.total_commission)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 font-medium">Total Fees</div>
              <div className="text-xl font-bold text-gray-900">{formatCurrency(blotterData.total_fees)}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Excellent Executions</div>
              <div className="text-xl font-bold text-green-900">{blotterData.execution_summary.excellent}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Good Executions</div>
              <div className="text-xl font-bold text-blue-900">{blotterData.execution_summary.good}</div>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div>
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    value={filters.symbol}
                    onChange={(e) => setFilters({...filters, symbol: e.target.value})}
                    placeholder="AAPL"
                  />
                </div>
                <div>
                  <Label htmlFor="side">Side</Label>
                  <Select
                    value={filters.side}
                    onValueChange={(value) => setFilters({...filters, side: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="BUY">Buy</SelectItem>
                      <SelectItem value="SELL">Sell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="venue">Venue</Label>
                  <Select
                    value={filters.venue}
                    onValueChange={(value) => setFilters({...filters, venue: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="NYSE">NYSE</SelectItem>
                      <SelectItem value="NASDAQ">NASDAQ</SelectItem>
                      <SelectItem value="ARCA">ARCA</SelectItem>
                      <SelectItem value="BATS">BATS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quality">Quality</Label>
                  <Select
                    value={filters.execution_quality}
                    onValueChange={(value) => setFilters({...filters, execution_quality: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="EXCELLENT">Excellent</SelectItem>
                      <SelectItem value="GOOD">Good</SelectItem>
                      <SelectItem value="FAIR">Fair</SelectItem>
                      <SelectItem value="POOR">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date_from">From</Label>
                  <Input
                    id="date_from"
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => setFilters({...filters, date_from: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="date_to">To</Label>
                  <Input
                    id="date_to"
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => setFilters({...filters, date_to: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="trades" className="w-full">
            <TabsList>
              <TabsTrigger value="trades">Trades ({blotterData.trades.length})</TabsTrigger>
              <TabsTrigger value="analysis">Execution Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="trades">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Side</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Notional</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Slippage</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blotterData.trades.map((trade) => (
                    <TableRow key={trade.trade_id}>
                      <TableCell>{formatDateTime(trade.timestamp)}</TableCell>
                      <TableCell className="font-medium">{trade.symbol}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSideIcon(trade.side)}
                          {trade.side}
                        </div>
                      </TableCell>
                      <TableCell>{formatNumber(trade.quantity)}</TableCell>
                      <TableCell>{formatCurrency(trade.price)}</TableCell>
                      <TableCell>{formatCurrency(trade.notional)}</TableCell>
                      <TableCell>{trade.venue}</TableCell>
                      <TableCell>{getExecutionQualityBadge(trade.execution_quality)}</TableCell>
                      <TableCell className={getSlippageColor(trade.slippage)}>
                        {formatPercentage(trade.slippage)}
                      </TableCell>
                      <TableCell>{formatCurrency(trade.commission)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTrade(trade)}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="analysis">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Execution Quality Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-green-600">Excellent</span>
                        <span className="font-medium">{blotterData.execution_summary.excellent}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-600">Good</span>
                        <span className="font-medium">{blotterData.execution_summary.good}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-600">Fair</span>
                        <span className="font-medium">{blotterData.execution_summary.fair}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-red-600">Poor</span>
                        <span className="font-medium">{blotterData.execution_summary.poor}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cost Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Total Commission</span>
                        <span className="font-medium">{formatCurrency(blotterData.total_commission)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Total Fees</span>
                        <span className="font-medium">{formatCurrency(blotterData.total_fees)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Total Costs</span>
                        <span className="font-medium">{formatCurrency(blotterData.total_commission + blotterData.total_fees)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Cost as % of Notional</span>
                        <span className="font-medium">
                          {formatPercentage((blotterData.total_commission + blotterData.total_fees) / blotterData.total_notional)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Trade Details Modal */}
      {selectedTrade && (
        <Card>
          <CardHeader>
            <CardTitle>Trade Details - {selectedTrade.symbol}</CardTitle>
            <CardDescription>Trade ID: {selectedTrade.trade_id}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <Label className="text-sm font-medium">Order ID</Label>
                <div className="mt-1">{selectedTrade.order_id}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Side</Label>
                <div className="flex items-center gap-2 mt-1">
                  {getSideIcon(selectedTrade.side)}
                  {selectedTrade.side}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Quantity</Label>
                <div className="mt-1">{formatNumber(selectedTrade.quantity)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Price</Label>
                <div className="mt-1">{formatCurrency(selectedTrade.price)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Notional</Label>
                <div className="mt-1">{formatCurrency(selectedTrade.notional)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Venue</Label>
                <div className="mt-1">{selectedTrade.venue}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Execution Quality</Label>
                <div className="mt-1">{getExecutionQualityBadge(selectedTrade.execution_quality)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Slippage</Label>
                <div className={`mt-1 ${getSlippageColor(selectedTrade.slippage)}`}>
                  {formatPercentage(selectedTrade.slippage)}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Market Impact</Label>
                <div className="mt-1">{formatPercentage(selectedTrade.market_impact)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Commission</Label>
                <div className="mt-1">{formatCurrency(selectedTrade.commission)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Fees</Label>
                <div className="mt-1">{formatCurrency(selectedTrade.fees)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Net Amount</Label>
                <div className="mt-1">{formatCurrency(selectedTrade.net_amount)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Timestamp</Label>
                <div className="mt-1">{formatDateTime(selectedTrade.timestamp)}</div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={() => setSelectedTrade(null)}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
