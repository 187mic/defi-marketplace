interface StatsBarProps {
  stats: {
    totalOffers: number
    totalVolume: number
    activeTraders: number
  }
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      data-testid="stats-bar"
    >
      {/* Total Offers */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Active Offers</p>
            <p className="text-2xl font-bold text-white" data-testid="total-offers">
              {stats.totalOffers.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Total Volume */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-400 text-sm">24h Volume</p>
            <p className="text-2xl font-bold text-white" data-testid="total-volume">
              ${stats.totalVolume.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Active Traders */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Active Traders</p>
            <p className="text-2xl font-bold text-white" data-testid="active-traders">
              {stats.activeTraders.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
