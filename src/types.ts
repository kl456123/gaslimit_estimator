export enum Chain {
  Ethereum = 1,
  Arbitrum = 42161,
  Optimism = 10,
  BSC = 56,
  Polygon = 137,
  Avalanche = 43114,
  ZkSync = 324,
  Linea = 59144,
  Base = 8453,
  Gnosis = 100,
  Fantom = 250,
  Klaytn,
  Aurota,
  Solana,
  opBNB = 204,
  Scroll,
  Mode,
  Metis = 1088,
  BTC
}
export type UrlMapping = Partial<{ [chain in Chain]: string }>
