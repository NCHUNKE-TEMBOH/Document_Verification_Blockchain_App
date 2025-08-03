import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Document from '@/models/Document'
import AuditLog from '@/models/AuditLog'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'
    const timeframe = parseInt(searchParams.get('timeframe') || '30') // days
    const userAddress = searchParams.get('userAddress')
    const role = searchParams.get('role')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - timeframe)

    let analytics: any = {}

    switch (type) {
      case 'overview':
        analytics = await getOverviewAnalytics(startDate, userAddress, role)
        break
      
      case 'verification':
        analytics = await getVerificationAnalytics(startDate, userAddress)
        break
      
      case 'documents':
        analytics = await getDocumentAnalytics(startDate, userAddress, role)
        break
      
      case 'activity':
        analytics = await getActivityAnalytics(startDate, userAddress)
        break
      
      case 'trends':
        analytics = await getTrendAnalytics(timeframe, userAddress)
        break
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid analytics type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      type,
      timeframe,
      data: analytics,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getOverviewAnalytics(startDate: Date, userAddress?: string | null, role?: string | null) {
  const baseQuery = userAddress ? { userAddress: userAddress.toLowerCase() } : {}
  const docQuery = userAddress && role === 'issuer' 
    ? { issuerAddress: userAddress.toLowerCase() }
    : userAddress && role === 'user'
    ? { ownerAddress: userAddress.toLowerCase() }
    : {}

  const [
    totalDocuments,
    activeDocuments,
    totalVerifications,
    recentActivity,
    topCategories,
    userStats
  ] = await Promise.all([
    Document.countDocuments(docQuery),
    Document.countDocuments({ ...docQuery, isActive: true }),
    AuditLog.countDocuments({ 
      ...baseQuery, 
      action: 'document_verified',
      timestamp: { $gte: startDate }
    }),
    AuditLog.countDocuments({ 
      ...baseQuery,
      timestamp: { $gte: startDate }
    }),
    Document.aggregate([
      { $match: docQuery },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]),
    AuditLog.aggregate([
      { 
        $match: { 
          ...baseQuery,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$userAddress',
          actionCount: { $sum: 1 },
          lastActivity: { $max: '$timestamp' },
          actions: { $addToSet: '$action' }
        }
      },
      { $sort: { actionCount: -1 } },
      { $limit: 10 }
    ])
  ])

  return {
    summary: {
      totalDocuments,
      activeDocuments,
      revokedDocuments: totalDocuments - activeDocuments,
      totalVerifications,
      recentActivity
    },
    categories: topCategories,
    activeUsers: userStats,
    timeframe: {
      start: startDate,
      end: new Date()
    }
  }
}

async function getVerificationAnalytics(startDate: Date, userAddress?: string | null) {
  const baseQuery = userAddress ? { userAddress: userAddress.toLowerCase() } : {}
  
  const [
    verificationStats,
    dailyVerifications,
    topDocuments,
    verificationSuccess
  ] = await Promise.all([
    AuditLog.getVerificationStats(Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24))),
    AuditLog.aggregate([
      {
        $match: {
          ...baseQuery,
          action: 'document_verified',
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          count: { $sum: 1 },
          successful: { $sum: { $cond: ['$success', 1, 0] } }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]),
    AuditLog.getTopDocuments(Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24))),
    AuditLog.aggregate([
      {
        $match: {
          ...baseQuery,
          action: 'document_verified',
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$success',
          count: { $sum: 1 }
        }
      }
    ])
  ])

  const successRate = verificationSuccess.reduce((acc, item) => {
    if (item._id === true) acc.successful = item.count
    else acc.failed = item.count
    return acc
  }, { successful: 0, failed: 0 })

  const totalVerifications = successRate.successful + successRate.failed
  const rate = totalVerifications > 0 ? (successRate.successful / totalVerifications) * 100 : 0

  return {
    overview: {
      totalVerifications,
      successfulVerifications: successRate.successful,
      failedVerifications: successRate.failed,
      successRate: Math.round(rate * 100) / 100
    },
    trends: verificationStats,
    dailyActivity: dailyVerifications,
    topDocuments,
    timeframe: {
      start: startDate,
      end: new Date()
    }
  }
}

