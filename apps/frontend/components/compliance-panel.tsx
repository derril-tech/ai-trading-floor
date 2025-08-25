'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertTriangle, XCircle, Clock, MessageSquare } from 'lucide-react'

// Created automatically by Cursor AI (2024-01-XX)

interface ComplianceViolation {
  id: string
  symbol?: string
  rule: string
  current: number | string
  limit: number | string
  message: string
  check_type: string
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
}

interface ComplianceWarning {
  id: string
  symbol?: string
  rule: string
  current: number | string
  limit: number | string
  message: string
  check_type: string
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
}

interface ComplianceReport {
  overall_status: 'OK' | 'REVIEW' | 'BLOCK'
  summary: {
    total_checks: number
    passed_checks: number
    warning_checks: number
    failed_checks: number
  }
  violations: ComplianceViolation[]
  warnings: ComplianceWarning[]
  recommendations: string[]
}

interface ExceptionRequest {
  id: string
  violation_id: string
  justification: string
  user_id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  timestamp: string
  reviewed_by?: string
  reviewed_at?: string
  approved?: boolean
}

interface ComplianceData {
  report: ComplianceReport
  exception_requests: ExceptionRequest[]
  rulesets: Array<{
    id: string
    name: string
    description: string
  }>
}

export function CompliancePanel() {
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRuleset, setSelectedRuleset] = useState<string>('long_only_fund')
  const [selectedViolation, setSelectedViolation] = useState<ComplianceViolation | null>(null)
  const [exceptionJustification, setExceptionJustification] = useState('')
  const [showExceptionForm, setShowExceptionForm] = useState(false)

  const runComplianceChecks = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock compliance data
    const mockData: ComplianceData = {
      report: {
        overall_status: 'REVIEW',
        summary: {
          total_checks: 10,
          passed_checks: 7,
          warning_checks: 2,
          failed_checks: 1
        },
        violations: [
          {
            id: 'violation_1',
            symbol: 'ASSET_001',
            rule: 'max_single_position',
            current: 0.065,
            limit: 0.05,
            message: 'Position ASSET_001 exceeds maximum size limit',
            check_type: 'position_limits',
            severity: 'HIGH'
          }
        ],
        warnings: [
          {
            id: 'warning_1',
            symbol: 'ASSET_015',
            rule: 'min_adv_ratio',
            current: 0.008,
            limit: 0.01,
            message: 'Security ASSET_015 has low liquidity (ADV ratio: 0.008)',
            check_type: 'liquidity_requirements',
            severity: 'MEDIUM'
          },
          {
            id: 'warning_2',
            symbol: 'ASSET_023',
            rule: 'min_esg_score',
            current: 45,
            limit: 50,
            message: 'Security ASSET_023 has low ESG score (45.0)',
            check_type: 'esg_requirements',
            severity: 'LOW'
          }
        ],
        recommendations: [
          'Address all violations before proceeding with trade',
          'Review warnings and consider adjustments'
        ]
      },
      exception_requests: [
        {
          id: 'exc_20240101_120000',
          violation_id: 'violation_1',
          justification: 'Strategic position for sector rotation strategy',
          user_id: 'user_123',
          status: 'PENDING',
          timestamp: '2024-01-01T12:00:00Z'
        }
      ],
      rulesets: [
        {
          id: 'long_only_fund',
          name: 'Long-Only Fund',
          description: 'Standard long-only fund compliance rules'
        },
        {
          id: 'long_short_fund',
          name: 'Long-Short Fund',
          description: 'Long-short fund with leverage'
        }
      ]
    }
    
    setComplianceData(mockData)
    setIsLoading(false)
  }

  useEffect(() => {
    runComplianceChecks()
  }, [])

  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`
  const formatNumber = (value: number) => value.toFixed(3)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'REVIEW':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'BLOCK':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OK':
        return <Badge variant="default" className="bg-green-100 text-green-800">OK</Badge>
      case 'REVIEW':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">REVIEW</Badge>
      case 'BLOCK':
        return <Badge variant="destructive">BLOCK</Badge>
      default:
        return <Badge variant="outline">UNKNOWN</Badge>
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return <Badge variant="destructive">High</Badge>
      case 'MEDIUM':
        return <Badge variant="secondary">Medium</Badge>
      case 'LOW':
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK':
        return 'text-green-600'
      case 'REVIEW':
        return 'text-yellow-600'
      case 'BLOCK':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const requestException = async () => {
    if (!selectedViolation || !exceptionJustification.trim()) return
    
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newException: ExceptionRequest = {
      id: `exc_${Date.now()}`,
      violation_id: selectedViolation.id,
      justification: exceptionJustification,
      user_id: 'current_user',
      status: 'PENDING',
      timestamp: new Date().toISOString()
    }
    
    setComplianceData(prev => prev ? {
      ...prev,
      exception_requests: [...prev.exception_requests, newException]
    } : null)
    
    setExceptionJustification('')
    setSelectedViolation(null)
    setShowExceptionForm(false)
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compliance Panel</CardTitle>
          <CardDescription>Running compliance checks...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!complianceData) return null

  const { report, exception_requests, rulesets } = complianceData

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Compliance Panel</CardTitle>
              <CardDescription>Pre-trade checks and regulatory compliance</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedRuleset} onValueChange={setSelectedRuleset}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rulesets.map(ruleset => (
                    <SelectItem key={ruleset.id} value={ruleset.id}>
                      {ruleset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm"
                onClick={runComplianceChecks}
                disabled={isLoading}
              >
                Run Checks
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="violations">Violations</TabsTrigger>
              <TabsTrigger value="warnings">Warnings</TabsTrigger>
              <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    {getStatusIcon(report.overall_status)}
                    <div>
                      <h3 className="text-lg font-semibold">Overall Status</h3>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(report.overall_status)}
                        <span className={`text-sm font-medium ${getStatusColor(report.overall_status)}`}>
                          {report.overall_status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Checks</span>
                      <span className="font-mono">{report.summary.total_checks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Passed</span>
                      <span className="font-mono text-green-600">{report.summary.passed_checks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Warnings</span>
                      <span className="font-mono text-yellow-600">{report.summary.warning_checks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed</span>
                      <span className="font-mono text-red-600">{report.summary.failed_checks}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                  <div className="space-y-2">
                    {report.recommendations.map((rec, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{rec}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="violations" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Compliance Violations</h3>
                <Badge variant="destructive">{report.violations.length} violations</Badge>
              </div>
              
              {report.violations.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No violations found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Rule</TableHead>
                      <TableHead>Current</TableHead>
                      <TableHead>Limit</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.violations.map((violation) => (
                      <TableRow key={violation.id}>
                        <TableCell className="font-medium">
                          {violation.symbol || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{violation.rule}</div>
                            <div className="text-sm text-muted-foreground">{violation.check_type}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          {typeof violation.current === 'number' ? formatPercentage(violation.current) : violation.current}
                        </TableCell>
                        <TableCell className="font-mono">
                          {typeof violation.limit === 'number' ? formatPercentage(violation.limit) : violation.limit}
                        </TableCell>
                        <TableCell>
                          {getSeverityBadge(violation.severity)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedViolation(violation)
                              setShowExceptionForm(true)
                            }}
                          >
                            Request Exception
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="warnings" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Compliance Warnings</h3>
                <Badge variant="secondary">{report.warnings.length} warnings</Badge>
              </div>
              
              {report.warnings.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No warnings found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Rule</TableHead>
                      <TableHead>Current</TableHead>
                      <TableHead>Limit</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.warnings.map((warning) => (
                      <TableRow key={warning.id}>
                        <TableCell className="font-medium">
                          {warning.symbol || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{warning.rule}</div>
                            <div className="text-sm text-muted-foreground">{warning.check_type}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          {typeof warning.current === 'number' ? formatNumber(warning.current) : warning.current}
                        </TableCell>
                        <TableCell className="font-mono">
                          {typeof warning.limit === 'number' ? formatNumber(warning.limit) : warning.limit}
                        </TableCell>
                        <TableCell>
                          {getSeverityBadge(warning.severity)}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {warning.message}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="exceptions" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Exception Requests</h3>
                <Badge variant="outline">{exception_requests.length} requests</Badge>
              </div>
              
              {exception_requests.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No exception requests
                </div>
              ) : (
                <div className="space-y-4">
                  {exception_requests.map((request) => (
                    <Card key={request.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={request.status === 'APPROVED' ? 'default' : request.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                              {request.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(request.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium">Violation: {request.violation_id}</div>
                            <div className="text-sm text-muted-foreground">{request.justification}</div>
                          </div>
                        </div>
                        {request.status === 'PENDING' && (
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">Approve</Button>
                            <Button size="sm" variant="outline">Reject</Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Exception Request Modal */}
      {showExceptionForm && selectedViolation && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Request Exception</CardTitle>
              <CardDescription>
                Justify why this violation should be allowed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Violation</Label>
                <div className="text-sm text-muted-foreground mt-1">
                  {selectedViolation.message}
                </div>
              </div>
              <div>
                <Label htmlFor="justification">Justification</Label>
                <Textarea
                  id="justification"
                  value={exceptionJustification}
                  onChange={(e) => setExceptionJustification(e.target.value)}
                  placeholder="Explain why this exception should be granted..."
                  rows={4}
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={requestException}
                  disabled={!exceptionJustification.trim() || isLoading}
                  className="flex-1"
                >
                  Submit Request
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowExceptionForm(false)
                    setSelectedViolation(null)
                    setExceptionJustification('')
                  }}
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
