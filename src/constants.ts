import { Chain, UrlMapping } from './types'
// rango
// for most chains
export const rangoAddress =
  '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d'
// for zksync
export const rangoAddressInZksync =
  '0x13598FD0986D0E33c402f6907F05Acf720224527'

// lifi
export const lifiAddress =
  '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE'
// 324
export const lifiAddressInZksync =
  '0x341e94069f53234fE6DabeF707aD424830525715'
// 59144
export const lifiAddressInLinea =
  '0xDE1E598b81620773454588B85D6b5D4eEC32573e'
// 1088
export const lifiAddressInMetis =
  '0x24ca98fB6972F5eE05f0dB00595c7f68D9FaFd68'

// 1inch
export const oneInchAddress =
  '0x111111125421cA6dc452d289314280a0f8842A65'

const INFURA_API_KEY = '4afef93554c240f98c1a3644fbe181d1'
const ALCHEMY_API_KEY = 'JvMibmM4thQEF_7m7UXF02YSqUW5-pRX'

export const rpcUrls: UrlMapping = {
  [Chain.Ethereum]: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
  [Chain.opBNB]: 'https://opbnb-mainnet-rpc.bnbchain.org',
  // max block range: 1000
  [Chain.Scroll]: 'https://rpc.scroll.io/',
  [Chain.Base]: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  [Chain.BSC]: 'https://bsc-dataseed1.binance.org/',
  [Chain.Arbitrum]: `https://arbitrum-mainnet.infura.io/v3/${INFURA_API_KEY}`,
  [Chain.Linea]: `https://linea-mainnet.infura.io/v3/${INFURA_API_KEY}`,
  [Chain.Polygon]: `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`,
  [Chain.ZkSync]: `https://zksync-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  [Chain.Solana]:
    'https://mainnet.helius-rpc.com/?api-key=a56154c2-a1c1-4604-835a-2f9d4acb317b',
  [Chain.Optimism]: `https://optimism-mainnet.infura.io/v3/${INFURA_API_KEY}`,
  [Chain.Avalanche]: `https://avalanche-mainnet.infura.io/v3/${INFURA_API_KEY}`,
  [Chain.Aurota]: `https://aurora.drpc.org`,
  [Chain.Metis]: 'https://metis.drpc.org',
  [Chain.Mode]: 'https://mode.drpc.org',
  [Chain.BTC]: 'https://bitcoin.drpc.org',
  [Chain.Gnosis]: 'https://rpc.gnosischain.com',
  [Chain.Fantom]: 'https://rpc.fantom.network',
  [Chain.Klaytn]: 'https://archive-en.cypress.klaytn.net'
}

export const etherscanUrls: UrlMapping = {
  [Chain.Ethereum]: 'https://api.etherscan.io/api',
  [Chain.Optimism]: 'https://api-optimistic.etherscan.io/api',
  [Chain.Arbitrum]: 'https://api.arbiscan.io/api',
  [Chain.Base]: 'https://api.basescan.org/api',
  [Chain.BSC]: 'https://api.bscscan.com/api',
  [Chain.Fantom]: 'https://api.ftmscan.com/api',
  [Chain.Polygon]: 'https://api.polygonscan.com/api',
  [Chain.Gnosis]: 'https://api.gnosisscan.io/api',
  [Chain.opBNB]: 'https://api-opbnb.bscscan.com/api'
}

export const apiKeys = {
  [Chain.Optimism]: 'DAFYQIQZRSHHJAKI537DUG34I5EISE6TYR',
  [Chain.Ethereum]: '9K1972CHBWVUHDIHH925J8Q9F9369RK6IH',
  [Chain.Arbitrum]: '34DMWUNIFUBU89E9X6H7E8PGT1U6QVDJHV',
  [Chain.Base]: 'HSX9552HB65CH8AVDQ4Y45V9S9XTHPERNJ',
  [Chain.BSC]: '8VIU3SVRIUYRTP492AC8ZQGBVUDDV7MGV5',
  [Chain.Fantom]: 'H2STAG1HV5NAKFMYKHKU6SWNRPXXD47873',
  [Chain.Polygon]: 'SWZNZAZS9JU75B5WP3HEDSV3ZPQ9HFZSWI',
  [Chain.Gnosis]: '24T3WAA687VKB278BHNMBVPXVEZSPRW2GR',
  [Chain.opBNB]: 'PKEAHEUI9QJTBKW1TYSNXGEBR924T85KN5'
}

export const tokens = {
  [Chain.Ethereum]: {
    usdt: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  },
  [Chain.BSC]: {
    usdt: '0x55d398326f99059fF775485246999027B3197955',
    usdc: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'
  }
}
