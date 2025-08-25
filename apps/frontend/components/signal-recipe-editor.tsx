'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'

// Created automatically by Cursor AI (2024-01-XX)

interface FactorConfig {
  enabled: boolean
  weight: number
  lookback?: number
  winsorize_percentile?: number
  custom_params?: Record<string, any>
}

interface PipelineConfig {
  zscore: boolean
  sector_neutralize: boolean
  size_neutralize: boolean
  decay: number
}

interface CombinationConfig {
  method: 'weighted_sum' | 'pca'
  weights: Record<string, number>
}

interface SignalRecipe {
  name: string
  description: string
  factors: Record<string, FactorConfig>
  pipeline: PipelineConfig
  combination: CombinationConfig
}

const AVAILABLE_FACTORS = [
  { id: 'momentum', name: 'Momentum', description: 'Price momentum over lookback period' },
  { id: 'value', name: 'Value', description: 'P/E and P/B ratio based value signals' },
  { id: 'quality', name: 'Quality', description: 'ROE and debt-to-equity based quality' },
  { id: 'growth', name: 'Growth', description: 'Revenue and earnings growth rates' },
  { id: 'low_vol', name: 'Low Volatility', description: 'Historical volatility signals' },
  { id: 'size', name: 'Size', description: 'Market capitalization based size factor' },
  { id: 'esg', name: 'ESG', description: 'Environmental, Social, and Governance scores' }
]

