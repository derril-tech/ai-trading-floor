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
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, Play, Pause, CheckCircle, AlertTriangle, Download, Eye } from 'lucide-react'

// Created automatically by Cursor AI (2024-01-XX)

interface OrderSlice {
  slice_id: string
  start_time: string
  end_time: string
  status: 'PENDING' | 'IN_PROGRESS' | 'EXECUTED' | 'FAILED'
  volume_multiplier: number
  trades: Record<string, number>
  executed_at?: string
  execution_price?: number
  executed_quantity?: number
  commission?: number
}

interface Order {
  order_id: string
  order_type: 'VWAP' | 'TWAP'
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'ALERT'
  created_at: string
  target_weights: Record<string, number>
  total_notional: number
  slices: OrderSlice[]
  execution_summary: {
    total_slices: number
    executed_slices: number
    total_executed: number
    total_commission: number
    avg_execution_price: number
  }
  drift_alerts?: Array<{
    type: string
    symbol: string
    value: number
    threshold: number
    severity: 'HIGH' | 'MEDIUM' | 'LOW'
  }>
}

interface OrderData {
  orders: Order[]
  total_orders: number
  pending_orders: number
  completed_orders: number
  failed_orders: number
}

export function OrdersTable() {
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showCreateOrder, setShowCreateOrder] = useState(false)
  const [orderParams, setOrderParams] = useState({
    order_type: 'VWAP',
    start_time: new Date().toISOString().slice(0, 16),
    end_time: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString().slice(0, 16),
    slice_duration: '30'
  })

  const loadOrders = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock order data
    const mockData: OrderData = {
      orders: [
        {
          order_id: 'order_20240101_120000_abc12345',
          order_type: 'VWAP',
          status: 'IN_PROGRESS',
          created_at: '2024-01-01T12:00:00Z',
          target_weights: { 'ASSET_001': 0.05, 'ASSET_002': 0.03, 'ASSET_003': 0.04 },
          total_notional: 2500000,
          slices: generateOrderSlices(12),
          execution_summary: {
            total_slices: 12,
            executed_slices: 7,
            total_executed: 1450000,
            total_commission: 1450,
            avg_execution_price: 125.45
          },
          drift_alerts: [
            {
              type: 'PRICE_DRIFT',
              symbol: 'ASSET_001',
              value: 0.015,
              threshold: 0.01,
              severity: 'MEDIUM'
            }
          ]
        },
        {
          order_id: 'order_20240101_100000_def67890',
          order_type: 'TWAP',
          status: 'COMPLETED',
          created_at: '2024-01-01T10:00:00Z',
          target_weights: { 'ASSET_004': 0.06, 'ASSET_005': 0.04 },
          total_notional: 1800000,
          slices: generateOrderSlices(8, 'COMPLETED'),
          execution_summary: {
            total_slices: 8,
            executed_slices: 8,
            total_executed: 1800000,
            total_commission: 1800,
            avg_execution_price: 118.75
          }
        }
      ],
      total_orders: 2,
      pending_orders: 0,
      completed_orders: 1,
      failed_orders: 0
    }
    
    setOrderData(mockData)
    setIsLoading(false)
  }

  const generateOrderSlices = (count: number, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' = 'PENDING'): OrderSlice[] => {
    const slices: OrderSlice[] = []
    const now = new Date()
    
    for (let i = 0; i < count; i++) {
      const sliceStatus = status === 'COMPLETED' ? 'EXECUTED' : 
                         status === 'IN_PROGRESS' && i < 7 ? 'EXECUTED' : 
                         status === 'IN_PROGRESS' && i === 7 ? 'IN_PROGRESS' : 'PENDING'
      
      slices.push({
        slice_id: `slice_${i+1:03d}`,
        start_time: new Date(now.getTime() + i * 30 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + (i + 1) * 30 * 60 * 1000).toISOString(),
        status: sliceStatus,
        volume_multiplier: i < 2 || i >= count - 2 ? 1.5 : 0.7,
        trades: { 'ASSET_001': 50000, 'ASSET_002': 30000 },
        ...(sliceStatus === 'EXECUTED' && {
          executed_at: new Date(now.getTime() + i * 30 * 60 * 1000).toISOString(),
          execution_price: 125 + Math.random() * 10,
          executed_quantity: 800,
          commission: 80
        })
      })
    }
    
    return slices
  }

  const createOrder = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const newOrder: Order = {
      order_id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      order_type: orderParams.order_type as 'VWAP' | 'TWAP',
      status: 'PENDING',
      created_at: new Date().toISOString(),
      target_weights: { 'ASSET_001': 0.05, 'ASSET_002': 0.03 },
      total_notional: 2000000,
      slices: generateOrderSlices(parseInt(orderParams.slice_duration)),
      execution_summary: {
        total_slices: parseInt(orderParams.slice_duration),
        executed_slices: 0,
        total_executed: 0,
        total_commission: 0,
        avg_execution_price: 0
      }
    }
    
    setOrderData(prev => prev ? {
      ...prev,
      orders: [newOrder, ...prev.orders],
      total_orders: prev.total_orders + 1,
      pending_orders: prev.pending_orders + 1
    } : null)
    
    setShowCreateOrder(false)
    setIsLoading(false)
  }

  const executeSlice = async (orderId: string, sliceId: string) => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setOrderData(prev => {
      if (!prev) return prev
      
      return {
        ...prev,
        orders: prev.orders.map(order => {
          if (order.order_id === orderId) {
            const updatedSlices = order.slices.map(slice => {
              if (slice.slice_id === sliceId) {
                return {
                  ...slice,
                  status: 'EXECUTED' as const,
                  executed_at: new Date().toISOString(),
                  execution_price: 125 + Math.random() * 10,
                  executed_quantity: 800,
                  commission: 80
                }
              }
              return slice
            })
            
            const executedSlices = updatedSlices.filter(s => s.status === 'EXECUTED').length
            const totalExecuted = updatedSlices.reduce((sum, slice) => sum + (slice.executed_quantity || 0), 0)
            const totalCommission = updatedSlices.reduce((sum, slice) => sum + (slice.commission || 0), 0)
            
            return {
              ...order,
              slices: updatedSlices,
              status: executedSlices === order.slices.length ? 'COMPLETED' : 'IN_PROGRESS',
              execution_summary: {
                ...order.execution_summary,
                executed_slices: executedSlices,
                total_executed: totalExecuted,
                total_commission: totalCommission
              }
            }
          }
          return order
        })
      }
    })
    
    setIsLoading(false)
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const formatCurrency = (value: number) => `$${(value / 1000).toFixed(1)}K`
  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`
  const formatDateTime = (dateString: string) => new Date(dateString).toLocaleString()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline">Pending</Badge>
      case 'IN_PROGRESS':
        return <Badge variant="secondary">In Progress</Badge>
      case 'COMPLETED':
        return <Badge variant="default">Completed</Badge>
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>
      case 'ALERT':
        return <Badge variant="destructive">Alert</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getSliceStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="text-xs">Pending</Badge>
      case 'IN_PROGRESS':
        return <Badge variant="secondary" className="text-xs">Executing</Badge>
      case 'EXECUTED':
        return <Badge variant="default" className="text-xs">Done</Badge>
      case 'FAILED':
        return <Badge variant="destructive" className="text-xs">Failed</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orders Management</CardTitle>
          <CardDescription>Loading orders...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!orderData) return null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Orders Management</CardTitle>
              <CardDescription>VWAP/TWAP order execution and monitoring</CardDescription>
            </div>
            <Button onClick={() => setShowCreateOrder(true)}>
              Create Order
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="execution">Execution</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-4">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{orderData.total_orders}</div>
                    <div className="text-sm text-muted-foreground">Total Orders</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">{orderData.pending_orders}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{orderData.completed_orders}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-600">{orderData.failed_orders}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notional</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderData.orders.map((order) => (
                    <TableRow key={order.order_id}>
                      <TableCell className="font-mono text-sm">
                        {order.order_id.split('_').slice(-1)[0]}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.order_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatCurrency(order.total_notional)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress 
                            value={(order.execution_summary.executed_slices / order.execution_summary.total_slices) * 100} 
                            className="h-2"
                          />
                          <div className="text-xs text-muted-foreground">
                            {order.execution_summary.executed_slices}/{order.execution_summary.total_slices} slices
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDateTime(order.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.status === 'IN_PROGRESS' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const pendingSlice = order.slices.find(s => s.status === 'PENDING')
                                if (pendingSlice) {
                                  executeSlice(order.order_id, pendingSlice.slice_id)
                                }
                              }}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="execution" className="space-y-4">
              {selectedOrder ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Order Execution Details</h3>
                    <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                      Close
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Execution Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Executed</span>
                          <span className="font-mono">{formatCurrency(selectedOrder.execution_summary.total_executed)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Commission</span>
                          <span className="font-mono">${selectedOrder.execution_summary.total_commission}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Price</span>
                          <span className="font-mono">${selectedOrder.execution_summary.avg_execution_price.toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Target Weights</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {Object.entries(selectedOrder.target_weights).map(([symbol, weight]) => (
                          <div key={symbol} className="flex justify-between">
                            <span>{symbol}</span>
                            <span className="font-mono">{formatPercentage(weight)}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Slice</TableHead>
                        <TableHead>Time Window</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Volume Multiplier</TableHead>
                        <TableHead>Execution Price</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.slices.map((slice) => (
                        <TableRow key={slice.slice_id}>
                          <TableCell className="font-mono">{slice.slice_id}</TableCell>
                          <TableCell className="text-sm">
                            {formatDateTime(slice.start_time).slice(11, 16)} - {formatDateTime(slice.end_time).slice(11, 16)}
                          </TableCell>
                          <TableCell>
                            {getSliceStatusBadge(slice.status)}
                          </TableCell>
                          <TableCell className="font-mono">
                            {slice.volume_multiplier.toFixed(1)}x
                          </TableCell>
                          <TableCell className="font-mono">
                            {slice.execution_price ? `$${slice.execution_price.toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell className="font-mono">
                            {slice.commission ? `$${slice.commission}` : '-'}
                          </TableCell>
                          <TableCell>
                            {slice.status === 'PENDING' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => executeSlice(selectedOrder.order_id, slice.slice_id)}
                              >
                                Execute
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Select an order to view execution details
                </div>
              )}
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <div className="space-y-4">
                {orderData.orders
                  .filter(order => order.drift_alerts && order.drift_alerts.length > 0)
                  .map(order => 
                    order.drift_alerts!.map((alert, index) => (
                      <Alert key={`${order.order_id}_${index}`}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <div>
                              <strong>{alert.type}</strong> - {alert.symbol}: {alert.value.toFixed(3)} 
                              (threshold: {alert.threshold.toFixed(3)})
                            </div>
                            <Badge variant={alert.severity === 'HIGH' ? 'destructive' : 'secondary'}>
                              {alert.severity}
                            </Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))
                  )}
                
                {orderData.orders.every(order => !order.drift_alerts || order.drift_alerts.length === 0) && (
                  <div className="text-center text-muted-foreground py-8">
                    No drift alerts
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Order Modal */}
      {showCreateOrder && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Order</CardTitle>
              <CardDescription>Configure VWAP/TWAP order parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="order_type">Order Type</Label>
                <Select value={orderParams.order_type} onValueChange={(value) => setOrderParams(prev => ({ ...prev, order_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VWAP">VWAP (Volume Weighted)</SelectItem>
                    <SelectItem value="TWAP">TWAP (Time Weighted)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={orderParams.start_time}
                  onChange={(e) => setOrderParams(prev => ({ ...prev, start_time: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={orderParams.end_time}
                  onChange={(e) => setOrderParams(prev => ({ ...prev, end_time: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="slice_duration">Slice Duration (minutes)</Label>
                <Select value={orderParams.slice_duration} onValueChange={(value) => setOrderParams(prev => ({ ...prev, slice_duration: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={createOrder}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Create Order
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateOrder(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </Card>
      )}
    </div>
  )
}
