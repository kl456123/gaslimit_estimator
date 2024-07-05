import { Chain, RpcUrlMapping } from "./types";
// rango
// for most chains
export const rangoAddress = "0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d";
// for zksync
export const rangoAddressInZksync =
  "0x13598FD0986D0E33c402f6907F05Acf720224527";

// lifi
export const lifiAddress = "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE";
// 324
export const lifiAddressInZksync = "0x341e94069f53234fE6DabeF707aD424830525715";
// 59144
export const lifiAddressInLinea = "0xDE1E598b81620773454588B85D6b5D4eEC32573e";
// 1088
export const lifiAddressInMetis = "0x24ca98fB6972F5eE05f0dB00595c7f68D9FaFd68";

// 1inch
export const oneInchAddress = "0x111111125421cA6dc452d289314280a0f8842A65";

const INFURA_API_KEY = "4afef93554c240f98c1a3644fbe181d1";
const ALCHEMY_API_KEY = "JvMibmM4thQEF_7m7UXF02YSqUW5-pRX";

export const rpcUrls: RpcUrlMapping = {
  [Chain.Ethereum]: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
  [Chain.opBNB]: "https://opbnb-mainnet-rpc.bnbchain.org",
  // max block range: 1000
  [Chain.Scroll]: "https://rpc.scroll.io/",
  [Chain.Base]: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  [Chain.BSC]: "https://bsc-dataseed1.binance.org/",
  [Chain.Arbitrum]: `https://arbitrum-mainnet.infura.io/v3/${INFURA_API_KEY}`,
  [Chain.Linea]: `https://linea-mainnet.infura.io/v3/${INFURA_API_KEY}`,
  [Chain.Polygon]: `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`,
  [Chain.ZkSync]: `https://zksync-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  [Chain.Solana]:
    "https://mainnet.helius-rpc.com/?api-key=a56154c2-a1c1-4604-835a-2f9d4acb317b",
  [Chain.Optimism]: `https://optimism-mainnet.infura.io/v3/${INFURA_API_KEY}`,
  [Chain.Avalanche]: `https://avalanche-mainnet.infura.io/v3/${INFURA_API_KEY}`,
  [Chain.Aurota]: `https://aurora.drpc.org`,
  [Chain.Metis]: "https://metis.drpc.org",
  [Chain.Mode]: "https://mode.drpc.org",
  [Chain.BTC]: "https://bitcoin.drpc.org",
  [Chain.Gnosis]: "https://rpc.gnosischain.com",
  [Chain.Fantom]: "https://rpc.fantom.network",
  [Chain.Klaytn]: "https://archive-en.cypress.klaytn.net",
};
