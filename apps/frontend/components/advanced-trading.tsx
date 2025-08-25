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
import { TrendingUp, TrendingDown, DollarSign, Activity, Calculator, BarChart3, Zap, Target, Settings } from 'lucide-react'

interface OptionContract {
  symbol: string
  underlying: string
  strike_price: number
  expiration_date: string
  option_type: 'call' | 'put'
  style: 'american' | 'european'
  price: number
  volume: number
  open_interest: number
  implied_volatility: number
  delta: number
  gamma: number
  theta: number
  vega: number
  rho: number
}

interface Bond {
  symbol: string
  issuer: string
  bond_type: string
  face_value: number
  coupon_rate: number
  maturity_date: string
  yield_to_maturity: number
  duration: number
  convexity: number
  credit_rating: string
  price: number
}

interface FXPair {
  pair: string
  spot_rate: number
  forward_rate: number
  forward_points: number
  implied_volatility: number
  correlation: number
  interest_differential: number
}

interface CryptoAsset {
  symbol: string
  name: string
  price: number
  market_cap: number
  volume_24h: number
  volatility: number
  correlation: number
  dominance: number
  on_chain_metrics: {
    active_addresses: number
    transaction_count: number
    network_hash_rate: number
  }
}

export function AdvancedTrading() {
  const [activeTab, setActiveTab] = useState('options')
  const [options, setOptions] = useState<OptionContract[]>([])
  const [bonds, setBonds] = useState<Bond[]>([])
  const [fxPairs, setFxPairs] = useState<FXPair[]>([])
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadAdvancedTradingData()
  }, [])

  const loadAdvancedTradingData = async () => {
    setIsLoading(true)
    try {
      // Simulated data
      const mockOptions: OptionContract[] = [
        {
          symbol: 'AAPL240315C150',
          underlying: 'AAPL',
          strike_price: 150,
          expiration_date: '2024-03-15',
          option_type: 'call',
          style: 'american',
          price: 8.50,
          volume: 1250,
          open_interest: 5000,
          implied_volatility: 0.25,
          delta: 0.65,
          gamma: 0.02,
          theta: -0.15,
          vega: 0.45,
          rho: 0.08
        },
        {
          symbol: 'AAPL240315P150',
          underlying: 'AAPL',
          strike_price: 150,
          expiration_date: '2024-03-15',
          option_type: 'put',
          style: 'american',
          price: 6.20,
          volume: 980,
          open_interest: 3200,
          implied_volatility: 0.28,
          delta: -0.35,
          gamma: 0.02,
          theta: -0.12,
          vega: 0.42,
          rho: -0.06
        }
      ]

      const mockBonds: Bond[] = [
        {
          symbol: 'US10Y',
          issuer: 'US Treasury',
          bond_type: 'treasury',
          face_value: 1000,
          coupon_rate: 0.045,
          maturity_date: '2034-02-15',
          yield_to_maturity: 0.042,
          duration: 8.5,
          convexity: 85.2,
          credit_rating: 'AAA',
          price: 1025.50
        },
        {
          symbol: 'CORP001',
          issuer: 'Apple Inc',
          bond_type: 'corporate',
          face_value: 1000,
          coupon_rate: 0.055,
          maturity_date: '2030-05-15',
          yield_to_maturity: 0.058,
          duration: 6.2,
          convexity: 45.8,
          credit_rating: 'AA+',
          price: 985.75
        }
      ]

      const mockFxPairs: FXPair[] = [
        {
          pair: 'EUR/USD',
          spot_rate: 1.0850,
          forward_rate: 1.0875,
          forward_points: 25,
          implied_volatility: 0.12,
          correlation: 0.85,
          interest_differential: -0.02
        },
        {
          pair: 'GBP/USD',
          spot_rate: 1.2650,
          forward_rate: 1.2680,
          forward_points: 30,
          implied_volatility: 0.15,
          correlation: 0.78,
          interest_differential: -0.03
        }
      ]

      const mockCryptoAssets: CryptoAsset[] = [
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          price: 45000,
          market_cap: 850000000000,
          volume_24h: 25000000000,
          volatility: 0.35,
          correlation: 0.92,
          dominance: 0.48,
          on_chain_metrics: {
            active_addresses: 850000,
            transaction_count: 250000,
            network_hash_rate: 450
          }
        },
        {
          symbol: 'ETH',
          name: 'Ethereum',
          price: 2800,
          market_cap: 350000000000,
          volume_24h: 15000000000,
          volatility: 0.42,
          correlation: 0.88,
          dominance: 0.19,
          on_chain_metrics: {
            active_addresses: 650000,
            transaction_count: 1200000,
            network_hash_rate: 850
          }
        }
      ]

      setOptions(mockOptions)
      setBonds(mockBonds)
      setFxPairs(mockFxPairs)
      setCryptoAssets(mockCryptoAssets)
    } catch (error) {
      console.error('Error loading advanced trading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateOptionGreeks = async (option: OptionContract) => {
    // Simulated Greeks calculation
    console.log('Calculating Greeks for:', option.symbol)
  }

  const calculateBondMetrics = async (bond: Bond) => {
    // Simulated bond metrics calculation
    console.log('Calculating metrics for:', bond.symbol)
  }

  const calculateYieldCurve = async () => {
    // Simulated yield curve calculation
    console.log('Calculating yield curve...')
  }

  const getOptionTypeColor = (type: string) => {
    return type === 'call' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getBondTypeColor = (type: string) => {
    switch (type) {
      case 'treasury': return 'bg-blue-100 text-blue-800'
      case 'corporate': return 'bg-purple-100 text-purple-800'
      case 'municipal': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCreditRatingColor = (rating: string) => {
    if (rating.includes('AAA') || rating.includes('AA')) return 'bg-green-100 text-green-800'
    if (rating.includes('A') || rating.includes('BBB')) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Advanced Trading</h2>
          <p className="text-muted-foreground">
            Options, bonds, FX, and crypto trading with advanced analytics
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={calculateYieldCurve} className="flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>Yield Curve</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Options</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{options.length}</div>
            <p className="text-xs text-muted-foreground">
              +5 from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bond Portfolio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bonds.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FX Pairs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fxPairs.length}</div>
            <p className="text-xs text-muted-foreground">
              +1 from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crypto Assets</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cryptoAssets.length}</div>
            <p className="text-xs text-muted-foreground">
              +3 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="options">Options</TabsTrigger>
          <TabsTrigger value="bonds">Bonds</TabsTrigger>
          <TabsTrigger value="fx">FX Trading</TabsTrigger>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
        </TabsList>

        <TabsContent value="options" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Options Chain</CardTitle>
              <CardDescription>
                Options contracts with Greeks and volatility analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Strike</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>IV</TableHead>
                    <TableHead>Delta</TableHead>
                    <TableHead>Gamma</TableHead>
                    <TableHead>Theta</TableHead>
                    <TableHead>Vega</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {options.map((option) => (
                    <TableRow key={option.symbol}>
                      <TableCell className="font-medium">{option.symbol}</TableCell>
                      <TableCell>
                        <Badge className={getOptionTypeColor(option.option_type)}>
                          {option.option_type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>${option.strike_price}</TableCell>
                      <TableCell>${option.price.toFixed(2)}</TableCell>
                      <TableCell>{(option.implied_volatility * 100).toFixed(1)}%</TableCell>
                      <TableCell>{option.delta.toFixed(3)}</TableCell>
                      <TableCell>{option.gamma.toFixed(3)}</TableCell>
                      <TableCell>{option.theta.toFixed(3)}</TableCell>
                      <TableCell>{option.vega.toFixed(3)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => calculateOptionGreeks(option)}
                        >
                          <Calculator className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bonds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bond Portfolio</CardTitle>
              <CardDescription>
                Fixed income securities with yield and duration analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Issuer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Coupon</TableHead>
                    <TableHead>YTM</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Convexity</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bonds.map((bond) => (
                    <TableRow key={bond.symbol}>
                      <TableCell className="font-medium">{bond.symbol}</TableCell>
                      <TableCell>{bond.issuer}</TableCell>
                      <TableCell>
                        <Badge className={getBondTypeColor(bond.bond_type)}>
                          {bond.bond_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{(bond.coupon_rate * 100).toFixed(2)}%</TableCell>
                      <TableCell>{(bond.yield_to_maturity * 100).toFixed(2)}%</TableCell>
                      <TableCell>{bond.duration.toFixed(1)}</TableCell>
                      <TableCell>{bond.convexity.toFixed(1)}</TableCell>
                      <TableCell>
                        <Badge className={getCreditRatingColor(bond.credit_rating)}>
                          {bond.credit_rating}
                        </Badge>
                      </TableCell>
                      <TableCell>${bond.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => calculateBondMetrics(bond)}
                        >
                          <Calculator className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fx" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>FX Trading</CardTitle>
              <CardDescription>
                Foreign exchange pairs with forward rates and volatility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pair</TableHead>
                    <TableHead>Spot Rate</TableHead>
                    <TableHead>Forward Rate</TableHead>
                    <TableHead>Forward Points</TableHead>
                    <TableHead>Implied Vol</TableHead>
                    <TableHead>Correlation</TableHead>
                    <TableHead>Interest Diff</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fxPairs.map((pair) => (
                    <TableRow key={pair.pair}>
                      <TableCell className="font-medium">{pair.pair}</TableCell>
                      <TableCell>{pair.spot_rate.toFixed(4)}</TableCell>
                      <TableCell>{pair.forward_rate.toFixed(4)}</TableCell>
                      <TableCell>{pair.forward_points}</TableCell>
                      <TableCell>{(pair.implied_volatility * 100).toFixed(1)}%</TableCell>
                      <TableCell>{pair.correlation.toFixed(2)}</TableCell>
                      <TableCell>{(pair.interest_differential * 100).toFixed(2)}%</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crypto" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crypto Assets</CardTitle>
              <CardDescription>
                Cryptocurrency assets with on-chain metrics and correlations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Market Cap</TableHead>
                    <TableHead>Volume 24h</TableHead>
                    <TableHead>Volatility</TableHead>
                    <TableHead>Correlation</TableHead>
                    <TableHead>Dominance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cryptoAssets.map((asset) => (
                    <TableRow key={asset.symbol}>
                      <TableCell className="font-medium">{asset.symbol}</TableCell>
                      <TableCell>{asset.name}</TableCell>
                      <TableCell>${asset.price.toLocaleString()}</TableCell>
                      <TableCell>${(asset.market_cap / 1e9).toFixed(1)}B</TableCell>
                      <TableCell>${(asset.volume_24h / 1e6).toFixed(0)}M</TableCell>
                      <TableCell>{(asset.volatility * 100).toFixed(1)}%</TableCell>
                      <TableCell>{asset.correlation.toFixed(2)}</TableCell>
                      <TableCell>{(asset.dominance * 100).toFixed(1)}%</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Activity className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* On-Chain Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>On-Chain Metrics</CardTitle>
              <CardDescription>
                Blockchain network activity and transaction data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {cryptoAssets.map((asset) => (
                  <Card key={asset.symbol}>
                    <CardHeader>
                      <CardTitle className="text-lg">{asset.name} ({asset.symbol})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Active Addresses</span>
                          <span className="font-medium">{asset.on_chain_metrics.active_addresses.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Transaction Count</span>
                          <span className="font-medium">{asset.on_chain_metrics.transaction_count.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Network Hash Rate</span>
                          <span className="font-medium">{asset.on_chain_metrics.network_hash_rate.toFixed(0)} TH/s</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
