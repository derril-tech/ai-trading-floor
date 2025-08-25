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
import { Brain, TrendingUp, BarChart3, Zap, Target, Settings, Play, Pause, RefreshCw, Download, Upload, Eye } from 'lucide-react'

interface MLModel {
  id: string
  name: string
  type: string
  status: string
  accuracy: number
  precision: number
  recall: number
  f1_score: number
  created_at: string
  last_updated: string
}

interface Strategy {
  id: string
  name: string
  type: string
  description: string
  performance: {
    sharpe_ratio: number
    max_drawdown: number
    total_return: number
    volatility: number
  }
  status: string
  created_at: string
}

interface Feature {
  id: string
  name: string
  type: string
  importance: number
  correlation: number
  description: string
}

interface ModelExplanation {
  model_id: string
  feature_importance: Record<string, number>
  shap_values: number[]
  lime_explanation: Record<string, any>
}

export function MLDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [models, setModels] = useState<MLModel[]>([])
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [features, setFeatures] = useState<Feature[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<MLModel | null>(null)
  const [modelExplanation, setModelExplanation] = useState<ModelExplanation | null>(null)

  useEffect(() => {
    loadMLData()
  }, [])

  const loadMLData = async () => {
    setIsLoading(true)
    try {
      // Simulated API calls
      const mockModels: MLModel[] = [
        {
          id: '1',
          name: 'Momentum Predictor',
          type: 'Random Forest',
          status: 'active',
          accuracy: 0.85,
          precision: 0.82,
          recall: 0.78,
          f1_score: 0.80,
          created_at: '2024-01-15',
          last_updated: '2024-01-20'
        },
        {
          id: '2',
          name: 'Sentiment Analyzer',
          type: 'Neural Network',
          status: 'training',
          accuracy: 0.78,
          precision: 0.75,
          recall: 0.72,
          f1_score: 0.73,
          created_at: '2024-01-18',
          last_updated: '2024-01-20'
        }
      ]

      const mockStrategies: Strategy[] = [
        {
          id: '1',
          name: 'Momentum Strategy - AAPL',
          type: 'momentum',
          description: 'Momentum-based strategy for Apple stock',
          performance: {
            sharpe_ratio: 1.25,
            max_drawdown: 0.08,
            total_return: 0.15,
            volatility: 0.12
          },
          status: 'active',
          created_at: '2024-01-15'
        },
        {
          id: '2',
          name: 'Pairs Trading - MSFT/GOOGL',
          type: 'pairs_trading',
          description: 'Statistical arbitrage between Microsoft and Google',
          performance: {
            sharpe_ratio: 1.45,
            max_drawdown: 0.05,
            total_return: 0.12,
            volatility: 0.08
          },
          status: 'active',
          created_at: '2024-01-16'
        }
      ]

      const mockFeatures: Feature[] = [
        {
          id: '1',
          name: 'price_momentum_20d',
          type: 'technical',
          importance: 0.25,
          correlation: 0.65,
          description: '20-day price momentum indicator'
        },
        {
          id: '2',
          name: 'volume_ratio',
          type: 'technical',
          importance: 0.18,
          correlation: 0.45,
          description: 'Volume ratio compared to average'
        },
        {
          id: '3',
          name: 'sentiment_score',
          type: 'sentiment',
          importance: 0.15,
          correlation: 0.38,
          description: 'News sentiment analysis score'
        }
      ]

      setModels(mockModels)
      setStrategies(mockStrategies)
      setFeatures(mockFeatures)
    } catch (error) {
      console.error('Error loading ML data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const trainNewModel = async () => {
    // Simulated model training
    console.log('Training new model...')
  }

  const discoverStrategies = async () => {
    // Simulated strategy discovery
    console.log('Discovering strategies...')
  }

  const explainModel = async (modelId: string) => {
    // Simulated model explanation
    const explanation: ModelExplanation = {
      model_id: modelId,
      feature_importance: {
        'price_momentum_20d': 0.25,
        'volume_ratio': 0.18,
        'sentiment_score': 0.15,
        'rsi': 0.12,
        'bollinger_position': 0.10
      },
      shap_values: [0.1, 0.2, 0.15, 0.05, 0.1],
      lime_explanation: {
        'feature_weights': {
          'price_momentum_20d': 0.25,
          'volume_ratio': 0.18,
          'sentiment_score': 0.15
        },
        'score': 0.75,
        'local_pred': 0.6
      }
    }
    setModelExplanation(explanation)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'training': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStrategyTypeColor = (type: string) => {
    switch (type) {
      case 'momentum': return 'bg-blue-100 text-blue-800'
      case 'pairs_trading': return 'bg-purple-100 text-purple-800'
      case 'mean_reversion': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI/ML Dashboard</h2>
          <p className="text-muted-foreground">
            Advanced machine learning and artificial intelligence capabilities
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={trainNewModel} className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>Train Model</span>
          </Button>
          <Button onClick={discoverStrategies} variant="outline" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Discover Strategies</span>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{models.filter(m => m.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{strategies.filter(s => s.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              +1 from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Model Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {models.length > 0 ? (models.reduce((acc, m) => acc + m.accuracy, 0) / models.length * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Features</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{features.length}</div>
            <p className="text-xs text-muted-foreground">
              +5 from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="explanations">Model Explanations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Model Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {models.slice(0, 3).map((model) => (
                    <div key={model.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{model.name}</p>
                        <p className="text-sm text-muted-foreground">{model.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{(model.accuracy * 100).toFixed(1)}%</p>
                        <Badge className={getStatusColor(model.status)}>{model.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Strategy Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {strategies.slice(0, 3).map((strategy) => (
                    <div key={strategy.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{strategy.name}</p>
                        <p className="text-sm text-muted-foreground">{strategy.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{strategy.performance.sharpe_ratio.toFixed(2)}</p>
                        <Badge className={getStrategyTypeColor(strategy.type)}>{strategy.type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Machine Learning Models</CardTitle>
              <CardDescription>
                Manage and monitor your ML models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Precision</TableHead>
                    <TableHead>Recall</TableHead>
                    <TableHead>F1 Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {models.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell className="font-medium">{model.name}</TableCell>
                      <TableCell>{model.type}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(model.status)}>{model.status}</Badge>
                      </TableCell>
                      <TableCell>{(model.accuracy * 100).toFixed(1)}%</TableCell>
                      <TableCell>{(model.precision * 100).toFixed(1)}%</TableCell>
                      <TableCell>{(model.recall * 100).toFixed(1)}%</TableCell>
                      <TableCell>{(model.f1_score * 100).toFixed(1)}%</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => explainModel(model.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Discovered Strategies</CardTitle>
              <CardDescription>
                AI-discovered trading strategies and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Strategy</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sharpe Ratio</TableHead>
                    <TableHead>Max Drawdown</TableHead>
                    <TableHead>Total Return</TableHead>
                    <TableHead>Volatility</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {strategies.map((strategy) => (
                    <TableRow key={strategy.id}>
                      <TableCell className="font-medium">{strategy.name}</TableCell>
                      <TableCell>
                        <Badge className={getStrategyTypeColor(strategy.type)}>{strategy.type}</Badge>
                      </TableCell>
                      <TableCell>{strategy.performance.sharpe_ratio.toFixed(2)}</TableCell>
                      <TableCell>{(strategy.performance.max_drawdown * 100).toFixed(1)}%</TableCell>
                      <TableCell>{(strategy.performance.total_return * 100).toFixed(1)}%</TableCell>
                      <TableCell>{(strategy.performance.volatility * 100).toFixed(1)}%</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(strategy.status)}>{strategy.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Engineering</CardTitle>
              <CardDescription>
                Engineered features and their importance scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Importance</TableHead>
                    <TableHead>Correlation</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {features.map((feature) => (
                    <TableRow key={feature.id}>
                      <TableCell className="font-medium">{feature.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{feature.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={feature.importance * 100} className="w-20" />
                          <span className="text-sm">{(feature.importance * 100).toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={feature.correlation > 0 ? 'text-green-600' : 'text-red-600'}>
                          {feature.correlation > 0 ? '+' : ''}{feature.correlation.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{feature.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="explanations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Explanations</CardTitle>
              <CardDescription>
                SHAP and LIME explanations for model predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {modelExplanation ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Feature Importance (SHAP)</h4>
                    <div className="space-y-2">
                      {Object.entries(modelExplanation.feature_importance)
                        .sort(([,a], [,b]) => b - a)
                        .map(([feature, importance]) => (
                          <div key={feature} className="flex items-center justify-between">
                            <span className="text-sm">{feature}</span>
                            <div className="flex items-center space-x-2">
                              <Progress value={importance * 100} className="w-32" />
                              <span className="text-sm">{(importance * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">LIME Local Explanation</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-2">
                        {Object.entries(modelExplanation.lime_explanation.feature_weights).map(([feature, weight]) => (
                          <div key={feature} className="flex items-center justify-between">
                            <span className="text-sm">{feature}</span>
                            <span className={`text-sm font-medium ${weight > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {weight > 0 ? '+' : ''}{weight.toFixed(3)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between text-sm">
                          <span>Local Prediction: {modelExplanation.lime_explanation.local_pred.toFixed(3)}</span>
                          <span>Confidence: {(modelExplanation.lime_explanation.score * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a model to view its explanations</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
