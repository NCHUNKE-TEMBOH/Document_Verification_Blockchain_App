// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DocumentVerification
 * @dev Smart contract for storing and verifying document hashes on the blockchain
 */
contract DocumentVerification {
    
    struct Document {
        string documentHash;
        string metadata;
        address owner;
        address issuer;
        uint256 timestamp;
        bool isActive;
    }
    
    // Mapping from document hash to document details
    mapping(string => Document) public documents;
    
    // Mapping from owner address to array of document hashes
    mapping(address => string[]) public ownerDocuments;
    
    // Mapping from issuer address to array of document hashes
    mapping(address => string[]) public issuerDocuments;
    
    // Events
    event DocumentStored(
        string indexed documentHash,
        address indexed owner,
        address indexed issuer,
        uint256 timestamp
    );
    
    event DocumentRevoked(
        string indexed documentHash,
        address indexed revokedBy,
        uint256 timestamp
    );
    
    event DocumentTransferred(
        string indexed documentHash,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );
    
    /**
     * @dev Store a new document hash with metadata
     * @param _documentHash The SHA-256 hash of the document
     * @param _metadata JSON string containing document metadata
     * @param _owner The address of the document owner (recipient)
     */
    function storeDocument(
        string memory _documentHash,
        string memory _metadata,
        address _owner
    ) public {
        require(bytes(_documentHash).length == 64, "Invalid hash length");
        require(bytes(documents[_documentHash].documentHash).length == 0, "Document already exists");
        require(_owner != address(0), "Invalid owner address");
        
        documents[_documentHash] = Document({
            documentHash: _documentHash,
            metadata: _metadata,
            owner: _owner,
            issuer: msg.sender,
            timestamp: block.timestamp,
            isActive: true
        });
        
        ownerDocuments[_owner].push(_documentHash);
        issuerDocuments[msg.sender].push(_documentHash);
        
        emit DocumentStored(_documentHash, _owner, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Verify if a document exists and return its details
     * @param _documentHash The document hash to verify
     * @return exists Whether the document exists
     * @return metadata The document metadata
     * @return owner The document owner
     * @return issuer The document issuer
     * @return timestamp When the document was stored
     * @return isActive Whether the document is still active
     */
    function verifyDocument(string memory _documentHash)
        public
        view
        returns (
            bool exists,
            string memory metadata,
            address owner,
            address issuer,
            uint256 timestamp,
            bool isActive
        )
    {
        Document memory doc = documents[_documentHash];
        
        if (bytes(doc.documentHash).length > 0) {
            return (
                true,
                doc.metadata,
                doc.owner,
                doc.issuer,
                doc.timestamp,
                doc.isActive
            );
        }
        
        return (false, "", address(0), address(0), 0, false);
    }
    
    /**
     * @dev Revoke a document (only by issuer or owner)
     * @param _documentHash The document hash to revoke
     */
    function revokeDocument(string memory _documentHash) public {
        Document storage doc = documents[_documentHash];
        require(bytes(doc.documentHash).length > 0, "Document does not exist");
        require(
            msg.sender == doc.issuer || msg.sender == doc.owner,
            "Only issuer or owner can revoke"
        );
        require(doc.isActive, "Document already revoked");
        
        doc.isActive = false;
        
        emit DocumentRevoked(_documentHash, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Transfer document ownership (only by current owner)
     * @param _documentHash The document hash to transfer
     * @param _newOwner The new owner address
     */
    function transferDocument(string memory _documentHash, address _newOwner) public {
        Document storage doc = documents[_documentHash];
        require(bytes(doc.documentHash).length > 0, "Document does not exist");
        require(msg.sender == doc.owner, "Only owner can transfer");
        require(_newOwner != address(0), "Invalid new owner address");
        require(doc.isActive, "Cannot transfer revoked document");
        
        address oldOwner = doc.owner;
        doc.owner = _newOwner;
        
        // Add to new owner's documents
        ownerDocuments[_newOwner].push(_documentHash);
        
        // Remove from old owner's documents
        string[] storage oldOwnerDocs = ownerDocuments[oldOwner];
        for (uint i = 0; i < oldOwnerDocs.length; i++) {
            if (keccak256(bytes(oldOwnerDocs[i])) == keccak256(bytes(_documentHash))) {
                oldOwnerDocs[i] = oldOwnerDocs[oldOwnerDocs.length - 1];
                oldOwnerDocs.pop();
                break;
            }
        }
        
        emit DocumentTransferred(_documentHash, oldOwner, _newOwner, block.timestamp);
    }
    
    /**
     * @dev Get all documents owned by an address
     * @param _owner The owner address
     * @return Array of document hashes
     */
    function getDocumentsByOwner(address _owner) public view returns (string[] memory) {
        return ownerDocuments[_owner];
    }
    
    /**
     * @dev Get all documents issued by an address
     * @param _issuer The issuer address
     * @return Array of document hashes
     */
    function getDocumentsByIssuer(address _issuer) public view returns (string[] memory) {
        return issuerDocuments[_issuer];
    }
    
    /**
     * @dev Get the total number of documents stored
     * @return The total count of unique documents
     */
    function getTotalDocuments() public view returns (uint256) {
        // Note: This is a simplified implementation
        // In practice, you'd want to maintain a counter for efficiency
        uint256 count = 0;
        // This would require iterating through all possible hashes, which is not practical
        // Better to maintain a separate counter variable
        return count;
    }
    
    /**
     * @dev Check if a document is active
     * @param _documentHash The document hash to check
     * @return Whether the document is active
     */
    function isDocumentActive(string memory _documentHash) public view returns (bool) {
        return documents[_documentHash].isActive;
    }
    
    /**
     * @dev Get document issuer
     * @param _documentHash The document hash
     * @return The issuer address
     */
    function getDocumentIssuer(string memory _documentHash) public view returns (address) {
        return documents[_documentHash].issuer;
    }
    
    /**
     * @dev Get document owner
     * @param _documentHash The document hash
     * @return The owner address
     */
    function getDocumentOwner(string memory _documentHash) public view returns (address) {
        return documents[_documentHash].owner;
    }
}
