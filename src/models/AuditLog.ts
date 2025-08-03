import mongoose, { Schema, Document as MongoDocument } from 'mongoose'

export interface IAuditLog extends MongoDocument {
  action: 'document_created' | 'document_verified' | 'document_revoked' | 'document_transferred' | 'document_viewed' | 'document_shared' | 'document_downloaded'
  documentHash: string
  userAddress: string
  userRole?: 'issuer' | 'verifier' | 'user'
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
  timestamp: Date
  blockchainTxHash?: string
  success: boolean
  errorMessage?: string
  sessionId?: string
  geolocation?: {
    country?: string
    region?: string
    city?: string
    latitude?: number
    longitude?: number
  }
}

const AuditLogSchema = new Schema<IAuditLog>({
  action: {
    type: String,
    required: true,
    enum: [
      'document_created',
      'document_verified', 
      'document_revoked',
      'document_transferred',
      'document_viewed',
      'document_shared',
      'document_downloaded'
    ],
    index: true
  },
  documentHash: {
    type: String,
    required: true,
    index: true,
    match: /^[a-f0-9]{64}$/i
  },
  userAddress: {
    type: String,
    required: true,
    index: true,
    match: /^0x[a-fA-F0-9]{40}$/
  },
  userRole: {
    type: String,
    enum: ['issuer', 'verifier', 'user'],
    index: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  blockchainTxHash: {
    type: String,
    trim: true,
    match: /^0x[a-fA-F0-9]{64}$/
  },
  success: {
    type: Boolean,
    default: true,
    index: true
  },
  errorMessage: {
    type: String,
    trim: true
  },
  sessionId: {
    type: String,
    trim: true,
    index: true
  },
  geolocation: {
    country: String,
    region: String,
    city: String,
    latitude: Number,
    longitude: Number
  }
}, {
  timestamps: false, // We use our own timestamp field
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Compound indexes for better query performance
AuditLogSchema.index({ documentHash: 1, timestamp: -1 })
AuditLogSchema.index({ userAddress: 1, timestamp: -1 })
AuditLogSchema.index({ action: 1, timestamp: -1 })
AuditLogSchema.index({ success: 1, timestamp: -1 })
AuditLogSchema.index({ timestamp: -1 }) // For general time-based queries

// TTL index to automatically delete old logs (optional - 1 year retention)
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 })

// Virtual for time ago
AuditLogSchema.virtual('timeAgo').get(function() {
  const now = new Date()
  const diff = now.getTime() - this.timestamp.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  return `${days} day${days > 1 ? 's' : ''} ago`
})

// Static methods
AuditLogSchema.statics.logAction = function(
  action: IAuditLog['action'],
  documentHash: string,
  userAddress: string,
  options: Partial<IAuditLog> = {}
) {
  return this.create({
    action,
    documentHash,
    userAddress,
    ...options
  })
}

AuditLogSchema.statics.getDocumentHistory = function(documentHash: string, limit = 50) {
  return this.find({ documentHash })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean()
}

AuditLogSchema.statics.getUserActivity = function(userAddress: string, limit = 50) {
  return this.find({ userAddress })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean()
}

AuditLogSchema.statics.getActionStats = function(timeframe = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - timeframe)

  return this.aggregate([
    { $match: { timestamp: { $gte: startDate } } },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        successCount: { $sum: { $cond: ['$success', 1, 0] } },
        failureCount: { $sum: { $cond: ['$success', 0, 1] } }
      }
    },
    { $sort: { count: -1 } }
  ])
}

AuditLogSchema.statics.getVerificationStats = function(timeframe = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - timeframe)

  return this.aggregate([
    { 
      $match: { 
        action: 'document_verified',
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
        },
        totalVerifications: { $sum: 1 },
        successfulVerifications: { $sum: { $cond: ['$success', 1, 0] } },
        uniqueDocuments: { $addToSet: '$documentHash' },
        uniqueUsers: { $addToSet: '$userAddress' }
      }
    },
    {
      $project: {
        date: '$_id.date',
        totalVerifications: 1,
        successfulVerifications: 1,
        uniqueDocuments: { $size: '$uniqueDocuments' },
        uniqueUsers: { $size: '$uniqueUsers' },
        successRate: {
          $multiply: [
            { $divide: ['$successfulVerifications', '$totalVerifications'] },
            100
          ]
        }
      }
    },
    { $sort: { date: 1 } }
  ])
}

AuditLogSchema.statics.getTopDocuments = function(timeframe = 30, limit = 10) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - timeframe)

  return this.aggregate([
    { 
      $match: { 
        action: 'document_verified',
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$documentHash',
        verificationCount: { $sum: 1 },
        lastVerified: { $max: '$timestamp' },
        uniqueVerifiers: { $addToSet: '$userAddress' }
      }
    },
    {
      $project: {
        documentHash: '$_id',
        verificationCount: 1,
        lastVerified: 1,
        uniqueVerifiers: { $size: '$uniqueVerifiers' }
      }
    },
    { $sort: { verificationCount: -1 } },
    { $limit: limit }
  ])
}

// Instance methods
AuditLogSchema.methods.addMetadata = function(key: string, value: any) {
  if (!this.metadata) this.metadata = {}
  this.metadata[key] = value
  return this.save()
}

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema)
