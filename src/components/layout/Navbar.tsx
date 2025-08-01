'use client'

import { useState } from 'react'
import { useWeb3 } from '@/contexts/Web3Context'
import { Shield, Wallet, ChevronDown, LogOut, User } from 'lucide-react'

export function Navbar() {
  const { account, userRole, isConnected, connectWallet, disconnectWallet, switchRole } = useWeb3()
  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)

  const roles = [
    { value: 'issuer', label: 'Document Issuer', description: 'Issue and manage certificates' },
    { value: 'verifier', label: 'Document Verifier', description: 'Verify document authenticity' },
    { value: 'user', label: 'Document User', description: 'View and share documents' },
  ] as const

  return (
    <nav className="bg-white shadow-lg border-b border-silver-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-primary-900" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">DocVerify</h1>
              <p className="text-xs text-gray-500">Blockchain Document Verification</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            {isConnected && (
              <>
                {/* Role Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowRoleMenu(!showRoleMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span className="capitalize">{userRole}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {showRoleMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        {roles.map((role) => (
                          <button
                            key={role.value}
                            onClick={() => {
                              switchRole(role.value)
                              setShowRoleMenu(false)
                            }}
                            className={`block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 transition-colors ${
                              userRole === role.value ? 'bg-primary-50 text-primary-900' : 'text-gray-700'
                            }`}
                          >
                            <div className="font-medium">{role.label}</div>
                            <div className="text-xs text-gray-500">{role.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Account Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowAccountMenu(!showAccountMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Wallet className="h-4 w-4" />
                    <span>{account?.slice(0, 6)}...{account?.slice(-4)}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {showAccountMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        <div className="px-4 py-2 text-xs text-gray-500 border-b">
                          Connected Account
                        </div>
                        <div className="px-4 py-2 text-sm font-mono text-gray-700 break-all">
                          {account}
                        </div>
                        <button
                          onClick={() => {
                            disconnectWallet()
                            setShowAccountMenu(false)
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Disconnect
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Connect Wallet Button */}
            {!isConnected && (
              <button
                onClick={connectWallet}
                className="btn-primary flex items-center space-x-2"
              >
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(showRoleMenu || showAccountMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowRoleMenu(false)
            setShowAccountMenu(false)
          }}
        />
      )}
    </nav>
  )
}
