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
import { TrendingUp, TrendingDown, Activity, Wifi, WifiOff, Play, Pause, Settings, BarChart3 } from 'lucide-react'

interface MarketDataPoint {
  symbol: string
  timestamp: string
  data_type: 'trade' | 'quote' | 'level2' | 'ohlcv' | 'news'
  price?: number
  volume?: number
  bid?: number
  ask?: number
  bid_size?: number
  ask_size?: number
  open?: number
  high?: number
  low?: number
  close?: number
  news_headline?: string
  news_body?: string
}

interface MarketDataStreamData {
  streams: Array<{
    stream_id: string
    symbols: string[]
    data_types: string[]
    status: 'active' | 'inactive' | 'error'
    message_count: number
    last_message: string
    uptime_seconds: number
  }>
  latest_data: MarketDataPoint[]
  total_messages: number
  active_streams: number
  error_streams: number
}

export function MarketDataStream() {
  const [streamData, setStreamData] = useState<MarketDataStreamData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showStreamConfig, setShowStreamConfig] = useState(false)
  const [streamConfig, setStreamConfig] = useState({
    symbols: ['AAPL', 'MSFT', 'GOOGL'],
    data_types: ['trade', 'quote'],
    update_frequency: 1.0,
    volatility: 0.02
  })

  const loadStreamData = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data
      const mockStreams = [
        {
          stream_id: 'stream_001',
          symbols: ['AAPL', 'MSFT', 'GOOGL'],
          data_types: ['trade', 'quote'],
          status: 'active' as const,
          message_count: 1250,
          last_message: new Date().toISOString(),
          uptime_seconds: 3600
        },
        {
          stream_id: 'stream_002',
          symbols: ['AMZN', 'TSLA', 'NVDA'],
          data_types: ['trade', 'ohlcv'],
          status: 'active' as const,
          message_count: 890,
          last_message: new Date().toISOString(),
          uptime_seconds: 1800
        },
        {
          stream_id: 'stream_003',
          symbols: ['SPY', 'QQQ'],
          data_types: ['trade', 'quote', 'level2'],
          status: 'error' as const,
          message_count: 0,
          last_message: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          uptime_seconds: 0
        }
      ]

      const mockLatestData: MarketDataPoint[] = [
        {
          symbol: 'AAPL',
          timestamp: new Date().toISOString(),
          data_type: 'trade',
          price: 150.25,
          volume: 1000
        },
        {
          symbol: 'AAPL',
          timestamp: new Date().toISOString(),
          data_type: 'quote',
          bid: 150.20,
          ask: 150.30,
          bid_size: 500,
          ask_size: 750
        },
        {
          symbol: 'MSFT',
          timestamp: new Date().toISOString(),
          data_type: 'trade',
          price: 300.75,
          volume: 500
        },
        {
          symbol: 'GOOGL',
          timestamp: new Date().toISOString(),
          data_type: 'ohlcv',
          open: 2800.0,
          high: 2805.0,
          low: 2795.0,
          close: 2802.0,
          volume: 2500
        }
      ]

      setStreamData({
        streams: mockStreams,
        latest_data: mockLatestData,
        total_messages: mockStreams.reduce((sum, stream) => sum + stream.message_count, 0),
        active_streams: mockStreams.filter(s => s.status === 'active').length,
        error_streams: mockStreams.filter(s => s.status === 'error').length
      })
    } catch (error) {
      console.error('Error loading stream data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startStream = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setShowStreamConfig(false)
      loadStreamData() // Reload data
    } catch (error) {
      console.error('Error starting stream:', error)
    }
  }

  const stopStream = async (streamId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      loadStreamData() // Reload data
    } catch (error) {
      console.error('Error stopping stream:', error)
    }
  }

  useEffect(() => {
    loadStreamData()
    // Set up real-time updates
    const interval = setInterval(loadStreamData, 2000)
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`
  const formatNumber = (value: number) => value.toLocaleString()
  const formatDateTime = (dateString: string) => new Date(dateString).toLocaleString()
  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'active': 'default',
      'inactive': 'outline',
      'error': 'destructive'
    }
    
    const colors: Record<string, string> = {
      'active': 'text-green-600',
      'inactive': 'text-gray-600',
      'error': 'text-red-600'
    }

    return (
      <Badge variant={variants[status] || 'default'} className={colors[status]}>
        {status === 'active' ? (
          <Wifi className="w-3 h-3 mr-1" />
        ) : status === 'error' ? (
          <WifiOff className="w-3 h-3 mr-1" />
        ) : null}
        {status.toUpperCase()}
      </Badge>
    )
  }

  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case 'trade':
        return <Activity className="w-4 h-4 text-blue-600" />
      case 'quote':
        return <BarChart3 className="w-4 h-4 text-green-600" />
      case 'ohlcv':
        return <TrendingUp className="w-4 h-4 text-purple-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  if (isLoading && !streamData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!streamData) return null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Market Data Streams</CardTitle>
              <CardDescription>
                Real-time market data streaming and monitoring
              </CardDescription>
            </div>
            <Button onClick={() => setShowStreamConfig(true)}>
              <Play className="w-4 h-4 mr-2" />
              New Stream
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Total Messages</div>
              <div className="text-2xl font-bold text-blue-900">{formatNumber(streamData.total_messages)}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Active Streams</div>
              <div className="text-2xl font-bold text-green-900">{streamData.active_streams}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm text-red-600 font-medium">Error Streams</div>
              <div className="text-2xl font-bold text-red-900">{streamData.error_streams}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600 font-medium">Total Streams</div>
              <div className="text-2xl font-bold text-purple-900">{streamData.streams.length}</div>
            </div>
          </div>

          <Tabs defaultValue="streams" className="w-full">
            <TabsList>
              <TabsTrigger value="streams">Streams ({streamData.streams.length})</TabsTrigger>
              <TabsTrigger value="data">Latest Data ({streamData.latest_data.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="streams">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stream ID</TableHead>
                    <TableHead>Symbols</TableHead>
                    <TableHead>Data Types</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Messages</TableHead>
                    <TableHead>Last Message</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {streamData.streams.map((stream) => (
                    <TableRow key={stream.stream_id}>
                      <TableCell className="font-medium">{stream.stream_id}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {stream.symbols.map((symbol) => (
                            <Badge key={symbol} variant="outline" className="text-xs">
                              {symbol}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {stream.data_types.map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {getDataTypeIcon(type)}
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(stream.status)}</TableCell>
                      <TableCell>{formatNumber(stream.message_count)}</TableCell>
                      <TableCell>{formatDateTime(stream.last_message)}</TableCell>
                      <TableCell>{formatUptime(stream.uptime_seconds)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {stream.status === 'active' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => stopStream(stream.stream_id)}
                            >
                              <Pause className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startStream()}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="data">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Bid</TableHead>
                    <TableHead>Ask</TableHead>
                    <TableHead>Spread</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {streamData.latest_data.map((data, index) => (
                    <TableRow key={`${data.symbol}-${data.timestamp}-${index}`}>
                      <TableCell>{formatDateTime(data.timestamp)}</TableCell>
                      <TableCell className="font-medium">{data.symbol}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDataTypeIcon(data.data_type)}
                          {data.data_type.toUpperCase()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {data.price ? formatCurrency(data.price) : '-'}
                      </TableCell>
                      <TableCell>
                        {data.volume ? formatNumber(data.volume) : '-'}
                      </TableCell>
                      <TableCell>
                        {data.bid ? formatCurrency(data.bid) : '-'}
                      </TableCell>
                      <TableCell>
                        {data.ask ? formatCurrency(data.ask) : '-'}
                      </TableCell>
                      <TableCell>
                        {data.bid && data.ask ? 
                          formatCurrency(data.ask - data.bid) : '-'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Stream Configuration Modal */}
      {showStreamConfig && (
        <Card>
          <CardHeader>
            <CardTitle>Configure New Stream</CardTitle>
            <CardDescription>Set up a new market data stream</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="symbols">Symbols (comma-separated)</Label>
                <Input
                  id="symbols"
                  value={streamConfig.symbols.join(', ')}
                  onChange={(e) => setStreamConfig({
                    ...streamConfig, 
                    symbols: e.target.value.split(',').map(s => s.trim())
                  })}
                  placeholder="AAPL, MSFT, GOOGL"
                />
              </div>
              <div>
                <Label htmlFor="data_types">Data Types</Label>
                <Select
                  value={streamConfig.data_types[0]}
                  onValueChange={(value) => setStreamConfig({
                    ...streamConfig, 
                    data_types: [value]
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trade">Trade</SelectItem>
                    <SelectItem value="quote">Quote</SelectItem>
                    <SelectItem value="ohlcv">OHLCV</SelectItem>
                    <SelectItem value="level2">Level 2</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="update_frequency">Update Frequency (seconds)</Label>
                <Input
                  id="update_frequency"
                  type="number"
                  step="0.1"
                  value={streamConfig.update_frequency}
                  onChange={(e) => setStreamConfig({
                    ...streamConfig, 
                    update_frequency: parseFloat(e.target.value)
                  })}
                />
              </div>
              <div>
                <Label htmlFor="volatility">Volatility</Label>
                <Input
                  id="volatility"
                  type="number"
                  step="0.001"
                  value={streamConfig.volatility}
                  onChange={(e) => setStreamConfig({
                    ...streamConfig, 
                    volatility: parseFloat(e.target.value)
                  })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowStreamConfig(false)}>
                Cancel
              </Button>
              <Button onClick={startStream}>
                Start Stream
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stream Status Alerts */}
      {streamData.error_streams > 0 && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            {streamData.error_streams} stream(s) are experiencing errors. Please check the stream configuration.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
