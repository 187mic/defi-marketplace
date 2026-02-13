# DeFi P2P Marketplace

A decentralized peer-to-peer marketplace for token swaps built with Next.js, TypeScript, and Safe (formerly Gnosis Safe).

## Features

- 🔐 **Safe Smart Account Integration** - CREATE2 address prediction for escrow
- 🔄 **Multi-Provider RPC Client** - Automatic failover between Alchemy, Infura, and public nodes
- 💼 **Wallet Connection** - Powered by Reown AppKit
- 📊 **Marketplace UI** - Browse and create token swap offers
- ⚡ **TypeScript** - Full type safety across the stack

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git configured with your identity (see [Git Configuration Guide](.github/GIT_CONFIGURATION.md))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/187mic/defi-marketplace.git
cd defi-marketplace
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` and add your API keys:
```bash
# Get your Alchemy API key from: https://dashboard.alchemy.com/
NEXT_PUBLIC_ALCHEMY_RPC=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# Get your Infura API key from: https://infura.io/dashboard
NEXT_PUBLIC_INFURA_RPC=https://sepolia.infura.io/v3/YOUR_KEY

# Get your WalletConnect project ID from: https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run Playwright tests
- `npm run test:ui` - Run Playwright tests with UI

### Project Structure

```
defi-marketplace/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── context/          # React context providers
│   ├── lib/              # Utility libraries
│   │   ├── rpcClient.ts      # RPC client with failover
│   │   ├── safeClient.ts     # Safe smart account client
│   │   └── txServiceClient.ts # Transaction service client
│   └── types/            # TypeScript type definitions
├── .env.example          # Example environment variables
└── package.json          # Dependencies and scripts
```

## Security

### ⚠️ Important Security Information

**Before contributing**, please review:

- **[Security Remediation Guide](SECURITY_REMEDIATION.md)** - Information about a sensitive commit in the repository history
- **[Git Configuration Guide](.github/GIT_CONFIGURATION.md)** - How to properly configure your git identity

### Best Practices

1. ✅ **Never commit `.env` files** - They are gitignored for a reason
2. ✅ **Never hardcode API keys** - Always use environment variables
3. ✅ **Configure git properly** - Use your public/professional email
4. ✅ **Review commits before pushing** - Check for sensitive information
5. ✅ **Use GitHub's no-reply email** - Keep your personal email private

### Environment Variables

This project uses the following environment variables:

**Required (Public - exposed to browser):**
- `NEXT_PUBLIC_ALCHEMY_RPC` - Alchemy RPC endpoint URL
- `NEXT_PUBLIC_INFURA_RPC` - Infura RPC endpoint URL  
- `NEXT_PUBLIC_FALLBACK_RPC` - Fallback RPC endpoint URL
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID

**Optional (Server-side only):**
- `DATABASE_URL` - Database connection string (default: `file:./dev.db`)
- `PLATFORM_FEE_BPS` - Platform fee in basis points (default: 300)
- `FEE_RECIPIENT_ADDRESS` - Address to receive platform fees
- `MODERATOR_ADDRESS` - Address with moderation privileges

**Note:** `NEXT_PUBLIC_*` variables are exposed to the browser. Never put secrets in them.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Configure your git identity properly (see [Git Configuration Guide](.github/GIT_CONFIGURATION.md))
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Architecture

### RPC Client

The RPC client implements automatic failover between multiple providers:

1. **Alchemy** (Priority 1) - Primary provider
2. **Infura** (Priority 2) - Secondary provider
3. **Public Node** (Priority 3) - Fallback provider

Features:
- Circuit breaker pattern to avoid cascading failures
- Health monitoring and automatic recovery
- Transparent failover with minimal downtime

### Safe Client

Integration with Safe smart accounts for secure escrow:

- CREATE2 address prediction for deterministic escrow addresses
- Transaction service integration
- Multi-signature support (future feature)

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Web3**: ethers.js 6, wagmi, viem
- **Smart Accounts**: Safe Protocol Kit & API Kit
- **State Management**: TanStack Query (React Query)
- **Testing**: Playwright

## Roadmap

- [x] Project structure and TypeScript setup
- [x] RPC client with multi-provider failover
- [x] Safe client integration
- [x] Basic marketplace UI
- [ ] Smart contract deployment
- [ ] Escrow functionality
- [ ] Token swap execution
- [ ] Order book implementation
- [ ] Advanced search and filtering
- [ ] User profiles and reputation
- [ ] Dispute resolution mechanism
- [ ] Multi-chain support

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or contributions, please open an issue on GitHub.

## Acknowledgments

- Safe (Gnosis Safe) for smart account infrastructure
- Alchemy and Infura for reliable RPC services
- The Ethereum community for ongoing development

---

**⚠️ Disclaimer**: This is experimental software. Use at your own risk. Never commit sensitive information to git.
