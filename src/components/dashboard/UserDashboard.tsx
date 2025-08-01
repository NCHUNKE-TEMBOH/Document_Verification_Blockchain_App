'use client'

import { useState } from 'react'
import { FileText, Share2, Download, QrCode, Eye, Calendar, Building } from 'lucide-react'
import { CertificateViewer } from '../certificate/CertificateViewer'

interface UserDocument {
  id: string
  title: string
  issuer: string
  category: string
  issuedAt: string
  hash: string
  status: 'active' | 'expired'
  sharedCount: number
}

export function UserDashboard() {
  const [selectedDocument, setSelectedDocument] = useState<UserDocument | null>(null)
  const [showCertificateViewer, setShowCertificateViewer] = useState(false)

  // Mock data for user's documents
  const userDocuments: UserDocument[] = [
    {
      id: '1',
      title: 'Bachelor of Science in Computer Science',
      issuer: 'University of Technology',
      category: 'academic',
      issuedAt: '2024-01-15T10:30:00Z',
      hash: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
      status: 'active',
      sharedCount: 5
    },
    {
      id: '2',
      title: 'Professional Development Certificate',
      issuer: 'Blockchain Institute',
      category: 'business',
      issuedAt: '2024-02-20T14:45:00Z',
      hash: 'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1',
      status: 'active',
      sharedCount: 2
    },
    {
      id: '3',
      title: 'Digital Marketing Certification',
      issuer: 'Marketing Academy',
      category: 'business',
      issuedAt: '2023-12-10T09:15:00Z',
      hash: 'c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1b2',
      status: 'active',
      sharedCount: 8
    }
  ]

  const stats = {
    totalDocuments: userDocuments.length,
    activeDocuments: userDocuments.filter(doc => doc.status === 'active').length,
    totalShares: userDocuments.reduce((sum, doc) => sum + doc.sharedCount, 0),
    recentActivity: 3
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleViewCertificate = (document: UserDocument) => {
    setSelectedDocument(document)
    setShowCertificateViewer(true)
  }

  const handleShareDocument = (document: UserDocument) => {
    // In a real app, this would generate a shareable link or QR code
    const shareUrl = `${window.location.origin}/verify/${document.hash}`
    navigator.clipboard.writeText(shareUrl)
    alert('Share link copied to clipboard!')
  }

  const handleDownloadDocument = (document: UserDocument) => {
    // In a real app, this would download the actual document
    alert(`Downloading ${document.title}...`)
  }

  return (
    <>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">My Documents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDocuments}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeDocuments}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Share2 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Shares</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalShares}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Eye className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Recent Activity</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentActivity}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Document Collection */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">My Document Collection</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userDocuments.map((document) => (
              <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      document.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {document.status}
                    </span>
                  </div>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                    {document.category}
                  </span>
                </div>

                <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                  {document.title}
                </h4>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Building className="h-4 w-4" />
                    <span>{document.issuer}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Issued {formatDate(document.issuedAt)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Share2 className="h-4 w-4" />
                    <span>Shared {document.sharedCount} times</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewCertificate(document)}
                    className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleShareDocument(document)}
                    className="bg-gray-100 text-gray-700 text-sm py-2 px-3 rounded hover:bg-gray-200 transition-colors"
                    title="Share"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDownloadDocument(document)}
                    className="bg-gray-100 text-gray-700 text-sm py-2 px-3 rounded hover:bg-gray-200 transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                  <p className="text-gray-500 mb-1">Document Hash:</p>
                  <p className="font-mono text-gray-700 break-all">
                    {document.hash.slice(0, 32)}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Share2 className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Shared "Bachelor of Science in Computer Science"
                </p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Received "Professional Development Certificate"
                </p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Document verified by employer
                </p>
                <p className="text-xs text-gray-500">3 days ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <FileText className="h-8 w-8 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Upload Document</h4>
              <p className="text-sm text-gray-500">Add a new document to your collection</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <QrCode className="h-8 w-8 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Generate QR Code</h4>
              <p className="text-sm text-gray-500">Create QR codes for easy sharing</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Share2 className="h-8 w-8 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">Share Portfolio</h4>
              <p className="text-sm text-gray-500">Share your entire document portfolio</p>
            </button>
          </div>
        </div>
      </div>

      {/* Certificate Viewer Modal */}
      {showCertificateViewer && selectedDocument && (
        <CertificateViewer
          document={{
            title: selectedDocument.title,
            recipient: 'You',
            issuer: selectedDocument.issuer,
            issuedAt: selectedDocument.issuedAt,
            hash: selectedDocument.hash,
            category: selectedDocument.category
          }}
          onClose={() => {
            setShowCertificateViewer(false)
            setSelectedDocument(null)
          }}
        />
      )}
    </>
  )
}
