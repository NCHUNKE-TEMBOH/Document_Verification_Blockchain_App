'use client'

import { useState } from 'react'
import QRCode from 'react-qr-code'
import { X, Download, Share2, Shield, Calendar, Building, Hash, QrCode } from 'lucide-react'

interface CertificateDocument {
  title: string
  recipient: string
  issuer: string
  issuedAt: string
  hash: string
  category: string
}

interface CertificateViewerProps {
  document: CertificateDocument
  onClose: () => void
}

export function CertificateViewer({ document, onClose }: CertificateViewerProps) {
  const [showQR, setShowQR] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const verificationUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${document.hash}`

  const handleDownload = () => {
    // In a real implementation, this would generate and download a PDF
    alert('Certificate download functionality would be implemented here')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        text: `Verify this certificate: ${document.title}`,
        url: verificationUrl,
      })
    } else {
      navigator.clipboard.writeText(verificationUrl)
      alert('Verification link copied to clipboard!')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Certificate Viewer</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowQR(!showQR)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Toggle QR Code"
            >
              <QrCode className="h-5 w-5" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Download"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Certificate Display */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200 rounded-lg p-8 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200 rounded-full opacity-20 -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-300 rounded-full opacity-20 translate-y-12 -translate-x-12"></div>
                
                {/* Certificate Content */}
                <div className="relative z-10">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                      <Shield className="h-12 w-12 text-primary-900" />
                    </div>
                    <h1 className="text-2xl font-bold text-primary-900 mb-2">
                      CERTIFICATE OF COMPLETION
                    </h1>
                    <div className="w-24 h-1 bg-primary-600 mx-auto"></div>
                  </div>

                  {/* Main Content */}
                  <div className="text-center mb-8">
                    <p className="text-gray-700 mb-4">This is to certify that</p>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      {document.recipient}
                    </h2>
                    <p className="text-gray-700 mb-2">has successfully completed</p>
                    <h3 className="text-xl font-semibold text-primary-900 mb-6">
                      {document.title}
                    </h3>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-end">
                    <div className="text-left">
                      <div className="border-t border-gray-400 pt-2 mb-2 w-32">
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(document.issuedAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="mb-4">
                        <div className="w-16 h-16 bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Shield className="h-8 w-8 text-white" />
                        </div>
                        <p className="text-xs text-gray-600">VERIFIED</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="border-t border-gray-400 pt-2 mb-2 w-32">
                        <p className="text-sm text-gray-600">Issued by</p>
                        <p className="font-medium text-gray-900">
                          {document.issuer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* QR Code */}
              {showQR && (
                <div className="card text-center">
                  <h3 className="text-lg font-semibold mb-4">Verification QR Code</h3>
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <QRCode
                      value={verificationUrl}
                      size={150}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Scan to verify this certificate
                  </p>
                </div>
              )}

              {/* Certificate Details */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Certificate Details</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Building className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Issuing Organization</p>
                      <p className="font-medium text-gray-900">{document.issuer}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Issue Date</p>
                      <p className="font-medium text-gray-900">{formatDate(document.issuedAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium text-gray-900 capitalize">{document.category}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Hash className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Document Hash</p>
                      <p className="font-mono text-xs text-gray-700 break-all">
                        {document.hash}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Status */}
              <div className="card bg-green-50 border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">Verified</h3>
                    <p className="text-sm text-green-700">
                      This certificate is authentic and registered on the blockchain
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Certificate</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="w-full btn-secondary flex items-center justify-center space-x-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share Certificate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
