'use client'

import { useState, useEffect } from 'react'
import { useWeb3 } from '@/contexts/Web3Context'
import { BarChart, LineChart, PieChart, TrendingUp, Activity, Users, FileText, Eye, Calendar } from 'lucide-react'

interface AnalyticsData {
  overview?: any
  verification?: any
  documents?: any
  activity?: any
  trends?: any
}

export function AnalyticsDashboard() {
  const { account, userRole } = useWeb3()
  const [analyticsType, setAnalyticsType] = useState<'overview' | 'verification' | 'documents' | 'activity' | 'trends'>('overview')
  const [timeframe, setTimeframe] = useState(30)
  const [data, setData] = useState<AnalyticsData>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [analyticsType, timeframe, account, userRole])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        type: analyticsType,
        timeframe: timeframe.toString(),
        ...(account && { userAddress: account }),
        ...(userRole && { role: userRole })
      })

      const response = await fetch(`/api/analytics?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const result = await response.json()
      
      if (result.success) {
        setData(prev => ({ ...prev, [analyticsType]: result.data }))
      } else {
        throw new Error(result.error || 'Analytics request failed')
      }
    } catch (err) {
      console.error('Analytics error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatPercentage = (num: number) => {
    return `${Math.round(num * 100) / 100}%`
  }

  const renderOverview = () => {
    const overview = data.overview
    if (!overview) return null

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(overview.summary?.totalDocuments || 0)}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Documents</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(overview.summary?.activeDocuments || 0)}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Verifications</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(overview.summary?.totalVerifications || 0)}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Recent Activity</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(overview.summary?.recentActivity || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Breakdown */}
        {overview.categories && overview.categories.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Document Categories</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {overview.categories.map((category: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">{category._id}</span>
                    <span className="text-lg font-bold text-gray-900">{category.count}</span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(category.count / Math.max(...overview.categories.map((c: any) => c.count))) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Users */}
        {overview.activeUsers && overview.activeUsers.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Most Active Users</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {overview.activeUsers.slice(0, 5).map((user: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900">
                          {user._id.slice(0, 6)}...{user._id.slice(-4)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.actionCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(user.lastActivity).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderVerification = () => {
    const verification = data.verification
    if (!verification) return null

    return (
      <div className="space-y-6">
        {/* Verification Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="card">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-3xl font-bold text-green-600">{formatPercentage(verification.overview?.successRate || 0)}</p>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Total Verifications</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(verification.overview?.totalVerifications || 0)}</p>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Successful</p>
              <p className="text-2xl font-bold text-green-600">{formatNumber(verification.overview?.successfulVerifications || 0)}</p>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Failed</p>
              <p className="text-2xl font-bold text-red-600">{formatNumber(verification.overview?.failedVerifications || 0)}</p>
            </div>
          </div>
        </div>

        {/* Daily Activity Chart */}
        {verification.dailyActivity && verification.dailyActivity.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Daily Verification Activity</h3>
            <div className="h-64 flex items-end space-x-2 overflow-x-auto">
              {verification.dailyActivity.map((day: any, index: number) => (
                <div key={index} className="flex flex-col items-center min-w-0 flex-1">
                  <div 
                    className="bg-primary-600 rounded-t w-full min-h-1"
                    style={{ height: `${(day.count / Math.max(...verification.dailyActivity.map((d: any) => d.count))) * 200}px` }}
                  ></div>
                  <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                    {new Date(day._id.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Documents */}
        {verification.topDocuments && verification.topDocuments.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Most Verified Documents</h3>
            <div className="space-y-3">
              {verification.topDocuments.slice(0, 5).map((doc: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-mono text-sm text-gray-700">{doc.documentHash.slice(0, 16)}...</p>
                    <p className="text-xs text-gray-500">{doc.uniqueVerifiers} unique verifiers</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{doc.verificationCount}</p>
                    <p className="text-xs text-gray-500">verifications</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Insights and metrics for document verification</p>
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(parseInt(e.target.value))}
            className="input-field text-sm"
            title="Select timeframe"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>
      </div>

      {/* Analytics Type Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart },
            { key: 'verification', label: 'Verification', icon: Eye },
            { key: 'documents', label: 'Documents', icon: FileText },
            { key: 'activity', label: 'Activity', icon: Activity },
            { key: 'trends', label: 'Trends', icon: TrendingUp }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setAnalyticsType(key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                analyticsType === key
                  ? 'border-primary-900 text-primary-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-900"></div>
          </div>
        )}

        {error && (
          <div className="card bg-red-50 border-red-200">
            <div className="flex items-center space-x-2">
              <div className="text-red-600">⚠️</div>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {analyticsType === 'overview' && renderOverview()}
            {analyticsType === 'verification' && renderVerification()}
            {analyticsType === 'documents' && <div className="card">Document analytics coming soon...</div>}
            {analyticsType === 'activity' && <div className="card">Activity analytics coming soon...</div>}
            {analyticsType === 'trends' && <div className="card">Trend analytics coming soon...</div>}
          </>
        )}
      </div>
    </div>
  )
}
