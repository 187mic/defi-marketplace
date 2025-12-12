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

interface OfferCardProps {
  offer: Offer
}

const paymentMethodLabels: Record<string, string> = {
  bank_transfer: 'Bank Transfer',
  mobile_wallet: 'Mobile Wallet',
  gift_card: 'Gift Card',
}

export function OfferCard({ offer }: OfferCardProps) {
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div 
      className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
      data-testid="offer-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
            {offer.assetType.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-white">{offer.amount} {offer.assetType}</h3>
            <p className="text-sm text-gray-400">{truncateAddress(offer.creatorAddress)}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          offer.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
        }`}>
          {offer.status}
        </span>
      </div>

      {/* Price */}
      <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Price</span>
          <span className="text-2xl font-bold text-white">
            ${parseFloat(offer.price).toLocaleString()}
            <span className="text-sm text-gray-400 ml-1">/{offer.assetType}</span>
          </span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-400">Total Value</span>
          <span className="text-lg text-secondary">
            ${(parseFloat(offer.amount) * parseFloat(offer.price)).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Payment Method */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-gray-400">Payment:</span>
        <span className="bg-gray-700 px-3 py-1 rounded-lg text-sm text-white">
          {paymentMethodLabels[offer.paymentMethod] || offer.paymentMethod}
        </span>
      </div>

      {/* Terms */}
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{offer.terms}</p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-yellow-400">★ {offer.rating.toFixed(1)}</span>
          <span className="text-gray-400">{offer.tradeCount} trades</span>
        </div>
        <button 
          className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg font-medium transition"
          data-testid="trade-button"
        >
          Trade
        </button>
      </div>
    </div>
  )
}
