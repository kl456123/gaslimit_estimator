import { analysisGasLimitOnSolana } from '../src/solana_utils'
import { estimateFeeTest } from '../src/bitcoin_utils'
import { Chain, UrlMapping } from '../src/types'
import { rpcUrls } from '../src/constants'
import { analysisGasLimitOnEVMChain } from '../src/evm_utils'

async function analysisGasLimitOnMultiChains() {
  const rpcUrls: UrlMapping = {
    [Chain.BTC]: 'https://bitcoin.drpc.org'
  }
  for (const chainStr of Object.keys(rpcUrls)) {
    const chain = parseInt(chainStr) as Chain
    const rpcUrl = rpcUrls[chain]!
    console.log(`processing ${Chain[chain]}[${rpcUrl}]`)
    try {
      switch (chain) {
        case Chain.Solana: {
          await analysisGasLimitOnSolana(rpcUrl, 10)
          break
        }
        case Chain.BTC: {
          // tx bytes instead of consumed resource
          await estimateFeeTest(rpcUrl, 1)
          break
        }
        default: {
          await analysisGasLimitOnEVMChain(rpcUrl, chain, 500)
        }
      }
    } catch (e) {
      console.log(`fail to process ${e}`)
    }
  }
}

async function main() {
  await analysisGasLimitOnMultiChains()
}

main()
