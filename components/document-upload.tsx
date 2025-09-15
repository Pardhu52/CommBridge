"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, CheckCircle, AlertTriangle, X } from "lucide-react"

interface DocumentUploadProps {
  onUploadComplete?: (documents: any[]) => void
}

export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFiles = async (files: FileList) => {
    setUploading(true)

    // Simulate file upload and AI processing
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const newDoc = {
        id: Date.now() + i,
        name: file.name,
        type: detectDocumentType(file.name),
        size: file.size,
        status: "processing",
        confidence: 0,
        issues: [],
      }

      setUploadedDocs((prev) => [...prev, newDoc])

      // Simulate AI processing
      setTimeout(
        () => {
          const confidence = Math.floor(Math.random() * 40) + 60 // 60-100%
          const issues = confidence < 80 ? ["Low image quality", "Partial text visible"] : []

          setUploadedDocs((prev) =>
            prev.map((doc) =>
              doc.id === newDoc.id
                ? {
                    ...doc,
                    status: confidence >= 70 ? "verified" : "flagged",
                    confidence,
                    issues,
                  }
                : doc,
            ),
          )
        },
        2000 + i * 1000,
      )
    }

    setUploading(false)
  }

  const detectDocumentType = (filename: string): string => {
    const lower = filename.toLowerCase()
    if (lower.includes("electric") || lower.includes("power") || lower.includes("utility")) {
      return "Electricity Bill"
    }
    if (lower.includes("gas")) {
      return "Gas Bill"
    }
    if (lower.includes("lease") || lower.includes("rent")) {
      return "Lease Agreement"
    }
    if (lower.includes("id") || lower.includes("license")) {
      return "ID Document"
    }
    return "Other Document"
  }

  const removeDocument = (id: number) => {
    setUploadedDocs((prev) => prev.filter((doc) => doc.id !== id))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "flagged":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "processing":
        return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Verification</CardTitle>
          <CardDescription>
            Upload documents to verify your residence. Accepted: utility bills, lease agreements, official IDs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Upload Documents</h3>
            <p className="text-muted-foreground mb-4">Drag and drop files here, or click to browse</p>
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                Choose Files
              </label>
            </Button>
          </div>

          {uploadedDocs.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="font-medium">Uploaded Documents</h4>
              {uploadedDocs.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  {getStatusIcon(doc.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{doc.name}</p>
                      <Button variant="ghost" size="sm" onClick={() => removeDocument(doc.id)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" size="sm">
                        {doc.type}
                      </Badge>
                      {doc.status === "processing" ? (
                        <div className="flex items-center gap-2">
                          <Progress value={50} className="w-20 h-2" />
                          <span className="text-xs text-muted-foreground">Processing...</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">{doc.confidence}% confidence</span>
                      )}
                    </div>
                    {doc.issues.length > 0 && (
                      <div className="mt-1">
                        {doc.issues.map((issue: string, index: number) => (
                          <p key={index} className="text-xs text-red-600">
                            • {issue}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {uploadedDocs.some((doc) => doc.status === "flagged") && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Some documents need review. You can still proceed, but peer approval may be required.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
