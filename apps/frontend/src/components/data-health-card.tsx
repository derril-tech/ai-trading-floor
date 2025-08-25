'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react'

// Created automatically by Cursor AI (2024-01-XX)

interface DataHealthMetrics {
  totalRows: number
  uniqueSymbols: number
  dateRange: {
    start: string
    end: string
  }
  missingData: Record<string, number>
  completeness: number
  warnings: string[]
  errors: string[]
}

interface DataHealthCardProps {
  metrics: DataHealthMetrics
  title?: string
  showDetails?: boolean
}

export function DataHealthCard({ metrics, title = "Data Health", showDetails = true }: DataHealthCardProps) {
  const getCompletenessColor = (completeness: number) => {
    if (completeness >= 0.95) return 'text-green-600'
    if (completeness >= 0.85) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCompletenessBadge = (completeness: number) => {
    if (completeness >= 0.95) return <Badge variant="default" className="bg-green-100 text-green-800">Excellent</Badge>
    if (completeness >= 0.85) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Good</Badge>
    return <Badge variant="destructive">Poor</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              Data quality and completeness metrics
            </CardDescription>
          </div>
          {getCompletenessBadge(metrics.completeness)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overview Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold">{metrics.totalRows.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Rows</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold">{metrics.uniqueSymbols}</div>
            <div className="text-sm text-gray-600">Unique Symbols</div>
          </div>
        </div>

        {/* Date Range */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-900 mb-1">Date Range</div>
          <div className="text-sm text-blue-700">
            {formatDate(metrics.dateRange.start)} - {formatDate(metrics.dateRange.end)}
          </div>
        </div>

        {/* Completeness */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Data Completeness</span>
            <span className={getCompletenessColor(metrics.completeness)}>
              {(metrics.completeness * 100).toFixed(1)}%
            </span>
          </div>
          <Progress value={metrics.completeness * 100} className="h-2" />
        </div>

        {/* Missing Data Breakdown */}
        {showDetails && Object.keys(metrics.missingData).length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Missing Data by Column</div>
            <div className="space-y-1">
              {Object.entries(metrics.missingData).map(([column, count]) => (
                <div key={column} className="flex justify-between text-sm">
                  <span className="capitalize">{column}</span>
                  <span className="text-red-600">{count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {metrics.warnings.length > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="font-medium mb-1">Warnings ({metrics.warnings.length})</div>
              <ul className="text-sm space-y-1">
                {metrics.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Errors */}
        {metrics.errors.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="font-medium mb-1">Errors ({metrics.errors.length})</div>
              <ul className="text-sm space-y-1">
                {metrics.errors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Health Score */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Overall Health</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-lg font-bold ${getCompletenessColor(metrics.completeness)}`}>
              {Math.round(metrics.completeness * 100)}
            </div>
            <span className="text-sm text-gray-600">/ 100</span>
          </div>
        </div>

        {/* Recommendations */}
        {metrics.completeness < 0.95 && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-900 mb-1">Recommendations</div>
            <ul className="text-sm text-blue-700 space-y-1">
              {metrics.completeness < 0.85 && (
                <li>• Consider data source quality and completeness</li>
              )}
              {Object.values(metrics.missingData).some(count => count > 0) && (
                <li>• Review missing data patterns and implement data validation</li>
              )}
              {metrics.warnings.length > 0 && (
                <li>• Address warnings to improve data quality</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Example usage component
export function DataHealthExample() {
  const exampleMetrics: DataHealthMetrics = {
    totalRows: 125000,
    uniqueSymbols: 500,
    dateRange: {
      start: '2020-01-01',
      end: '2024-01-15'
    },
    missingData: {
      open: 45,
      high: 23,
      low: 67,
      close: 12,
      volume: 89
    },
    completeness: 0.92,
    warnings: [
      'Found 15 outliers in price data',
      '3 symbols have inconsistent date ranges',
      'Volume data missing for 89 records'
    ],
    errors: []
  }

  return <DataHealthCard metrics={exampleMetrics} />
}
