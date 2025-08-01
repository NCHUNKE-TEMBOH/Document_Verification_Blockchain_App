'use client'

import { useState } from 'react'
import { useWeb3 } from '@/contexts/Web3Context'
import { hashFile, isValidHash } from '@/utils/crypto'
import { Search, Upload, CheckCircle, XCircle, AlertTriangle, FileText, Calendar, User, Building } from 'lucide-react'

interface VerificationResult {
  isValid: boolean
  metadata?: {
    title: string
    description: string
    issuer: string
    category: string
    fileName: string
    fileSize: number
    fileType: string
    uploadedBy: string
    uploadedAt: string
    transactionHash: string
  }
  error?: string
}

export function DocumentVerification() {
  const { contract } = useWeb3()
  const [verificationMethod, setVerificationMethod] = useState<'hash' | 'file'>('hash')
  const [hashInput, setHashInput] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)

  // Mock verification data for demo
  const mockDocuments = [
    {
      hash: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
      metadata: {
        title: 'Bachelor of Science Degree',
        description: 'Computer Science degree from University of Technology',
        issuer: 'University of Technology',
        category: 'academic',
        fileName: 'degree_certificate.pdf',
        fileSize: 2048576,
        fileType: 'application/pdf',
        uploadedBy: '0x1234567890123456789012345678901234567890',
        uploadedAt: '2024-01-15T10:30:00Z',
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      }
    },
    {
      hash: 'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1',
      metadata: {
        title: 'Professional Certification',
        description: 'Certified Blockchain Developer',
        issuer: 'Blockchain Institute',
        category: 'business',
        fileName: 'blockchain_cert.pdf',
        fileSize: 1536000,
        fileType: 'application/pdf',
        uploadedBy: '0x2345678901234567890123456789012345678901',
        uploadedAt: '2024-02-20T14:45:00Z',
        transactionHash: '0xbcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890a'
      }
    }
  ]

  const verifyByHash = async () => {
    if (!hashInput.trim()) {
      setResult({ isValid: false, error: 'Please enter a document hash' })
      return
    }

    if (!isValidHash(hashInput.trim())) {
      setResult({ isValid: false, error: 'Invalid hash format. Please enter a valid SHA-256 hash.' })
      return
    }

    setIsVerifying(true)
    setResult(null)

    try {
      // Simulate blockchain lookup
      await new Promise(resolve => setTimeout(resolve, 1500))

      const document = mockDocuments.find(doc => doc.hash === hashInput.trim().toLowerCase())
      
      if (document) {
        setResult({
          isValid: true,
          metadata: document.metadata
        })
      } else {
        setResult({
          isValid: false,
          error: 'Document not found in blockchain. This document may not be registered or the hash is incorrect.'
        })
      }
    } catch (error) {
      setResult({
        isValid: false,
        error: 'Failed to verify document. Please try again.'
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const verifyByFile = async () => {
    if (!selectedFile) {
      setResult({ isValid: false, error: 'Please select a file to verify' })
      return
    }

    setIsVerifying(true)
    setResult(null)

    try {
      const fileHash = await hashFile(selectedFile)
      
      // Simulate blockchain lookup
      await new Promise(resolve => setTimeout(resolve, 1500))

      const document = mockDocuments.find(doc => doc.hash === fileHash)
      
      if (document) {
        setResult({
          isValid: true,
          metadata: document.metadata
        })
      } else {
        setResult({
          isValid: false,
          error: 'Document not found in blockchain. This file may not be registered or has been modified.'
        })
      }
    } catch (error) {
      setResult({
        isValid: false,
        error: 'Failed to process file. Please try again.'
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setResult(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Verify Document Authenticity</h2>
        
        {/* Verification Method Selector */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setVerificationMethod('hash')
                setResult(null)
                setSelectedFile(null)
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                verificationMethod === 'hash'
                  ? 'bg-primary-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Verify by Hash
            </button>
            <button
              onClick={() => {
                setVerificationMethod('file')
                setResult(null)
                setHashInput('')
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                verificationMethod === 'file'
                  ? 'bg-primary-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Verify by File Upload
            </button>
          </div>
        </div>

        {/* Hash Input Method */}
        {verificationMethod === 'hash' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Hash (SHA-256)
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  placeholder="Enter the 64-character SHA-256 hash"
                  className="input-field flex-1 font-mono text-sm"
                />
                <button
                  onClick={verifyByHash}
                  disabled={isVerifying}
                  className="btn-primary flex items-center space-x-2"
                >
                  {isVerifying ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span>Verify</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Example: a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
              </p>
            </div>
          </div>
        )}

        {/* File Upload Method */}
        {verificationMethod === 'file' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Document File
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                <button
                  onClick={verifyByFile}
                  disabled={isVerifying || !selectedFile}
                  className="btn-primary flex items-center space-x-2"
                >
                  {isVerifying ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span>Verify</span>
                </button>
              </div>
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Verification Result */}
      {result && (
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            {result.isValid ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <XCircle className="h-8 w-8 text-red-500" />
            )}
            <h3 className="text-xl font-semibold">
              {result.isValid ? 'Document Verified' : 'Verification Failed'}
            </h3>
          </div>

          {result.isValid && result.metadata ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">
                  ✓ This document is authentic and registered on the blockchain
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Document Title</p>
                      <p className="font-medium">{result.metadata.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Issuing Organization</p>
                      <p className="font-medium">{result.metadata.issuer}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Upload Date</p>
                      <p className="font-medium">{formatDate(result.metadata.uploadedAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium capitalize">{result.metadata.category}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">File Information</p>
                    <p className="font-medium">
                      {result.metadata.fileName} ({formatFileSize(result.metadata.fileSize)})
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Uploaded By</p>
                    <p className="font-mono text-sm">
                      {result.metadata.uploadedBy.slice(0, 6)}...{result.metadata.uploadedBy.slice(-4)}
                    </p>
                  </div>
                </div>
              </div>

              {result.metadata.description && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-gray-700">{result.metadata.description}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Transaction Hash</p>
                <p className="font-mono text-sm text-gray-700 break-all">
                  {result.metadata.transactionHash}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <p className="text-red-800 font-medium">Verification Failed</p>
              </div>
              <p className="text-red-700 mt-2">{result.error}</p>
            </div>
          )}
        </div>
      )}

      {/* Demo Hashes */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Demo Document Hashes</h3>
        <p className="text-gray-600 mb-4">
          Try verifying these sample document hashes to see the system in action:
        </p>
        <div className="space-y-2">
          {mockDocuments.map((doc, index) => (
            <div key={index} className="bg-gray-50 rounded p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{doc.metadata.title}</p>
                  <p className="text-xs text-gray-500">by {doc.metadata.issuer}</p>
                </div>
                <button
                  onClick={() => {
                    setHashInput(doc.hash)
                    setVerificationMethod('hash')
                  }}
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  Use Hash
                </button>
              </div>
              <p className="font-mono text-xs text-gray-600 mt-2 break-all">{doc.hash}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
