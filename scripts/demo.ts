import { ethers } from "ethers";
import { estimateUnitLimitTest } from "../src/solana_utils";
import { estimateFeeTest } from "../src/bitcoin_utils";

enum Chain {
  Ethereum,
  Arbitrum,
  Optimism,
  BSC,
  Polygon,
  Avalanche,
  ZkSync,
  Linea,
  Base,
  Gnosis,
  Fantom,
  Klaytn,
  Aurota,
  Solana,
  opBNB,
  Scroll,
  Mode,
  Metis,
  BTC,
}

const INFURA_API_KEY = "4afef93554c240f98c1a3644fbe181d1";
const ALCHEMY_API_KEY = "JvMibmM4thQEF_7m7UXF02YSqUW5-pRX";

type RpcUrlMapping = Partial<{ [chain in Chain]: string }>;

const rpcUrls: RpcUrlMapping = {
  [Chain.Ethereum]: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
  [Chain.opBNB]: "https://opbnb-mainnet-rpc.bnbchain.org",
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
  // TODO fix error: err: insufficient balance for transfer (supplied gas 500000010499)
  [Chain.Klaytn]: "https://archive-en.cypress.klaytn.net",
};

async function main() {
  for (const chainStr of Object.keys(rpcUrls)) {
    const chain = parseInt(chainStr) as Chain;
    const rpcUrl = rpcUrls[chain]!;
    console.log(`processing ${Chain[chain]}[${rpcUrl}]`);
    let gasLimit = 0n;
    switch (chain) {
      case Chain.Solana: {
        gasLimit = await estimateUnitLimitTest(rpcUrl);
        break;
      }
      case Chain.BTC: {
        // tx bytes instead of consumed resource
        gasLimit = await estimateFeeTest(rpcUrl);
        break;
      }
      case Chain.ZkSync: {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        /// will check from balance when estimating gas
        const tx = {
          from: "0xD0B4b95c456550dC47d09307Bc957c08B726320B",
          value: "1",
          to: ethers.ZeroAddress,
        };
        gasLimit = await provider.estimateGas(tx);
        break;
      }
      case Chain.Klaytn: {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        // receiver cannot be zero address
        const tx = {
          from: "0x50c23983ea26f30d368da5b257001ee3ddf9a539",
          value: "1",
          to: "0x50c23983ea26f30d368da5b257001ee3ddf9a539",
        };
        gasLimit = await provider.estimateGas(tx);
        break;
      }
      default: {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const tx = {
          value: "1",
          to: ethers.ZeroAddress,
        };
        gasLimit = await provider.estimateGas(tx);
      }
    }
    console.log(`estimated gas limit: ${gasLimit}`);
  }
}

main();
