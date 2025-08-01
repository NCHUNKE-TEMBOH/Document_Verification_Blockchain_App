import { NextRequest, NextResponse } from 'next/server'

// Mock verification data
const mockVerificationLogs = [
  {
    id: '1',
    documentHash: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    verifierAddress: '0x3456789012345678901234567890123456789012',
    verifiedAt: '2024-01-20T10:30:00Z',
    result: 'valid',
    ipAddress: '192.168.1.100'
  },
  {
    id: '2',
    documentHash: 'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1',
    verifierAddress: '0x4567890123456789012345678901234567890123',
    verifiedAt: '2024-01-19T14:45:00Z',
    result: 'valid',
    ipAddress: '192.168.1.101'
  }
]

const mockDocuments = [
  {
    hash: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    title: 'Bachelor of Science Degree',
    issuer: 'University of Technology',
    owner: '0x1234567890123456789012345678901234567890',
    category: 'academic',
    issuedAt: '2024-01-15T10:30:00Z',
    isActive: true,
    metadata: {
      description: 'Computer Science degree from University of Technology',
      fileName: 'degree_certificate.pdf',
      fileSize: 2048576,
      fileType: 'application/pdf'
    }
  },
  {
    hash: 'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1',
    title: 'Professional Certification',
    issuer: 'Blockchain Institute',
    owner: '0x2345678901234567890123456789012345678901',
    category: 'business',
    issuedAt: '2024-02-20T14:45:00Z',
    isActive: true,
    metadata: {
      description: 'Certified Blockchain Developer',
      fileName: 'blockchain_cert.pdf',
      fileSize: 1536000,
      fileType: 'application/pdf'
    }
  }
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { documentHash, verifierAddress } = body

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

    // Find document in mock database
    const document = mockDocuments.find(doc => doc.hash === documentHash)
    
    let verificationResult
    if (document && document.isActive) {
      verificationResult = {
        isValid: true,
        document: {
          title: document.title,
          issuer: document.issuer,
          owner: document.owner,
          category: document.category,
          issuedAt: document.issuedAt,
          metadata: document.metadata
        },
        verifiedAt: new Date().toISOString(),
        blockchainConfirmed: true
      }
    } else if (document && !document.isActive) {
      verificationResult = {
        isValid: false,
        error: 'Document has been revoked',
        verifiedAt: new Date().toISOString(),
        blockchainConfirmed: true
      }
    } else {
      verificationResult = {
        isValid: false,
        error: 'Document not found in blockchain',
        verifiedAt: new Date().toISOString(),
        blockchainConfirmed: false
      }
    }

    // Log the verification attempt
    const verificationLog = {
      id: (mockVerificationLogs.length + 1).toString(),
      documentHash,
      verifierAddress: verifierAddress || 'anonymous',
      verifiedAt: new Date().toISOString(),
      result: verificationResult.isValid ? 'valid' : 'invalid',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    }
    mockVerificationLogs.push(verificationLog)

    return NextResponse.json({
      success: true,
      verification: verificationResult,
      logId: verificationLog.id
    })
  } catch (error) {
    console.error('Error verifying document:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const documentHash = searchParams.get('hash')
    const verifierAddress = searchParams.get('verifier')
    const limit = parseInt(searchParams.get('limit') || '10')

    let filteredLogs = mockVerificationLogs

    // Filter by document hash if provided
    if (documentHash) {
      filteredLogs = filteredLogs.filter(log => log.documentHash === documentHash)
    }

    // Filter by verifier address if provided
    if (verifierAddress) {
      filteredLogs = filteredLogs.filter(log => 
        log.verifierAddress.toLowerCase() === verifierAddress.toLowerCase()
      )
    }

    // Sort by most recent first and limit results
    filteredLogs = filteredLogs
      .sort((a, b) => new Date(b.verifiedAt).getTime() - new Date(a.verifiedAt).getTime())
      .slice(0, limit)

    return NextResponse.json({
      success: true,
      data: filteredLogs,
      count: filteredLogs.length,
      total: mockVerificationLogs.length
    })
  } catch (error) {
    console.error('Error fetching verification logs:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
