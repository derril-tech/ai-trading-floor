'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Upload, Search, Filter } from 'lucide-react'

// Created automatically by Cursor AI (2024-01-XX)

interface Universe {
  id: string
  name: string
  description: string
  symbols: string[]
  filters: Record<string, any>
  createdAt: string
  updatedAt: string
}

interface UniverseBuilderProps {
  onUniverseCreated?: (universe: Universe) => void
}

export function UniverseBuilder({ onUniverseCreated }: UniverseBuilderProps) {
  const [activeTab, setActiveTab] = useState('manual')
  const [universeName, setUniverseName] = useState('')
  const [universeDescription, setUniverseDescription] = useState('')
  const [symbols, setSymbols] = useState<string[]>([])
  const [newSymbol, setNewSymbol] = useState('')
  const [filters, setFilters] = useState({
    sector: '',
    marketCap: '',
    country: '',
    exchange: ''
  })

  const handleAddSymbol = () => {
    if (newSymbol.trim() && !symbols.includes(newSymbol.trim().toUpperCase())) {
      setSymbols([...symbols, newSymbol.trim().toUpperCase()])
      setNewSymbol('')
    }
  }

  const handleRemoveSymbol = (symbol: string) => {
    setSymbols(symbols.filter(s => s !== symbol))
  }

  const handleCreateUniverse = async () => {
    if (!universeName.trim()) return

    const universe: Universe = {
      id: Date.now().toString(), // In real app, this would come from API
      name: universeName,
      description: universeDescription,
      symbols,
      filters,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // TODO: Call API to create universe
    console.log('Creating universe:', universe)

    onUniverseCreated?.(universe)

    // Reset form
    setUniverseName('')
    setUniverseDescription('')
    setSymbols([])
    setFilters({
      sector: '',
      marketCap: '',
      country: '',
      exchange: ''
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Universe</CardTitle>
        <CardDescription>
          Build a universe of instruments for your trading strategy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="universe-name">Universe Name</Label>
            <Input
              id="universe-name"
              value={universeName}
              onChange={(e) => setUniverseName(e.target.value)}
              placeholder="e.g., S&P 500 Technology"
            />
          </div>
          <div>
            <Label htmlFor="universe-description">Description</Label>
            <Textarea
              id="universe-description"
              value={universeDescription}
              onChange={(e) => setUniverseDescription(e.target.value)}
              placeholder="Describe your universe..."
              rows={3}
            />
          </div>
        </div>

        {/* Universe Construction */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <div>
              <Label>Add Symbols</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  placeholder="e.g., AAPL"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSymbol()}
                />
                <Button onClick={handleAddSymbol} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {symbols.length > 0 && (
              <div>
                <Label>Selected Symbols ({symbols.length})</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {symbols.map((symbol) => (
                    <Badge key={symbol} variant="secondary" className="flex items-center gap-1">
                      {symbol}
                      <button
                        onClick={() => handleRemoveSymbol(symbol)}
                        className="ml-1 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="filters" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sector">Sector</Label>
                <Select value={filters.sector} onValueChange={(value) => setFilters({...filters, sector: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="consumer">Consumer</SelectItem>
                    <SelectItem value="energy">Energy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="market-cap">Market Cap</Label>
                <Select value={filters.marketCap} onValueChange={(value) => setFilters({...filters, marketCap: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select market cap" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="large">Large Cap (>$10B)</SelectItem>
                    <SelectItem value="mid">Mid Cap ($2B-$10B)</SelectItem>
                    <SelectItem value="small">Small Cap (<$2B)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Select value={filters.country} onValueChange={(value) => setFilters({...filters, country: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="eu">European Union</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="exchange">Exchange</Label>
                <Select value={filters.exchange} onValueChange={(value) => setFilters({...filters, exchange: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exchange" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nasdaq">NASDAQ</SelectItem>
                    <SelectItem value="nyse">NYSE</SelectItem>
                    <SelectItem value="tsx">TSX</SelectItem>
                    <SelectItem value="lse">LSE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <Search className="h-4 w-4 mr-2" />
              Search Instruments
            </Button>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">
                Upload a CSV file with symbols
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Supported formats: CSV with 'symbol' column
              </p>
              <Button variant="outline">
                Choose File
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Button */}
        <Button 
          onClick={handleCreateUniverse}
          disabled={!universeName.trim() || symbols.length === 0}
          className="w-full"
        >
          Create Universe
        </Button>
      </CardContent>
    </Card>
  )
}
