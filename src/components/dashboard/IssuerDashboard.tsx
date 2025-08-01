'use client'

import { useState } from 'react'
import { FileText, Users, TrendingUp, Calendar, Eye, Download, QrCode } from 'lucide-react'
import { CertificateViewer } from '../certificate/CertificateViewer'

interface IssuedDocument {
  id: string
  title: string
  recipient: string
  category: string
  issuedAt: string
  status: 'active' | 'revoked'
  verificationCount: number
  hash: string
}

export function IssuerDashboard() {
  const [selectedDocument, setSelectedDocument] = useState<IssuedDocument | null>(null)
  const [showCertificateViewer, setShowCertificateViewer] = useState(false)

  // Mock data for issued documents
  const issuedDocuments: IssuedDocument[] = [
    {
      id: '1',
      title: 'Bachelor of Science in Computer Science',
      recipient: '0x1234...5678',
      category: 'academic',
      issuedAt: '2024-01-15T10:30:00Z',
      status: 'active',
      verificationCount: 12,
      hash: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456'
    },
    {
      id: '2',
      title: 'Professional Development Certificate',
      recipient: '0x2345...6789',
      category: 'business',
      issuedAt: '2024-02-20T14:45:00Z',
      status: 'active',
      verificationCount: 8,
      hash: 'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1'
    },
    {
      id: '3',
      title: 'Legal Compliance Certificate',
      recipient: '0x3456...7890',
      category: 'legal',
      issuedAt: '2024-03-10T09:15:00Z',
      status: 'active',
      verificationCount: 5,
      hash: 'c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1b2'
    }
  ]

  const stats = {
    totalIssued: issuedDocuments.length,
    totalVerifications: issuedDocuments.reduce((sum, doc) => sum + doc.verificationCount, 0),
    activeDocuments: issuedDocuments.filter(doc => doc.status === 'active').length,
    thisMonth: 2
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleViewCertificate = (document: IssuedDocument) => {
    setSelectedDocument(document)
    setShowCertificateViewer(true)
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
                <p className="text-sm font-medium text-gray-500">Total Issued</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalIssued}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Verifications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVerifications}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Documents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeDocuments}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Issued Documents</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issued Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verifications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {issuedDocuments.map((document) => (
                  <tr key={document.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {document.title}
                        </div>
                        <div className="text-sm text-gray-500 font-mono">
                          {document.hash.slice(0, 16)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        {document.recipient}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {document.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(document.issuedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {document.verificationCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        document.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {document.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewCertificate(document)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Certificate"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          className="text-purple-600 hover:text-purple-900"
                          title="QR Code"
                        >
                          <QrCode className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <FileText className="h-8 w-8 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Issue New Certificate</h4>
              <p className="text-sm text-gray-500">Create and issue a new document</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Manage Recipients</h4>
              <p className="text-sm text-gray-500">View and manage document recipients</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">View Analytics</h4>
              <p className="text-sm text-gray-500">Track verification statistics</p>
            </button>
          </div>
        </div>
      </div>

      {/* Certificate Viewer Modal */}
      {showCertificateViewer && selectedDocument && (
        <CertificateViewer
          document={{
            title: selectedDocument.title,
            recipient: selectedDocument.recipient,
            issuer: 'Your Organization',
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
