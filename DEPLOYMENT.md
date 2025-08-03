# Deployment Guide

This guide covers deploying the Document Verification Blockchain App to various environments.

## Prerequisites

### Required Software
- Node.js 18+ and npm
- MongoDB (local or cloud)
- Git
- MetaMask or compatible Web3 wallet

### Required Accounts
- Infura account (for Ethereum RPC and IPFS)
- MongoDB Atlas account (for cloud database)
- Etherscan account (for contract verification)
- Vercel/Netlify account (for frontend deployment)

## Environment Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd document-verification-blockchain-app
npm install
```

### 2. Environment Variables

Copy the example environment file:
```bash
cp .env.example .env.local
```

Fill in the required values:

#### Blockchain Configuration
```env
# For Sepolia testnet
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
NEXT_PUBLIC_NETWORK_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=sepolia
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

#### IPFS Configuration
```env
NEXT_PUBLIC_IPFS_HOST=ipfs.infura.io
NEXT_PUBLIC_IPFS_PORT=5001
NEXT_PUBLIC_IPFS_PROTOCOL=https
IPFS_PROJECT_ID=your_infura_ipfs_project_id
IPFS_PROJECT_SECRET=your_infura_ipfs_project_secret
```

#### Database Configuration
```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/document-verification

# Or MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/document-verification
```

## Smart Contract Deployment

### 1. Compile Contracts
```bash
npm run compile
```

### 2. Deploy to Testnet (Sepolia)
```bash
npm run deploy:sepolia
```

### 3. Verify Contract
```bash
npm run verify:sepolia
```

### 4. Deploy to Mainnet (Production)
```bash
npm run deploy:mainnet
npm run verify:mainnet
```

## Database Setup

### Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. The app will automatically create collections

### MongoDB Atlas (Cloud)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get connection string
4. Update MONGODB_URI in .env.local

## IPFS Setup

### Using Infura IPFS
1. Create Infura account
2. Create new IPFS project
3. Get Project ID and Secret
4. Update IPFS configuration in .env.local

### Self-hosted IPFS Node
1. Install IPFS
2. Initialize and start IPFS daemon
3. Update IPFS configuration to point to local node

## Frontend Deployment

### Vercel Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel`
4. Set environment variables in Vercel dashboard

### Netlify Deployment
1. Build the app: `npm run build`
2. Deploy to Netlify
3. Set environment variables in Netlify dashboard

### Manual Deployment
1. Build: `npm run build`
2. Start: `npm run start`
3. Configure reverse proxy (nginx/Apache)

## Production Checklist

### Security
- [ ] Use strong, unique private keys
- [ ] Enable HTTPS/SSL
- [ ] Set up proper CORS policies
- [ ] Implement rate limiting
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Set up firewall rules

### Performance
- [ ] Enable caching headers
- [ ] Optimize images and assets
- [ ] Set up CDN for static files
- [ ] Configure database indexes
- [ ] Monitor application performance

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure logging
- [ ] Set up uptime monitoring
- [ ] Monitor blockchain transactions
- [ ] Track IPFS pin status

## Network Configurations

### Sepolia Testnet
```javascript
{
  chainId: 11155111,
  name: 'Sepolia',
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
  blockExplorer: 'https://sepolia.etherscan.io'
}
```

### Ethereum Mainnet
```javascript
{
  chainId: 1,
  name: 'Ethereum',
  rpcUrl: 'https://mainnet.infura.io/v3/YOUR_KEY',
  blockExplorer: 'https://etherscan.io'
}
```

### Polygon
```javascript
{
  chainId: 137,
  name: 'Polygon',
  rpcUrl: 'https://polygon-rpc.com',
  blockExplorer: 'https://polygonscan.com'
}
```

## Troubleshooting

### Common Issues

#### Contract Deployment Fails
- Check wallet balance for gas fees
- Verify RPC URL is correct
- Ensure private key is valid

#### IPFS Upload Fails
- Verify Infura credentials
- Check file size limits
- Ensure IPFS service is running

#### Database Connection Issues
- Verify MongoDB URI
- Check network connectivity
- Ensure database user has proper permissions

#### Frontend Build Errors
- Clear node_modules and reinstall
- Check for TypeScript errors
- Verify all environment variables are set

### Getting Help
- Check the GitHub issues
- Review the documentation
- Contact support at support@docverify.com

## Maintenance

### Regular Tasks
- Monitor smart contract events
- Clean up old IPFS pins
- Backup database regularly
- Update dependencies
- Review audit logs

### Updates
- Test updates on testnet first
- Use blue-green deployment for zero downtime
- Monitor application after updates
- Keep rollback plan ready

## Cost Estimation

### Ethereum Mainnet
- Contract deployment: ~$50-200 (depending on gas)
- Document storage: ~$5-20 per transaction
- Verification: ~$2-10 per transaction

### Polygon
- Contract deployment: ~$1-5
- Document storage: ~$0.01-0.10 per transaction
- Verification: ~$0.001-0.01 per transaction

### IPFS Storage
- Infura: $0.15/GB/month
- Self-hosted: Server costs + bandwidth

### Database
- MongoDB Atlas: $9+/month
- Self-hosted: Server costs

## Support

For deployment assistance:
- Email: support@docverify.com
- Documentation: [Link to docs]
- Community: [Link to Discord/Telegram]
