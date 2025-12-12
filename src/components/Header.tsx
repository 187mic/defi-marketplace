'use client'

import { useState } from 'react'

interface HeaderProps {
  onCreateOffer: () => void
}

export function Header({ onCreateOffer }: HeaderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)

  const connectWallet = async () => {
    // Simulated wallet connection
    setIsConnected(true)
    setAddress('0x742d...f44e')
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAddress(null)
  }

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                DeFi Market
              </h1>
            </div>
            <nav className="hidden md:ml-10 md:flex space-x-8">
              <a href="/" className="text-white hover:text-primary transition">Marketplace</a>
              <a href="/trades" className="text-gray-400 hover:text-white transition">My Trades</a>
              <a href="/disputes" className="text-gray-400 hover:text-white transition">Disputes</a>
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={onCreateOffer}
              className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg font-medium transition"
              data-testid="create-offer-button"
            >
              + Create Offer
            </button>

            {isConnected ? (
              <div className="flex items-center gap-3">
                <div className="bg-gray-800 px-4 py-2 rounded-lg" data-testid="wallet-address">
                  <span className="text-green-400 mr-2">●</span>
                  {address}
                </div>
                <button
                  onClick={disconnectWallet}
                  className="text-gray-400 hover:text-white transition"
                  data-testid="disconnect-wallet"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-secondary hover:bg-secondary/80 text-white px-4 py-2 rounded-lg font-medium transition"
                data-testid="connect-wallet"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
