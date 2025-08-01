'use client'

import { useState, useEffect } from 'react'
import { useWeb3 } from '@/contexts/Web3Context'
import { IssuerDashboard } from './IssuerDashboard'
import { VerifierDashboard } from './VerifierDashboard'
import { UserDashboard } from './UserDashboard'
import { AlertCircle } from 'lucide-react'

export function RoleDashboard() {
  const { userRole, account } = useWeb3()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [userRole])

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!userRole) {
    return (
      <div className="card text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Role Assigned</h3>
        <p className="text-gray-600">
          Please select a role from the navigation menu to access your dashboard.
        </p>
      </div>
    )
  }

  const renderDashboard = () => {
    switch (userRole) {
      case 'issuer':
        return <IssuerDashboard />
      case 'verifier':
        return <VerifierDashboard />
      case 'user':
        return <UserDashboard />
      default:
        return (
          <div className="card text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unknown Role</h3>
            <p className="text-gray-600">
              The selected role is not recognized. Please contact support.
            </p>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 capitalize">
            {userRole} Dashboard
          </h2>
          <p className="text-gray-600">
            Manage your documents and activities
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Connected Account</p>
          <p className="font-mono text-sm text-gray-700">
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </p>
        </div>
      </div>
      
      {renderDashboard()}
    </div>
  )
}
