'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, TrendingUp, Shield, FileText, Settings, Zap } from 'lucide-react'
import { SignalRecipeEditor } from './signal-recipe-editor'
import { ZScoreTable } from './z-score-table'
import { EquityCurve } from './equity-curve'
import { KPIsTable } from './kpis-table'
import { ConstraintsForm } from './constraints-form'
import { WeightsTable } from './weights-table'
import { RiskKPIDials } from './risk-kpi-dials'
import { ExposureHeatmap } from './exposure-heatmap'
import { ScenarioTornado } from './scenario-tornado'
import { CompliancePanel } from './compliance-panel'
import { OrdersTable } from './orders-table'
import { ExportHub } from './export-hub'
import { LiveOrders } from './live-orders'
import { TradeBlotter } from './trade-blotter'
import { MarketDataStream } from './market-data-stream'
import { MLDashboard } from './ml-dashboard'
import { AdvancedTrading } from './advanced-trading'

export function Dashboard() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r">
        <div className="p-6">
          <h1 className="text-xl font-bold">AI Trading Floor</h1>
        </div>
        <nav className="px-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <BarChart3 className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Zap className="mr-2 h-4 w-4" />
            Signals
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <TrendingUp className="mr-2 h-4 w-4" />
            Strategies
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Shield className="mr-2 h-4 w-4" />
            Risk
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <FileText className="mr-2 h-4 w-4" />
            Reports
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Trading Research Dashboard</h2>
          <p className="text-muted-foreground">
            Multi-agent quantitative analysis and strategy development
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
                     <TabsList>
             <TabsTrigger value="overview">Overview</TabsTrigger>
             <TabsTrigger value="signals">Signals</TabsTrigger>
             <TabsTrigger value="strategies">Strategies</TabsTrigger>
             <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
             <TabsTrigger value="compliance">Compliance</TabsTrigger>
             <TabsTrigger value="orders">Orders</TabsTrigger>
             <TabsTrigger value="exports">Exports</TabsTrigger>
             <TabsTrigger value="live-trading">Live Trading</TabsTrigger>
             <TabsTrigger value="ai-ml">AI/ML</TabsTrigger>
             <TabsTrigger value="advanced-trading">Advanced Trading</TabsTrigger>
           </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    +2 from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">+$2.4M</div>
                  <p className="text-xs text-muted-foreground">
                    +12.5% YTD
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7.2</div>
                  <p className="text-xs text-muted-foreground">
                    Moderate risk
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">✓</div>
                  <p className="text-xs text-muted-foreground">
                    All clear
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest strategy updates and risk assessments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Renewable Energy Strategy</p>
                        <p className="text-xs text-muted-foreground">Updated 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Risk Assessment Complete</p>
                        <p className="text-xs text-muted-foreground">Completed 4 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks and shortcuts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      Create New Strategy
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      Run Risk Analysis
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="signals">
            <div className="space-y-6">
              <SignalRecipeEditor />
              <ZScoreTable />
            </div>
          </TabsContent>

          <TabsContent value="strategies">
            <div className="space-y-6">
              <ConstraintsForm />
              <WeightsTable />
              <EquityCurve />
              <KPIsTable />
            </div>
          </TabsContent>

          <TabsContent value="risk">
            <div className="space-y-6">
              <RiskKPIDials />
              <ExposureHeatmap />
              <ScenarioTornado />
            </div>
          </TabsContent>

          <TabsContent value="compliance">
            <CompliancePanel />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersTable />
          </TabsContent>

          <TabsContent value="exports">
            <ExportHub />
          </TabsContent>

          <TabsContent value="live-trading">
            <div className="space-y-6">
              <LiveOrders />
              <TradeBlotter />
              <MarketDataStream />
            </div>
          </TabsContent>

          <TabsContent value="ai-ml">
            <MLDashboard />
          </TabsContent>

          <TabsContent value="advanced-trading">
            <AdvancedTrading />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
