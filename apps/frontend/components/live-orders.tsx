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
import { Play, Pause, X, Eye, TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle } from 'lucide-react'

interface Order {
  order_id: string
  symbol: string
  side: 'BUY' | 'SELL'
  order_type: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT'
  quantity: number
  filled_quantity: number
  remaining_quantity: number
  price?: number
  stop_price?: number
  average_price?: number
  status: 'PENDING' | 'SENT' | 'PARTIAL' | 'FILLED' | 'CANCELLED' | 'REJECTED'
  venue: string
  created_at: string
  updated_at: string
  fills: Array<{
    fill_id: string
    quantity: number
    price: number
    timestamp: string
  }>
}

interface LiveOrdersData {
  active_orders: Order[]
  pending_orders: Order[]
  completed_orders: Order[]
  total_notional: number
  total_volume: number
  order_count: number
}

export function LiveOrders() {
  const [ordersData, setOrdersData] = useState<LiveOrdersData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showCreateOrder, setShowCreateOrder] = useState(false)
  const [orderParams, setOrderParams] = useState({
    symbol: '',
    side: 'BUY',
    order_type: 'LIMIT',
    quantity: 100,
    price: 0,
    stop_price: 0,
    time_in_force: 'DAY',
    venue: 'NYSE'
  })

  const loadOrders = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data
      const mockOrders: Order[] = [
        {
          order_id: 'ord_001',
          symbol: 'AAPL',
          side: 'BUY',
          order_type: 'LIMIT',
          quantity: 1000,
          filled_quantity: 750,
          remaining_quantity: 250,
          price: 150.0,
          average_price: 150.25,
          status: 'PARTIAL',
          venue: 'NYSE',
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          fills: [
            {
              fill_id: 'fill_001',
              quantity: 500,
              price: 150.0,
              timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString()
            },
            {
              fill_id: 'fill_002',
              quantity: 250,
              price: 150.5,
              timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          order_id: 'ord_002',
          symbol: 'MSFT',
          side: 'SELL',
          order_type: 'MARKET',
          quantity: 500,
          filled_quantity: 500,
          remaining_quantity: 0,
          average_price: 300.75,
          status: 'FILLED',
          venue: 'NASDAQ',
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          fills: [
            {
              fill_id: 'fill_003',
              quantity: 500,
              price: 300.75,
              timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          order_id: 'ord_003',
          symbol: 'GOOGL',
          side: 'BUY',
          order_type: 'STOP',
          quantity: 200,
          filled_quantity: 0,
          remaining_quantity: 200,
          stop_price: 2800.0,
          status: 'PENDING',
          venue: 'NASDAQ',
          created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          fills: []
        }
      ]

      setOrdersData({
        active_orders: mockOrders.filter(o => o.status === 'PARTIAL' || o.status === 'SENT'),
        pending_orders: mockOrders.filter(o => o.status === 'PENDING'),
        completed_orders: mockOrders.filter(o => o.status === 'FILLED' || o.status === 'CANCELLED'),
        total_notional: 450000,
        total_volume: 1500,
        order_count: mockOrders.length
      })
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createOrder = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setShowCreateOrder(false)
      loadOrders() // Reload orders
    } catch (error) {
      console.error('Error creating order:', error)
    }
  }

  const cancelOrder = async (orderId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      loadOrders() // Reload orders
    } catch (error) {
      console.error('Error cancelling order:', error)
    }
  }

  useEffect(() => {
    loadOrders()
    // Set up real-time updates
    const interval = setInterval(loadOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`
  const formatNumber = (value: number) => value.toLocaleString()
  const formatDateTime = (dateString: string) => new Date(dateString).toLocaleString()
  const formatPercentage = (filled: number, total: number) => `${((filled / total) * 100).toFixed(1)}%`

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'PENDING': 'outline',
      'SENT': 'secondary',
      'PARTIAL': 'default',
      'FILLED': 'default',
      'CANCELLED': 'destructive',
      'REJECTED': 'destructive'
    }
    
    const colors: Record<string, string> = {
      'PENDING': 'text-yellow-600',
      'SENT': 'text-blue-600',
      'PARTIAL': 'text-orange-600',
      'FILLED': 'text-green-600',
      'CANCELLED': 'text-red-600',
      'REJECTED': 'text-red-600'
    }

    return (
      <Badge variant={variants[status] || 'default'} className={colors[status]}>
        {status}
      </Badge>
    )
  }

  const getSideIcon = (side: string) => {
    return side === 'BUY' ? 
      <TrendingUp className="w-4 h-4 text-green-600" /> : 
      <TrendingDown className="w-4 h-4 text-red-600" />
  }

  if (isLoading && !ordersData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!ordersData) return null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Live Orders</CardTitle>
              <CardDescription>
                Real-time order management and execution monitoring
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateOrder(true)}>
              <Play className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Total Orders</div>
              <div className="text-2xl font-bold text-blue-900">{ordersData.order_count}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Total Volume</div>
              <div className="text-2xl font-bold text-green-900">{formatNumber(ordersData.total_volume)}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600 font-medium">Total Notional</div>
              <div className="text-2xl font-bold text-purple-900">{formatCurrency(ordersData.total_notional)}</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-orange-600 font-medium">Active Orders</div>
              <div className="text-2xl font-bold text-orange-900">{ordersData.active_orders.length}</div>
            </div>
          </div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList>
              <TabsTrigger value="active">Active ({ordersData.active_orders.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({ordersData.pending_orders.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({ordersData.completed_orders.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Side</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Filled</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersData.active_orders.map((order) => (
                    <TableRow key={order.order_id}>
                      <TableCell className="font-medium">{order.symbol}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSideIcon(order.side)}
                          {order.side}
                        </div>
                      </TableCell>
                      <TableCell>{order.order_type}</TableCell>
                      <TableCell>{formatNumber(order.quantity)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{formatNumber(order.filled_quantity)}</span>
                          <span className="text-sm text-gray-500">
                            ({formatPercentage(order.filled_quantity, order.quantity)})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.price ? formatCurrency(order.price) : 'Market'}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{order.venue}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelOrder(order.order_id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="pending">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Side</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersData.pending_orders.map((order) => (
                    <TableRow key={order.order_id}>
                      <TableCell className="font-medium">{order.symbol}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSideIcon(order.side)}
                          {order.side}
                        </div>
                      </TableCell>
                      <TableCell>{order.order_type}</TableCell>
                      <TableCell>{formatNumber(order.quantity)}</TableCell>
                      <TableCell>
                        {order.price ? formatCurrency(order.price) : 'Market'}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{order.venue}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelOrder(order.order_id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="completed">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Side</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Avg Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersData.completed_orders.map((order) => (
                    <TableRow key={order.order_id}>
                      <TableCell className="font-medium">{order.symbol}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSideIcon(order.side)}
                          {order.side}
                        </div>
                      </TableCell>
                      <TableCell>{order.order_type}</TableCell>
                      <TableCell>{formatNumber(order.quantity)}</TableCell>
                      <TableCell>
                        {order.average_price ? formatCurrency(order.average_price) : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{order.venue}</TableCell>
                      <TableCell>{formatDateTime(order.updated_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Card>
          <CardHeader>
            <CardTitle>Order Details - {selectedOrder.symbol}</CardTitle>
            <CardDescription>Order ID: {selectedOrder.order_id}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <Label className="text-sm font-medium">Side</Label>
                <div className="flex items-center gap-2 mt-1">
                  {getSideIcon(selectedOrder.side)}
                  {selectedOrder.side}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Type</Label>
                <div className="mt-1">{selectedOrder.order_type}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Quantity</Label>
                <div className="mt-1">{formatNumber(selectedOrder.quantity)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Filled</Label>
                <div className="mt-1">
                  {formatNumber(selectedOrder.filled_quantity)} / {formatNumber(selectedOrder.quantity)}
                  <span className="text-sm text-gray-500 ml-2">
                    ({formatPercentage(selectedOrder.filled_quantity, selectedOrder.quantity)})
                  </span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Price</Label>
                <div className="mt-1">
                  {selectedOrder.price ? formatCurrency(selectedOrder.price) : 'Market'}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Average Price</Label>
                <div className="mt-1">
                  {selectedOrder.average_price ? formatCurrency(selectedOrder.average_price) : '-'}
                </div>
              </div>
            </div>

            {selectedOrder.fills.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Fills</Label>
                <Table className="mt-2">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.fills.map((fill) => (
                      <TableRow key={fill.fill_id}>
                        <TableCell>{formatDateTime(fill.timestamp)}</TableCell>
                        <TableCell>{formatNumber(fill.quantity)}</TableCell>
                        <TableCell>{formatCurrency(fill.price)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Order Modal */}
      {showCreateOrder && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Order</CardTitle>
            <CardDescription>Enter order details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                  id="symbol"
                  value={orderParams.symbol}
                  onChange={(e) => setOrderParams({...orderParams, symbol: e.target.value})}
                  placeholder="AAPL"
                />
              </div>
              <div>
                <Label htmlFor="side">Side</Label>
                <Select
                  value={orderParams.side}
                  onValueChange={(value) => setOrderParams({...orderParams, side: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUY">Buy</SelectItem>
                    <SelectItem value="SELL">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="order_type">Order Type</Label>
                <Select
                  value={orderParams.order_type}
                  onValueChange={(value) => setOrderParams({...orderParams, order_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MARKET">Market</SelectItem>
                    <SelectItem value="LIMIT">Limit</SelectItem>
                    <SelectItem value="STOP">Stop</SelectItem>
                    <SelectItem value="STOP_LIMIT">Stop Limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={orderParams.quantity}
                  onChange={(e) => setOrderParams({...orderParams, quantity: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={orderParams.price}
                  onChange={(e) => setOrderParams({...orderParams, price: parseFloat(e.target.value)})}
                  placeholder="150.00"
                />
              </div>
              <div>
                <Label htmlFor="venue">Venue</Label>
                <Select
                  value={orderParams.venue}
                  onValueChange={(value) => setOrderParams({...orderParams, venue: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NYSE">NYSE</SelectItem>
                    <SelectItem value="NASDAQ">NASDAQ</SelectItem>
                    <SelectItem value="ARCA">ARCA</SelectItem>
                    <SelectItem value="BATS">BATS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreateOrder(false)}>
                Cancel
              </Button>
              <Button onClick={createOrder}>
                Create Order
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
