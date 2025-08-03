import { NextRequest, NextResponse } from 'next/server'
import { ipfsService } from '@/utils/ipfs'
import connectDB from '@/lib/mongodb'
import AuditLog from '@/models/AuditLog'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userAddress = formData.get('userAddress') as string
    const documentHash = formData.get('documentHash') as string
    const uploadType = formData.get('uploadType') as string || 'document' // 'document' or 'metadata'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!userAddress) {
      return NextResponse.json(
        { success: false, error: 'User address is required' },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/json',
      'text/plain'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'File type not allowed' },
        { status: 400 }
      )
    }

    try {
      // Upload to IPFS
      const uploadResult = await ipfsService.uploadFile(file)

      // Pin the content to ensure availability
      if (ipfsService.isAvailable()) {
        try {
          await ipfsService.pinContent(uploadResult.hash)
        } catch (pinError) {
          console.warn('Failed to pin content:', pinError)
          // Continue even if pinning fails
        }
      }

      // Log the upload action
      await AuditLog.logAction(
        uploadType === 'metadata' ? 'document_created' : 'document_created',
        documentHash || 'unknown',
        userAddress.toLowerCase(),
        {
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            ipfsHash: uploadResult.hash,
            uploadType
          }
        }
      )

      return NextResponse.json({
        success: true,
        data: {
          ipfsHash: uploadResult.hash,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          ipfsUrl: uploadResult.url,
          uploadedAt: new Date().toISOString()
        },
        message: 'File uploaded to IPFS successfully'
      })

    } catch (ipfsError) {
      console.error('IPFS upload failed:', ipfsError)
      
      // Log the failed upload
      await AuditLog.logAction(
        'document_created',
        documentHash || 'unknown',
        userAddress.toLowerCase(),
        {
          success: false,
          errorMessage: 'IPFS upload failed',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            uploadType,
            error: ipfsError.message
          }
        }
      )

      return NextResponse.json(
        { success: false, error: 'Failed to upload file to IPFS' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hash = searchParams.get('hash')

    if (!hash) {
      return NextResponse.json(
        { success: false, error: 'IPFS hash is required' },
        { status: 400 }
      )
    }

    try {
      // Get content from IPFS
      const content = await ipfsService.getContent(hash)
      
      // Try to determine content type from the first few bytes
      let contentType = 'application/octet-stream'
      
      // Check for common file signatures
      if (content.length >= 4) {
        const signature = Array.from(content.slice(0, 4))
          .map(byte => byte.toString(16).padStart(2, '0'))
          .join('')
        
        switch (signature.substring(0, 8)) {
          case '25504446': // PDF
            contentType = 'application/pdf'
            break
          case 'ffd8ffe0': // JPEG
          case 'ffd8ffe1':
          case 'ffd8ffe2':
            contentType = 'image/jpeg'
            break
          case '89504e47': // PNG
            contentType = 'image/png'
            break
          case '504b0304': // ZIP/DOCX
            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            break
        }
      }

      // Check if it's JSON
      try {
        const text = new TextDecoder().decode(content)
        JSON.parse(text)
        contentType = 'application/json'
      } catch {
        // Not JSON, keep existing content type
      }

      return new NextResponse(content, {
        headers: {
          'Content-Type': contentType,
          'Content-Length': content.length.toString(),
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
          'Access-Control-Allow-Origin': '*'
        }
      })

    } catch (ipfsError) {
      console.error('IPFS retrieval failed:', ipfsError)
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve content from IPFS' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('IPFS GET API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get IPFS service status
export async function HEAD(request: NextRequest) {
  try {
    const status = ipfsService.getStatus()
    
    return new NextResponse(null, {
      status: status.available ? 200 : 503,
      headers: {
        'X-IPFS-Available': status.available.toString(),
        'X-IPFS-Gateway': status.gateway,
        'X-IPFS-Host': status.config.host,
        'X-IPFS-Port': status.config.port.toString(),
        'X-IPFS-Protocol': status.config.protocol
      }
    })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}