async function getDocumentAnalytics(startDate: Date, userAddress?: string | null, role?: string | null) {
  const docQuery = userAddress && role === 'issuer' 
    ? { issuerAddress: userAddress.toLowerCase() }
    : userAddress && role === 'user'
    ? { ownerAddress: userAddress.toLowerCase() }
    : {}

  const [
    documentStats,
    categoryBreakdown,
    sizeAnalysis,
    ageAnalysis,
    verificationDistribution
  ] = await Promise.all([
    Document.aggregate([
      { $match: docQuery },
      {
        $group: {
          _id: null,
          totalDocuments: { $sum: 1 },
          activeDocuments: { $sum: { $cond: ['$isActive', 1, 0] } },
          totalSize: { $sum: '$fileSize' },
          avgSize: { $avg: '$fileSize' },
          totalVerifications: { $sum: '$verificationCount' },
          avgVerifications: { $avg: '$verificationCount' }
        }
      }
    ]),
    Document.aggregate([
      { $match: docQuery },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalVerifications: { $sum: '$verificationCount' },
          avgFileSize: { $avg: '$fileSize' }
        }
      },
      { $sort: { count: -1 } }
    ]),
    Document.aggregate([
      { $match: docQuery },
      {
        $bucket: {
          groupBy: '$fileSize',
          boundaries: [0, 1024*1024, 5*1024*1024, 10*1024*1024, 50*1024*1024, Infinity],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            avgVerifications: { $avg: '$verificationCount' }
          }
        }
      }
    ]),
    Document.aggregate([
      { $match: docQuery },
      {
        $addFields: {
          ageInDays: {
            $divide: [
              { $subtract: [new Date(), '$issuedAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $bucket: {
          groupBy: '$ageInDays',
          boundaries: [0, 7, 30, 90, 365, Infinity],
          default: 'Very Old',
          output: {
            count: { $sum: 1 },
            avgVerifications: { $avg: '$verificationCount' }
          }
        }
      }
    ]),
    Document.aggregate([
      { $match: docQuery },
      {
        $bucket: {
          groupBy: '$verificationCount',
          boundaries: [0, 1, 5, 10, 25, 50, Infinity],
          default: 'High',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ])
  ])

  return {
    overview: documentStats[0] || {
      totalDocuments: 0,
      activeDocuments: 0,
      totalSize: 0,
      avgSize: 0,
      totalVerifications: 0,
      avgVerifications: 0
    },
    categoryBreakdown,
    sizeDistribution: sizeAnalysis,
    ageDistribution: ageAnalysis,
    verificationDistribution,
    timeframe: {
      start: startDate,
      end: new Date()
    }
  }
}

async function getActivityAnalytics(startDate: Date, userAddress?: string | null) {
  const baseQuery = userAddress ? { userAddress: userAddress.toLowerCase() } : {}

  const [
    actionBreakdown,
    hourlyActivity,
    dailyActivity,
    userActivity
  ] = await Promise.all([
    AuditLog.getActionStats(Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24))),
    AuditLog.aggregate([
      {
        $match: {
          ...baseQuery,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]),
    AuditLog.aggregate([
      {
        $match: {
          ...baseQuery,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userAddress' },
          actions: { $addToSet: '$action' }
        }
      },
      {
        $project: {
          date: '$_id.date',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          uniqueActions: { $size: '$actions' }
        }
      },
      { $sort: { date: 1 } }
    ]),
    AuditLog.aggregate([
      {
        $match: {
          ...baseQuery,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$userAddress',
          actionCount: { $sum: 1 },
          lastActivity: { $max: '$timestamp' },
          firstActivity: { $min: '$timestamp' },
          actions: { $addToSet: '$action' },
          successRate: {
            $avg: { $cond: ['$success', 1, 0] }
          }
        }
      },
      { $sort: { actionCount: -1 } },
      { $limit: 20 }
    ])
  ])

  return {
    actionBreakdown,
    patterns: {
      hourlyActivity,
      dailyActivity
    },
    topUsers: userActivity,
    timeframe: {
      start: startDate,
      end: new Date()
    }
  }
}

async function getTrendAnalytics(timeframeDays: number, userAddress?: string | null) {
  const baseQuery = userAddress ? { userAddress: userAddress.toLowerCase() } : {}
  const intervals = Math.min(timeframeDays, 30) // Max 30 data points

  const trends = await AuditLog.aggregate([
    {
      $match: {
        ...baseQuery,
        timestamp: {
          $gte: new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000)
        }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          action: '$action'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.date',
        actions: {
          $push: {
            action: '$_id.action',
            count: '$count'
          }
        },
        totalActivity: { $sum: '$count' }
      }
    },
    { $sort: { '_id': 1 } }
  ])

  return {
    trends,
    timeframe: {
      days: timeframeDays,
      intervals
    }
  }
}
