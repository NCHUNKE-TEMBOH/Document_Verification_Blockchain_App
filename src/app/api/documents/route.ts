import { NextRequest, NextResponse } from 'next/server'

// Mock database for demonstration
const mockDocuments = [
  {
    id: '1',
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
    id: '2',
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hash = searchParams.get('hash')
    const owner = searchParams.get('owner')
    const issuer = searchParams.get('issuer')

    let filteredDocuments = mockDocuments

    // Filter by hash if provided
    if (hash) {
      filteredDocuments = filteredDocuments.filter(doc => doc.hash === hash)
    }

    // Filter by owner if provided
    if (owner) {
      filteredDocuments = filteredDocuments.filter(doc => 
        doc.owner.toLowerCase() === owner.toLowerCase()
      )
    }

    // Filter by issuer if provided
    if (issuer) {
      filteredDocuments = filteredDocuments.filter(doc => 
        doc.issuer.toLowerCase().includes(issuer.toLowerCase())
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredDocuments,
      count: filteredDocuments.length
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
    const body = await request.json()
    const { hash, title, issuer, owner, category, metadata } = body

    // Validate required fields
    if (!hash || !title || !issuer || !owner) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if document already exists
    const existingDoc = mockDocuments.find(doc => doc.hash === hash)
    if (existingDoc) {
      return NextResponse.json(
        { success: false, error: 'Document with this hash already exists' },
        { status: 409 }
      )
    }

    // Create new document
    const newDocument = {
      id: (mockDocuments.length + 1).toString(),
      hash,
      title,
      issuer,
      owner,
      category: category || 'other',
      issuedAt: new Date().toISOString(),
      isActive: true,
      metadata: metadata || {}
    }

    // In a real implementation, this would be saved to a database
    mockDocuments.push(newDocument)

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
    const body = await request.json()
    const { hash, isActive } = body

    if (!hash) {
      return NextResponse.json(
        { success: false, error: 'Document hash is required' },
        { status: 400 }
      )
    }

    // Find document
    const docIndex = mockDocuments.findIndex(doc => doc.hash === hash)
    if (docIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      )
    }

    // Update document
    if (typeof isActive === 'boolean') {
      mockDocuments[docIndex].isActive = isActive
    }

    return NextResponse.json({
      success: true,
      data: mockDocuments[docIndex],
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
