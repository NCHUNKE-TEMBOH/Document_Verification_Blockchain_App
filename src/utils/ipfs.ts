import { create, IPFSHTTPClient } from 'ipfs-http-client'

interface IPFSConfig {
  host: string
  port: number
  protocol: string
  headers?: Record<string, string>
}

interface UploadResult {
  hash: string
  path: string
  size: number
  url: string
}

interface DocumentMetadata {
  title: string
  description: string
  issuer: string
  category: string
  fileName: string
  fileSize: number
  fileType: string
  uploadedBy: string
  uploadedAt: string
  documentHash: string
}

class IPFSService {
  private client: IPFSHTTPClient | null = null
  private config: IPFSConfig

  constructor() {
    this.config = {
      host: process.env.NEXT_PUBLIC_IPFS_HOST || 'ipfs.infura.io',
      port: parseInt(process.env.NEXT_PUBLIC_IPFS_PORT || '5001'),
      protocol: process.env.NEXT_PUBLIC_IPFS_PROTOCOL || 'https',
    }

    // Add authentication if provided
    if (process.env.IPFS_PROJECT_ID && process.env.IPFS_PROJECT_SECRET) {
      const auth = 'Basic ' + Buffer.from(
        process.env.IPFS_PROJECT_ID + ':' + process.env.IPFS_PROJECT_SECRET
      ).toString('base64')
      
      this.config.headers = {
        authorization: auth,
      }
    }

    this.initializeClient()
  }

  private initializeClient() {
    try {
      this.client = create(this.config)
    } catch (error) {
      console.error('Failed to initialize IPFS client:', error)
      // Fallback to public gateway for read operations
      this.client = null
    }
  }

  /**
   * Upload a file to IPFS
   */
  async uploadFile(file: File): Promise<UploadResult> {
    if (!this.client) {
      throw new Error('IPFS client not initialized')
    }

    try {
      const buffer = await file.arrayBuffer()
      const result = await this.client.add({
        path: file.name,
        content: new Uint8Array(buffer)
      }, {
        progress: (prog) => console.log(`IPFS upload progress: ${prog}`)
      })

      const hash = result.cid.toString()
      const url = this.getIPFSUrl(hash)

      return {
        hash,
        path: result.path,
        size: result.size,
        url
      }
    } catch (error) {
      console.error('IPFS upload failed:', error)
      throw new Error(`Failed to upload file to IPFS: ${error}`)
    }
  }

  /**
   * Upload JSON metadata to IPFS
   */
  async uploadMetadata(metadata: DocumentMetadata): Promise<UploadResult> {
    if (!this.client) {
      throw new Error('IPFS client not initialized')
    }

    try {
      const jsonString = JSON.stringify(metadata, null, 2)
      const buffer = new TextEncoder().encode(jsonString)
      
      const result = await this.client.add({
        path: `metadata-${metadata.documentHash}.json`,
        content: buffer
      })

      const hash = result.cid.toString()
      const url = this.getIPFSUrl(hash)

      return {
        hash,
        path: result.path,
        size: result.size,
        url
      }
    } catch (error) {
      console.error('IPFS metadata upload failed:', error)
      throw new Error(`Failed to upload metadata to IPFS: ${error}`)
    }
  }

  /**
   * Retrieve content from IPFS
   */
  async getContent(hash: string): Promise<Uint8Array> {
    if (!this.client) {
      // Fallback to HTTP gateway
      return this.getContentViaGateway(hash)
    }

    try {
      const chunks: Uint8Array[] = []
      for await (const chunk of this.client.cat(hash)) {
        chunks.push(chunk)
      }
      
      // Combine all chunks
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
      const result = new Uint8Array(totalLength)
      let offset = 0
      
      for (const chunk of chunks) {
        result.set(chunk, offset)
        offset += chunk.length
      }
      
      return result
    } catch (error) {
      console.error('IPFS retrieval failed:', error)
      throw new Error(`Failed to retrieve content from IPFS: ${error}`)
    }
  }

  /**
   * Get content via HTTP gateway (fallback method)
   */
  private async getContentViaGateway(hash: string): Promise<Uint8Array> {
    const gatewayUrl = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/'
    const url = `${gatewayUrl}${hash}`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const arrayBuffer = await response.arrayBuffer()
      return new Uint8Array(arrayBuffer)
    } catch (error) {
      console.error('Gateway retrieval failed:', error)
      throw new Error(`Failed to retrieve content via gateway: ${error}`)
    }
  }

  /**
   * Get JSON metadata from IPFS
   */
  async getMetadata(hash: string): Promise<DocumentMetadata> {
    try {
      const content = await this.getContent(hash)
      const jsonString = new TextDecoder().decode(content)
      return JSON.parse(jsonString) as DocumentMetadata
    } catch (error) {
      console.error('Failed to parse metadata:', error)
      throw new Error(`Failed to retrieve metadata: ${error}`)
    }
  }

  /**
   * Pin content to IPFS (keep it available)
   */
  async pinContent(hash: string): Promise<void> {
    if (!this.client) {
      console.warn('Cannot pin content: IPFS client not initialized')
      return
    }

    try {
      await this.client.pin.add(hash)
      console.log(`Content pinned: ${hash}`)
    } catch (error) {
      console.error('Failed to pin content:', error)
      throw new Error(`Failed to pin content: ${error}`)
    }
  }

  /**
   * Unpin content from IPFS
   */
  async unpinContent(hash: string): Promise<void> {
    if (!this.client) {
      console.warn('Cannot unpin content: IPFS client not initialized')
      return
    }

    try {
      await this.client.pin.rm(hash)
      console.log(`Content unpinned: ${hash}`)
    } catch (error) {
      console.error('Failed to unpin content:', error)
      throw new Error(`Failed to unpin content: ${error}`)
    }
  }

  /**
   * Get IPFS URL for a hash
   */
  getIPFSUrl(hash: string): string {
    const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/'
    return `${gateway}${hash}`
  }

  /**
   * Check if IPFS client is available
   */
  isAvailable(): boolean {
    return this.client !== null
  }

  /**
   * Get client status and configuration
   */
  getStatus() {
    return {
      available: this.isAvailable(),
      config: this.config,
      gateway: process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/'
    }
  }
}

// Export singleton instance
export const ipfsService = new IPFSService()

// Export types
export type { UploadResult, DocumentMetadata, IPFSConfig }
