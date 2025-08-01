# Document Verification Blockchain App

A secure web application that uses blockchain technology to certify and verify academic, legal, or business documents. Institutions can issue tamper-proof certificates that users can share with third parties.

## Features

### Core Functionalities
- **Document Upload & Hashing**: Upload documents and generate blockchain-ready hashes
- **Document Verification**: Verify document authenticity via hash lookup
- **Role-Based Dashboards**: Different interfaces for Issuers, Verifiers, and Users
- **Certificate Viewer**: View documents with digital seal and QR code
- **Audit Trail**: Comprehensive logging of all document operations

### User Roles
- **Issuers**: Universities, institutions that issue certificates
- **Verifiers**: HR firms, organizations that verify documents
- **Users**: Students, individuals who own and share documents

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

### Blockchain & Web3
- **Ethers.js** - Ethereum library for blockchain interaction
- **Web3.js** - Alternative Web3 library
- **MetaMask** - Web3 wallet integration

### Utilities
- **CryptoJS** - Cryptographic functions for hashing
- **React QR Code** - QR code generation
- **React Dropzone** - File upload interface

### Planned Integrations
- **Solidity** - Smart contracts for document storage
- **IPFS** - Decentralized file storage
- **MongoDB** - Off-chain metadata storage
- **Node.js** - Backend API

## Color Scheme
- **Primary**: Royal Blue (#1F3BB3)
- **Secondary**: Silver (#BDC3C7)
- **Background**: White (#FFFFFF)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask or compatible Web3 wallet

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd document-verification-blockchain-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Connecting Your Wallet
1. Install MetaMask browser extension
2. Create or import a wallet
3. Connect to the application
4. Select your role (Issuer, Verifier, or User)

## Usage

### For Document Issuers
1. Connect your wallet and select "Issuer" role
2. Navigate to "Upload Documents" tab
3. Drag and drop or select files to upload
4. Fill in document metadata (title, category, issuer, description)
5. Upload to blockchain to generate tamper-proof hash
6. Share the document hash or QR code with recipients

### For Document Verifiers
1. Connect your wallet and select "Verifier" role
2. Navigate to "Verify Documents" tab
3. Enter document hash or upload the original file
4. View verification results and document metadata
5. Check issuer authenticity and document status

### For Document Users
1. Connect your wallet and select "User" role
2. View your document collection in the dashboard
3. Share documents via QR codes or direct links
4. Download certificates or generate verification links

## Demo Features

The application includes demo data for testing:
- Sample document hashes for verification
- Mock blockchain transactions
- Example certificates and metadata

### Demo Document Hashes
Try verifying these sample hashes:
- `a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456` - Bachelor's Degree
- `b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1` - Professional Certificate

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── certificate/       # Certificate viewer
│   ├── dashboard/         # Role-based dashboards
│   ├── layout/           # Layout components
│   ├── upload/           # File upload components
│   └── verification/     # Document verification
├── contexts/             # React contexts
│   └── Web3Context.tsx   # Web3 provider
└── utils/               # Utility functions
    └── crypto.ts        # Cryptographic functions
```

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables
Create a `.env.local` file for environment-specific configuration:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
NEXT_PUBLIC_NETWORK_ID=your_network_id
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

### Phase 1 (Current)
- ✅ Basic UI and file upload
- ✅ Document hashing and verification
- ✅ Role-based authentication
- ✅ Certificate viewer with QR codes

### Phase 2 (Planned)
- [ ] Smart contract deployment
- [ ] IPFS integration for file storage
- [ ] MongoDB backend for metadata
- [ ] Advanced audit trails

### Phase 3 (Future)
- [ ] Multi-chain support
- [ ] Batch operations
- [ ] API for third-party integrations
- [ ] Mobile application

## Support

For support, email support@docverify.com or create an issue in the repository.
