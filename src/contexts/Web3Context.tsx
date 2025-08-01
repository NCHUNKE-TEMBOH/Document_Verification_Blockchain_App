'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ethers } from 'ethers'

interface Web3ContextType {
  account: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  contract: ethers.Contract | null
  userRole: 'issuer' | 'verifier' | 'user' | null
  isConnected: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchRole: (role: 'issuer' | 'verifier' | 'user') => void
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

// Mock contract ABI for demonstration
const CONTRACT_ABI = [
  "function storeDocument(string memory documentHash, string memory metadata) public",
  "function verifyDocument(string memory documentHash) public view returns (bool, string memory, address, uint256)",
  "function getDocumentsByOwner(address owner) public view returns (string[] memory)",
  "event DocumentStored(string indexed documentHash, address indexed owner, uint256 timestamp)"
]

const CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890" // Mock address

interface Web3ProviderProps {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [userRole, setUserRole] = useState<'issuer' | 'verifier' | 'user' | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.send("eth_requestAccounts", [])
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner()
          const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
          
          setProvider(provider)
          setSigner(signer)
          setContract(contract)
          setAccount(accounts[0])
          setIsConnected(true)
          
          // Default role assignment based on address (for demo)
          const address = accounts[0].toLowerCase()
          if (address.endsWith('1') || address.endsWith('2')) {
            setUserRole('issuer')
          } else if (address.endsWith('3') || address.endsWith('4')) {
            setUserRole('verifier')
          } else {
            setUserRole('user')
          }
        }
      } else {
        alert('Please install MetaMask or another Web3 wallet')
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setContract(null)
    setUserRole(null)
    setIsConnected(false)
  }

  const switchRole = (role: 'issuer' | 'verifier' | 'user') => {
    setUserRole(role)
  }

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const accounts = await provider.listAccounts()
          
          if (accounts.length > 0) {
            await connectWallet()
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error)
        }
      }
    }

    checkConnection()

    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else {
          connectWallet()
        }
      })

      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged')
        window.ethereum.removeAllListeners('chainChanged')
      }
    }
  }, [])

  const value: Web3ContextType = {
    account,
    provider,
    signer,
    contract,
    userRole,
    isConnected,
    connectWallet,
    disconnectWallet,
    switchRole,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}
