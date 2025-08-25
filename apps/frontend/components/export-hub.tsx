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
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, FileText, FileSpreadsheet, FileJson, Archive, Eye, Clock, CheckCircle } from 'lucide-react'

// Created automatically by Cursor AI (2024-01-XX)

interface ExportJob {
  id: string
  type: 'PDF' | 'CSV' | 'JSON' | 'BUNDLE'
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  created_at: string
  completed_at?: string
  file_size?: number
  download_url?: string
  config: any
}

interface ExportData {
  jobs: ExportJob[]
  total_jobs: number
  pending_jobs: number
  completed_jobs: number
  failed_jobs: number
}

export function ExportHub() {
  const [exportData, setExportData] = useState<ExportData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedJob, setSelectedJob] = useState<ExportJob | null>(null)
  const [showCreateExport, setShowCreateExport] = useState(false)
  const [exportConfig, setExportConfig] = useState({
    export_type: 'PDF',
    report_type: 'backtest',
    data_type: 'portfolio',
    include_metadata: true,
    filters: {},
    sort_by: '',
    bundle_config: {
      include_pdfs: true,
      include_csvs: true,
      include_jsons: false,
      pdf_reports: ['backtest', 'risk'],
      csv_exports: ['portfolio', 'trades'],
      json_exports: ['signals']
    }
  })

  const loadExports = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    // Mock export data
    const mockData: ExportData = {
      jobs: [
        {
          id: 'export_20240101_120000_abc12345',
          type: 'PDF',
          status: 'COMPLETED',
          created_at: '2024-01-01T12:00:00Z',
          completed_at: '2024-01-01T12:02:30Z',
          file_size: 245760,
          download_url: 'https://ai-trading-floor-exports.s3.amazonaws.com/reports/backtest_20240101_120000.pdf?token=abc123&expires=1704123456',
          config: {
            report_type: 'backtest',
            data_params: { strategy_id: 'strategy_001' },
            report_config: { include_charts: true }
          }
        },
        {
          id: 'export_20240101_110000_def67890',
          type: 'BUNDLE',
          status: 'IN_PROGRESS',
          created_at: '2024-01-01T11:00:00Z',
          config: {
            include_pdfs: true,
            include_csvs: true,
            include_jsons: true,
            pdf_reports: ['backtest', 'risk', 'compliance'],
            csv_exports: ['portfolio', 'trades', 'signals'],
            json_exports: ['risk_metrics']
          }
        },
        {
          id: 'export_20240101_100000_ghi11111',
          type: 'CSV',
          status: 'COMPLETED',
          created_at: '2024-01-01T10:00:00Z',
          completed_at: '2024-01-01T10:00:45Z',
          file_size: 15680,
          download_url: 'https://ai-trading-floor-exports.s3.amazonaws.com/exports/portfolio_20240101_100000.csv?token=def456&expires=1704123456',
          config: {
            data_type: 'portfolio',
            export_config: { include_metadata: true }
          }
        }
      ],
      total_jobs: 3,
      pending_jobs: 0,
      completed_jobs: 2,
      failed_jobs: 0
    }
    
    setExportData(mockData)
    setIsLoading(false)
  }

  const createExport = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    const newJob: ExportJob = {
      id: `export_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      type: exportConfig.export_type as 'PDF' | 'CSV' | 'JSON' | 'BUNDLE',
      status: 'PENDING',
      created_at: new Date().toISOString(),
      config: exportConfig
    }
    
    setExportData(prev => prev ? {
      ...prev,
      jobs: [newJob, ...prev.jobs],
      total_jobs: prev.total_jobs + 1,
      pending_jobs: prev.pending_jobs + 1
    } : null)
    
    setShowCreateExport(false)
    setIsLoading(false)
  }

  const downloadFile = async (job: ExportJob) => {
    if (!job.download_url) return
    
    // Simulate download
    const link = document.createElement('a')
    link.href = job.download_url
    link.download = `export_${job.id}.${getFileExtension(job.type)}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getFileExtension = (type: string) => {
    switch (type) {
      case 'PDF': return 'pdf'
      case 'CSV': return 'csv'
      case 'JSON': return 'json'
      case 'BUNDLE': return 'zip'
      default: return 'txt'
    }
  }

  useEffect(() => {
    loadExports()
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

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
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="h-4 w-4" />
      case 'CSV':
        return <FileSpreadsheet className="h-4 w-4" />
      case 'JSON':
        return <FileJson className="h-4 w-4" />
      case 'BUNDLE':
        return <Archive className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Export Hub</CardTitle>
          <CardDescription>Loading exports...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!exportData) return null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Export Hub</CardTitle>
              <CardDescription>Generate PDFs, CSV/JSON exports, and export bundles</CardDescription>
            </div>
            <Button onClick={() => setShowCreateExport(true)}>
              Create Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="exports" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="exports">Exports</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="exports" className="space-y-4">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{exportData.total_jobs}</div>
                    <div className="text-sm text-muted-foreground">Total Exports</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">{exportData.pending_jobs}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{exportData.completed_jobs}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-600">{exportData.failed_jobs}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Export ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>File Size</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exportData.jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-mono text-sm">
                        {job.id.split('_').slice(-1)[0]}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(job.type)}
                          <Badge variant="outline">{job.type}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(job.status)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDateTime(job.created_at)}
                      </TableCell>
                      <TableCell className="font-mono">
                        {job.file_size ? formatFileSize(job.file_size) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedJob(job)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {job.status === 'COMPLETED' && job.download_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadFile(job)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Backtest Report</CardTitle>
                    <CardDescription>Complete strategy performance analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">Includes:</div>
                      <ul className="text-xs space-y-1">
                        <li>• Performance metrics</li>
                        <li>• Equity curve charts</li>
                        <li>• Risk analysis</li>
                        <li>• Trade breakdown</li>
                      </ul>
                      <Button size="sm" className="w-full mt-2">
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Risk Analysis Bundle</CardTitle>
                    <CardDescription>Comprehensive risk assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">Includes:</div>
                      <ul className="text-xs space-y-1">
                        <li>• VaR/ES calculations</li>
                        <li>• Factor exposures</li>
                        <li>• Stress test results</li>
                        <li>• Portfolio metrics</li>
                      </ul>
                      <Button size="sm" className="w-full mt-2">
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Compliance Report</CardTitle>
                    <CardDescription>Regulatory compliance summary</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">Includes:</div>
                      <ul className="text-xs space-y-1">
                        <li>• Compliance checks</li>
                        <li>• Violations summary</li>
                        <li>• Exception requests</li>
                        <li>• Recommendations</li>
                      </ul>
                      <Button size="sm" className="w-full mt-2">
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Portfolio Data Export</CardTitle>
                    <CardDescription>Current portfolio positions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">Includes:</div>
                      <ul className="text-xs space-y-1">
                        <li>• Position weights</li>
                        <li>• Market values</li>
                        <li>• Sector exposures</li>
                        <li>• Risk metrics</li>
                      </ul>
                      <Button size="sm" className="w-full mt-2">
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Trade History</CardTitle>
                    <CardDescription>Complete trade execution log</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">Includes:</div>
                      <ul className="text-xs space-y-1">
                        <li>• Trade details</li>
                        <li>• Execution prices</li>
                        <li>• Commission data</li>
                        <li>• Timestamps</li>
                      </ul>
                      <Button size="sm" className="w-full mt-2">
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Signal Analysis</CardTitle>
                    <CardDescription>Factor signal analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">Includes:</div>
                      <ul className="text-xs space-y-1">
                        <li>• Factor scores</li>
                        <li>• Signal correlations</li>
                        <li>• Z-score analysis</li>
                        <li>• Sector breakdown</li>
                      </ul>
                      <Button size="sm" className="w-full mt-2">
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {selectedJob ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Export Details</h3>
                    <Button variant="outline" onClick={() => setSelectedJob(null)}>
                      Close
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Export Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span>Export ID</span>
                          <span className="font-mono text-sm">{selectedJob.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type</span>
                          <span>{selectedJob.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status</span>
                          <span>{getStatusBadge(selectedJob.status)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Created</span>
                          <span className="text-sm">{formatDateTime(selectedJob.created_at)}</span>
                        </div>
                        {selectedJob.completed_at && (
                          <div className="flex justify-between">
                            <span>Completed</span>
                            <span className="text-sm">{formatDateTime(selectedJob.completed_at)}</span>
                          </div>
                        )}
                        {selectedJob.file_size && (
                          <div className="flex justify-between">
                            <span>File Size</span>
                            <span className="font-mono">{formatFileSize(selectedJob.file_size)}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Configuration</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                          {JSON.stringify(selectedJob.config, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {selectedJob.status === 'COMPLETED' && selectedJob.download_url && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Download</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button onClick={() => downloadFile(selectedJob)} className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Download {selectedJob.type} File
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Select an export to view details
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Export Modal */}
      {showCreateExport && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Export</CardTitle>
              <CardDescription>Configure export parameters and options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="export_type">Export Type</Label>
                <Select value={exportConfig.export_type} onValueChange={(value) => setExportConfig(prev => ({ ...prev, export_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF Report</SelectItem>
                    <SelectItem value="CSV">CSV Data</SelectItem>
                    <SelectItem value="JSON">JSON Data</SelectItem>
                    <SelectItem value="BUNDLE">Export Bundle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {exportConfig.export_type === 'PDF' && (
                <div>
                  <Label htmlFor="report_type">Report Type</Label>
                  <Select value={exportConfig.report_type} onValueChange={(value) => setExportConfig(prev => ({ ...prev, report_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backtest">Backtest Report</SelectItem>
                      <SelectItem value="risk">Risk Analysis</SelectItem>
                      <SelectItem value="compliance">Compliance Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(exportConfig.export_type === 'CSV' || exportConfig.export_type === 'JSON') && (
                <div>
                  <Label htmlFor="data_type">Data Type</Label>
                  <Select value={exportConfig.data_type} onValueChange={(value) => setExportConfig(prev => ({ ...prev, data_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portfolio">Portfolio Data</SelectItem>
                      <SelectItem value="trades">Trade History</SelectItem>
                      <SelectItem value="signals">Signal Analysis</SelectItem>
                      <SelectItem value="risk_metrics">Risk Metrics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {exportConfig.export_type === 'BUNDLE' && (
                <div className="space-y-4">
                  <div>
                    <Label>Bundle Contents</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="include_pdfs" 
                          checked={exportConfig.bundle_config.include_pdfs}
                          onCheckedChange={(checked) => setExportConfig(prev => ({
                            ...prev,
                            bundle_config: { ...prev.bundle_config, include_pdfs: checked as boolean }
                          }))}
                        />
                        <Label htmlFor="include_pdfs">Include PDF Reports</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="include_csvs" 
                          checked={exportConfig.bundle_config.include_csvs}
                          onCheckedChange={(checked) => setExportConfig(prev => ({
                            ...prev,
                            bundle_config: { ...prev.bundle_config, include_csvs: checked as boolean }
                          }))}
                        />
                        <Label htmlFor="include_csvs">Include CSV Data</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="include_jsons" 
                          checked={exportConfig.bundle_config.include_jsons}
                          onCheckedChange={(checked) => setExportConfig(prev => ({
                            ...prev,
                            bundle_config: { ...prev.bundle_config, include_jsons: checked as boolean }
                          }))}
                        />
                        <Label htmlFor="include_jsons">Include JSON Data</Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include_metadata" 
                  checked={exportConfig.include_metadata}
                  onCheckedChange={(checked) => setExportConfig(prev => ({ ...prev, include_metadata: checked as boolean }))}
                />
                <Label htmlFor="include_metadata">Include metadata</Label>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={createExport}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Create Export
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateExport(false)}
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