export function SignalRecipeEditor() {
  const [recipe, setRecipe] = useState<SignalRecipe>({
    name: '',
    description: '',
    factors: {
      momentum: { enabled: true, weight: 1.0, lookback: 252, winsorize_percentile: 0.05 },
      value: { enabled: true, weight: 1.0, winsorize_percentile: 0.05 },
      quality: { enabled: false, weight: 1.0, winsorize_percentile: 0.05 },
      growth: { enabled: false, weight: 1.0, winsorize_percentile: 0.05 },
      low_vol: { enabled: false, weight: 1.0, lookback: 252, winsorize_percentile: 0.05 },
      size: { enabled: false, weight: 1.0, winsorize_percentile: 0.05 },
      esg: { enabled: false, weight: 1.0, winsorize_percentile: 0.05 }
    },
    pipeline: {
      zscore: true,
      sector_neutralize: true,
      size_neutralize: true,
      decay: 0.0
    },
    combination: {
      method: 'weighted_sum',
      weights: {}
    }
  })

  const [isComputing, setIsComputing] = useState(false)
  const [results, setResults] = useState<any>(null)

  const updateFactor = (factorId: string, updates: Partial<FactorConfig>) => {
    setRecipe(prev => ({
      ...prev,
      factors: {
        ...prev.factors,
        [factorId]: { ...prev.factors[factorId], ...updates }
      }
    }))
  }

  const updatePipeline = (updates: Partial<PipelineConfig>) => {
    setRecipe(prev => ({
      ...prev,
      pipeline: { ...prev.pipeline, ...updates }
    }))
  }

  const updateCombination = (updates: Partial<CombinationConfig>) => {
    setRecipe(prev => ({
      ...prev,
      combination: { ...prev.combination, ...updates }
    }))
  }

  const computeSignals = async () => {
    setIsComputing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock results
      setResults({
        status: 'success',
        signals: {
          momentum: { mean: 0.1, std: 1.2, ic: 0.08 },
          value: { mean: -0.2, std: 0.9, ic: 0.12 },
          quality: { mean: 0.05, std: 1.1, ic: 0.06 }
        },
        combined_signal: { mean: 0.02, std: 1.0, ic: 0.15 },
        diagnostics: {
          mean: 0.02,
          std: 1.0,
          skewness: 0.1,
          kurtosis: 3.2,
          ic: 0.15,
          turnover: 0.25,
          concentration: 0.08
        }
      })
    } catch (error) {
      console.error('Error computing signals:', error)
    } finally {
      setIsComputing(false)
    }
  }

  const enabledFactors = Object.entries(recipe.factors).filter(([_, config]) => config.enabled)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Signal Recipe Editor</CardTitle>
          <CardDescription>
            Configure factor signals, processing pipeline, and combination methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipe-name">Recipe Name</Label>
              <Input
                id="recipe-name"
                value={recipe.name}
                onChange={(e) => setRecipe(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter recipe name"
              />
            </div>
            <div>
              <Label htmlFor="recipe-description">Description</Label>
              <Textarea
                id="recipe-description"
                value={recipe.description}
                onChange={(e) => setRecipe(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your signal recipe"
                rows={3}
              />
            </div>
          </div>

          <Tabs defaultValue="factors" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="factors">Factors</TabsTrigger>
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
              <TabsTrigger value="combination">Combination</TabsTrigger>
            </TabsList>

            <TabsContent value="factors" className="space-y-4">
              <div className="grid gap-4">
                {AVAILABLE_FACTORS.map(factor => (
                  <Card key={factor.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Switch
                            checked={recipe.factors[factor.id].enabled}
                            onCheckedChange={(checked) => updateFactor(factor.id, { enabled: checked })}
                          />
                          <div>
                            <h4 className="font-medium">{factor.name}</h4>
                            <p className="text-sm text-muted-foreground">{factor.description}</p>
                          </div>
                        </div>
                        {recipe.factors[factor.id].enabled && (
                          <div className="flex items-center space-x-2">
                            <Label htmlFor={`weight-${factor.id}`}>Weight:</Label>
                            <Input
                              id={`weight-${factor.id}`}
                              type="number"
                              step="0.1"
                              value={recipe.factors[factor.id].weight}
                              onChange={(e) => updateFactor(factor.id, { weight: parseFloat(e.target.value) })}
                              className="w-20"
                            />
                          </div>
                        )}
                      </div>

                      {recipe.factors[factor.id].enabled && (
                        <div className="mt-4 space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`winsorize-${factor.id}`}>Winsorize Percentile</Label>
                              <Input
                                id={`winsorize-${factor.id}`}
                                type="number"
                                step="0.01"
                                min="0"
                                max="0.5"
                                value={recipe.factors[factor.id].winsorize_percentile}
                                onChange={(e) => updateFactor(factor.id, { winsorize_percentile: parseFloat(e.target.value) })}
                              />
                            </div>
                            {(factor.id === 'momentum' || factor.id === 'low_vol') && (
                              <div>
                                <Label htmlFor={`lookback-${factor.id}`}>Lookback (days)</Label>
                                <Input
                                  id={`lookback-${factor.id}`}
                                  type="number"
                                  value={recipe.factors[factor.id].lookback}
                                  onChange={(e) => updateFactor(factor.id, { lookback: parseInt(e.target.value) })}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pipeline" className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Z-Score Normalization</Label>
                      <p className="text-sm text-muted-foreground">Standardize signals to mean=0, std=1</p>
                    </div>
                    <Switch
                      checked={recipe.pipeline.zscore}
                      onCheckedChange={(checked) => updatePipeline({ zscore: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sector Neutralization</Label>
                      <p className="text-sm text-muted-foreground">Remove sector-specific effects</p>
                    </div>
                    <Switch
                      checked={recipe.pipeline.sector_neutralize}
                      onCheckedChange={(checked) => updatePipeline({ sector_neutralize: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Size Neutralization</Label>
                      <p className="text-sm text-muted-foreground">Remove size-specific effects</p>
                    </div>
                    <Switch
                      checked={recipe.pipeline.size_neutralize}
                      onCheckedChange={(checked) => updatePipeline({ size_neutralize: checked })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="decay">Signal Decay Factor</Label>
                    <Input
                      id="decay"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={recipe.pipeline.decay}
                      onChange={(e) => updatePipeline({ decay: parseFloat(e.target.value) })}
                    />
                    <p className="text-sm text-muted-foreground">Apply exponential decay to signals (0 = no decay)</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="combination" className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label htmlFor="combination-method">Combination Method</Label>
                    <Select
                      value={recipe.combination.method}
                      onValueChange={(value: 'weighted_sum' | 'pca') => updateCombination({ method: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weighted_sum">Weighted Sum</SelectItem>
                        <SelectItem value="pca">PCA (Principal Component Analysis)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {recipe.combination.method === 'weighted_sum' && (
                    <div className="space-y-3">
                      <Label>Factor Weights</Label>
                      {enabledFactors.map(([factorId, config]) => (
                        <div key={factorId} className="flex items-center space-x-3">
                          <Label htmlFor={`combo-weight-${factorId}`} className="w-20">
                            {AVAILABLE_FACTORS.find(f => f.id === factorId)?.name}:
                          </Label>
                          <Input
                            id={`combo-weight-${factorId}`}
                            type="number"
                            step="0.1"
                            value={recipe.combination.weights[factorId] || config.weight}
                            onChange={(e) => updateCombination({
                              weights: {
                                ...recipe.combination.weights,
                                [factorId]: parseFloat(e.target.value)
                              }
                            })}
                            className="w-24"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {enabledFactors.length} factors enabled
              </Badge>
              <Badge variant="outline">
                {recipe.pipeline.zscore ? 'Z-Score' : 'Raw'} + 
                {recipe.pipeline.sector_neutralize ? ' Sector-Neutral' : ''} + 
                {recipe.pipeline.size_neutralize ? ' Size-Neutral' : ''}
              </Badge>
            </div>
            <Button onClick={computeSignals} disabled={isComputing || enabledFactors.length === 0}>
              {isComputing ? 'Computing...' : 'Compute Signals'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Signal Results</CardTitle>
            <CardDescription>Computed signal diagnostics and performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{results.diagnostics.mean.toFixed(3)}</div>
                <div className="text-sm text-muted-foreground">Mean</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{results.diagnostics.std.toFixed(3)}</div>
                <div className="text-sm text-muted-foreground">Std Dev</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{results.diagnostics.ic.toFixed(3)}</div>
                <div className="text-sm text-muted-foreground">IC</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{results.diagnostics.turnover.toFixed(3)}</div>
                <div className="text-sm text-muted-foreground">Turnover</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
