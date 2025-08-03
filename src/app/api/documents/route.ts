import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Document from '@/models/Document'
import AuditLog from '@/models/AuditLog'
import { ipfsService } from '@/utils/ipfs'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const hash = searchParams.get('hash')
    const owner = searchParams.get('owner')
    const issuer = searchParams.get('issuer')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    let query: any = {}

    // Build query based on parameters
    if (hash) {
      query.documentHash = hash
    }
    if (owner) {
      query.ownerAddress = owner.toLowerCase()
    }
    if (issuer) {
      query.issuerAddress = issuer.toLowerCase()
    }
    if (category) {
      query.category = category
    }

    // Execute query with pagination
    const skip = (page - 1) * limit
    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()

    const total = await Document.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const {
      documentHash,
      title,
      description,
      issuer,
      issuerAddress,
      owner,
      ownerAddress,
      category,
      fileName,
      fileSize,
      fileType,
      ipfsHash,
      metadataIpfsHash,
      blockchainTxHash,
      blockNumber
    } = body

    // Validate required fields
    if (!documentHash || !title || !issuer || !issuerAddress || !owner || !ownerAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate hash format
    if (!/^[a-f0-9]{64}$/i.test(documentHash)) {
      return NextResponse.json(
        { success: false, error: 'Invalid document hash format' },
        { status: 400 }
      )
    }

    // Check if document already exists
    const existingDoc = await Document.findOne({ documentHash })
    if (existingDoc) {
      return NextResponse.json(
        { success: false, error: 'Document with this hash already exists' },
        { status: 409 }
      )
    }

    // Create new document
    const newDocument = new Document({
      documentHash,
      title,
      description,
      issuer,
      issuerAddress: issuerAddress.toLowerCase(),
      owner,
      ownerAddress: ownerAddress.toLowerCase(),
      category: category || 'other',
      fileName: fileName || 'unknown',
      fileSize: fileSize || 0,
      fileType: fileType || 'application/octet-stream',
      ipfsHash,
      metadataIpfsHash,
      blockchainTxHash,
      blockNumber,
      isActive: true,
      issuedAt: new Date()
    })

    await newDocument.save()

    // Log the action
    await AuditLog.logAction(
      'document_created',
      documentHash,
      issuerAddress.toLowerCase(),
      {
        userRole: 'issuer',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: {
          title,
          category,
          fileSize,
          fileType
        },
        blockchainTxHash
      }
    )

    return NextResponse.json({
      success: true,
      data: newDocument,
      message: 'Document stored successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error storing document:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { documentHash, isActive, userAddress, action } = body

    if (!documentHash) {
      return NextResponse.json(
        { success: false, error: 'Document hash is required' },
        { status: 400 }
      )
    }

    // Find document
    const document = await Document.findOne({ documentHash })
    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      )
    }

    // Update document based on action
    if (action === 'revoke' && typeof isActive === 'boolean') {
      document.isActive = isActive
      await document.save()

      // Log the revocation
      await AuditLog.logAction(
        'document_revoked',
        documentHash,
        userAddress || 'unknown',
        {
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          metadata: { previousStatus: !isActive }
        }
      )
    } else if (action === 'transfer' && body.newOwnerAddress) {
      const oldOwnerAddress = document.ownerAddress
      document.ownerAddress = body.newOwnerAddress.toLowerCase()
      document.owner = body.newOwner || 'Unknown'
      await document.save()

      // Log the transfer
      await AuditLog.logAction(
        'document_transferred',
        documentHash,
        userAddress || oldOwnerAddress,
        {
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          metadata: {
            fromAddress: oldOwnerAddress,
            toAddress: body.newOwnerAddress.toLowerCase()
          }
        }
      )
    }

    return NextResponse.json({
      success: true,
      data: document,
      message: 'Document updated successfully'
    })
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
