import mongoose, { Schema, Document as MongoDocument } from 'mongoose'

export interface IDocument extends MongoDocument {
  documentHash: string
  title: string
  description?: string
  issuer: string
  issuerAddress: string
  owner: string
  ownerAddress: string
  category: 'academic' | 'legal' | 'business' | 'identity' | 'other'
  fileName: string
  fileSize: number
  fileType: string
  ipfsHash?: string
  metadataIpfsHash?: string
  blockchainTxHash?: string
  blockNumber?: number
  isActive: boolean
  issuedAt: Date
  createdAt: Date
  updatedAt: Date
  verificationCount: number
  lastVerifiedAt?: Date
  tags?: string[]
  expiresAt?: Date
}

const DocumentSchema = new Schema<IDocument>({
  documentHash: {
    type: String,
    required: true,
    unique: true,
    index: true,
    match: /^[a-f0-9]{64}$/i
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  issuer: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  issuerAddress: {
    type: String,
    required: true,
    index: true,
    match: /^0x[a-fA-F0-9]{40}$/
  },
  owner: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  ownerAddress: {
    type: String,
    required: true,
    index: true,
    match: /^0x[a-fA-F0-9]{40}$/
  },
  category: {
    type: String,
    required: true,
    enum: ['academic', 'legal', 'business', 'identity', 'other'],
    default: 'other'
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  fileSize: {
    type: Number,
    required: true,
    min: 0
  },
  fileType: {
    type: String,
    required: true,
    trim: true
  },
  ipfsHash: {
    type: String,
    trim: true,
    index: true
  },
  metadataIpfsHash: {
    type: String,
    trim: true,
    index: true
  },
  blockchainTxHash: {
    type: String,
    trim: true,
    index: true,
    match: /^0x[a-fA-F0-9]{64}$/
  },
  blockNumber: {
    type: Number,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  issuedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  verificationCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastVerifiedAt: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
DocumentSchema.index({ issuerAddress: 1, issuedAt: -1 })
DocumentSchema.index({ ownerAddress: 1, issuedAt: -1 })
DocumentSchema.index({ category: 1, isActive: 1 })
DocumentSchema.index({ createdAt: -1 })
DocumentSchema.index({ verificationCount: -1 })

// Virtual for document age
DocumentSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.issuedAt.getTime()) / (1000 * 60 * 60 * 24))
})

// Virtual for file size in MB
DocumentSchema.virtual('fileSizeMB').get(function() {
  return (this.fileSize / (1024 * 1024)).toFixed(2)
})

// Pre-save middleware
DocumentSchema.pre('save', function(next) {
  if (this.isModified('verificationCount')) {
    this.lastVerifiedAt = new Date()
  }
  next()
})

// Static methods
DocumentSchema.statics.findByHash = function(hash: string) {
  return this.findOne({ documentHash: hash })
}

DocumentSchema.statics.findByIssuer = function(issuerAddress: string) {
  return this.find({ issuerAddress, isActive: true }).sort({ issuedAt: -1 })
}

DocumentSchema.statics.findByOwner = function(ownerAddress: string) {
  return this.find({ ownerAddress, isActive: true }).sort({ issuedAt: -1 })
}

DocumentSchema.statics.getStatsByIssuer = function(issuerAddress: string) {
  return this.aggregate([
    { $match: { issuerAddress } },
    {
      $group: {
        _id: null,
        totalDocuments: { $sum: 1 },
        activeDocuments: { $sum: { $cond: ['$isActive', 1, 0] } },
        totalVerifications: { $sum: '$verificationCount' },
        categories: { $addToSet: '$category' }
      }
    }
  ])
}

// Instance methods
DocumentSchema.methods.incrementVerification = function() {
  this.verificationCount += 1
  this.lastVerifiedAt = new Date()
  return this.save()
}

DocumentSchema.methods.revoke = function() {
  this.isActive = false
  return this.save()
}

DocumentSchema.methods.addTag = function(tag: string) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag)
    return this.save()
  }
  return Promise.resolve(this)
}

export default mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema)
