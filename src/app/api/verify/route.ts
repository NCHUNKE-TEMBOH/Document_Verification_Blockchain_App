import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Document from '@/models/Document'
import AuditLog from '@/models/AuditLog'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { documentHash, verifierAddress, userRole } = body

    if (!documentHash) {
      return NextResponse.json(
        { success: false, error: 'Document hash is required' },
        { status: 400 }
      )
    }

    // Validate hash format (SHA-256 should be 64 characters)
    if (!/^[a-f0-9]{64}$/i.test(documentHash)) {
      return NextResponse.json(
        { success: false, error: 'Invalid hash format' },
        { status: 400 }
      )
    }

    // Find document in database
    const document = await Document.findOne({ documentHash })

    let verificationResult
    let success = true

    if (document && document.isActive) {
      // Increment verification count
      await document.incrementVerification()

      verificationResult = {
        isValid: true,
        document: {
          title: document.title,
          description: document.description,
          issuer: document.issuer,
          issuerAddress: document.issuerAddress,
          owner: document.owner,
          ownerAddress: document.ownerAddress,
          category: document.category,
          issuedAt: document.issuedAt,
          fileName: document.fileName,
          fileSize: document.fileSize,
          fileType: document.fileType,
          ipfsHash: document.ipfsHash,
          verificationCount: document.verificationCount,
          ageInDays: document.ageInDays
        },
        verifiedAt: new Date().toISOString(),
        blockchainConfirmed: !!document.blockchainTxHash
      }
    } else if (document && !document.isActive) {
      success = false
      verificationResult = {
        isValid: false,
        error: 'Document has been revoked',
        verifiedAt: new Date().toISOString(),
        blockchainConfirmed: !!document.blockchainTxHash,
        document: {
          title: document.title,
          issuer: document.issuer,
          revokedAt: document.updatedAt
        }
      }
    } else {
      success = false
      verificationResult = {
        isValid: false,
        error: 'Document not found in blockchain',
        verifiedAt: new Date().toISOString(),
        blockchainConfirmed: false
      }
    }

    // Log the verification attempt
    const auditLog = await AuditLog.logAction(
      'document_verified',
      documentHash,
      verifierAddress || 'anonymous',
      {
        userRole: userRole || 'verifier',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        success,
        errorMessage: success ? undefined : verificationResult.error,
        metadata: {
          documentFound: !!document,
          documentActive: document?.isActive || false,
          verificationCount: document?.verificationCount || 0
        }
      }
    )

    return NextResponse.json({
      success: true,
      verification: verificationResult,
      logId: auditLog._id
    })
  } catch (error) {
    console.error('Error verifying document:', error)

    // Log the failed verification attempt
    try {
      await AuditLog.logAction(
        'document_verified',
        body?.documentHash || 'unknown',
        body?.verifierAddress || 'anonymous',
        {
          success: false,
          errorMessage: 'Internal server error',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      )
    } catch (logError) {
      console.error('Failed to log verification error:', logError)
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const documentHash = searchParams.get('hash')
    const verifierAddress = searchParams.get('verifier')
    const action = searchParams.get('action') || 'document_verified'
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const timeframe = parseInt(searchParams.get('timeframe') || '30') // days

    let query: any = { action }

    // Add time filter
    if (timeframe > 0) {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - timeframe)
      query.timestamp = { $gte: startDate }
    }

    // Filter by document hash if provided
    if (documentHash) {
      query.documentHash = documentHash
    }

    // Filter by verifier address if provided
    if (verifierAddress) {
      query.userAddress = verifierAddress.toLowerCase()
    }

    // Execute query with pagination
    const skip = (page - 1) * limit
    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .lean()

    const total = await AuditLog.countDocuments(query)

    // Get additional statistics if requested
    const includeStats = searchParams.get('stats') === 'true'
    let stats = null

    if (includeStats) {
      const [actionStats, verificationStats] = await Promise.all([
        AuditLog.getActionStats(timeframe),
        AuditLog.getVerificationStats(timeframe)
      ])

      stats = {
        actionBreakdown: actionStats,
        verificationTrends: verificationStats,
        totalLogs: total
      }
    }

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats
    })
  } catch (error) {
    console.error('Error fetching verification logs:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
