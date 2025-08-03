'use client'

import { useState } from 'react'
import { useWeb3 } from '@/contexts/Web3Context'
import { FileUpload } from '@/components/upload/FileUpload'
import { DocumentVerification } from '@/components/verification/DocumentVerification'
import { RoleDashboard } from '@/components/dashboard/RoleDashboard'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'
import { Shield, Upload, Search, Users, BarChart3 } from 'lucide-react'

export default function Home() {
  const { account, userRole, isConnected } = useWeb3()
  const [activeTab, setActiveTab] = useState<'upload' | 'verify' | 'dashboard' | 'analytics'>('upload')

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-16 w-16 text-primary-900 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Document Verification System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Secure, tamper-proof document verification using blockchain technology
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            <div className="card text-center">
              <Upload className="mx-auto h-12 w-12 text-primary-900 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
              <p className="text-gray-600">Securely upload and hash documents to the blockchain</p>
            </div>
            <div className="card text-center">
              <Search className="mx-auto h-12 w-12 text-primary-900 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Verify Authenticity</h3>
              <p className="text-gray-600">Instantly verify document authenticity using hash lookup</p>
            </div>
            <div className="card text-center">
              <Users className="mx-auto h-12 w-12 text-primary-900 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Role-Based Access</h3>
              <p className="text-gray-600">Different interfaces for issuers, verifiers, and users</p>
            </div>
          </div>
          <p className="text-gray-600">
            Please connect your Web3 wallet to get started
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {userRole || 'User'}
        </h1>
        <p className="text-gray-600">
          Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'upload'
              ? 'border-primary-900 text-primary-900'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Upload Documents
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('verify')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'verify'
              ? 'border-primary-900 text-primary-900'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Verify Documents
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'dashboard'
              ? 'border-primary-900 text-primary-900'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'analytics'
              ? 'border-primary-900 text-primary-900'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Analytics
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'upload' && <FileUpload />}
        {activeTab === 'verify' && <DocumentVerification />}
        {activeTab === 'dashboard' && <RoleDashboard />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
      </div>
    </div>
  )
}
