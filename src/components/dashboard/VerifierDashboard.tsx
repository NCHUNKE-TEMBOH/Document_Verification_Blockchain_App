'use client'

import { useState } from 'react'
import { Search, CheckCircle, XCircle, Clock, TrendingUp, AlertTriangle, FileText } from 'lucide-react'

interface VerificationRecord {
  id: string
  documentHash: string
  documentTitle: string
  verifiedAt: string
  result: 'valid' | 'invalid' | 'pending'
  issuer: string
  requestedBy: string
}

export function VerifierDashboard() {
  const [recentVerifications] = useState<VerificationRecord[]>([
    {
      id: '1',
      documentHash: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
      documentTitle: 'Bachelor of Science Degree',
      verifiedAt: '2024-01-20T10:30:00Z',
      result: 'valid',
      issuer: 'University of Technology',
      requestedBy: '0x1234...5678'
    },
    {
      id: '2',
      documentHash: 'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1',
      documentTitle: 'Professional Certificate',
      verifiedAt: '2024-01-19T14:45:00Z',
      result: 'valid',
      issuer: 'Blockchain Institute',
      requestedBy: '0x2345...6789'
    },
    {
      id: '3',
      documentHash: 'invalid123456789012345678901234567890abcdef1234567890abcdef123456',
      documentTitle: 'Unknown Document',
      verifiedAt: '2024-01-18T09:15:00Z',
      result: 'invalid',
      issuer: 'N/A',
      requestedBy: '0x3456...7890'
    }
  ])

  const stats = {
    totalVerifications: recentVerifications.length,
    validDocuments: recentVerifications.filter(v => v.result === 'valid').length,
    invalidDocuments: recentVerifications.filter(v => v.result === 'invalid').length,
    pendingVerifications: recentVerifications.filter(v => v.result === 'pending').length
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'valid':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'invalid':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
    }
  }

  const getResultBadge = (result: string) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-semibold rounded-full"
    switch (result) {
      case 'valid':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'invalid':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Search className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Verifications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalVerifications}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Valid Documents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.validDocuments}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Invalid Documents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.invalidDocuments}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingVerifications}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Success Rate */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Verification Success Rate</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Valid Documents</span>
              <span>{stats.totalVerifications > 0 ? Math.round((stats.validDocuments / stats.totalVerifications) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ 
                  width: `${stats.totalVerifications > 0 ? (stats.validDocuments / stats.totalVerifications) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">
              {stats.totalVerifications > 0 ? Math.round((stats.validDocuments / stats.totalVerifications) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-500">Success Rate</p>
          </div>
        </div>
      </div>

      {/* Recent Verifications */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Verification Activity</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issuer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verified At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Result
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentVerifications.map((verification) => (
                <tr key={verification.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {verification.documentTitle}
                      </div>
                      <div className="text-sm text-gray-500 font-mono">
                        {verification.documentHash.slice(0, 16)}...
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {verification.issuer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">
                      {verification.requestedBy}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(verification.verifiedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getResultIcon(verification.result)}
                      <span className={getResultBadge(verification.result)}>
                        {verification.result}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">
                      View Details
                    </button>
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
            <Search className="h-8 w-8 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Verify Document</h4>
            <p className="text-sm text-gray-500">Verify a document's authenticity</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <FileText className="h-8 w-8 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Batch Verification</h4>
            <p className="text-sm text-gray-500">Verify multiple documents at once</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">View Reports</h4>
            <p className="text-sm text-gray-500">Generate verification reports</p>
          </button>
        </div>
      </div>

      {/* Verification Tips */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Verification Best Practices</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Always verify the complete document hash, not just a portion</li>
              <li>• Check the issuer's identity and reputation before trusting documents</li>
              <li>• Be aware that valid blockchain entries don't guarantee document content accuracy</li>
              <li>• Report suspicious or fraudulent documents to the appropriate authorities</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
