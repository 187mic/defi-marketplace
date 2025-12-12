'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { OfferCard } from '@/components/OfferCard'
import { CreateOfferModal } from '@/components/CreateOfferModal'
import { StatsBar } from '@/components/StatsBar'

interface Offer {
  id: string
  creatorAddress: string
  assetType: string
  amount: string
  price: string
  paymentMethod: string
  terms: string
  status: 'active' | 'inactive'
  rating: number
  tradeCount: number
}

const mockOffers: Offer[] = [
  {
    id: '1',
    creatorAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    assetType: 'ETH',
    amount: '1.5',
    paymentMethod: 'bank_transfer',
    price: '3150',
    terms: 'Fast payment, verified trader. Bank transfer only.',
    status: 'active',
    rating: 4.8,
    tradeCount: 127,
  },
  {
    id: '2',
    creatorAddress: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    assetType: 'USDT',
    amount: '5000',
    paymentMethod: 'mobile_wallet',
    price: '1.01',
    terms: 'Venmo or CashApp accepted. Quick release.',
    status: 'active',
    rating: 4.9,
    tradeCount: 89,
  },
  {
    id: '3',
    creatorAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    assetType: 'ETH',
    amount: '0.5',
    paymentMethod: 'gift_card',
    price: '2100',
    terms: 'Amazon gift cards accepted. Min $100.',
    status: 'active',
    rating: 4.5,
    tradeCount: 45,
  },
  {
    id: '4',
    creatorAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    assetType: 'USDC',
    amount: '10000',
    paymentMethod: 'bank_transfer',
    price: '0.99',
    terms: 'Wire transfer only. 24h settlement.',
    status: 'active',
    rating: 4.7,
    tradeCount: 203,
  },
]

const stats = {
  totalOffers: 1247,
  totalVolume: 2400000,
  activeTraders: 156,
}

export default function Home() {
  const [offers, setOffers] = useState<Offer[]>(mockOffers)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterAsset, setFilterAsset] = useState<string>('all')
  const [filterPayment, setFilterPayment] = useState<string>('all')

  const filteredOffers = offers.filter(offer => {
    if (filterAsset !== 'all' && offer.assetType !== filterAsset) return false
    if (filterPayment !== 'all' && offer.paymentMethod !== filterPayment) return false
    return true
  })

  const handleCreateOffer = (newOffer: {
    assetType: string
    amount: string
    paymentMethod: string
    price: string
    terms: string
  }) => {
    const offer: Offer = {
      id: Date.now().toString(),
      creatorAddress: '0x0000000000000000000000000000000000000000',
      assetType: newOffer.assetType,
      amount: newOffer.amount,
      paymentMethod: newOffer.paymentMethod,
      price: newOffer.price,
      terms: newOffer.terms,
      status: 'active',
      rating: 5.0,
      tradeCount: 0,
    }
    setOffers([offer, ...offers])
    setIsModalOpen(false)
  }

  return (
    <main className="min-h-screen">
      <Header onCreateOffer={() => setIsModalOpen(true)} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsBar stats={stats} />

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={filterAsset}
            onChange={(e) => setFilterAsset(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            data-testid="filter-asset-type"
          >
            <option value="all">All Assets</option>
            <option value="ETH">ETH</option>
            <option value="USDT">USDT</option>
            <option value="USDC">USDC</option>
          </select>
          
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            data-testid="filter-payment-method"
          >
            <option value="all">All Payment Methods</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="mobile_wallet">Mobile Wallet</option>
            <option value="gift_card">Gift Card</option>
          </select>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="offers-list">
          {filteredOffers.map(offer => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>

        {filteredOffers.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-xl">No offers found</p>
            <p className="mt-2">Try adjusting your filters or create a new offer</p>
          </div>
        )}
      </div>

      <CreateOfferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOffer}
      />
    </main>
  )
}
