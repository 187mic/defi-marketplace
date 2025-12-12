'use client'

import { useState } from 'react'

interface CreateOfferModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (offer: OfferFormData) => void
}

interface OfferFormData {
  assetType: string
  amount: string
  paymentMethod: string
  price: string
  terms: string
}

export function CreateOfferModal({ isOpen, onClose, onSubmit }: CreateOfferModalProps) {
  const [formData, setFormData] = useState<OfferFormData>({
    assetType: 'USDC',
    amount: '',
    paymentMethod: 'bank_transfer',
    price: '',
    terms: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      assetType: 'USDC',
      amount: '',
      paymentMethod: 'bank_transfer',
      price: '',
      terms: '',
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      data-testid="create-offer-modal"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-800 rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Create New Offer</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            data-testid="close-modal-button"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Asset Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Asset Type</label>
            <select
              value={formData.assetType}
              onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
              data-testid="asset-type-select"
            >
              <option value="USDC">USDC</option>
              <option value="ETH">ETH</option>
              <option value="USDT">USDT</option>
              <option value="DAI">DAI</option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Enter amount"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              data-testid="amount-input"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Price (USD per unit)</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="Enter price"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              data-testid="price-input"
              required
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
              data-testid="payment-method-select"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="mobile_wallet">Mobile Wallet</option>
              <option value="gift_card">Gift Card</option>
            </select>
          </div>

          {/* Terms */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Terms & Conditions</label>
            <textarea
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              placeholder="Enter your trading terms..."
              rows={3}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
              data-testid="terms-input"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/80 text-white py-3 rounded-lg font-medium transition"
              data-testid="submit-offer-button"
            >
              Create Offer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
