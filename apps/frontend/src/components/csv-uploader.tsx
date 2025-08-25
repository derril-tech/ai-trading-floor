'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react'

// Created automatically by Cursor AI (2024-01-XX)

interface UploadResult {
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

interface CSVUploaderProps {
  onUploadComplete?: (result: UploadResult) => void
  acceptedTypes?: string[]
  maxFileSize?: number // in MB
}

export function CSVUploader({ 
  onUploadComplete, 
  acceptedTypes = ['.csv', '.parquet'],
  maxFileSize = 50 
}: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete' | 'error'>('idle')
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    // Validate file type
    const fileExtension = file.name.toLowerCase().split('.').pop()
    const isValidType = acceptedTypes.some(type => 
      type.startsWith('.') ? fileExtension === type.slice(1) : file.type.includes(type)
    )

    if (!isValidType) {
      setUploadResult({
        status: 'error',
        message: `Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`
      })
      return
    }

    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      setUploadResult({
        status: 'error',
        message: `File too large. Maximum size: ${maxFileSize}MB`
      })
      return
    }

    setSelectedFile(file)
    setUploadStatus('idle')
    setUploadResult(null)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploadStatus('uploading')
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      setUploadStatus('processing')

      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Simulate successful upload
      const result: UploadResult = {
        status: 'success',
        message: `Successfully uploaded ${selectedFile.name}`,
        details: {
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          rowsProcessed: 1250,
          warnings: ['Found 3 missing values in volume column']
        }
      }

      setUploadResult(result)
      setUploadStatus('complete')
      onUploadComplete?.(result)

    } catch (error) {
      setUploadStatus('error')
      setUploadResult({
        status: 'error',
        message: 'Upload failed. Please try again.'
      })
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    setUploadStatus('idle')
    setUploadResult(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Data File</CardTitle>
        <CardDescription>
          Upload CSV or Parquet files for data ingestion
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-2">
            Drag and drop your file here, or click to browse
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Supported formats: {acceptedTypes.join(', ')} (max {maxFileSize}MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
          >
            Choose File
          </Button>
        </div>

        {/* Selected File */}
        {selectedFile && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Upload Progress */}
        {uploadStatus === 'uploading' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {uploadStatus === 'processing' && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            Processing file...
          </div>
        )}

        {/* Upload Result */}
        {uploadResult && (
          <Alert className={uploadResult.status === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-center gap-2">
              {uploadResult.status === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={uploadResult.status === 'success' ? 'text-green-800' : 'text-red-800'}>
                {uploadResult.message}
              </AlertDescription>
            </div>
            {uploadResult.details && (
              <div className="mt-2 text-xs">
                {uploadResult.details.warnings?.map((warning: string, index: number) => (
                  <div key={index} className="text-yellow-600">⚠️ {warning}</div>
                ))}
              </div>
            )}
          </Alert>
        )}

        {/* Upload Button */}
        {selectedFile && uploadStatus === 'idle' && (
          <Button 
            onClick={handleUpload}
            className="w-full"
          >
            Upload File
          </Button>
        )}

        {/* File Requirements */}
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>CSV Requirements:</strong></p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Required columns: symbol, date, open, high, low, close, volume</li>
            <li>Date format: YYYY-MM-DD</li>
            <li>Numeric values only for prices and volume</li>
            <li>No duplicate symbol-date combinations</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
