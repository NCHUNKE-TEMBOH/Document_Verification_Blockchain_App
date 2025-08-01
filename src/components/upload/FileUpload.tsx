'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useWeb3 } from '@/contexts/Web3Context'
import { hashFile } from '@/utils/crypto'
import { Upload, File, Hash, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import CryptoJS from 'crypto-js'

interface UploadedFile {
  file: File
  hash: string
  status: 'pending' | 'hashing' | 'uploading' | 'success' | 'error'
  transactionHash?: string
  error?: string
}

export function FileUpload() {
  const { contract, account, userRole } = useWeb3()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    issuer: '',
    category: 'academic',
  })

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      hash: '',
      status: 'pending' as const,
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    // Hash files
    for (let i = 0; i < newFiles.length; i++) {
      const fileIndex = uploadedFiles.length + i
      
      setUploadedFiles(prev => 
        prev.map((f, idx) => 
          idx === fileIndex ? { ...f, status: 'hashing' } : f
        )
      )

      try {
        const hash = await hashFile(newFiles[i].file)
        
        setUploadedFiles(prev => 
          prev.map((f, idx) => 
            idx === fileIndex ? { ...f, hash, status: 'pending' } : f
          )
        )
      } catch (error) {
        setUploadedFiles(prev => 
          prev.map((f, idx) => 
            idx === fileIndex ? { 
              ...f, 
              status: 'error', 
              error: 'Failed to hash file' 
            } : f
          )
        )
      }
    }
  }, [uploadedFiles.length])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const uploadToBlockchain = async (fileIndex: number) => {
    const file = uploadedFiles[fileIndex]
    if (!file.hash || !contract) return

    setUploadedFiles(prev => 
      prev.map((f, idx) => 
        idx === fileIndex ? { ...f, status: 'uploading' } : f
      )
    )

    try {
      // Create metadata string
      const metadataString = JSON.stringify({
        ...metadata,
        fileName: file.file.name,
        fileSize: file.file.size,
        fileType: file.file.type,
        uploadedBy: account,
        uploadedAt: new Date().toISOString(),
      })

      // For demo purposes, we'll simulate the blockchain transaction
      // In a real implementation, you would call the smart contract
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockTxHash = `0x${CryptoJS.SHA256(file.hash + Date.now()).toString().slice(0, 64)}`

      setUploadedFiles(prev => 
        prev.map((f, idx) => 
          idx === fileIndex ? { 
            ...f, 
            status: 'success',
            transactionHash: mockTxHash
          } : f
        )
      )

      // Reset metadata form
      setMetadata({
        title: '',
        description: '',
        issuer: '',
        category: 'academic',
      })

    } catch (error) {
      setUploadedFiles(prev => 
        prev.map((f, idx) => 
          idx === fileIndex ? { 
            ...f, 
            status: 'error',
            error: 'Failed to upload to blockchain'
          } : f
        )
      )
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, idx) => idx !== index))
  }

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'hashing':
      case 'uploading':
        return <Loader className="h-5 w-5 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <File className="h-5 w-5 text-gray-500" />
    }
  }

  const canUpload = userRole === 'issuer' || userRole === 'user'

  if (!canUpload) {
    return (
      <div className="card text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
        <p className="text-gray-600">
          Only document issuers and users can upload documents. 
          Please switch your role to access this feature.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Documents</h2>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-lg text-primary-600">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-lg text-gray-600 mb-2">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Supports PDF, DOC, DOCX, PNG, JPG (max 10MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Metadata Form */}
      {uploadedFiles.some(f => f.status === 'pending' && f.hash) && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Document Metadata</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Title
              </label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                className="input-field"
                placeholder="Enter document title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={metadata.category}
                onChange={(e) => setMetadata(prev => ({ ...prev, category: e.target.value }))}
                className="input-field"
              >
                <option value="academic">Academic Certificate</option>
                <option value="legal">Legal Document</option>
                <option value="business">Business Certificate</option>
                <option value="identity">Identity Document</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issuer Organization
              </label>
              <input
                type="text"
                value={metadata.issuer}
                onChange={(e) => setMetadata(prev => ({ ...prev, issuer: e.target.value }))}
                className="input-field"
                placeholder="Enter issuing organization"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={metadata.description}
                onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                className="input-field"
                rows={3}
                placeholder="Enter document description"
              />
            </div>
          </div>
        </div>
      )}

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Uploaded Files</h3>
          <div className="space-y-4">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(file.status)}
                    <div>
                      <p className="font-medium text-gray-900">{file.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {file.status === 'pending' && file.hash && (
                      <button
                        onClick={() => uploadToBlockchain(index)}
                        className="btn-primary text-sm"
                        disabled={!metadata.title || !metadata.issuer}
                      >
                        Upload to Blockchain
                      </button>
                    )}
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                
                {file.hash && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2 mb-2">
                      <Hash className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Document Hash:</span>
                    </div>
                    <p className="text-xs font-mono text-gray-600 break-all">{file.hash}</p>
                  </div>
                )}
                
                {file.transactionHash && (
                  <div className="mt-3 p-3 bg-green-50 rounded">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-700">Transaction Hash:</span>
                    </div>
                    <p className="text-xs font-mono text-green-600 break-all">{file.transactionHash}</p>
                  </div>
                )}
                
                {file.error && (
                  <div className="mt-3 p-3 bg-red-50 rounded">
                    <p className="text-sm text-red-600">{file.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
